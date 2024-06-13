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
const express_validator_1 = require("express-validator");
const user_login_1 = __importDefault(require("../../models/user-login"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const changePasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        const errorMessage = error.array()[0].msg;
        console.log(error);
        res.status(400).json({ message: errorMessage });
        return;
    }
    const { email, oldPassword, newPassword } = req.body;
    console.log("email: ", email);
    console.log("old password: ", oldPassword);
    console.log("new password: ", newPassword);
    const loginUser = yield user_login_1.default.getUser(email);
    if (loginUser === user_login_1.default.empty) {
        res.status(400).json({ message: "Không tìm thấy tài khoản email này" });
        return;
    }
    const isEqual = yield bcryptjs_1.default.compare(oldPassword, loginUser.password);
    if (!isEqual) {
        res.status(400).json({ message: "Bạn đã nhập sai mật khẩu hiện tại" });
        return;
    }
    else {
        console.log("correct old password");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
    loginUser.updatePassword(email, hashedPassword);
    const token = jsonwebtoken_1.default.sign({
        email: email,
        userId: loginUser.id,
    }, "mySecretKey");
    res.status(200).json({ token: token, userId: loginUser.id });
});
exports.default = changePasswordController;
