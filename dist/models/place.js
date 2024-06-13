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
const app_database_1 = require("../databases/app-database");
class Place {
    constructor(name, category, lat, long) {
        this.name = name;
        this.category = category;
        this.lat = lat;
        this.long = long;
    }
    static getPlaces() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const documents = yield db.collection("places").find().toArray();
            const places = documents.map((doc) => new Place(doc.name, doc.category, doc.lat, doc.long));
            return places;
        });
    }
}
exports.default = Place;
