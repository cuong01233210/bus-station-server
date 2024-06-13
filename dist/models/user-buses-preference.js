"use strict";
// class to connect to the userBusesPreference collection in the database
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
class UserBusPreference {
    constructor(userId, bus) {
        this.userId = userId;
        this.bus = bus;
    }
    createUserBusPreference(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            yield db.collection("userBusesPreference").insertOne(Object.assign({}, this));
            const userBusesPreference = yield UserBusPreference.getUserBusesPreference(userId);
            return userBusesPreference;
        });
    }
    static getUserBusesPreference(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const documents = yield db
                .collection("userBusesPreference")
                .find({ userId: userId })
                .toArray();
            const userBusesPreferences = documents.map((doc) => new UserBusPreference(doc.userId, doc.bus));
            return userBusesPreferences;
        });
    }
    static deleteUserBusPreference(userId, bus) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const result = yield db
                .collection("userBusesPreference")
                .deleteMany({ userId: userId, bus: bus });
            return result.deletedCount; // returns the number of deleted documents
        });
    }
}
UserBusPreference.empty = new UserBusPreference("", "");
exports.default = UserBusPreference;
