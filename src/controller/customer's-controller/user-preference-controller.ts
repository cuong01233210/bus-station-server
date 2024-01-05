import { Request, Response } from "express";
import UserBusPreference from "../../models/user-buses-preference";
export function getAllBusPreference(req: Request, res: Response) {
  const userId = res.locals.userId;
  const userBusesPreference = UserBusPreference.getUserBusesPreference(userId);
  res.status(200).json({ userBusesPreference: userBusesPreference });
}

export function addBusPrefer(req: Request, res: Response) {
  const userId = res.locals.userId;
  const bus = req.body.bus;
  // console.log(bus);
  // console.log(userId);
  try {
    const userBusPreference = new UserBusPreference(userId, bus);
    userBusPreference.createUserBusPreference(userId);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ message: "fail" });
  }
}

export function deleteBusPreference(req: Request, res: Response) {
  const userId = res.locals.userId;
  const bus = req.body.bus;
  try {
    UserBusPreference.deleteUserBusPreference(userId, bus);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ message: "fail" });
  }
}
