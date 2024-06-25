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
exports.deleteStationPreference = exports.addStationPrefer = exports.getAllStationsPreference = exports.deleteBusPreference = exports.addBusPrefer = exports.getAllBusPreference = void 0;
const user_buses_preference_1 = __importDefault(require("../../models/user-buses-preference"));
const user_station_preference_1 = __importDefault(require("../../models/user-station-preference"));
function getAllBusPreference(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = res.locals.userId;
        try {
            const userBusesPreference = yield user_buses_preference_1.default.getUserBusesPreference(userId);
            //console.log(userBusesPreference.map((pref) => pref.bus));
            res.status(200).json({
                sbuses: userBusesPreference.map((pref) => pref.bus),
            });
        }
        catch (error) {
            res.status(400).json({ message: "fail" });
        }
    });
}
exports.getAllBusPreference = getAllBusPreference;
function addBusPrefer(req, res) {
    const userId = res.locals.userId;
    const bus = req.body.bus;
    // console.log(bus);
    // console.log(userId);
    try {
        const userBusPreference = new user_buses_preference_1.default(userId, bus);
        userBusPreference.createUserBusPreference(userId);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ message: "fail" });
    }
}
exports.addBusPrefer = addBusPrefer;
function deleteBusPreference(req, res) {
    const userId = res.locals.userId;
    const bus = req.body.bus;
    try {
        user_buses_preference_1.default.deleteUserBusPreference(userId, bus);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ message: "fail" });
    }
}
exports.deleteBusPreference = deleteBusPreference;
function getAllStationsPreference(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = res.locals.userId;
        //console.log(userId);
        try {
            const userStationsPreference = yield user_station_preference_1.default.getUserStationPreference(userId);
            // console.log(userStationsPreference.map((pref) => pref.stationId));
            res.status(200).json({
                stationIds: userStationsPreference.map((pref) => pref.stationId),
            });
        }
        catch (error) {
            res.status(400).json({ message: "fail" });
        }
    });
}
exports.getAllStationsPreference = getAllStationsPreference;
function addStationPrefer(req, res) {
    const userId = res.locals.userId;
    const stationId = req.body.stationId;
    try {
        const userStationPreference = new user_station_preference_1.default(userId, stationId);
        userStationPreference.createUserStationPreference(userId);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ message: "fail" });
    }
}
exports.addStationPrefer = addStationPrefer;
function deleteStationPreference(req, res) {
    const userId = res.locals.userId;
    const stationId = req.body.stationId;
    try {
        user_station_preference_1.default.deleteUserStationPreference(userId, stationId);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ message: "fail" });
    }
}
exports.deleteStationPreference = deleteStationPreference;
