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
class UserStationPreference {
    constructor(userId, stationId) {
        this.userId = userId;
        this.stationId = stationId;
    }
    createUserStationPreference(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            yield db.collection("userStationsPreference").insertOne(Object.assign({}, this));
            const userStationPreference = yield UserStationPreference.getUserStationPreference(userId);
            return userStationPreference;
        });
    }
    static getUserStationPreference(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const documents = yield db
                .collection("userStationsPreference")
                .find({ userId: userId })
                .toArray();
            const userStationPreferences = documents.map((doc) => new UserStationPreference(doc.userId, doc.stationId));
            return userStationPreferences;
        });
    }
    static deleteUserStationPreference(userId, stationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const result = yield db
                .collection("userStationsPreference")
                .deleteMany({ userId: userId, stationId: stationId });
            return result.deletedCount; // returns the number of deleted documents
        });
    }
}
UserStationPreference.empty = new UserStationPreference("", "");
exports.default = UserStationPreference;
