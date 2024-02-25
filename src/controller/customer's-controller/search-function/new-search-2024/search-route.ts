import { Request, Response } from "express";
import { InputIn4, InputInfo } from "../../../../models/input-in4";
import { updateUserString2 } from "../old-search-2023/user-input-string.controller";
import MyPoint from "../../../../models/my-point";
import BusStationsByDistrict from "../../../../models/bus-stations-by-district";
import KDTree from "../../../../models/kdTree";
import { haversineDistance } from "./test-geocoding-controller";
import Bus from "../../../../models/bus";
import { InputRawIn4 } from "../../../../models/input-in4";
import { getLocationIn4 } from "./location-preprocessing";
import { Dijkstra } from "./dijstra";
import { Vertex } from "./dijstra";
import { NodeVertex } from "./dijstra";
import { DirectedGraph } from "./create-directed-graph";
interface BusIn4Struct {
  name: string;
  bus: Array<string>;
  lat: number;
  long: number;
}
// tìm tuyến liền mạch mạch, đi 1 lèo tới đích luôn không cần nhảy tuyến
export async function findSeamlessRoute(req: Request, res: Response) {
  //không cần dùng userId để phân biệt các tài khoản do cơ chế tự làm đc rồi
  const startString = req.body.startString;
  const endString = req.body.endString;

  // sử dụng hàm getLocationIn4 để tìm toàn bộ thông tin gồm lat, long, district của điểm xuất phát và đích
  let inputInfo: InputInfo = await getLocationIn4(startString, endString);
  //console.log(inputInfo);

  const buses = await Bus.getBusIn4();
  console.log(buses[0].chieuDi);
  const graph = new DirectedGraph();
  graph.createGraph(buses);

  let dijkstra = new Dijkstra(); // khởi tạo đối tượng Dijstra để tìm kiếm đường
  // đẩy thông tin đồ thị có hướng giữa các trạm vừa vẽ được vào dijstra
  graph.adjacencyList.forEach((edges, vertex) => {
    let nodeVertexts: NodeVertex[] = [];
    let busVertexts: string[] = []; // tạo mảng lưu trữ tuyến xe buýt đi qua trạm (node) đang xét
    let uniqueBuses = new Set<string>(); // dùng Set để lưu trữ tuyến xe buýt độc lập trước rồi thêm vào busVertexts sau
    //console.log("Đỉnh:", vertex);
    edges.forEach((edge) => {
      // console.log("  Vertex:", edge.vertex);
      //console.log("  Weight:", edge.weight);
      //  console.log("  Buses:", edge.buses);

      // Duyệt qua mỗi phần tử trong edge.buses và thêm vào Set
      edge.buses.forEach((bus) => {
        uniqueBuses.add(bus);
      });

      nodeVertexts.push({ nameOfVertex: edge.vertex, weight: edge.weight });
    });
    // Chuyển đổi Set thành mảng bằng spread operator
    busVertexts = [...uniqueBuses];
    dijkstra.addVertex(new Vertex(vertex, nodeVertexts, 0, busVertexts));
  });
  console.log(
    dijkstra.findShortestWay("Bến Xe Yên Nghĩa", "283 Tôn Đức Thắng")
  );
  res.status(200).json("success");
}
export async function findBusStationsV1(req: Request, res: Response) {
  const userId = req.body.id;
  const startString = req.body.startString;
  const endString = req.body.endString;
  const userKm = req.body.userKm;
  //const userString = userStrings.find((user) => user.id === userId);

  let inputIn4: InputIn4 = await updateUserString2(
    userId,
    startString,
    endString,
    userKm
  );

  const startQueryPoint = new MyPoint(
    inputIn4.startIn4.lat,
    inputIn4.startIn4.long
  );

  const busStationsByDistrict =
    await BusStationsByDistrict.getBusStationsByDistrictIn4();
  //console.log("inputIn4: ", inputIn4);
  let busStationsPoints: MyPoint[] = [];
  let busStationsByDistrictLeng = busStationsByDistrict.length;
  for (let i = 0; i < busStationsByDistrictLeng; i++) {
    let busStationsIn4Leng = busStationsByDistrict[i].busStationIn4.length;
    for (let j = 0; j < busStationsIn4Leng; j++) {
      const point = {
        x: busStationsByDistrict[i].busStationIn4[j].lat,
        y: busStationsByDistrict[i].busStationIn4[j].long,
      };
      busStationsPoints.push(point);
    }
  }
  // dựng cây kd tree với tất cả các trạm xe buýt
  const startTree = new KDTree(null, busStationsPoints);
  startTree.build();
  // tìm trạm xuất phát gần nhất có thể
  const startLocation = startTree.nearestDis(startQueryPoint);

  // tìm thông tin chi tiết của trạm xuất phát
  let startLocationIn4: BusIn4Struct = {
    name: "",
    bus: [],
    lat: 0,
    long: 0,
  };
  for (let i = 0; i < busStationsByDistrictLeng; i++) {
    let busStationsIn4Leng = busStationsByDistrict[i].busStationIn4.length;
    for (let j = 0; j < busStationsIn4Leng; j++) {
      const point = {
        x: busStationsByDistrict[i].busStationIn4[j].lat,
        y: busStationsByDistrict[i].busStationIn4[j].long,
      };
      if (
        startLocation.point?.x == point.x &&
        startLocation.point?.y == point.y
      ) {
        startLocationIn4 = busStationsByDistrict[i].busStationIn4[j];
      }
    }
  }
  // tìm khoảng cách trạm xe buýt gần nhất với vị trí xuất phát
  const startDistance = haversineDistance(
    startLocationIn4.lat,
    startLocationIn4.long,
    inputIn4.startIn4.lat,
    inputIn4.endIn4.long
  );
  //console.log(startLocationIn4);
  // đi tìm in4 của các tuyến bus từ db
  const buses = await Bus.getBusIn4();
  //console.log(buses);

  // lấy đầy đủ in4 các tuyến của trạm xuất phát
  const routesIn4: Bus[] = [];
  const startLocationIn4BusesLeng = startLocationIn4.bus.length;
  const busesLeng = buses.length;
  for (let i = 0; i < startLocationIn4BusesLeng; i++) {
    for (let j = 0; j < busesLeng; j++) {
      if (startLocationIn4.bus[i] == buses[j].bus) {
        routesIn4.push(buses[j]);
        j = busesLeng;
      }
    }
  }

  // mảng lưu các trạm gần nhất so với đích trên mỗi tuyến của trạm xuất phát và các khoảng cách so với đích của chúng
  const minDistances = []; // mảng lưu khoảng cách oke nhất của trạm đích và đích đến theo các tuyến
  const minDistancesStations = []; // mảng lưu các đích tương ứng mà oke nhất trên tuyến
  const minRoutes = []; // mảng lưu tuyến xe buýt để đến trạm tương ứng

  // vòng for các route của trạm xuất phát
  const routesIn4Leng = routesIn4.length;

  for (let i = 0; i < routesIn4Leng; i++) {
    let minDis = Infinity;
    let minDisStation = "";
    const chieuDiLeng = routesIn4[i].chieuDi.length;
    const chieuVeLeng = routesIn4[i].chieuVe.length;

    // xét chiều đi của route đó
    let j = 0;
    for (; j < chieuDiLeng; j++) {
      if (routesIn4[i].chieuDi[j].name == startLocationIn4.name) {
        console.log(
          "common name: ",
          startLocationIn4.name,
          routesIn4[i].chieuDi[j].name
        );
        break;
      }
    }
    for (; j < chieuDiLeng; j++) {
      const tempDis = haversineDistance(
        inputIn4.endIn4.lat,
        inputIn4.endIn4.long,
        routesIn4[i].chieuDi[j].lat,
        routesIn4[i].chieuDi[j].long
      );
      if (tempDis < minDis) {
        minDis = tempDis;
        minDisStation = routesIn4[i].chieuDi[j].name;
      }
    }
    if (minDisStation != "") {
      minDistances.push(minDis);
      minDistancesStations.push(minDisStation);
      minRoutes.push(routesIn4[i].bus);
    }

    minDis = Infinity;
    minDisStation = "";
    j = 0;
    // xét chiều về của route đó
    for (; j < chieuVeLeng; j++) {
      if (routesIn4[i].chieuVe[j].name == startLocationIn4.name) {
        console.log(
          "common name: ",
          startLocationIn4.name,
          routesIn4[i].chieuVe[j].name
        );
        break;
      }
    }
    for (; j < chieuVeLeng; j++) {
      const tempDis = haversineDistance(
        inputIn4.endIn4.lat,
        inputIn4.endIn4.long,
        routesIn4[i].chieuVe[j].lat,
        routesIn4[i].chieuVe[j].long
      );
      if (tempDis < minDis) {
        minDis = tempDis;
        minDisStation = routesIn4[i].chieuVe[j].name;
      }
    }
    if (minDisStation != "") {
      minDistances.push(minDis);
      minDistancesStations.push(minDisStation);
      minRoutes.push(routesIn4[i].bus);
    }
  }
  res.status(200).json({
    startLocation: startLocationIn4.name,
    startLocationLat: startLocationIn4.lat,
    startLocationLong: startLocationIn4.long,
    minDistances: minDistances,
    minDistancesStations: minDistancesStations,
    minRoutes: minRoutes,
    startDistance: startDistance,
    startStationLat: inputIn4.startIn4.lat,
    startStationLong: inputIn4.startIn4.long,
  });
  //res.status(200).json({ busStationsByDistrict: busStationsByDistrict });
}
