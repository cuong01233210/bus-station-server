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
const bus_appearance_time_database_1 = require("./databases/bus-appearance-time-database");
const bus_stations_database_1 = require("./databases/bus-stations-database");
const express_1 = __importDefault(require("express"));
const buses_database_1 = require("./databases/buses-database");
const bus_router_1 = __importDefault(require("./router/bus-router"));
const auth_router_1 = __importDefault(require("./router/auth-router"));
const app_info_database_1 = require("./databases/app-info-database");
const app_database_1 = require("./databases/app-database");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
app.use(express_1.default.json());
// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log("first middleware");
//   next();
// });
// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log("second middleware");
//   next();
// });
//app.get("/xuatDB", getAllBuses);
app.use("/", bus_router_1.default);
app.use("/auth", auth_router_1.default);
databaseInit();
function databaseInit() {
    return __awaiter(this, void 0, void 0, function* () {
        yield buses_database_1.BusesDatabase.initialize();
        yield bus_stations_database_1.BusStationsDatabase.initialize();
        yield app_info_database_1.AppInfoDatabase.initialize();
        yield bus_appearance_time_database_1.BusAppearanceDatabase.initialize();
        yield app_database_1.AppDatabase.initialize();
        app.listen(port);
    });
}
// passDB: flqOFCtNjd7A6lDH
// mongodb+srv://findBusStation2:<password>@cluster0.qoqmjli.mongodb.net/
