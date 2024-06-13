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
exports.getPlaces = void 0;
const place_1 = __importDefault(require("../../models/place"));
function categorizePlaces(places) {
    const stations = [];
    const schools = [];
    const hospitals = [];
    const markets = [];
    const bookstores = [];
    const parks = [];
    const pagodas = [];
    const museums = [];
    const busStations = [];
    const diffPlaces = [];
    places.forEach((place) => {
        if (place.category == "Bến xe - Nhà ga") {
            stations.push(place);
        }
        if (place.category == "Cơ sở giáo dục") {
            schools.push(place);
        }
        if (place.category == "Bệnh viện") {
            hospitals.push(place);
        }
        if (place.category == "Chợ - Siêu thị") {
            markets.push(place);
        }
        if (place.category == "Nhà sách") {
            bookstores.push(place);
        }
        if (place.category == "Công viên") {
            parks.push(place);
        }
        if (place.category == "Cơ sở tôn giáo") {
            pagodas.push(place);
        }
        if (place.category == "Bảo tàng") {
            museums.push(place);
        }
        if (place.category == "Trạm xe buýt") {
            busStations.push(place);
        }
        if (place.category == "Khác") {
            diffPlaces.push(place);
        }
    });
    return {
        stations,
        schools,
        hospitals,
        markets,
        bookstores,
        parks,
        pagodas,
        museums,
        busStations,
        diffPlaces,
    };
}
const getPlaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const places = yield place_1.default.getPlaces();
        const { stations, schools, hospitals, markets, bookstores, parks, pagodas, museums, busStations, diffPlaces, } = categorizePlaces(places);
        res.status(200).json({
            places: places,
            stations: stations,
            schools: schools,
            hospitals: hospitals,
            markets: markets,
            bookstores: bookstores,
            parks: parks,
            pagodas: pagodas,
            museums: museums,
            busStations: busStations,
            diffPlaces: diffPlaces,
        });
    }
    catch (error) {
        res.status(400).json({ message: "failed to load" });
    }
});
exports.getPlaces = getPlaces;
