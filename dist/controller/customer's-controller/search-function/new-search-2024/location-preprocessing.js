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
exports.getLocationIn4 = void 0;
const LocationIQ_1 = require("./LocationIQ");
function getLocationIn4(startString, endString) {
    return __awaiter(this, void 0, void 0, function* () {
        let startIn4 = {
            name: startString,
            district: "",
            lat: 0.0,
            long: 0.0,
        };
        let endIn4 = {
            name: endString,
            district: "",
            lat: 0.0,
            long: 0.0,
        };
        startString = startString.concat(" Hà Nội, Việt Nam");
        endString = endString.concat(" Hà Nội, Việt Nam");
        const getGeo1 = yield (0, LocationIQ_1.getLatLong)(startString);
        const getGeo2 = yield (0, LocationIQ_1.getLatLong)(endString);
        startIn4.name = startString;
        startIn4.lat = getGeo1.lat;
        startIn4.long = getGeo1.long;
        endIn4.name = endString;
        endIn4.lat = getGeo2.lat;
        endIn4.long = getGeo2.long;
        const inputInfo = {
            startIn4: startIn4,
            endIn4: endIn4,
        };
        inputInfo.startIn4 = startIn4;
        inputInfo.endIn4 = endIn4;
        return inputInfo;
    });
}
exports.getLocationIn4 = getLocationIn4;
