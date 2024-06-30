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
exports.readGraphFromFile2 = exports.readGraphFromFile = exports.writeGraphToFile = exports.DirectedGraph = void 0;
const bus_1 = __importDefault(require("../../../../models/bus"));
const test_geocoding_controller_1 = require("./test-geocoding-controller");
const fs_1 = __importDefault(require("fs"));
//import BusRoute from "../../../../models/bus-route";
// ý tưởng
// dùng list liền kề (adjacencyList) + map để lưu trữ dữ liệu theo các cạnh
// nói chung dùng list để tiện cho việc từ 1 key (điểm xuất phát) dễ dàng nhìn thấy được luôn các đích (des) có thể tới
// ví dụ : A -> [{B, 15, [90]}, {C, 20, [98, 32]}]
//         B -> {D, 90, [01]}
// biết rõ ngay từ A đi xe 90 trạm tiếp theo dừng là B và mất 15m
// tương tự A -> C có thể đi trực tiếp bằng xe 98 hoặc 32 và mất 20m
// B -> D có thể đi được bằng tuyến 01
// ý tưởng hàm createGraph
// từ mảng danh sách các tuyến xe buýt đã có
// đầu tiên lấy được trường tên tuyến xe buýt (ex : 98)
// tiếp theo duyệt vào mảng chiều đi và chiều về của xe buýt
// ta sẽ duyệt hết tất cả các phần tử trong mảng chiều đi làm ví dụ
// mỗi phần tử ta sẽ cho nó vào hàm addVertex(thêm node vào cây)
// sau đó kiểm tra, nếu nó không phải phần tử cuối của mảng
// lấy thông tin về tên trạm đó, toạ độ lat long + tên trạm phía sau ptu(i + 1) + lat long sau
// cho vào hàm tạo cạnh đường đi (addEdge)
// ý tưởng hàm addEdge
// đầu tiên để chắc ăn ta thêm 2 đỉnh trạm nguồn và trạm đích vào đồ thị
// sau đó kiểm tra xem cạnh này đã tồn tại chưa
// nếu chưa thì dùng lat , long của 2 đầu tính ra khoảng cách ước lượng và sau đó tạo cạnh
// nếu rồi thì hãy truy cập vào cạnh đó và bổ sung tuyến xe buýt hiện tại cũng đi trùng cạnh đó
// ví dụ trước đó tuyến 01 tạo cạnh AB, bâyh xét tuyến 02 thì cũng đi qua cạnh AB -> cần bổ sung
// ý tưởng hàm addVertex
// hàm này chỉ đơn giản là kiểm tra xem đã có cạnh trong bộ đồ thị hay chưa, nếu chưa có thì bổ sung
class DirectedGraph {
    constructor() {
        this.adjacencyList = new Map();
    }
    addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }
    addEdge(source, destination, sourceLat, sourceLong, desLat, desLong, bus, pathType) {
        var _a, _b;
        this.addVertex(source);
        this.addVertex(destination);
        const edgeExists = (_a = this.adjacencyList
            .get(source)) === null || _a === void 0 ? void 0 : _a.some((edge) => edge.vertex === destination);
        const weigh = (0, test_geocoding_controller_1.haversineDistance)(sourceLat, sourceLong, desLat, desLong) * 1000;
        if (!edgeExists) {
            (_b = this.adjacencyList.get(source)) === null || _b === void 0 ? void 0 : _b.push({
                vertex: destination,
                weight: weigh,
                buses: [bus],
                lat: desLat,
                long: desLong,
                pathType: pathType,
            });
        }
        else {
            const edges = this.adjacencyList.get(source);
            const existingEdge = edges === null || edges === void 0 ? void 0 : edges.find((edge) => edge.vertex === destination);
            if (existingEdge && existingEdge.buses[0] !== "Walk" && bus !== "Walk") {
                existingEdge.buses.push(bus);
            }
        }
    }
    createGraph(busRoutes, state) {
        busRoutes.forEach((busRoute) => {
            busRoute.chieuDi.forEach((stop, index) => {
                this.addVertex(stop.name);
                if (index < busRoute.chieuDi.length - 1) {
                    this.addEdge(stop.name, busRoute.chieuDi[index + 1].name, stop.lat, stop.long, busRoute.chieuDi[index + 1].lat, busRoute.chieuDi[index + 1].long, busRoute.bus, "bus");
                }
            });
            busRoute.chieuVe.forEach((stop, index) => {
                this.addVertex(stop.name);
                if (index < busRoute.chieuVe.length - 1) {
                    this.addEdge(stop.name, busRoute.chieuVe[index + 1].name, stop.lat, stop.long, busRoute.chieuVe[index + 1].lat, busRoute.chieuVe[index + 1].long, busRoute.bus, "bus");
                }
            });
            if (state === 2) {
                busRoute.chieuDi.forEach((stopDi) => {
                    busRoute.chieuVe.forEach((stopVe) => {
                        const dist = (0, test_geocoding_controller_1.haversineDistance)(stopDi.lat, stopDi.long, stopVe.lat, stopVe.long) * 1000;
                        if (dist < 200) {
                            this.addEdge(stopDi.name, stopVe.name, stopDi.lat, stopDi.long, stopVe.lat, stopVe.long, "Walk", "walk");
                            this.addEdge(stopVe.name, stopDi.name, stopVe.lat, stopVe.long, stopDi.lat, stopDi.long, "Walk", "walk");
                        }
                    });
                });
            }
        });
    }
    createGraph2(busRoutes, state) {
        busRoutes.forEach((busRoute) => {
            // Add edges for all pairs of stops in chieuDi
            for (let i = 0; i < busRoute.chieuDi.length; i++) {
                this.addVertex(busRoute.chieuDi[i].name);
                for (let j = i + 1; j < busRoute.chieuDi.length; j++) {
                    this.addEdge(busRoute.chieuDi[j].name, busRoute.chieuDi[i].name, busRoute.chieuDi[j].lat, busRoute.chieuDi[j].long, busRoute.chieuDi[i].lat, busRoute.chieuDi[i].long, busRoute.bus, "bus");
                }
            }
            // Add edges for all pairs of stops in chieuVe
            for (let i = 0; i < busRoute.chieuVe.length; i++) {
                this.addVertex(busRoute.chieuVe[i].name);
                for (let j = i + 1; j < busRoute.chieuVe.length; j++) {
                    this.addEdge(busRoute.chieuVe[j].name, busRoute.chieuVe[i].name, busRoute.chieuVe[j].lat, busRoute.chieuVe[j].long, busRoute.chieuVe[i].lat, busRoute.chieuVe[i].long, busRoute.bus, "bus");
                }
            }
            // Add walking edges between chieuDi and chieuVe stops if state === 2
            if (state === 3) {
                busRoute.chieuDi.forEach((stopDi) => {
                    busRoute.chieuVe.forEach((stopVe) => {
                        const dist = (0, test_geocoding_controller_1.haversineDistance)(stopDi.lat, stopDi.long, stopVe.lat, stopVe.long) * 1000;
                        if (dist < 200) {
                            this.addEdge(stopDi.name, stopVe.name, stopDi.lat, stopDi.long, stopVe.lat, stopVe.long, "Walk", "walk");
                            this.addEdge(stopVe.name, stopDi.name, stopVe.lat, stopVe.long, stopDi.lat, stopDi.long, "Walk", "walk");
                        }
                    });
                });
            }
        });
    }
}
exports.DirectedGraph = DirectedGraph;
function serializeGraph(adjacencyList) {
    let serializableList = {};
    adjacencyList.forEach((edges, vertex) => {
        serializableList[vertex] = edges.map((edge) => ({
            vertex: edge.vertex,
            weight: edge.weight,
            buses: edge.buses,
            lat: edge.lat,
            long: edge.long,
            pathType: edge.pathType,
        }));
    });
    return JSON.stringify(serializableList);
}
function writeGraphToFile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const state = req.body.state;
        const filename = req.body.filename;
        try {
            const busRoutes = yield bus_1.default.getAllBusRoutes(); // Get BusRoutes instead of Buses
            const graph = new DirectedGraph();
            if (state == 1 || state == 2)
                graph.createGraph(busRoutes, state);
            else
                graph.createGraph2(busRoutes, state);
            // graph.createGraph(busRoutes, state);
            const adjacencyListString = serializeGraph(graph.adjacencyList);
            fs_1.default.writeFileSync(filename, adjacencyListString, "utf8");
            res.status(200).send("Graph data saved successfully.");
        }
        catch (error) {
            res.status(500).send("Error saving graph data: ");
        }
    });
}
exports.writeGraphToFile = writeGraphToFile;
function deserializeGraph(serializedData) {
    let adjacencyList = new Map();
    Object.entries(serializedData).forEach(([vertex, edges]) => {
        adjacencyList.set(vertex, edges.map((edge) => ({
            vertex: edge.vertex,
            weight: edge.weight,
            buses: edge.buses,
            lat: edge.lat,
            long: edge.long,
            pathType: edge.pathType,
        })));
    });
    return adjacencyList;
}
function readGraphFromFile(filename) {
    const fileContent = fs_1.default.readFileSync(filename, "utf8");
    const serializedData = JSON.parse(fileContent);
    const adjacencyList = deserializeGraph(serializedData);
    const graph = new DirectedGraph();
    graph.adjacencyList = adjacencyList;
    return graph;
}
exports.readGraphFromFile = readGraphFromFile;
function readGraphFromFile2(filename) {
    const fileContent = fs_1.default.readFileSync(filename, "utf8");
    const serializedData = JSON.parse(fileContent);
    const adjacencyList = deserializeGraph2(serializedData);
    const graph = new DirectedGraph();
    graph.adjacencyList = adjacencyList;
    return graph;
}
exports.readGraphFromFile2 = readGraphFromFile2;
function deserializeGraph2(serializedData) {
    const adjacencyList = new Map();
    for (const [key, value] of Object.entries(serializedData)) {
        adjacencyList.set(key, value);
    }
    return adjacencyList;
}
