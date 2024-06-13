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
Object.defineProperty(exports, "__esModule", { value: true });
const bus_appearance_time_database_1 = require("./../databases/bus-appearance-time-database");
class BusAppearance {
    constructor(stationName, appearances, id) {
        this.stationName = stationName;
        this.appearances = appearances;
        this.id = id;
    }
    createStationTime(stationName) {
        return __awaiter(this, void 0, void 0, function* () {
            //const usersDb: Db = UsersDatabase.getDb();
            const db = bus_appearance_time_database_1.BusAppearanceDatabase.getDb();
            delete this.id;
            // await usersDb.collection("comments").insertOne({ ...this });
            const insertOneResult = yield db
                .collection("busAppearanceTime")
                .insertOne(Object.assign({}, this));
            const stationTime = yield BusAppearance.getStationTime(stationName);
            return stationTime;
        });
    }
    static getAllStationTimes() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = bus_appearance_time_database_1.BusAppearanceDatabase.getDb();
            const documents = yield usersDb
                .collection("busAppearanceTime")
                .find()
                .toArray();
            const stationTimes = documents.map((doc) => new BusAppearance(doc.stationName, doc.appearances));
            return stationTimes;
        });
    }
    static getStationTime(stationName) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = bus_appearance_time_database_1.BusAppearanceDatabase.getDb();
            const documents = yield usersDb
                .collection("busAppearanceTime")
                .find({ stationName: stationName })
                .toArray();
            const stationTimes = documents.map((doc) => new BusAppearance(doc.stationName, doc.appearances));
            //console.log(stationTimes);
            return stationTimes[0];
        });
    }
    static getTArrayForStationAndRoute(stationName, route) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = bus_appearance_time_database_1.BusAppearanceDatabase.getDb();
            const document = yield usersDb
                .collection("busAppearanceTime")
                .findOne({ stationName: stationName });
            if (!document) {
                throw new Error(`Station with name ${stationName} not found`);
            }
            const appearance = document.appearances.find((appearance) => appearance.route === route);
            if (!appearance) {
                throw new Error(`Route ${route} not found for station ${stationName}`);
            }
            return appearance.tArray;
        });
    }
    updateStationTime(stationName, appearances = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = bus_appearance_time_database_1.BusAppearanceDatabase.getDb();
            yield usersDb.collection("busAppearanceTime").updateOne({ stationName: stationName }, {
                $set: {
                    stationName: stationName,
                    appearances: appearances,
                },
            });
            const newStationTime = yield BusAppearance.getStationTime(stationName);
            return newStationTime;
        });
    }
}
exports.default = BusAppearance;
