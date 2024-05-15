import { StationPoint } from "./../../../../models/my-point";
import { Request, Response } from "express";
import { InputIn4 } from "../../../../models/input-in4";

import MyPoint from "../../../../models/my-point";
import BusStationsByDistrict from "../../../../models/bus-stations-by-district";
import KDTree from "../../../../models/kdTree";
import { haversineDistance } from "./test-geocoding-controller";
import Bus from "../../../../models/bus";
import { InputRawIn4 } from "../../../../models/input-in4";
import { getLocationIn4 } from "./location-preprocessing";
import { Dijkstra, ResultRoute } from "./dijstra";
import { Vertex } from "./dijstra";
import { NodeVertex } from "./dijstra";
import { DirectedGraph, readGraphFromFile } from "./create-directed-graph";
import { searchStationRouteTimeMode1 } from "./calculate-estimate-time";
interface BusIn4Struct {
  name: string;
  bus: Array<string>;
  lat: number;
  long: number;
}

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

  let startIn4: StationPoint = {
    name: startPlace.name,
    district: "",
    lat: startPlace.lat,
    long: startPlace.long,
  };
  let endIn4: StationPoint = {
    name: endPlace.name,
    district: "",
    lat: endPlace.lat,
    long: endPlace.long,
  };
  let inputIn4: InputIn4 = {
    startIn4: startIn4,
    endIn4: endIn4,
  };
  // sử dụng hàm convertInputData để lấy lat long của điểm xp và điểm đích
  // let inputIn4: InputIn4 = await convertInputData(
  //   startString,
  //   endString,
  //   userInputLat,
  //   userInputLong
  // );
  // console.log(inputIn4);

  // sử dụng kd tree để tìm 2 trạm xuất phát ứng cử viên và 2 trạm đích ứng cử viên
  //console.log("cac tram nhet vao kd tree");
  const busStationsByDistrict =
    await BusStationsByDistrict.getBusStationsByDistrictIn4();
  //console.log("inputIn4: ", inputIn4);
  let stationPoints: StationPoint[] = [];
  let busStationsByDistrictLeng = busStationsByDistrict.length;
  for (let i = 0; i < busStationsByDistrictLeng; i++) {
    let busStationsIn4Leng = busStationsByDistrict[i].busStationIn4.length;
    for (let j = 0; j < busStationsIn4Leng; j++) {
      const point = {
        name: busStationsByDistrict[i].busStationIn4[j].name,
        district: busStationsByDistrict[i].district,
        lat: busStationsByDistrict[i].busStationIn4[j].lat,
        long: busStationsByDistrict[i].busStationIn4[j].long,
      };
      // console.log(point);
      stationPoints.push(point);
    }
  }

  // dựng cây kd tree với tất cả các trạm xe buýt
  const tree = new KDTree(null, stationPoints);
  tree.build();
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
  //const buses = await Bus.getBusIn4();
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
    dijkstra.addVertex(new Vertex(vertex, nodeVertexts, 0, busVertexts, ""));
  });
  console.log("Một vài tuyến đường gợi ý là: ");
  let resultRoutes: ResultRoute[] = [];
  let appearTimes = [];
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
        let result = dijkstra.findShortestWay(
          startStation.name,
          endStation.name
        );
        if (result.returnRoutes.length > 0) {
          console.log(result.returnRoutes);
          resultRoutes.push(result); // lưu trữ lại lộ trình tìm được
          // tìm thời gian xuất hiện tuyến xe buýt đi được tương ứng
          const appearTime = await searchStationRouteTimeMode1(
            startStation.name,
            result.returnRoutes[0].buses,
            inputIn4.startIn4.lat,
            inputIn4.startIn4.long,
            startStation.lat,
            startStation.long
          );
          appearTimes.push(appearTime);
          console.log(appearTime);
        } else {
          console.log("không tìm được tuyến đường phù hợp");
        }

        // console.log(
        //   dijkstra.findShortestWay(startStation.name, endStation.name)
        // );
      }
    }
  }
  // console.log(
  //   dijkstra.findShortestWay(
  //     "Đối Diện 447 Ngọc Lâm - Vườn Hoa Gia Lâm",
  //     "Đài Tưởng Niệm Khâm Thiên - 45 Khâm Thiên"
  //   )
  // );
  //console.log("appearTimes: ", appearTimes);
  res
    .status(200)
    .json({ resultRoutes: resultRoutes, appearTimes: appearTimes });
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
