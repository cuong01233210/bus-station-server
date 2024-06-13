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
const buses_database_1 = require("../databases/buses-database");
class BusInfo {
    constructor(bus, price, activityTime, gianCachChayXe, gianCachTrungBinh) {
        this.bus = bus;
        this.price = price;
        this.activityTime = activityTime;
        this.gianCachChayXe = gianCachChayXe;
        this.gianCachTrungBinh = gianCachTrungBinh;
    }
    static getAllBusInfos() {
        return __awaiter(this, void 0, void 0, function* () {
            let startTime = performance.now();
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("bus_infos")
                .find()
                .sort({ bus: 1 })
                .toArray();
            const busInfos = documents.map((doc) => new BusInfo(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh));
            let endTime = performance.now();
            console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
            return busInfos;
        });
    }
    static getBusInfo(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const document = yield db.collection("bus_infos").findOne({ bus: bus });
            if (document != null) {
                return new BusInfo(document.bus, document.price, document.activityTime, document.gianCachChayXe, document.gianCachTrungBinh);
            }
            else
                return BusInfo.empty;
        });
    }
    static getUserBusInfosPreference(sbuses) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("bus_infos")
                .find({ bus: { $in: sbuses } })
                .toArray();
            const busInfos = documents.map((doc) => new BusInfo(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh));
            return busInfos;
        });
    }
    createBusInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("bus_infos").insertOne(Object.assign({}, this));
        });
    }
    updateBusInfo(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db
                .collection("bus_infos")
                .updateOne({ bus: bus }, { $set: Object.assign({}, this) });
        });
    }
    static deleteBusInfo(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("bus_infos").deleteOne({ bus: bus });
        });
    }
}
exports.default = BusInfo;
