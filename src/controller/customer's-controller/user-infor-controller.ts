import { Request, Response } from "express";
import UserIn4 from "../../models/user-in4";

export const getUserInfor = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  console.log(userId);
  try {
    const userIn4 = await UserIn4.getUserIn4(userId);
    console.log("userIn4: ", userIn4);
    res.status(200).json({ userIn4: userIn4 });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};
