import { Request, Response } from "express";
import BusStation from "../models/bus-station";
import BusStationsByDistrict from "../models/bus-stations-by-district";
export const getAllBusStations = async (req: Request, res: Response) => {
  try {
    const busStations = await BusStation.getBusStationIn4();
    const busStationsByDistrict =
      await BusStationsByDistrict.getBusStationsByDistrictIn4();
    res
      .status(200)
      .json({
        busStations: busStations,
        busStationsByDistrict: busStationsByDistrict,
      });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
