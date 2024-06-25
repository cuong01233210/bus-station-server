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
exports.getStationsByIds = exports.deleteBusStationNoDistrict = exports.updateBusStationNoDistrict = exports.addBusStationNoDistrict = exports.getAllBusStationsNoDistrict = void 0;
const bus_station_1 = __importDefault(require("../../models/bus-station"));
//import BusStationsByDistrict from "../../models/bus-stations-by-district";
// export const getAllBusStations = async (req: Request, res: Response) => {
//   try {
//     //const busStations = await BusStation.getBusStationIn4();
//     const busStationsByDistrict =
//       await BusStationsByDistrict.getBusStationsByDistrictIn4();
//     res.status(200).json({
//       busStationsByDistrict: busStationsByDistrict,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error });
//   }
// };
// export const getStationNames = async (req: Request, res: Response) => {
//   try {
//     const busStationOnlyNames =
//       await BusStationsByDistrict.getBusStationOnlyNames();
//     res.status(200).json({ busStationNames: busStationOnlyNames });
//   } catch (error) {
//     res.status(400).json({ message: error });
//   }
// };
const getAllBusStationsNoDistrict = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const busStations = yield bus_station_1.default.getBusStations();
        res.status(200).json({
            busStations: busStations,
        });
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.getAllBusStationsNoDistrict = getAllBusStationsNoDistrict;
// 3 hàm add, update, delete là của staff
const addBusStationNoDistrict = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const busStation = new bus_station_1.default(req.body.name, req.body.buses, req.body.lat, req.body.long, req.body.id);
        yield busStation.createBusStation();
        res.status(200).json({
            message: "add bus station successfully",
        });
    }
    catch (error) {
        res.status(400).json({ message: "error" });
    }
});
exports.addBusStationNoDistrict = addBusStationNoDistrict;
const updateBusStationNoDistrict = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const busStation = new bus_station_1.default(req.body.name, req.body.buses, req.body.lat, req.body.long, req.body.id);
        yield busStation.updateBusStation(req.body.id);
        res.status(200).json({
            message: "update bus station successfully",
        });
    }
    catch (error) {
        res.status(400).json({ message: "error" });
    }
});
exports.updateBusStationNoDistrict = updateBusStationNoDistrict;
const deleteBusStationNoDistrict = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const busStation = new bus_station_1.default(req.body.name, req.body.buses, req.body.lat, req.body.long, req.body.id);
        yield busStation.deleteBusStation(req.body.name);
        res.status(200).json({
            message: "delete bus station successfully",
        });
    }
    catch (error) {
        res.status(400).json({ message: "error" });
    }
});
exports.deleteBusStationNoDistrict = deleteBusStationNoDistrict;
const getStationsByIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stationIds = req.body.stationIds; // Bên SwiftUI đang coi name là id
        const busStations = yield bus_station_1.default.getStationsByNames(stationIds);
        res.status(200).json({
            busStations: busStations,
        });
    }
    catch (error) {
        console.error("Lỗi khi gọi getStationsByNames:", error);
        res.status(400).json({ message: error });
    }
});
exports.getStationsByIds = getStationsByIds;
