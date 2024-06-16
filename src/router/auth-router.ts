import { Router } from "express";
import * as authController from "../controller/customer's-controller/auth-controller";
import { body } from "express-validator";
import authValidator from "../middleware/auth-validation";
const authRouter = Router();

authRouter.put(
  "/signup",
  [
    body("name")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Tên của bạn quá ngắn"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Xin hãy nhập đúng định dạng email")
      .normalizeEmail(),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Mật khẩu của bạn quá ngắn"),
  ],
  authController.signupController
);
authRouter.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Xin hãy nhập đúng định dạng email")
      .normalizeEmail(),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Mật khẩu của bạn quá ngắn"),
  ],
  authController.loginController
);

// router để lấy được cái tài khoản của nhân viên
authRouter.get(
  "/get-staffs",
  authValidator,
  authController.getStaffsController
);

export default authRouter;
