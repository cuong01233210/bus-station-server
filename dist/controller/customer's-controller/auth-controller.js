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
exports.getStaffInfo = exports.deleteStaffController = exports.addStaffController = exports.getStaffsController = exports.loginController = exports.signupController = void 0;
const express_validator_1 = require("express-validator");
const user_in4_1 = __importDefault(require("../../models/user-in4"));
const user_login_1 = __importDefault(require("../../models/user-login"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signupController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        const errorMessage = error.array()[0].msg;
        console.log(error);
        res.status(400).json({ message: errorMessage });
        return;
    }
    const { name, email, password } = req.body;
    const role = "0"; // chỉ cho người dùng đăng ký tài khoản cấp thường
    const loginUser = yield user_login_1.default.getUser(email);
    if (loginUser !== user_login_1.default.empty) {
        res.status(400).json({ message: "Email này đã dùng để đăng ký rồi" });
        return;
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
    const newLoginUser = new user_login_1.default(email, hashedPassword, role);
    const userId = yield newLoginUser.createUser();
    const token = jsonwebtoken_1.default.sign({ email: email, userId: userId }, "mySecretKey");
    // create new account in db
    //const userId = res.locals.userId;
    try {
        const newUser = new user_in4_1.default(userId, name, "Chưa có", "Chưa có", "Chưa có", email);
        const newUsers = yield newUser.createAccount(userId);
        console.log(newUsers);
    }
    catch (error) {
        console.log(error);
    }
    //res.locals.email = email;
    res.status(200).json({ token: token, userId: userId, role: role });
});
exports.signupController = signupController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        const errorMessage = error.array()[0].msg;
        console.log(error);
        res.status(400).json({ message: errorMessage });
        return;
    }
    const { email, password } = req.body;
    console.log("email dùng để login là: ", email);
    const loginUser = yield user_login_1.default.getUser(email);
    if (loginUser === user_login_1.default.empty) {
        res.status(400).json({ message: "Chưa có tài khoản với email này" });
        return;
    }
    const isEqual = yield bcryptjs_1.default.compare(password, loginUser.password);
    if (!isEqual) {
        res.status(400).json({ message: "Bạn đã sai mật khẩu" });
        return;
    }
    else {
        console.log("correct password");
    }
    const role = loginUser.role;
    const token = jsonwebtoken_1.default.sign({
        email: email,
        userId: loginUser.id,
    }, "mySecretKey"
    //{ expiresIn: "1h" }
    );
    // res.locals.email = email;
    res.status(200).json({ token: token, userId: loginUser.id, role: role });
});
exports.loginController = loginController;
const getStaffsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staffs = yield user_login_1.default.getStaffs();
        res.status(200).json(staffs);
    }
    catch (error) {
        res.status(400).json({ message: "error" });
    }
});
exports.getStaffsController = getStaffsController;
const addStaffController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = (0, express_validator_1.validationResult)(req);
    if (!error.isEmpty()) {
        const errorMessage = error.array()[0].msg;
        console.log(error);
        res.status(400).json({ message: errorMessage });
        return;
    }
    const { id, email, password, role, name, sex, dateOfBirth, phoneNumber } = req.body;
    const loginUser = yield user_login_1.default.getUser(email);
    if (loginUser !== user_login_1.default.empty) {
        res.status(400).json({ message: "Email này đã dùng để đăng ký rồi" });
        return;
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
    const newLoginUser = new user_login_1.default(email, hashedPassword, role);
    const userId = yield newLoginUser.createUser();
    // create new account in db
    //const userId = res.locals.userId;
    try {
        const newUser = new user_in4_1.default(userId, name, sex, dateOfBirth, phoneNumber, email);
        const newUsers = yield newUser.createAccount(userId);
    }
    catch (error) {
        console.log(error);
    }
    //res.locals.email = email;
    res.status(200).json({ message: "success" });
});
exports.addStaffController = addStaffController;
const deleteStaffController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        yield user_login_1.default.deleteUser(email);
        yield user_in4_1.default.deleteUser(email);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ message: "error" });
    }
});
exports.deleteStaffController = deleteStaffController;
const getStaffInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    try {
        console.log(email);
        const staffInfo = yield user_in4_1.default.getUserInfor(email);
        console.log(staffInfo);
        res.status(200).json(staffInfo);
    }
    catch (error) {
        res.status(400).json({ message: "error" });
    }
});
exports.getStaffInfo = getStaffInfo;
