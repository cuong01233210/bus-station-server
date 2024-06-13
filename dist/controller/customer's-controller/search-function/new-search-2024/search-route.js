"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoute = exports.busInfoMap = void 0;
const kdTree_1 = __importDefault(require("./kdTree"));
const dijstra_1 = require("./dijstra");
const dijstra_2 = require("./dijstra");
const create_directed_graph_1 = require("./create-directed-graph");
const bus_info_1 = __importDefault(require("../../../../models/bus-info"));
const calculate_estimate_time_1 = require("./calculate-estimate-time");
exports.busInfoMap = {};
function findRoute(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
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
        let startIn4 = {
            name: startPlace.name,
            lat: startPlace.lat,
            long: startPlace.long,
        };
        let endIn4 = {
            name: endPlace.name,
            lat: endPlace.lat,
            long: endPlace.long,
        };
        let inputIn4 = {
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
            const tree = new kdTree_1.default(null, []);
            tree.loadFromFile("kdtree.json");
            // Tìm 2 trạm gần nhất với điểm xuất phát
            const nearestStartNodes = tree.nearestNodes(inputIn4.startIn4, 2);
            // In ra các điểm gần nhất
            console.log("Các điểm gần nhất với trạm xuất phát:");
            for (let index = 0; index < nearestStartNodes.length; index++) {
                console.log(`Trạm ${index + 1}: ${(_a = nearestStartNodes[index].point) === null || _a === void 0 ? void 0 : _a.name}`);
            }
            // Tìm 2 trạm gần nhất với điểm đích
            const nearestEndNodes = tree.nearestNodes(inputIn4.endIn4, 2);
            console.log("Các điểm gần nhất với trạm xuất đích:");
            for (let index = 0; index < nearestEndNodes.length; index++) {
                console.log(`Trạm ${index + 1}: ${(_b = nearestEndNodes[index].point) === null || _b === void 0 ? void 0 : _b.name}`);
            }
            // từ những tuyến xe buýt build đồ thị có hướng
            //const graph = new DirectedGraph();
            //graph.createGraph(buses);
            let filename = "";
            if (searchMode == 1) {
                filename = "basicgraph.json";
            }
            else
                filename = "canwalkgraph.json";
            const graph = (0, create_directed_graph_1.readGraphFromFile)(filename);
            // sử dụng dijstra trên đồ thị có hướng để tìm đường
            let dijkstra = new dijstra_1.Dijkstra(); // khởi tạo đối tượng Dijstra để tìm kiếm đường
            // đẩy thông tin đồ thị có hướng giữa các trạm vừa vẽ được vào dijstra
            graph.adjacencyList.forEach((edges, vertex) => {
                let nodeVertexts = [];
                let busVertexts = []; // tạo mảng lưu trữ tuyến xe buýt đi qua trạm (node) đang xét
                let uniqueBuses = new Set(); // dùng Set để lưu trữ tuyến xe buýt độc lập trước rồi thêm vào busVertexts sau
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
                dijkstra.addVertex(new dijstra_2.Vertex(vertex, nodeVertexts, 0, busVertexts, "bus"));
            });
            console.log("Một vài tuyến đường gợi ý là: ");
            let resultRoutes = [];
            let appearTimes = [];
            // chuẩn bị db buses để tiện sp tính tiền xe buýt
            const busInfos = yield bus_info_1.default.getAllBusInfos();
            exports.busInfoMap = {};
            exports.busInfoMap = {};
            busInfos.forEach((busInfo) => {
                exports.busInfoMap[busInfo.bus] = busInfo;
            });
            for (let startIndex = 0; startIndex < nearestStartNodes.length; startIndex++) {
                for (let endIndex = 0; endIndex < nearestEndNodes.length; endIndex++) {
                    let startStation = nearestStartNodes[startIndex].point;
                    let endStation = nearestEndNodes[endIndex].point;
                    if (startStation != null && endStation != null) {
                        console.log("trạm xuất phát", startStation);
                        console.log("trạm đích là", endStation);
                        let results = dijkstra.findShortestWay(startStation.name, endStation.name);
                        //thêm các phần tử của results vào resultRoutes
                        if (results.length > 0) {
                            let result1 = results[0];
                            let exists = resultRoutes.some((existingRoute) => existingRoute.startStation === result1.startStation &&
                                existingRoute.endStation === result1.endStation);
                            if (!exists) {
                                for (let i = 0; i < results.length; i++) {
                                    const { startHour, startMinute } = yield (0, calculate_estimate_time_1.findStartTime)(startPlace.lat, startPlace.long, userInputHour, userInputMinute, results[i].buses[0], results[i].startStation);
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
                                resultRoutes.push(...results);
                            }
                        }
                    }
                }
            }
            let endTime = performance.now();
            console.log(`Thời gian tìm kiếm: ${endTime - startTime} milliseconds`);
            res.status(200).json({ resultRoutes: resultRoutes });
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    });
}
exports.findRoute = findRoute;
