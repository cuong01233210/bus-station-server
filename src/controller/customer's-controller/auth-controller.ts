import e, { Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import UserIn4 from "../../models/user-in4";

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
  const role = "0"; // chỉ cho người dùng đăng ký tài khoản cấp thường
  const loginUser = await LoginUser.getUser(email);

  if (loginUser !== LoginUser.empty) {
    res.status(400).json({ message: "Email này đã dùng để đăng ký rồi" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newLoginUser = new LoginUser(email, hashedPassword, role);
  const userId = await newLoginUser.createUser();

  const token = jwt.sign({ email: email, userId: userId }, "mySecretKey");

  // create new account in db
  //const userId = res.locals.userId;
  try {
    const newUser = new UserIn4(
      userId,
      name,
      "Chưa có",
      "Chưa có",
      "Chưa có",
      email
    );
    const newUsers = await newUser.createAccount(userId);
    console.log(newUsers);
  } catch (error) {
    console.log(error);
  }
  //res.locals.email = email;
  res.status(200).json({ token: token, userId: userId, role: role });
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
  const role = loginUser.role;
  const token = jwt.sign(
    {
      email: email,
      userId: loginUser.id,
    },
    "mySecretKey"
    //{ expiresIn: "1h" }
  );
  // res.locals.email = email;
  res.status(200).json({ token: token, userId: loginUser.id, role: role });
};

export const getStaffsController = async (req: Request, res: Response) => {
  try {
    const staffs = await LoginUser.getStaffs();
    res.status(200).json(staffs);
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
};

export const addStaffController = async (req: Request, res: Response) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errorMessage = error.array()[0].msg;
    console.log(error);
    res.status(400).json({ message: errorMessage });
    return;
  }
  const { id, email, password, role, name, sex, dateOfBirth, phoneNumber } =
    req.body;
  const loginUser = await LoginUser.getUser(email);

  if (loginUser !== LoginUser.empty) {
    res.status(400).json({ message: "Email này đã dùng để đăng ký rồi" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newLoginUser = new LoginUser(email, hashedPassword, role);
  const userId = await newLoginUser.createUser();

  // create new account in db
  //const userId = res.locals.userId;
  try {
    const newUser = new UserIn4(
      userId,
      name,
      sex,
      dateOfBirth,
      phoneNumber,
      email
    );
    const newUsers = await newUser.createAccount(userId);
  } catch (error) {
    console.log(error);
  }
  //res.locals.email = email;
  res.status(200).json({ message: "success" });
};

export const deleteStaffController = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await LoginUser.deleteUser(email);
    await UserIn4.deleteUser(email);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
};

export const getStaffInfo = async (req: Request, res: Response) => {
  const email = req.body.email;
  try {
    console.log(email);
    const staffInfo = await UserIn4.getUserInfor(email);
    console.log(staffInfo);
    res.status(200).json(staffInfo);
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
};
