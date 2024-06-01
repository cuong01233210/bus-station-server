import { StationPoint } from "./../../../../models/my-point";
import { Request, Response } from "express";
import { InputIn4 } from "../../../../models/input-in4";

import KDTree from "./kdTree";
import { haversineDistance } from "./test-geocoding-controller";
import Bus from "../../../../models/bus";
import { InputRawIn4 } from "../../../../models/input-in4";
import { getLocationIn4 } from "./location-preprocessing";
import { Dijkstra, ResultRoute } from "./dijstra";
import { Vertex } from "./dijstra";
import { NodeVertex } from "./dijstra";
import { DirectedGraph, readGraphFromFile } from "./create-directed-graph";
import {
  findStartTime,
  searchStationRouteTimeMode1,
} from "./calculate-estimate-time";
import BusStation from "../../../../models/bus-station";
import BusInfo from "../../../../models/bus-info";
import BusAppearance from "../../../../models/bus-appearance-time";

interface BusIn4Struct {
  name: string;
  bus: string[];
  lat: number;
  long: number;
}
export let busInfoMap: { [key: string]: BusInfo } = {};
export async function findRoute(req: Request, res: Response) {
  //không cần dùng userId để phân biệt các tài khoản do cơ chế tự làm đc rồi
  //const startString = req.body.startString;
  //const endString = req.body.endString;
  //const userInputLat = req.body.lat;
  //const userInputLong = req.body.long;
  const startPlace = req.body.startPlace;
  const endPlace = req.body.endPlace;
  const searchMode = req.body.searchMode;
  const timeFilterMode = req.body.timeFilterMode; // biến xác định chế độ lọc thời gian xe buýt đến trạm
  let startTime = performance.now();

  let startIn4: StationPoint = {
    name: startPlace.name,
    lat: startPlace.lat,
    long: startPlace.long,
  };
  let endIn4: StationPoint = {
    name: endPlace.name,
    lat: endPlace.lat,
    long: endPlace.long,
  };
  let inputIn4: InputIn4 = {
    startIn4: startIn4,
    endIn4: endIn4,
  };

  try {
    // const busStations = await BusStation.getBusStations();
    // //console.log(busStations);
    // //console.log("inputIn4: ", inputIn4);
    // let stationPoints: StationPoint[] = [];

    // let busStationsLength = busStations.length;
    // for (let i = 0; i < busStationsLength; i++) {
    //   const point = {
    //     name: busStations[i].name,
    //     lat: busStations[i].lat,
    //     long: busStations[i].long,
    //   };
    //   //console.log(point);
    //   stationPoints.push(point);
    // }
    //console.log(stationPoints.length);

    // dựng cây kd tree với tất cả các trạm xe buýt
    // Tạo lại cây từ file JSON
    const tree = new KDTree(null, []);
    tree.loadFromFile("kdtree.json");
    // Tìm 2 trạm gần nhất với điểm xuất phát
    const nearestStartNodes = tree.nearestNodes(inputIn4.startIn4, 2);

    // In ra các điểm gần nhất
    console.log("Các điểm gần nhất với trạm xuất phát:");
    for (let index = 0; index < nearestStartNodes.length; index++) {
      console.log(`Trạm ${index + 1}: ${nearestStartNodes[index].point?.name}`);
    }

    // Tìm 2 trạm gần nhất với điểm đích
    const nearestEndNodes = tree.nearestNodes(inputIn4.endIn4, 2);
    console.log("Các điểm gần nhất với trạm xuất đích:");
    for (let index = 0; index < nearestEndNodes.length; index++) {
      console.log(`Trạm ${index + 1}: ${nearestEndNodes[index].point?.name}`);
    }

    // từ những tuyến xe buýt build đồ thị có hướng
    //const graph = new DirectedGraph();
    //graph.createGraph(buses);
    let filename = "";
    if (searchMode == 1) {
      filename = "basicgraph.json";
    } else filename = "canwalkgraph.json";
    const graph = readGraphFromFile(filename);
    // sử dụng dijstra trên đồ thị có hướng để tìm đường
    let dijkstra = new Dijkstra(); // khởi tạo đối tượng Dijstra để tìm kiếm đường
    // đẩy thông tin đồ thị có hướng giữa các trạm vừa vẽ được vào dijstra
    graph.adjacencyList.forEach((edges, vertex) => {
      let nodeVertexts: NodeVertex[] = [];
      let busVertexts: string[] = []; // tạo mảng lưu trữ tuyến xe buýt đi qua trạm (node) đang xét
      let uniqueBuses = new Set<string>(); // dùng Set để lưu trữ tuyến xe buýt độc lập trước rồi thêm vào busVertexts sau
      //console.log("Đỉnh:", vertex);
      edges.forEach((edge) => {
        // console.log("  Vertex:", edge.vertex);
        // console.log("  Weight:", edge.weight);
        // console.log("  Buses:", edge.buses);

        // Duyệt qua mỗi phần tử trong edge.buses và thêm vào Set
        edge.buses.forEach((bus) => {
          uniqueBuses.add(bus);
        });

        nodeVertexts.push({
          nameOfVertex: edge.vertex,
          weight: edge.weight,
          pathType: edge.pathType,
        });
      });
      // Chuyển đổi Set thành mảng bằng spread operator
      busVertexts = [...uniqueBuses];
      dijkstra.addVertex(
        new Vertex(vertex, nodeVertexts, 0, busVertexts, "bus")
      );
    });
    console.log("Một vài tuyến đường gợi ý là: ");
    let resultRoutes: ResultRoute[] = [];
    let appearTimes = [];
    // chuẩn bị db buses để tiện sp tính tiền xe buýt
    const busInfos = await BusInfo.getAllBusInfos();
    busInfoMap = {};
    busInfoMap = {};
    busInfos.forEach((busInfo) => {
      busInfoMap[busInfo.bus] = busInfo;
    });
    for (
      let startIndex = 0;
      startIndex < nearestStartNodes.length;
      startIndex++
    ) {
      for (let endIndex = 0; endIndex < nearestEndNodes.length; endIndex++) {
        let startStation = nearestStartNodes[startIndex].point;
        let endStation = nearestEndNodes[endIndex].point;
        if (startStation != null && endStation != null) {
          console.log("trạm xuất phát", startStation);
          console.log("trạm đích là", endStation);
          let results = dijkstra.findShortestWay(
            startStation.name,
            endStation.name
          );
          //thêm các phần tử của results vào resultRoutes
          if (results.length > 0) {
            let result1 = results[0];
            let exists = resultRoutes.some(
              (existingRoute) =>
                existingRoute.startStation === result1.startStation &&
                existingRoute.endStation === result1.endStation
            );

            if (!exists) {
              for (let i = 0; i < results.length; i++) {
                const { startHour, startMinute } = await findStartTime(
                  startPlace.lat,
                  startPlace.long,
                  10,
                  47,
                  results[i].buses[0],
                  results[i].startStation
                );

                results[i].startHour = startHour;
                results[i].startMinute = startMinute;
                let endMinute = startMinute + results[i].transportMinute;
                let endHour = startHour + results[i].transportHour;
                while (endMinute >= 60) {
                  endMinute -= 60;
                  endHour += 1;
                }
                if (endHour >= 24) {
                  endHour -= 24;
                }
                results[i].endHour = endHour;
                results[i].endMinute = endMinute;
              }
              resultRoutes.push(...results); // Thêm toàn bộ `results` vào `resultRoutes`
            }
          }
        }
      }
    }

    let endTime = performance.now();
    console.log(`Thời gian tìm kiếm: ${endTime - startTime} milliseconds`);
    res.status(200).json({ resultRoutes: resultRoutes });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
// tóm lại là ổn rồi, sau 1 ngày check thì thuật toán ko sai mà do test case đen vào đúng TH ko có kq
// do đó cần phải làm thêm trường hợp ko ra kq này là xong
/*
console.log(
    dijkstra.findShortestWay(
      "Đối Diện 447 Ngọc Lâm - Vườn Hoa Gia Lâm",
      "Đài Tưởng Niệm Khâm Thiên - 45 Khâm Thiên"
    )
  );
  */
