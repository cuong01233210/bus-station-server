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
exports.findStartTime = exports.getOneTime = exports.getApprearanceTime = exports.calculateRoutesTime = exports.getCurrentHourAndMinuteInVietnam = exports.calculateTime = void 0;
const test_geocoding_controller_1 = require("./test-geocoding-controller");
const bus_appearance_time_1 = __importDefault(require("../../../../models/bus-appearance-time"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const bus_route_1 = __importDefault(require("../../../../models/bus-route"));
const bus_info_1 = __importDefault(require("../../../../models/bus-info"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bus_station_1 = __importDefault(require("../../../../models/bus-station"));
function convertStringTime(timeString) {
    // Tìm vị trí của ký tự 'h' trong chuỗi
    const indexOfH = timeString.indexOf("h");
    // Lấy giờ từ đầu chuỗi đến vị trí của ký tự 'h'
    const hourString = timeString.substring(0, indexOfH);
    const hour = parseInt(hourString, 10);
    // Lấy phút từ vị trí của ký tự 'h' đến hết chuỗi
    const minuteString = timeString.substring(indexOfH + 1);
    const minute = parseInt(minuteString, 10);
    // Trả về đối tượng chứa giá trị giờ và phút
    return { hour: hour, minute: minute };
}
function convertDoubleTime(tDouble) {
    const hour = Math.floor(tDouble); // Lấy phần nguyên
    const minute = Math.round((tDouble - hour) * 60); // Lấy phần thập phân và chuyển đổi thành phút
    return { hour: hour, minute: minute };
}
// ý tưởng: tận dụng thời gian giãn cách giữa các tuyến để đỡ phải dùng vòng lặp nhiều lần
// chỉ cần tính toán ra lần đầu tiên tuyến xuất hiện tại trạm theo chiều đi và về
// sau đó sẽ cộng dồn giãn cách cho tới khi chạm tới giới hạn thời gian hoạt động trong ngày của tuyến
// ex: tuyến 01 thời gian khởi đầu là 5h00, thời điểm kết thúc là 21h00
// giãn cách giữa các chuyến là 15p, vận tốc trung bình ước lượng đc là 25.5 km/h
// thì ở trạm đầu tiên của chiều đi thời gian xuất hiện xe sẽ là 5h00, 5h15, 5h30,... 21h00
// giả sử từ trạm đầu tiên tới trạm thứ 2 mất 5h thì thời gian xuất hiện xe là 5h05, 5h35, ... 20h50
function calculateTime(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const route = req.body.route;
        const Vtb = req.body.Vtb;
        const gianCachTrungBinh = req.body.gianCachTrungBinh;
        const tKDString = req.body.tKDString;
        const tKTString = req.body.tKTString;
        const firstAppearChieuDi = [];
        const firstAppearChieuVe = [];
        firstAppearChieuDi.push(0);
        firstAppearChieuVe.push(0);
        const busRoute = yield bus_route_1.default.getBusRoute(route);
        const busInfo = yield bus_info_1.default.getBusInfo(route);
        if (!busRoute || !busInfo) {
            res.status(404).json({ message: "Bus route or info not found" });
            return;
        }
        let chieuDi = busRoute.chieuDi;
        let chieuVe = busRoute.chieuVe;
        let tDi = 0;
        let tVe = 0;
        for (let j = 0; j < chieuDi.length - 1; j++) {
            const distance = (0, test_geocoding_controller_1.haversineDistance)(chieuDi[j].lat, chieuDi[j].long, chieuDi[j + 1].lat, chieuDi[j + 1].long);
            const deltaT = distance / Vtb;
            tDi += deltaT;
            firstAppearChieuDi.push(tDi);
        }
        for (let j = 0; j < chieuVe.length - 1; j++) {
            const distance = (0, test_geocoding_controller_1.haversineDistance)(chieuVe[j].lat, chieuVe[j].long, chieuVe[j + 1].lat, chieuVe[j + 1].long);
            const deltaT = distance / Vtb;
            tVe += deltaT;
            firstAppearChieuVe.push(tVe);
        }
        const tKD = convertStringTime(tKDString);
        const tKT = convertStringTime(tKTString);
        for (let j = 0; j < chieuDi.length; j++) {
            const tArray = [];
            const tTemp = convertDoubleTime(firstAppearChieuDi[j]);
            tTemp.hour += tKD.hour;
            tTemp.minute += tKD.minute;
            while (tTemp.hour < tKT.hour ||
                (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)) {
                tArray.push({ hour: tTemp.hour, minute: tTemp.minute });
                tTemp.minute += gianCachTrungBinh;
                if (tTemp.minute >= 60) {
                    tTemp.hour++;
                    tTemp.minute -= 60;
                }
            }
            const stationTime = yield bus_appearance_time_1.default.getStationTime(chieuDi[j].name);
            if (!stationTime) {
                const appearances = [{ route: route, tArray }];
                const busAppearance = new bus_appearance_time_1.default(chieuDi[j].name, appearances);
                yield busAppearance.createStationTime(chieuDi[j].name);
            }
            else {
                const appearances = stationTime.appearances;
                let routeExists = false;
                for (let k = 0; k < appearances.length; k++) {
                    if (appearances[k].route === route) {
                        routeExists = true;
                        break;
                    }
                }
                if (!routeExists) {
                    appearances.push({ route: route, tArray });
                    const busAppearance = new bus_appearance_time_1.default(chieuDi[j].name, appearances);
                    yield busAppearance.updateStationTime(chieuDi[j].name, appearances);
                }
            }
        }
        for (let j = 0; j < chieuVe.length; j++) {
            const tArray = [];
            const tTemp = convertDoubleTime(firstAppearChieuVe[j]);
            tTemp.hour += tKD.hour;
            tTemp.minute += tKD.minute;
            while (tTemp.hour < tKT.hour ||
                (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)) {
                tArray.push({ hour: tTemp.hour, minute: tTemp.minute });
                tTemp.minute += gianCachTrungBinh;
                if (tTemp.minute >= 60) {
                    tTemp.hour++;
                    tTemp.minute -= 60;
                }
            }
            const stationTime = yield bus_appearance_time_1.default.getStationTime(chieuVe[j].name);
            if (!stationTime) {
                const appearances = [{ route: route, tArray }];
                const busAppearance = new bus_appearance_time_1.default(chieuVe[j].name, appearances);
                yield busAppearance.createStationTime(chieuVe[j].name);
            }
            else {
                const appearances = stationTime.appearances;
                let routeExists = false;
                for (let k = 0; k < appearances.length; k++) {
                    if (appearances[k].route === route) {
                        routeExists = true;
                        break;
                    }
                }
                if (!routeExists) {
                    appearances.push({ route: route, tArray });
                    const busAppearance = new bus_appearance_time_1.default(chieuVe[j].name, appearances);
                    yield busAppearance.updateStationTime(chieuVe[j].name, appearances);
                }
            }
        }
        console.log("success");
        res.status(200).json({ message: "success" });
    });
}
exports.calculateTime = calculateTime;
function splitActivityTime(activityTime) {
    // Tách chuỗi bằng ký tự '->'
    const [tKDString, tKTString] = activityTime
        .split(" -> ")
        .map((str) => str.trim());
    return { tKDString, tKTString };
}
// Lấy giờ và phút hiện tại ở Việt Nam
function getCurrentHourAndMinuteInVietnam() {
    const currentTime = (0, moment_timezone_1.default)().tz("Asia/Ho_Chi_Minh");
    const hour = currentTime.hour();
    const minute = currentTime.minute();
    return { hour, minute };
}
exports.getCurrentHourAndMinuteInVietnam = getCurrentHourAndMinuteInVietnam;
// Define the path to your JSON file
const filePath = path_1.default.join("/Users/macbookpro/Desktop/Workspace", "busappearance.json");
// Function to check if the file exists and initialize it if necessary
function ensureFileExists() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                    fs_1.default.writeFile(filePath, "[]", "utf8", (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(true);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            });
        });
    });
}
// Function to read data from the JSON file
function readJsonFile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureFileExists();
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (parseError) {
                        // If parsing fails, resolve with an empty array and reset the file
                        fs_1.default.writeFile(filePath, "[]", "utf8", (writeErr) => {
                            if (writeErr) {
                                reject(writeErr);
                            }
                            else {
                                resolve([]);
                            }
                        });
                    }
                }
            });
        });
    });
}
// Function to write data to the JSON file
function writeJsonFile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    });
}
// Function to round minutes
function roundMinutes(time) {
    time.minute = Math.round(time.minute);
    if (time.minute >= 60) {
        time.hour++;
        time.minute -= 60;
    }
    return time;
}
function calculateOneRouteTime(busRoute, busInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const Vtb = 25;
        const route = busInfo.bus;
        const gianCachTrungBinh = busInfo.gianCachTrungBinh;
        const { tKDString, tKTString } = splitActivityTime(busInfo.activityTime);
        if (!tKDString || !tKTString) {
            throw new Error("Activity time is not properly defined");
        }
        const firstAppearChieuDi = [];
        const firstAppearChieuVe = [];
        firstAppearChieuDi.push(0);
        firstAppearChieuVe.push(0);
        let chieuDi = busRoute.chieuDi;
        let chieuVe = busRoute.chieuVe;
        let tDi = 0;
        let tVe = 0;
        for (let j = 0; j < chieuDi.length - 1; j++) {
            const distance = (0, test_geocoding_controller_1.haversineDistance)(chieuDi[j].lat, chieuDi[j].long, chieuDi[j + 1].lat, chieuDi[j + 1].long);
            const deltaT = distance / Vtb;
            tDi += deltaT;
            firstAppearChieuDi.push(tDi);
        }
        for (let j = 0; j < chieuVe.length - 1; j++) {
            const distance = (0, test_geocoding_controller_1.haversineDistance)(chieuVe[j].lat, chieuVe[j].long, chieuVe[j + 1].lat, chieuVe[j + 1].long);
            const deltaT = distance / Vtb;
            tVe += deltaT;
            firstAppearChieuVe.push(tVe);
        }
        let tKD, tKT;
        try {
            tKD = convertStringTime(tKDString);
            tKT = convertStringTime(tKTString);
        }
        catch (error) {
            console.error("Error converting time strings:", { tKDString, tKTString });
            throw error;
        }
        const jsonData = yield readJsonFile();
        for (let j = 0; j < chieuDi.length; j++) {
            const tArray = [];
            const tTemp = convertDoubleTime(firstAppearChieuDi[j]);
            tTemp.hour += tKD.hour;
            tTemp.minute += tKD.minute;
            while (tTemp.hour < tKT.hour ||
                (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)) {
                tArray.push(roundMinutes({ hour: tTemp.hour, minute: tTemp.minute }));
                tTemp.minute += gianCachTrungBinh;
                if (tTemp.minute >= 60) {
                    tTemp.hour++;
                    tTemp.minute -= 60;
                }
            }
            const station = jsonData.find((station) => station.stationName === chieuDi[j].name);
            if (!station) {
                jsonData.push({
                    stationName: chieuDi[j].name,
                    appearances: [{ route: route, tArray }],
                });
            }
            else {
                const appearances = station.appearances;
                const routeExists = appearances.some((appearance) => appearance.route === route);
                if (!routeExists) {
                    appearances.push({ route: route, tArray });
                }
            }
        }
        for (let j = 0; j < chieuVe.length; j++) {
            const tArray = [];
            const tTemp = convertDoubleTime(firstAppearChieuVe[j]);
            tTemp.hour += tKD.hour;
            tTemp.minute += tKD.minute;
            while (tTemp.hour < tKT.hour ||
                (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)) {
                tArray.push(roundMinutes({ hour: tTemp.hour, minute: tTemp.minute }));
                tTemp.minute += gianCachTrungBinh;
                if (tTemp.minute >= 60) {
                    tTemp.hour++;
                    tTemp.minute -= 60;
                }
            }
            const station = jsonData.find((station) => station.stationName === chieuVe[j].name);
            if (!station) {
                jsonData.push({
                    stationName: chieuVe[j].name,
                    appearances: [{ route: route, tArray }],
                });
            }
            else {
                const appearances = station.appearances;
                const routeExists = appearances.some((appearance) => appearance.route === route);
                if (!routeExists) {
                    appearances.push({ route: route, tArray });
                }
            }
        }
        yield writeJsonFile(jsonData);
        console.log("tuyen ", route, " is success");
    });
}
function calculateRoutesTime(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const busRoutes = yield bus_route_1.default.getAllBusRoutes();
        const busInfos = yield bus_info_1.default.getAllBusInfos();
        for (let i = 0; i < busInfos.length; i++) {
            try {
                yield calculateOneRouteTime(busRoutes[i], busInfos[i]);
            }
            catch (error) {
                console.error("Error processing route ", busInfos[i].bus, ": ", error);
                console.log("tuyen ", busInfos[i].bus, " is failed");
            }
        }
        res.status(200).json({ message: "success" });
    });
}
exports.calculateRoutesTime = calculateRoutesTime;
function getApprearanceTime(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appTime = yield bus_appearance_time_1.default.getAllStationTimes();
            res.status(200).json({ appTime: appTime });
        }
        catch (error) {
            res.status(400).json({ message: "error" });
        }
    });
}
exports.getApprearanceTime = getApprearanceTime;
function getOneTime(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appearance = yield bus_appearance_time_1.default.getStationTime(req.body.stationName);
            res.status(200).json({ appearance: appearance });
        }
        catch (error) {
            res.status(400).json({ message: "error" });
        }
    });
}
exports.getOneTime = getOneTime;
function findStartTime(startPlaceLat, startPlaceLong, userInputHour, userInputMinute, route, stationName) {
    return __awaiter(this, void 0, void 0, function* () {
        let startHour = -1;
        let startMinute = -1;
        let roundedWalkingTime = 0;
        try {
            let tArray = yield bus_appearance_time_1.default.getTArrayForStationAndRoute(stationName, route);
            // xác định thời gian người dùng di chuyển được từ vị trí người dùng ra trạm
            const stationInfo = yield bus_station_1.default.getBusStationByName(stationName);
            const dis = (0, test_geocoding_controller_1.haversineDistance)(startPlaceLat, startPlaceLong, stationInfo.lat, stationInfo.long);
            const walkingTime = dis / 5;
            roundedWalkingTime = Math.ceil(walkingTime);
            //console.log("roundedWalkingTime: ", roundedWalkingTime);
            userInputMinute = userInputMinute + roundedWalkingTime;
            while (userInputMinute >= 60) {
                userInputMinute = userInputMinute - 60;
                userInputHour = userInputHour + 1;
                if (userInputHour == 24)
                    userInputHour = 0;
            }
            tArray = tArray.filter((time) => {
                if (time.hour > userInputHour) {
                    return true;
                }
                else if (time.hour === userInputHour) {
                    return time.minute >= userInputMinute;
                }
                return false;
            });
            if (tArray.length > 0) {
                startHour = tArray[0].hour;
                startMinute = tArray[0].minute;
            }
            // console.log(userInputHour, " ", userInputMinute);
            //console.log(tArray)
        }
        catch (error) { }
        return { startHour, startMinute, roundedWalkingTime };
    });
}
exports.findStartTime = findStartTime;
