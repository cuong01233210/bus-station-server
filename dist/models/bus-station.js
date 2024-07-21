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
const mongodb_1 = require("mongodb");
const bus_stations_database_1 = require("../databases/bus-stations-database");
class BusStation {
    constructor(name, buses, lat, long, id) {
        this.name = name;
        this.buses = buses;
        this.lat = lat;
        this.long = long;
        this.id = id;
    }
    static getBusStations() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            yield db.collection("busStations").createIndex({ name: 1 });
            const documents = yield db
                .collection("busStations")
                .find()
                .sort({ name: 1 })
                .toArray();
            // console.log("Documents in busStations collection:", documents);
            const busStations = documents.map((doc) => new BusStation(doc.name, doc.buses, doc.lat, doc.long, doc._id.toString()));
            //.log(busStations);
            return busStations;
        });
    }
    createBusStation() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            delete this.id;
            const result = yield db.collection("busStations").insertOne(this);
            //console.log(result);
        });
    }
    updateBusStation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            delete this.id;
            const result = yield db.collection("busStations").updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                $set: {
                    name: this.name,
                    buses: this.buses,
                    lat: this.lat,
                    long: this.long,
                },
            });
            // console.log(result);
        });
    }
    deleteBusStation(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            const result = yield db.collection("busStations").deleteOne({ name: name });
            // console.log(result);
        });
    }
    // Lấy các trạm xe buýt theo mảng name truyền vào
    static getStationsByNames(busStationNames) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("da vao ham getStationsByNames");
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            // Kiểm tra đầu vào
            console.log("Tên trạm đầu vào:", busStationNames);
            const documents = yield db
                .collection("busStations")
                .find({ name: { $in: busStationNames } })
                .toArray();
            // Kiểm tra kết quả truy vấn
            console.log("Tài liệu từ cơ sở dữ liệu:", documents);
            const busStations = documents.map((doc) => new BusStation(doc.name, doc.buses, doc.lat, doc.long));
            // Kiểm tra kết quả cuối cùng
            console.log("Các trạm xe buýt:", busStations);
            return busStations;
        });
    }
    // Get a bus station by name
    static getBusStationByName(stationName) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            const document = yield db
                .collection("busStations")
                .findOne({ name: stationName });
            if (!document) {
                throw new Error(`Bus station with name ${stationName} not found`);
            }
            return new BusStation(document.name, document.buses, document.lat, document.long, document._id.toString());
        });
    }
    static getBusStationsAsMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = bus_stations_database_1.BusStationsDatabase.getDb();
            yield db.collection("busStations").createIndex({ name: 1 });
            const documents = yield db
                .collection("busStations")
                .find()
                .sort({ name: 1 })
                .toArray();
            const busStationMap = new Map();
            documents.forEach((doc) => {
                const busStation = new BusStation(doc.name, doc.buses, doc.lat, doc.long, doc._id.toString());
                busStationMap.set(doc.name, busStation);
            });
            return busStationMap;
        });
    }
}
exports.default = BusStation;
