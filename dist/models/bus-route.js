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
class BusRoute {
    constructor(bus, chieuDi, chieuVe) {
        this.bus = bus;
        this.chieuDi = chieuDi;
        this.chieuVe = chieuVe;
    }
    static getAllBusRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            let startTime = performance.now();
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db.collection("bus_routes").find().sort({ bus: 1 }).toArray();
            const busRoutes = documents.map((doc) => new BusRoute(doc.bus, doc.chieuDi, doc.chieuVe));
            let endTime = performance.now();
            console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
            return busRoutes;
        });
    }
    static getBusRoute(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const document = yield db.collection("bus_routes").findOne({ bus: bus });
            if (document != null) {
                return new BusRoute(document.bus, document.chieuDi, document.chieuVe);
            }
            else
                return BusRoute.empty;
        });
    }
    static getUserBusRoutesPreference(sbuses) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            const documents = yield db
                .collection("bus_routes")
                .find({ bus: { $in: sbuses } })
                .toArray();
            const busRoutes = documents.map((doc) => new BusRoute(doc.bus, doc.chieuDi, doc.chieuVe));
            return busRoutes;
        });
    }
    createBusRoute() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("bus_routes").insertOne(Object.assign({}, this));
        });
    }
    updateBusRoute(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db
                .collection("bus_routes")
                .updateOne({ bus: bus }, { $set: Object.assign({}, this) });
        });
    }
    static deleteBusRoute(bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = buses_database_1.BusesDatabase.getDb();
            yield db.collection("bus_routes").deleteOne({ bus: bus });
        });
    }
}
exports.default = BusRoute;
