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
class UserIn4 {
    constructor(userId, name, sex, dateOfBirth, phoneNumber, email) {
        this.userId = userId;
        this.name = name;
        this.sex = sex;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }
    createAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            yield db.collection("informations").insertOne(Object.assign({}, this));
            const users = yield UserIn4.getUserIn4(userId);
            return users;
        });
    }
    static getUserIn4(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            //const db: Db = UsersDatabase.getDb();
            const db = app_database_1.AppDatabase.getDb();
            const document = yield db
                .collection("informations")
                .findOne({ userId: userId });
            if (document != null) {
                return new UserIn4(document.userId, document.name, document.sex, document.dateOfBirth, document.phoneNumber, document.email);
            }
            else
                return UserIn4.empty;
        });
    }
    // async updateUserIn4(userId: string) {
    //   const db: Db = UsersDatabase.getDb();
    //   await db.collection("informations").updateOne(
    //     { userId: new ObjectId(this.userId) },
    //     {
    //       $set: {
    //         userId: this.userId,
    //         name: this.name,
    //         sex: this.sex,
    //         dateOfBirth: this.dateOfBirth,
    //         phoneNumber: this.phoneNumber,
    //         email: this.email,
    //       },
    //     }
    //   );
    //   const user = await UserIn4.getUserIn4(userId);
    //   return user;
    // }
    updateUserIn4(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // const db: Db = UsersDatabase.getDb();
            const db = app_database_1.AppDatabase.getDb();
            console.log(this.userId);
            console.log(this.name);
            console.log(this.dateOfBirth);
            yield db.collection("informations").findOneAndUpdate({ email: email }, // Sử dụng userId truyền vào thay vì this.userId
            {
                $set: {
                    name: this.name,
                    sex: this.sex,
                    dateOfBirth: this.dateOfBirth,
                    phoneNumber: this.phoneNumber,
                    email: this.email,
                },
            }, { returnDocument: "after" } // Ensure to get the updated document after the update
            );
            // const user = await UserIn4.getUserIn4(this.userId);
            // return user;
        });
    }
    static deleteUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            yield db.collection("informations").deleteOne({ email: email });
        });
    }
    static getUserInfor(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = app_database_1.AppDatabase.getDb();
            const document = yield db
                .collection("informations")
                .findOne({ email: email });
            if (document != null) {
                return new UserIn4(document.userId, document.name, document.sex, document.dateOfBirth, document.phoneNumber, document.email);
            }
        });
    }
}
UserIn4.empty = new UserIn4("", "", "", "", "", "");
exports.default = UserIn4;
