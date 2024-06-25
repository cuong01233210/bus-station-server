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
class LoginUser {
    constructor(email, password, role, id) {
        this.id = id;
        //this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    createUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            delete this.id;
            const insertOneResult = yield db.collection("users").insertOne(Object.assign({}, this));
            return insertOneResult.insertedId.toString();
        });
    }
    static getUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const document = yield db.collection("users").findOne({ email: email });
            console.log("user dang login", document);
            if (document != null) {
                return new LoginUser(document.email, document.password, document.role, document._id.toString());
            }
            else
                return LoginUser.empty;
        });
    }
    updatePassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // const db: Db = LoginDbs.getDb();
            const db = app_database_1.AppDatabase.getDb();
            // Kiểm tra xem người dùng có tồn tại dựa trên email
            const user = yield db.collection("users").findOne({ email: email });
            if (user) {
                // Người dùng tồn tại, cập nhật mật khẩu
                const updateResult = yield db
                    .collection("users")
                    .updateOne({ email: email }, { $set: { password: newPassword } });
                if (updateResult.modifiedCount === 1) {
                    // Cập nhật mật khẩu thành công
                    return true;
                }
                else {
                    // Cập nhật mật khẩu thất bại
                    return false;
                }
            }
            else {
                // Người dùng không tồn tại
                return false;
            }
        });
    }
    static getStaffs() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const documents = yield db
                .collection("users")
                .find({ role: "1" })
                .toArray();
            const staffs = documents.map((document) => {
                return new LoginUser(document.email, document.password, document.role, document._id.toString());
            });
            return staffs;
        });
    }
    static deleteUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const deleteResult = yield db.collection("users").deleteOne({
                email: email,
            });
            return deleteResult.deletedCount === 1;
        });
    }
}
LoginUser.empty = new LoginUser("", "", "", "");
exports.default = LoginUser;
