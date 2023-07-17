import { Request, Response } from "express";
import Bus from "../models/bus";

export const getAllBuses = async (req: Request, res: Response) => {
  try {
    const buses = await Bus.getBusIn4();
    // console.log(buses);
    res.status(200).json({ buses: buses });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};
