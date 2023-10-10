import { Router } from "express";
import * as authController from "../controller/auth-controller";
import { body } from "express-validator";
const authRouter = Router();

authRouter.put(
  "/signup",
  [
    body("name").trim().isLength({ min: 3 }).withMessage("Too small name"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("To small password"),
  ],
  authController.signupController
);
authRouter.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("To small password"),
  ],
  authController.loginController
);

export default authRouter;
