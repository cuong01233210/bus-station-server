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
exports.getDistance = exports.getLatLong = exports.testLocationIQ = void 0;
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const axios_1 = __importDefault(require("axios"));
const options = {
    provider: "locationiq",
    apiKey: "pk.f9d511f00dc9fe72f59065eb39ef79e5",
    formatter: null,
};
const APIKEY = "pk.f9d511f00dc9fe72f59065eb39ef79e5";
function testLocationIQ(req, res) {
    const geocoder = (0, node_geocoder_1.default)(options);
    const startLocation = req.body.strLocation;
    // Sử dụng geocode method để lấy tọa độ từ địa chỉ
    let lat1 = 0;
    let long1 = 0;
    geocoder
        .geocode("21 Lê Duẩn, Đà Nẵng")
        .then(function (response) {
        console.log(response[0].latitude);
        console.log(response[0].longitude);
        if (response[0].latitude !== undefined &&
            response[0].longitude !== undefined) {
            const lat2 = response[0].latitude;
            const long2 = response[0].longitude;
            lat1 = lat2;
            long1 = long2;
            res.status(200).json({ lat: lat1, long: long1 });
            //
        }
    })
        .catch(function (err) {
        console.log(err);
    });
}
exports.testLocationIQ = testLocationIQ;
function getLatLong(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const geocoder = (0, node_geocoder_1.default)(options);
        try {
            const response = yield geocoder.geocode(location);
            if (response[0].latitude !== undefined &&
                response[0].longitude !== undefined) {
                const latlong = {
                    lat: response[0].latitude,
                    long: response[0].longitude,
                };
                return latlong;
            }
            else {
                const latLong = {
                    lat: 0,
                    long: 0,
                };
                return latLong;
            }
        }
        catch (err) {
            console.error(err);
            const latLong = {
                lat: 0,
                long: 0,
            };
            return latLong;
        }
    });
}
exports.getLatLong = getLatLong;
function getDistance(lat1, lon1, lat2, lon2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `https://us1.locationiq.com/v1/directions/driving/${lon1},${lat1};${lon2},${lat2}?key=${APIKEY}&steps=true&alternatives=true&geometries=polyline&overview=full&`;
            const response = yield axios_1.default.get(url);
            const data = response.data;
            if (data.error) {
                console.error("Error:", data.error);
                return 0;
            }
            else {
                const distance = data.routes[0].distance;
                return distance;
            }
        }
        catch (error) {
            console.log("Error:");
            return 0;
        }
    });
}
exports.getDistance = getDistance;
