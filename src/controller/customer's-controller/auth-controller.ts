import { Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import UserIn4 from "../../models/user-in4";
import { LoginDbs } from "../../databases/user-login";
import LoginUser from "../../models/user-login";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupController = async (req: Request, res: Response) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errorMessage = error.array()[0].msg;
    console.log(error);
    res.status(400).json({ message: errorMessage });
    return;
  }

  const { name, email, password } = req.body;
  const loginUser = await LoginUser.getUser(email);

  if (loginUser !== LoginUser.empty) {
    res.status(400).json({ message: "Email này đã dùng để đăng ký rồi" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newLoginUser = new LoginUser(name, email, hashedPassword);
  const userId = await newLoginUser.createUser();

  const token = jwt.sign({ email: email, userId: userId }, "mySecretKey");

  // create new account in db
  //const userId = res.locals.userId;
  try {
    const newUser = new UserIn4(userId, name, "", "", "", email);
    const newUsers = await newUser.createAccount(userId);
    console.log(newUsers);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({ token: token, userId: userId });
};

export const loginController = async (req: Request, res: Response) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errorMessage = error.array()[0].msg;
    console.log(error);
    res.status(400).json({ message: errorMessage });
    return;
  }

  const { email, password } = req.body;
  console.log("email dùng để login là: ", email);
  const loginUser = await LoginUser.getUser(email);

  if (loginUser === LoginUser.empty) {
    res.status(400).json({ message: "Chưa có tài khoản với email này" });
    return;
  }

  const isEqual = await bcrypt.compare(password, loginUser.password);
  if (!isEqual) {
    res.status(400).json({ message: "Bạn đã sai mật khẩu" });
    return;
  } else {
    console.log("correct password");
  }

  const token = jwt.sign(
    {
      email: email,
      userId: loginUser.id,
    },
    "mySecretKey"
    //{ expiresIn: "1h" }
  );

  res.status(200).json({ token: token, userId: loginUser.id });
};
