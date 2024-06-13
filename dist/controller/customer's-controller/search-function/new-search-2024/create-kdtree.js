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
exports.createKDTree = void 0;
const bus_station_1 = __importDefault(require("../../../../models/bus-station"));
const kdTree_1 = __importDefault(require("./kdTree"));
function createKDTree(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const busStations = yield bus_station_1.default.getBusStations();
        //console.log(busStations);
        //console.log("inputIn4: ", inputIn4);
        let stationPoints = [];
        let busStationsLength = busStations.length;
        for (let i = 0; i < busStationsLength; i++) {
            const point = {
                name: busStations[i].name,
                lat: busStations[i].lat,
                long: busStations[i].long,
            };
            //console.log(point);
            stationPoints.push(point);
        }
        const tree = new kdTree_1.default(null, stationPoints);
        tree.build();
        // Lưu cây vào file JSON
        tree.saveToFile("kdtree.json");
        res.status(200).json({ message: "success" });
    });
}
exports.createKDTree = createKDTree;
