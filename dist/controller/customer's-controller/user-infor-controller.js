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
exports.updateUserInfor = exports.getUserInfor = void 0;
const user_in4_1 = __importDefault(require("../../models/user-in4"));
const getUserInfor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.userId;
    console.log(userId);
    try {
        const userIn4 = yield user_in4_1.default.getUserIn4(userId);
        console.log("userIn4: ", userIn4);
        res.status(200).json({
            name: userIn4.name,
            sex: userIn4.sex,
            dateOfBirth: userIn4.dateOfBirth,
            phoneNumber: userIn4.phoneNumber,
            email: userIn4.email,
        });
    }
    catch (error) {
        res.status(400).json({ message: "failed to load" });
    }
});
exports.getUserInfor = getUserInfor;
const updateUserInfor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.userId;
    // const userIn4 = req.body.userIn4;
    const name = req.body.name;
    const sex = req.body.sex;
    const dateOfBirth = req.body.dateOfBirth;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    console.log("da vao trong ham update user in4");
    console.log(userId);
    // console.log(userIn4);
    console.log(name);
    console.log(sex);
    console.log(dateOfBirth);
    console.log(phoneNumber);
    console.log(email);
    const userIn4 = new user_in4_1.default(userId, name, sex, dateOfBirth, phoneNumber, email);
    try {
        yield userIn4.updateUserIn4(email);
        res.status(200).json({ message: "Successfully updated" });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: "Failed to update" });
    }
});
exports.updateUserInfor = updateUserInfor;
