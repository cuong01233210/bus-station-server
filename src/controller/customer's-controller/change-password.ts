import { validationResult } from "express-validator";
import { Request, Response } from "express";
import LoginUser from "../../models/user-login";
import bcrypt from "bcryptjs";
import jwt, { TokenExpiredError } from "jsonwebtoken";

const changePasswordController = async (req: Request, res: Response) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errorMessage = error.array()[0].msg;
    console.log(error);
    res.status(400).json({ message: errorMessage });
    return;
  }

  const { email, oldPassword, newPassword, reNewPassword } = req.body;
  console.log("email: ", email);
  console.log("old password: ", oldPassword);
  console.log("new password: ", newPassword);

  const loginUser = await LoginUser.getUser(email);
  if (loginUser === LoginUser.empty) {
    res.status(400).json({ message: "Không tìm thấy tài khoản email này" });
    return;
  }
  const hasInputCheck = newPassword === reNewPassword;
  if (!hasInputCheck) {
    res.status(400).json({ message: "Mật khẩu mới không khớp" });
    return;
  } else {
    console.log("new password match");
  }
  const isEqual = await bcrypt.compare(oldPassword, loginUser.password);
  if (!isEqual) {
    res.status(400).json({ message: "Bạn đã nhập sai mật khẩu hiện tại" });
    return;
  } else {
    console.log("correct old password");
  }

  const hasInputCheck2 = oldPassword !== newPassword;
  if (!hasInputCheck2) {
    res
      .status(400)
      .json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
    return;
  } else {
    console.log("new password is not the same as old password");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  loginUser.updatePassword(email, hashedPassword);
  const token = jwt.sign(
    {
      email: email,
      userId: loginUser.id,
    },
    "mySecretKey"
  );
  res.status(200).json({ token: token, userId: loginUser.id, role: "" });
};

export default changePasswordController;
