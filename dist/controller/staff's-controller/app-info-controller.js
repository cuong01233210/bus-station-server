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
exports.updateAppInfo = exports.createAppInfo = exports.readAppInfo = void 0;
const app_info_1 = __importDefault(require("../../models/app-info"));
function readAppInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appInfos = yield app_info_1.default.getAppInfo();
            // console.log(allComments);
            res.status(200).json({ appInfos: appInfos });
        }
        catch (error) {
            console.error(error);
            res
                .status(400)
                .json({ message: "An error occurred while fetching appInfo" });
        }
    });
}
exports.readAppInfo = readAppInfo;
function createAppInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appInfo = new app_info_1.default(req.body.version, req.body.updated, req.body.content);
            yield appInfo.createAppInfo();
            res.status(200).json({ message: "create appInfo successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(400).json({ message: "failed to create appInfo" });
        }
    });
}
exports.createAppInfo = createAppInfo;
function updateAppInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appInfo = new app_info_1.default(req.body.version, req.body.updated, req.body.content);
            yield appInfo.updateAppInfo(req.body.id);
            console.log(req.body);
            res.status(200).json({ message: "update appInfo successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(400).json({ message: "failed to update appInfo" });
        }
    });
}
exports.updateAppInfo = updateAppInfo;
