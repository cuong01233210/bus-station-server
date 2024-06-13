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
exports.getConnectedStations = exports.createConnectedStations = void 0;
const bus_1 = __importDefault(require("../../../../models/bus"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BusRouteProcessor {
    constructor() {
        this.busData = [];
        this.routeConnections = [];
    }
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.busData = yield bus_1.default.getBusIn4();
        });
    }
    processRoutes() {
        this.busData.forEach((bus) => {
            this.processDirection(bus.bus, bus.chieuDi);
            this.processDirection(bus.bus, bus.chieuVe);
        });
    }
    processDirection(busName, direction) {
        for (let i = 0; i < direction.length - 1; i++) {
            const startStation = direction[i].name;
            for (let j = i + 1; j < direction.length; j++) {
                const endStation = direction[j].name;
                this.addConnection(startStation, endStation, busName);
            }
        }
    }
    addConnection(startStation, endStation, busName) {
        const existingConnection = this.routeConnections.find((conn) => conn.stationName === startStation && conn.usedBuses === busName);
        if (existingConnection) {
            if (!existingConnection.connectedStations.includes(endStation)) {
                existingConnection.connectedStations.push(endStation);
            }
        }
        else {
            this.routeConnections.push({
                stationName: startStation,
                connectedStations: [endStation],
                usedBuses: busName,
            });
        }
    }
    saveToJson(filePath) {
        const dir = path_1.default.dirname(filePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(filePath, JSON.stringify(this.routeConnections, null, 2));
    }
    static readFromJson(fileName) {
        const rawData = fs_1.default.readFileSync(fileName, "utf-8");
        const connections = JSON.parse(rawData);
        const connectionMap = new Map();
        connections.forEach((connection) => {
            var _a;
            if (!connectionMap.has(connection.stationName)) {
                connectionMap.set(connection.stationName, []);
            }
            (_a = connectionMap.get(connection.stationName)) === null || _a === void 0 ? void 0 : _a.push({
                connectedStations: connection.connectedStations,
                usedBuses: connection.usedBuses,
            });
        });
        return connectionMap;
    }
}
function createConnectedStations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const processor = new BusRouteProcessor();
        yield processor.fetchData();
        processor.processRoutes();
        processor.saveToJson("/Users/macbookpro/Desktop/Workspace/json-data/connectionRoutes.json");
        res.status(200).json({ message: "success" });
    });
}
exports.createConnectedStations = createConnectedStations;
function getConnectedStations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const connectionMap = BusRouteProcessor.readFromJson("connectionRoutes.json");
        console.log(connectionMap.get("BX Gia Lâm"));
        const connectionObject = Object.fromEntries(connectionMap);
        res.status(200).json({ data: connectionObject });
    });
}
exports.getConnectedStations = getConnectedStations;
