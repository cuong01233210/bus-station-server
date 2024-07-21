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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_database_1 = require("./../databases/app-database");
const mongodb_1 = require("mongodb");
class ErrorForm {
    constructor(source, destination, busName, time, date, errorDescription, id) {
        this.source = source;
        this.destination = destination;
        this.busName = busName;
        this.time = time;
        this.date = date;
        this.errorDescription = errorDescription;
        this.id = id;
    }
    static getAllErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            let startTime = performance.now();
            const db = app_database_1.AppDatabase.getDb();
            const documents = yield db
                .collection("error_form")
                .find()
                .sort({ date: 1 })
                .toArray();
            const errors = documents.map((doc) => new ErrorForm(doc.source, doc.destination, doc.busName, doc.time, doc.date, doc.errorDescription, doc._id.toString()));
            let endTime = performance.now();
            console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
            return errors;
        });
    }
    static getOneError(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const document = yield db
                .collection("error_form")
                .findOne({ _id: new mongodb_1.ObjectId(id) });
            if (document != null) {
                return new ErrorForm(document.source, document.destination, document.busName, document.time, document.date, document.errorDescription, document._id.toString());
            }
            else
                return ErrorForm.empty;
        });
    }
    createError() {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = this, { id } = _a, errorData = __rest(_a, ["id"]); // Loại bỏ trường id
            const db = app_database_1.AppDatabase.getDb();
            yield db.collection("error_form").insertOne(Object.assign({}, errorData));
        });
    }
    updateError(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = this, { id: errorId } = _a, errorData = __rest(_a, ["id"]); // Loại bỏ trường id
            const db = app_database_1.AppDatabase.getDb();
            yield db
                .collection("error_form")
                .updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: Object.assign({}, errorData) });
        });
    }
    static deleteError(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            yield db.collection("error_form").deleteOne({ _id: new mongodb_1.ObjectId(id) });
        });
    }
}
ErrorForm.empty = new ErrorForm("", "", "", "", "", "", "");
exports.default = ErrorForm;
