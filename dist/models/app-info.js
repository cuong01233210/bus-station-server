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
const mongodb_1 = require("mongodb");
const app_info_database_1 = require("../databases/app-info-database");
class AppInfo {
    constructor(version, updated, content) {
        this.version = version;
        this.updated = updated;
        this.content = content;
    }
    createAppInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_info_database_1.AppInfoDatabase.getDb();
            delete this.id;
            yield db.collection("app-info").insertOne(Object.assign({}, this));
        });
    }
    updateAppInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_info_database_1.AppInfoDatabase.getDb();
            yield db
                .collection("app-info")
                .updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: Object.assign({}, this) });
        });
    }
    static getAppInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_info_database_1.AppInfoDatabase.getDb();
            const documents = yield db.collection("app-info").find().toArray();
            const appInfos = documents.map((doc) => new AppInfo(doc.version, doc.updated, doc.content));
            return appInfos;
        });
    }
}
exports.default = AppInfo;
