import { Request, Response } from "express";
import BusStation from "../models/bus-station";

export const getAllBusStations = async (req: Request, res: Response) => {
  try {
    const busStations = await BusStation.getBusStationIn4();
    res
      .status(200)
      .json({  busStations: busStations });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
