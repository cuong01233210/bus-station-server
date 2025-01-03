"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controller/customer's-controller/auth-controller"));
const express_validator_1 = require("express-validator");
const auth_validation_1 = __importDefault(require("../middleware/auth-validation"));
const authRouter = (0, express_1.Router)();
authRouter.put("/signup", [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Tên của bạn quá ngắn"),
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail()
        .withMessage("Xin hãy nhập đúng định dạng email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 5 })
        .withMessage("Mật khẩu của bạn quá ngắn"),
], authController.signupController);
authRouter.post("/login", [
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail()
        .withMessage("Xin hãy nhập đúng định dạng email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 5 })
        .withMessage("Mật khẩu của bạn quá ngắn"),
], authController.loginController);
// router để lấy được cái tài khoản của nhân viên
authRouter.get("/get-staffs", auth_validation_1.default, authController.getStaffsController);
authRouter.post("/add-staff", [
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail()
        .withMessage("Xin hãy nhập đúng định dạng email")
        .normalizeEmail(),
    (0, express_validator_1.body)("phoneNumber")
        .trim()
        .isMobilePhone("vi-VN")
        .withMessage("Xin hãy nhập đúng định dạng số điện thoại"),
], authController.addStaffController);
authRouter.post("/get-staff-infor", auth_validation_1.default, authController.getStaffInfo);
authRouter.delete("/delete-staff", auth_validation_1.default, authController.deleteStaffController);
exports.default = authRouter;
