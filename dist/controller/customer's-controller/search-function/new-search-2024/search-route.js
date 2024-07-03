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
exports.findRoute2 = exports.findRoute = exports.busInfoMap = void 0;
const kdTree_1 = __importDefault(require("./kdTree"));
const test_geocoding_controller_1 = require("./test-geocoding-controller");
const bus_1 = __importDefault(require("../../../../models/bus"));
const dijstra_1 = require("./dijstra");
const dijstra_2 = require("./dijstra");
const create_directed_graph_1 = require("./create-directed-graph");
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
            // dựng cây kd tree với tất cả các trạm xe buýt
            // Tạo lại cây từ file JSON
            const tree = new kdTree_1.default(null, []);
            tree.loadFromFile("src/json-data/kdtree.json");
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
                filename = "src/json-data/basicgraph.json";
            }
            else
                filename = "src/json-data/canwalkgraph.json";
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
            let resultLength = 0;
            // chuẩn bị db buses để tiện sp tính tiền xe buýt
            const busInfos = yield bus_1.default.getAllBusInfos();
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
                        if (resultLength <= 5) {
                            let results = dijkstra.findShortestWay(startStation.name, endStation.name);
                            //thêm các phần tử của results vào resultRoutes
                            if (results.length > 0 && resultLength <= 5) {
                                let result1 = results[0];
                                let exists = resultRoutes.some((existingRoute) => existingRoute.startStation === result1.startStation &&
                                    existingRoute.endStation === result1.endStation);
                                if (!exists && resultLength <= 5) {
                                    for (let i = 0; i < results.length && i < 2; i++) {
                                        console.log("tuyen xe buyt dau tien: ", results[i].buses);
                                        const { startHour, startMinute, roundedWalkingTime } = yield (0, calculate_estimate_time_1.findStartTime)(startPlace.lat, startPlace.long, userInputHour, userInputMinute, results[i].buses[0], results[i].startStation);
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
                                        }
                                        else
                                            resultRoutes.push(...results);
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
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    });
}
exports.findRoute = findRoute;
function findRoute2(req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const startPlace = req.body.startPlace;
        const endPlace = req.body.endPlace;
        const searchMode = req.body.searchMode;
        const userInputHour = req.body.userInputHour;
        const userInputMinute = req.body.userInputMinute;
        const startTime = performance.now();
        // Đọc đồ thị từ file
        const graph = (0, create_directed_graph_1.readGraphFromFile2)("src/json-data/IndirectGraph.json");
        if (!graph) {
            res.status(500).json({ error: "Failed to read the graph from file" });
            return;
        }
        const adjacencyList = graph.adjacencyList;
        if (!adjacencyList || adjacencyList.size === 0) {
            res.status(500).json({ error: "Graph data is empty or invalid" });
            return;
        }
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
        console.log(inputIn4);
        const tree = new kdTree_1.default(null, []);
        tree.loadFromFile("src/json-data/kdtree.json");
        // Tìm 2 trạm gần nhất với điểm xuất phát
        const nearestStartNodes = tree.nearestNodes(inputIn4.startIn4, 2);
        // In ra các điểm gần nhất
        console.log("Các điểm gần nhất với trạm xuất phát:");
        for (let index = 0; index < nearestStartNodes.length; index++) {
            console.log(`Trạm ${index + 1}: ${(_a = nearestStartNodes[index].point) === null || _a === void 0 ? void 0 : _a.name}`);
            // let startStationLat = nearestStartNodes[index].point?.lat;
            // let startStationLong = nearestStartNodes[index].point?.long;
            // // in ra lat long của trạm nếu tồn tại
            // if (startStationLat != null && startStationLong != null) {
            //   console.log(
            //     haversineDistance(
            //       startStationLat,
            //       startStationLong,
            //       inputIn4.startIn4.lat,
            //       inputIn4.startIn4.long
            //     )
            //   );
            // }
        }
        // Tìm 2 trạm gần nhất với điểm đích
        const nearestEndNodes = tree.nearestNodes(inputIn4.endIn4, 2);
        console.log("Các điểm gần nhất với trạm xuất đích:");
        for (let index = 0; index < nearestEndNodes.length; index++) {
            console.log(`Trạm ${index + 1}: ${(_b = nearestEndNodes[index].point) === null || _b === void 0 ? void 0 : _b.name}`);
        }
        let resultRoutes = [];
        for (let startIndex = 0; startIndex < nearestStartNodes.length; startIndex++) {
            for (let endIndex = 0; endIndex < nearestEndNodes.length; endIndex++) {
                let startStation = nearestStartNodes[startIndex].point;
                let endStation = nearestEndNodes[endIndex].point;
                if (startStation != null && endStation != null) {
                    // Kiểm tra xem trong adjacencyList của startPlace có chứa edge đến endPlace không
                    const edgesFromStart = adjacencyList.get(startStation.name);
                    // console.log(edgesFromStart);
                    if (edgesFromStart) {
                        console.log(endStation.name);
                        const edgeToEnd = edgesFromStart.find((edge) => endStation && edge.vertex == endStation.name);
                        if (edgeToEnd) {
                            console.log(`Có cạnh đi từ ${startStation.name} đến ${endStation.name}:`, edgeToEnd);
                            if (edgeToEnd.pathType == "walk") {
                                const { startHour, startMinute, roundedWalkingTime } = yield (0, calculate_estimate_time_1.findStartTime)(startPlace.lat, startPlace.long, userInputHour, userInputMinute, "walk", startStation.name);
                                let transportMinute = Math.ceil((edgeToEnd.weight * 60) / 5 / 1000);
                                let transportHour = 0;
                                if (transportMinute >= 60) {
                                    transportHour = Math.floor(transportMinute / 60);
                                    transportMinute = transportMinute % 60;
                                }
                                let endMinute = startMinute + transportMinute;
                                let endHour = startHour + Math.floor(endMinute / 60) + transportHour;
                                endMinute = endMinute % 60;
                                if (endHour >= 24) {
                                    endHour -= 24;
                                }
                                const returnRoute = {
                                    source: startStation.name,
                                    destination: endStation.name,
                                    buses: ["walk"],
                                    transportTime: Math.ceil((edgeToEnd.weight * 60) / 5 / 1000),
                                    transportS: Math.ceil(edgeToEnd.weight),
                                    pathType: "walk",
                                };
                                const returnRoutes = [];
                                if (startPlace.name != startStation.name) {
                                    returnRoutes.unshift({
                                        source: startPlace.name,
                                        destination: startStation.name,
                                        buses: ["walk"],
                                        transportTime: Math.ceil(roundedWalkingTime),
                                        transportS: Math.ceil(roundedWalkingTime * 5),
                                        pathType: "walk",
                                    });
                                }
                                returnRoutes.push(returnRoute);
                                if (endStation.name != endPlace.name &&
                                    endStation.lat != endPlace.lat &&
                                    endStation.long != endPlace.long) {
                                    const transportS = Math.ceil((0, test_geocoding_controller_1.haversineDistance)(endStation.lat, endStation.long, endPlace.lat, endPlace.long));
                                    const transportTime = Math.ceil(transportS / 5 / 1000);
                                    returnRoutes.push({
                                        source: endStation.name,
                                        destination: endPlace.name,
                                        buses: ["walk"],
                                        transportTime: transportTime,
                                        transportS: transportS,
                                        pathType: "walk",
                                    });
                                }
                                resultRoutes.push({
                                    startStation: startStation.name,
                                    endStation: endStation.name,
                                    buses: ["walk"],
                                    cost: 0,
                                    transportHour: transportHour,
                                    transportMinute: transportMinute,
                                    startHour: startHour,
                                    startMinute: startMinute,
                                    endHour: endHour,
                                    endMinute: endMinute,
                                    stations: [startStation.name, endStation.name],
                                    returnRoutes: returnRoutes, //
                                });
                            }
                            else if (edgeToEnd.pathType == "bus") {
                                const commonBuses = edgeToEnd.buses;
                                for (let i = 0; i < commonBuses.length; i++) {
                                    const { startHour, startMinute, roundedWalkingTime } = yield (0, calculate_estimate_time_1.findStartTime)(startPlace.lat, startPlace.long, userInputHour, userInputMinute, commonBuses[i], startStation.name);
                                    let transportMinute = Math.ceil((edgeToEnd.weight * 60) / 22.5 / 1000);
                                    let transportHour = 0;
                                    if (transportMinute >= 60) {
                                        transportHour = Math.floor(transportMinute / 60);
                                        transportMinute = transportMinute % 60;
                                    }
                                    let endMinute = startMinute + transportMinute;
                                    let endHour = startHour + Math.floor(endMinute / 60) + transportHour;
                                    endMinute = endMinute % 60;
                                    if (endHour >= 24) {
                                        endHour -= 24;
                                    }
                                    //xác định danh sách các trạm trên đoạn đường đi đó
                                    const currentBus = yield bus_1.default.getOnlyOneBus(commonBuses[i]);
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
                                    const returnRoutes = [];
                                    const returnRoute = {
                                        source: startStation.name,
                                        destination: endStation.name,
                                        buses: [commonBuses[i]],
                                        transportTime: Math.ceil((edgeToEnd.weight * 60) / 22.5 / 1000),
                                        transportS: Math.ceil(edgeToEnd.weight),
                                        pathType: "bus",
                                    };
                                    if (startPlace.name != startStation.name &&
                                        startPlace.lat != startStation.lat &&
                                        startPlace.long != startStation.long) {
                                        returnRoutes.unshift({
                                            source: startPlace.name,
                                            destination: startStation.name,
                                            buses: ["walk"],
                                            transportTime: Math.ceil(roundedWalkingTime),
                                            transportS: Math.ceil(roundedWalkingTime * 5),
                                            pathType: "walk",
                                        });
                                    }
                                    returnRoutes.push(returnRoute);
                                    if (endStation.name != endPlace.name &&
                                        endStation.lat != endPlace.lat &&
                                        endStation.long != endPlace.long) {
                                        const transportS = Math.ceil((0, test_geocoding_controller_1.haversineDistance)(endStation.lat, endStation.long, endPlace.lat, endPlace.long));
                                        const transportTime = Math.ceil(transportS / 5 / 1000);
                                        returnRoutes.push({
                                            source: endStation.name,
                                            destination: endPlace.name,
                                            buses: ["walk"],
                                            transportTime: transportTime,
                                            transportS: transportS,
                                            pathType: "walk",
                                        });
                                    }
                                    resultRoutes.push({
                                        startStation: startStation.name,
                                        endStation: endStation.name,
                                        buses: [commonBuses[i]],
                                        cost: currentBus.price,
                                        transportHour: transportHour,
                                        transportMinute: transportMinute,
                                        startHour: startHour,
                                        startMinute: startMinute,
                                        endHour: endHour,
                                        endMinute: endMinute,
                                        stations: stations,
                                        returnRoutes: returnRoutes, //
                                    });
                                }
                            }
                            else {
                                console.log(`Không có đường đi 1 tuyến từ ${startStation.name} đến ${endStation.name}`);
                            }
                        }
                        else {
                            console.log(`Không tìm được ${startStation.name}`);
                        }
                    }
                }
            }
        }
        if (resultRoutes.length == 0) {
            const invertedGraph = (0, create_directed_graph_1.readGraphFromFile2)("src/json-data/InvertIndirectGraph.json");
            if (!invertedGraph) {
                res.status(500).json({ error: "Failed to read the graph from file" });
                return;
            }
            const invertedAdjacencyList = invertedGraph.adjacencyList;
            if (!invertedAdjacencyList || invertedAdjacencyList.size === 0) {
                res.status(500).json({ error: "Graph data is empty or invalid" });
                return;
            }
            const fullUcvs = [];
            for (let endIndex = 0; endIndex < nearestEndNodes.length; endIndex++) {
                let endStation = nearestEndNodes[endIndex].point;
                if (endStation != null) {
                    const invertEdgesFromEnd = invertedAdjacencyList.get(endStation.name);
                    if (invertEdgesFromEnd) {
                        // const edgeToStart = invertEdgesFromEnd.find(
                        //   (edge) => startStation && edge.vertex == endStation.name
                        // );
                        const ucv = invertEdgesFromEnd.find((edge) => edge.pathType == "walk");
                        if (ucv) {
                            let shouldAdd = true;
                            for (let j = 0; j < fullUcvs.length; j++) {
                                if (fullUcvs[j].vertex === ucv.vertex) {
                                    shouldAdd = false;
                                    break;
                                }
                            }
                            if (shouldAdd) {
                                fullUcvs.push(ucv);
                            }
                        }
                    }
                }
            }
            console.log(fullUcvs);
            for (let startIndex = 0; startIndex < 2; startIndex++) {
                for (let ucvIndex = 0; ucvIndex < fullUcvs.length; ucvIndex++) {
                    let startStation = nearestStartNodes[startIndex].point;
                    if (startStation != null) {
                        const edgesFromStart = adjacencyList.get(startStation.name);
                        if (edgesFromStart) {
                            const edgeToEnd = edgesFromStart.find((edge) => edge.vertex == fullUcvs[ucvIndex].vertex);
                            if (edgeToEnd) {
                                if (edgeToEnd.pathType == "bus") {
                                    const commonBuses = edgeToEnd.buses;
                                    for (let i = 0; i < commonBuses.length; i++) {
                                        const { startHour, startMinute, roundedWalkingTime } = yield (0, calculate_estimate_time_1.findStartTime)(startPlace.lat, startPlace.long, userInputHour, userInputMinute, commonBuses[i], startStation.name);
                                        let transportMinute = Math.ceil((edgeToEnd.weight * 60) / 22.5 / 1000);
                                        let transportHour = 0;
                                        if (transportMinute >= 60) {
                                            transportHour = Math.floor(transportMinute / 60);
                                            transportMinute = transportMinute % 60;
                                        }
                                        let endMinute = startMinute + transportMinute;
                                        let endHour = startHour + Math.floor(endMinute / 60) + transportHour;
                                        endMinute = endMinute % 60;
                                        if (endHour >= 24) {
                                            endHour -= 24;
                                        }
                                        //xác định danh sách các trạm trên đoạn đường đi đó
                                        const currentBus = yield bus_1.default.getOnlyOneBus(commonBuses[i]);
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
                                            if (currentBus.chieuDi[j].name == edgeToEnd.vertex) {
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
                                                if (currentBus.chieuVe[j].name == edgeToEnd.vertex) {
                                                    endIndex = j;
                                                    break;
                                                }
                                            }
                                        }
                                        const returnRoute = {
                                            source: startStation.name,
                                            destination: edgeToEnd.vertex,
                                            buses: [commonBuses[i]],
                                            transportTime: Math.ceil((edgeToEnd.weight * 60) / 22.5 / 1000),
                                            transportS: Math.ceil(edgeToEnd.weight),
                                            pathType: "bus",
                                        };
                                        const returnRoutes = [];
                                        if (startPlace.name != startStation.name) {
                                            returnRoutes.unshift({
                                                source: startPlace.name,
                                                destination: startStation.name,
                                                buses: ["walk"],
                                                transportTime: Math.ceil(roundedWalkingTime),
                                                transportS: Math.ceil(roundedWalkingTime) * 5,
                                                pathType: "walk",
                                            });
                                        }
                                        returnRoutes.push(returnRoute);
                                        resultRoutes.push({
                                            startStation: startStation.name,
                                            endStation: edgeToEnd.vertex,
                                            buses: [commonBuses[i]],
                                            cost: currentBus.price,
                                            transportHour: transportHour,
                                            transportMinute: transportMinute,
                                            startHour: startHour,
                                            startMinute: startMinute,
                                            endHour: endHour,
                                            endMinute: endMinute,
                                            stations: stations,
                                            returnRoutes: [returnRoute], //
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const endTime = performance.now();
        console.log(`Path found in ${endTime - startTime} milliseconds:`);
        res.status(200).json({ resultRoutes: resultRoutes });
    });
}
exports.findRoute2 = findRoute2;
