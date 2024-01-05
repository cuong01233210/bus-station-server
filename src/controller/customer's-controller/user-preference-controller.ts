import { Request, Response } from "express";
import UserBusPreference from "../../models/user-buses-preference";
export async function getAllBusPreference(req: Request, res: Response) {
  const userId = res.locals.userId;
  try {
    const userBusesPreference = await UserBusPreference.getUserBusesPreference(
      userId
    );
    // console.log(userBusesPreference.map((pref) => pref.bus));
    res.status(200).json({
      buses: userBusesPreference.map((pref) => pref.bus),
    });
  } catch (error) {
    res.status(400).json({ message: "fail" });
  }
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
