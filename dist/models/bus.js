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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const buses_database_1 = require("../databases/buses-database");
class Bus {
    constructor(bus, price, activityTime, gianCachChayXe, gianCachTrungBinh, chieuDi, chieuVe, id) {
        this.bus = bus;
        this.price = price;
        this.activityTime = activityTime;
        this.gianCachChayXe = gianCachChayXe;
        this.gianCachTrungBinh = gianCachTrungBinh;
        this.chieuDi = chieuDi;
        this.chieuVe = chieuVe;
        this.id = id;
    }
    static getBusIn4() {
        return __awaiter(this, void 0, void 0, function* () {
            let startTime = performance.now();
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("routes")
                .find()
                .sort({ bus: 1 })
                .toArray();
            const buses = documents.map((doc) => new Bus(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh, doc.chieuDi, doc.chieuVe, doc._id.toString()));
            let endTime = performance.now();
            console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
            return buses;
        });
    }
    static getOnlyOneBus(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const document = yield db.collection("routes").findOne({ bus: bus });
            if (document != null) {
                return new Bus(document.bus, document.price, document.activityTime, document.gianCachChayXe, document.gianCachTrungBinh, document.chieuDi, document.chieuVe);
            }
            else
                return Bus.empty;
        });
    }
    static getUserBusesPreferenceByBuses(sbuses) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("routes")
                .find({ bus: { $in: sbuses } })
                .sort({ bus: 1 })
                .toArray();
            const buses = documents.map((doc) => new Bus(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh, doc.chieuDi, doc.chieuVe, doc._id.toString()));
            return buses;
        });
    }
    createBus() {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = this, { id } = _a, busData = __rest(_a, ["id"]); // Loại bỏ trường id
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("routes").insertOne(Object.assign({}, busData));
        });
    }
    updateBus(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = this, { id } = _a, busData = __rest(_a, ["id"]); // Loại bỏ trường id
            const db = buses_database_1.BusesDatabase.getDb();
            yield db
                .collection("routes")
                .updateOne({ bus: bus }, { $set: Object.assign({}, busData) });
        });
    }
    static deleteBus(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("routes").deleteOne({ bus: bus });
        });
    }
    static getAllBusInfos() {
        return __awaiter(this, void 0, void 0, function* () {
            let startTime = performance.now();
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("routes")
                .find({}, {
                projection: {
                    bus: 1,
                    price: 1,
                    activityTime: 1,
                    gianCachChayXe: 1,
                    gianCachTrungBinh: 1,
                },
            })
                .sort({ bus: 1 })
                .toArray();
            const busInfos = documents.map((doc) => new Bus(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh, [], [], doc._id.toString()));
            let endTime = performance.now();
            console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
            return busInfos;
        });
    }
    static getBusInfo(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const document = yield db.collection("routes").findOne({ bus: bus });
            if (document != null) {
                return new Bus(document.bus, document.price, document.activityTime, document.gianCachChayXe, document.gianCachTrungBinh, [], []);
            }
            else
                return Bus.empty;
        });
    }
    static getBusRoute(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const document = yield db
                .collection("routes")
                .findOne({ bus: bus }, { projection: { chieuDi: 1, chieuVe: 1 } });
            if (document != null) {
                return new Bus(bus, 0, // Default price value
                "", // Default activityTime value
                "", // Default gianCachChayXe value
                0, // Default gianCachTrungBinh value
                document.chieuDi, document.chieuVe);
            }
            else
                return Bus.empty;
        });
    }
    static getAllBusRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("routes")
                .find({}, { projection: { bus: 1, chieuDi: 1, chieuVe: 1 } })
                .sort({ bus: 1 })
                .toArray();
            const busRoutes = documents.map((doc) => new Bus(doc.bus, 0, "", "", 0, doc.chieuDi, doc.chieuVe));
            return busRoutes;
        });
    }
}
exports.default = Bus;
