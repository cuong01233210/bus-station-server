import { loginController } from "./../../auth-controller";
import { StationPoint } from "./../../../../models/my-point";
import { Request, Response } from "express";
import { InputIn4 } from "../../../../models/input-in4";

import KDTree from "./kdTree";
import { haversineDistance } from "./test-geocoding-controller";
import Bus from "../../../../models/bus";
import { InputRawIn4 } from "../../../../models/input-in4";
import { getLocationIn4 } from "./location-preprocessing";
import { Dijkstra, ResultRoute, ReturnRoute } from "./dijstra";
import { Vertex } from "./dijstra";
import { NodeVertex } from "./dijstra";
import {
  DirectedGraph,
  readGraphFromFile,
  readGraphFromFile2,
} from "./create-directed-graph";

import BusStation from "../../../../models/bus-station";
import BusInfo from "../../../../models/bus-info";
import BusAppearance from "../../../../models/bus-appearance-time";
import { findStartTime } from "./calculate-estimate-time";

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
  const userInputHour = req.body.userInputHour;
  const userInputMinute = req.body.userInputMinute;
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
    let resultLength = 0;
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
          if (resultLength <= 5) {
            let results = dijkstra.findShortestWay(
              startStation.name,
              endStation.name
            );
            //thêm các phần tử của results vào resultRoutes
            if (results.length > 0 && resultLength <= 5) {
              let result1 = results[0];
              let exists = resultRoutes.some(
                (existingRoute) =>
                  existingRoute.startStation === result1.startStation &&
                  existingRoute.endStation === result1.endStation
              );

              if (!exists && resultLength <= 5) {
                for (let i = 0; i < results.length && i < 2; i++) {
                  console.log("tuyen xe buyt dau tien: ", results[i].buses);
                  const { startHour, startMinute, roundedWalkingTime } =
                    await findStartTime(
                      startPlace.lat,
                      startPlace.long,
                      userInputHour,
                      userInputMinute,
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
                  if (startPlace.name != results[i].returnRoutes[0].source) {
                    results[i].returnRoutes.unshift({
                      source: startPlace.name,
                      destination: results[i].startStation,
                      buses: ["walk"],
                      transportTime: roundedWalkingTime,
                      transportS: roundedWalkingTime * 5,
                      pathType: "walk",
                    });
                  }
                }
                if (resultLength <= 5) {
                  if (results.length >= 2) {
                    resultRoutes.push(results[0]);
                    resultRoutes.push(results[1]);
                  } else resultRoutes.push(...results);
                }
                resultLength = resultRoutes.length;
                if (resultLength >= 5) {
                  startIndex = nearestStartNodes.length;
                  endIndex = nearestEndNodes.length;
                  break;
                }
              }
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

export async function findRoute2(req: Request, res: Response) {
  const startPlace = req.body.startPlace;
  const endPlace = req.body.endPlace;
  const searchMode = req.body.searchMode;
  const userInputHour = req.body.userInputHour;
  const userInputMinute = req.body.userInputMinute;

  const startTime = performance.now();

  // Đọc đồ thị từ file
  const graph = readGraphFromFile2("IndirectGraph.json");
  if (!graph) {
    res.status(500).json({ error: "Failed to read the graph from file" });
    return;
  }

  const adjacencyList = graph.adjacencyList;

  if (!adjacencyList || adjacencyList.size === 0) {
    res.status(500).json({ error: "Graph data is empty or invalid" });
    return;
  }
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
  const tree = new KDTree(null, []);
  tree.loadFromFile("kdtree.json");
  // Tìm 2 trạm gần nhất với điểm xuất phát
  const nearestStartNodes = tree.nearestNodes(inputIn4.startIn4, 2);

  // In ra các điểm gần nhất
  console.log("Các điểm gần nhất với trạm xuất phát:");
  for (let index = 0; index < nearestStartNodes.length; index++) {
    console.log(`Trạm ${index + 1}: ${nearestStartNodes[index].point?.name}`);
    const lat = nearestStartNodes[index].point?.lat;
    const long = nearestStartNodes[index].point?.long;
    if (lat != null && long != null) {
      console.log(
        haversineDistance(startPlace.lat, startPlace.long, lat, long)
      );
    }
  }

  // Tìm 2 trạm gần nhất với điểm đích
  const nearestEndNodes = tree.nearestNodes(inputIn4.endIn4, 2);
  console.log("Các điểm gần nhất với trạm xuất đích:");
  for (let index = 0; index < nearestEndNodes.length; index++) {
    console.log(`Trạm ${index + 1}: ${nearestEndNodes[index].point?.name}`);
  }

  let resultRoutes: ResultRoute[] = [];
  for (
    let startIndex = 0;
    startIndex < nearestStartNodes.length;
    startIndex++
  ) {
    for (let endIndex = 0; endIndex < nearestEndNodes.length; endIndex++) {
      let startStation = nearestStartNodes[startIndex].point;
      let endStation = nearestEndNodes[endIndex].point;
      if (startStation != null && endStation != null) {
        // Kiểm tra xem trong adjacencyList của startPlace có chứa edge đến endPlace không
        const edgesFromStart = adjacencyList.get(startStation.name);

        if (edgesFromStart) {
          const edgeToEnd = edgesFromStart.find(
            (edge) => endStation && edge.vertex == endStation.name
          );
          if (edgeToEnd) {
            console.log(
              `Có cạnh đi từ ${startStation.name} đến ${endStation.name}:`,
              edgeToEnd
            );
            if (edgeToEnd.pathType == "walk") {
              const { startHour, startMinute } = await findStartTime(
                startPlace.lat,
                startPlace.long,
                userInputHour,
                userInputMinute,
                "walk",
                startStation.name
              );
              let transportMinute = Math.ceil(
                (edgeToEnd.weight * 60) / 5 / 1000
              );
              let transportHour = 0;
              if (transportMinute >= 60) {
                transportHour = Math.floor(transportMinute / 60);
                transportMinute = transportMinute % 60;
              }
              let endMinute = startMinute + transportMinute;
              let endHour =
                startHour + Math.floor(endMinute / 60) + transportHour;
              endMinute = endMinute % 60;
              if (endHour >= 24) {
                endHour -= 24;
              }
              const returnRoute: ReturnRoute = {
                source: startStation.name,
                destination: endStation.name,
                buses: ["walk"],
                transportTime: (edgeToEnd.weight * 60) / 5 / 1000,
                transportS: edgeToEnd.weight,
                pathType: "walk",
              };
              resultRoutes.push({
                startStation: startStation.name, // trạm xuất phát và đích
                endStation: endStation.name,
                buses: ["walk"], // các xe buýt cần dùng ;
                cost: 0, // giá tiền
                transportHour: transportHour, // thời gian cần để di chuyển
                transportMinute: transportMinute,
                startHour: startHour,
                startMinute: startMinute,
                endHour: endHour,
                endMinute: endMinute,
                stations: [startStation.name, endStation.name], //
                returnRoutes: [returnRoute], //
              });
            } else if (edgeToEnd.pathType == "bus") {
              const commonBuses = edgeToEnd.buses;
              for (let i = 0; i < commonBuses.length; i++) {
                const { startHour, startMinute } = await findStartTime(
                  startPlace.lat,
                  startPlace.long,
                  userInputHour,
                  userInputMinute,
                  commonBuses[i],
                  startStation.name
                );
                let transportMinute = Math.ceil(
                  (edgeToEnd.weight * 60) / 22.5 / 1000
                );
                let transportHour = 0;
                if (transportMinute >= 60) {
                  transportHour = Math.floor(transportMinute / 60);
                  transportMinute = transportMinute % 60;
                }
                let endMinute = startMinute + transportMinute;
                let endHour =
                  startHour + Math.floor(endMinute / 60) + transportHour;
                endMinute = endMinute % 60;
                if (endHour >= 24) {
                  endHour -= 24;
                }
                //xác định danh sách các trạm trên đoạn đường đi đó
                const currentBus = await Bus.getOnlyOneBus(commonBuses[i]);
                let startIndex = -1;
                let endIndex = -1;
                let stations = [];

                for (let j = 0; j < currentBus.chieuDi.length; j++) {
                  if (currentBus.chieuDi[j].name == startStation.name) {
                    stations.push(currentBus.chieuDi[j].name);
                    startIndex = j;
                  }
                  if (startIndex < j && startIndex != -1) {
                    stations.push(currentBus.chieuDi[j].name);
                  }
                  if (currentBus.chieuDi[j].name == endStation.name) {
                    endIndex = j;

                    break;
                  }
                }
                if (startIndex == -1 || endIndex == -1) {
                  for (let j = 0; j < currentBus.chieuVe.length; j++) {
                    if (currentBus.chieuVe[j].name == startStation.name) {
                      stations.push(currentBus.chieuVe[j].name);
                      startIndex = j;
                    }
                    if (startIndex < j && startIndex != -1) {
                      stations.push(currentBus.chieuVe[j].name);
                    }
                    if (currentBus.chieuVe[j].name == endStation.name) {
                      endIndex = j;

                      break;
                    }
                  }
                }
                const returnRoute: ReturnRoute = {
                  source: startStation.name,
                  destination: endStation.name,
                  buses: [commonBuses[i]],
                  transportTime: (edgeToEnd.weight * 60) / 22.5 / 1000,
                  transportS: edgeToEnd.weight,
                  pathType: "bus",
                };
                resultRoutes.push({
                  startStation: startStation.name, // trạm xuất phát và đích
                  endStation: endStation.name,
                  buses: [commonBuses[i]], // các xe buýt cần dùng ;
                  cost: currentBus.price, // giá tiền
                  transportHour: transportHour, // thời gian cần để di chuyển
                  transportMinute: transportMinute,
                  startHour: startHour,
                  startMinute: startMinute,
                  endHour: endHour,
                  endMinute: endMinute,
                  stations: stations, //
                  returnRoutes: [returnRoute], //
                });
              }
            } else {
              console.log(
                `Không có đường đi 1 tuyến từ ${startStation.name} đến ${endStation.name}`
              );
            }
          } else {
            console.log(`Không tìm được ${startStation.name}`);
          }
        }
      }
    }
  }

  const endTime = performance.now();
  console.log(`Path found in ${endTime - startTime} milliseconds:`);

  res.status(200).json({ resultRoutes: resultRoutes });
}
