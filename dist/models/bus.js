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
class Bus {
    constructor(bus, price, activityTime, gianCachChayXe, gianCachTrungBinh, chieuDi, chieuVe) {
        this.bus = bus;
        this.price = price;
        this.activityTime = activityTime;
        this.gianCachChayXe = gianCachChayXe;
        this.gianCachTrungBinh = gianCachTrungBinh;
        this.chieuDi = chieuDi;
        this.chieuVe = chieuVe;
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
            const buses = documents.map((doc) => new Bus(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh, doc.chieuDi, doc.chieuVe));
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
                .toArray();
            const buses = documents.map((doc) => new Bus(doc.bus, doc.price, doc.activityTime, doc.gianCachChayXe, doc.gianCachTrungBinh, doc.chieuDi, doc.chieuVe));
            return buses;
        });
    }
    createBus() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("routes").insertOne(Object.assign({}, this));
        });
    }
    updateBus(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db
                .collection("routes")
                .updateOne({ bus: bus }, { $set: Object.assign({}, this) });
        });
    }
    static deleteBus(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("routes").deleteOne({ bus: bus });
        });
    }
}
exports.default = Bus;
