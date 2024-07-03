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
exports.deleteBus = exports.updateBus = exports.createBus = exports.getOneBusRoute = exports.getAllBusNames = exports.getAllBusesByBusNameArray = exports.getAllBuses = void 0;
const bus_1 = __importDefault(require("../../models/bus"));
const getAllBuses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buses = yield bus_1.default.getBusIn4();
        // console.log(buses);
        res.status(200).json({ buses: buses });
    }
    catch (error) {
        res.status(400).json({ message: "failed to load" });
    }
});
exports.getAllBuses = getAllBuses;
const getAllBusesByBusNameArray = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sbuses = req.body.sbuses;
        console.log(sbuses);
        const buses = yield bus_1.default.getUserBusesPreferenceByBuses(sbuses);
        res.status(200).json({
            buses: buses.map((bus) => ({
                id: bus.id ? bus.id : "",
                bus: bus.bus,
                price: bus.price,
                activityTime: bus.activityTime,
                gianCachChayXe: bus.gianCachChayXe,
                gianCachTrungBinh: bus.gianCachTrungBinh,
                //   chieuDi: bus.chieuDi.map((di) => di.name),
                //  chieuVe: bus.chieuVe.map((ve) => ve.name),
            })),
        });
    }
    catch (error) {
        res.status(400).json({ message: "failed to load" });
    }
});
exports.getAllBusesByBusNameArray = getAllBusesByBusNameArray;
const getAllBusNames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buses = yield bus_1.default.getBusIn4();
        res.status(200).json({
            buses: buses.map((bus) => ({
                id: bus.id,
                bus: bus.bus,
                price: bus.price,
                activityTime: bus.activityTime,
                gianCachChayXe: bus.gianCachChayXe,
                gianCachTrungBinh: bus.gianCachTrungBinh,
                //   chieuDi: bus.chieuDi.map((di) => di.name),
                //  chieuVe: bus.chieuVe.map((ve) => ve.name),
            })),
        });
    }
    catch (error) {
        res.status(400).json({ message: "failed to load" });
    }
});
exports.getAllBusNames = getAllBusNames;
const getOneBusRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log(req.params.bus);
    try {
        const bus = yield bus_1.default.getOnlyOneBus(req.params.bus);
        res.status(200).json({
            chieuDi: bus.chieuDi,
            chieuVe: bus.chieuVe,
        });
    }
    catch (error) {
        res.status(400).json({ message: "failed to load" });
    }
});
exports.getOneBusRoute = getOneBusRoute;
const createBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bus = new bus_1.default(req.body.bus, req.body.price, req.body.activityTime, req.body.gianCachChayXe, req.body.gianCachTrungBinh, req.body.chieuDi, req.body.chieuVe);
        yield bus.createBus();
        res.status(200).json({ message: "created" });
    }
    catch (error) {
        res.status(400).json({ message: "failed to create" });
    }
});
exports.createBus = createBus;
const updateBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bus = new bus_1.default(req.body.bus, req.body.price, req.body.activityTime, req.body.gianCachChayXe, req.body.gianCachTrungBinh, req.body.chieuDi, req.body.chieuVe);
        yield bus.updateBus(req.body.bus);
        res.status(200).json({ message: "updated" });
    }
    catch (error) {
        res.status(400).json({ message: "failed to update" });
    }
});
exports.updateBus = updateBus;
const deleteBus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //console.log(req.body.bus);
        yield bus_1.default.deleteBus(req.body.bus);
        res.status(200).json({ message: "deleted" });
    }
    catch (error) {
        res.status(400).json({ message: "failed to delete" });
    }
});
exports.deleteBus = deleteBus;
