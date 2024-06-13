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
exports.haversineDistance = exports.convertIn4_2 = exports.getDirectionsAndDistance = exports.convertIn4 = void 0;
const axios_1 = __importDefault(require("axios"));
let GOOGLEMAP_API_KEY = "AIzaSyCHFYiIDPNpHJn4mdjhhpLMpUk0qcUbFAI";
function convertIn4(address) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const ans = {
            lat: 0.0,
            long: 0.0,
            district: "ha noi",
        };
        let compoundCode = "";
        const apiKey = GOOGLEMAP_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        console.log(url);
        try {
            const response = yield axios_1.default.get(url);
            const data = response.data;
            const results = data.results;
            if (results.length > 0) {
                const firstResult = results[0];
                const geometry = firstResult.geometry;
                const location = geometry.location;
                compoundCode = (_a = firstResult.plus_code) === null || _a === void 0 ? void 0 : _a.compound_code;
                const firstSpaceIndex = compoundCode.indexOf(" ");
                const modifiedCompoundCode = compoundCode.slice(0, firstSpaceIndex) +
                    "," +
                    compoundCode.slice(firstSpaceIndex + 1);
                const result = modifiedCompoundCode.split(",").map((part) => part.trim());
                ans.district = result[1];
                ans.lat = location.lat;
                ans.long = location.lng;
            }
            return ans;
        }
        catch (error) {
            //console.error("Error retrieving geocode1:", error);
            // throw error;
            // chỗ này xử lý trường hợp định dạng json của link lại biến đổi
            try {
                const response = yield axios_1.default.get(url);
                const data = response.data;
                const results = data.results;
                if (results.length > 0) {
                    const firstResult = results[0];
                    const district = firstResult.address_components[1].long_name;
                    const lat = firstResult.geometry.location.lat;
                    const long = firstResult.geometry.location.lng;
                    ans.district = district;
                    ans.lat = lat;
                    ans.long = long;
                }
                return ans;
                // console.log(results);
            }
            catch (error) {
                console.error("Error retrieving geocode2:", error);
            }
            return ans;
        }
    });
}
exports.convertIn4 = convertIn4;
// Hàm lấy thông tin về đường đi giữa hai điểm A và B
function getDirectionsAndDistance(lat1, lng1, lat2, lng2) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = GOOGLEMAP_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lng1}&destination=${lat2},${lng2}&key=${apiKey}`;
        console.log("distance url");
        console.log(url);
        try {
            const response = yield axios_1.default.get(url);
            const data = response.data;
            if (data.routes.length > 0) {
                const route = data.routes[0];
                const distanceInMeters = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
                return distanceInMeters;
            }
            else {
                console.log(data);
                return 999999;
            }
        }
        catch (error) {
            console.error("Error retrieving directions:", error);
            return 100000000;
        }
    });
}
exports.getDirectionsAndDistance = getDirectionsAndDistance;
// lấy lat long theo free geoconding api
function convertIn4_2(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const ans = {
            lat: 0.0,
            long: 0.0,
            district: "ha noi",
        };
    });
}
exports.convertIn4_2 = convertIn4_2;
// áp dụng công thức haversine để tính khoảng cách giữa 2 điểm với lat long cho trước (đường chim bay)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính trái đất ở đơn vị kilômét
    // Đổi độ sang radian
    const lat1Rad = (Math.PI / 180) * lat1;
    const lon1Rad = (Math.PI / 180) * lon1;
    const lat2Rad = (Math.PI / 180) * lat2;
    const lon2Rad = (Math.PI / 180) * lon2;
    // Độ thay đổi của latitude và longitude
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    // Sử dụng công thức Haversine để tính khoảng cách
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
exports.haversineDistance = haversineDistance;
// Sử dụng hàm để tính khoảng cách giữa hai điểm
const lat1 = 21.00365; // Vĩ độ điểm 1
const lon1 = 105.6356667; // Kinh độ điểm 1
const lat2 = 21.0495026; // Vĩ độ điểm 2
const lon2 = 105.8849267; // Kinh độ điểm 2
const result = haversineDistance(lat1, lon1, lat2, lon2);
//console.log(`Khoảng cách giữa hai điểm là ${result.toFixed(2)} km`);
