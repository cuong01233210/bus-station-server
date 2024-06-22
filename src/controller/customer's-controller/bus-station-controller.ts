import { Request, Response } from "express";
import BusStation from "../../models/bus-station";
//import BusStationsByDistrict from "../../models/bus-stations-by-district";
// export const getAllBusStations = async (req: Request, res: Response) => {
//   try {
//     //const busStations = await BusStation.getBusStationIn4();
//     const busStationsByDistrict =
//       await BusStationsByDistrict.getBusStationsByDistrictIn4();
//     res.status(200).json({
//       busStationsByDistrict: busStationsByDistrict,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error });
//   }
// };

// export const getStationNames = async (req: Request, res: Response) => {
//   try {
//     const busStationOnlyNames =
//       await BusStationsByDistrict.getBusStationOnlyNames();
//     res.status(200).json({ busStationNames: busStationOnlyNames });
//   } catch (error) {
//     res.status(400).json({ message: error });
//   }
// };
export const getAllBusStationsNoDistrict = async (
  req: Request,
  res: Response
) => {
  try {
    const busStations = await BusStation.getBusStations();
    res.status(200).json({
      busStations: busStations,
    });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

// 3 hàm add, update, delete là của staff
export const addBusStationNoDistrict = async (req: Request, res: Response) => {
  try {
    const busStation = new BusStation(
      req.body.name,
      req.body.buses,
      req.body.lat,
      req.body.long,
      req.body.id
    );
    await busStation.createBusStation();
    res.status(200).json({
      message: "add bus station successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
};

export const updateBusStationNoDistrict = async (
  req: Request,
  res: Response
) => {
  try {
    const busStation = new BusStation(
      req.body.name,
      req.body.buses,
      req.body.lat,
      req.body.long,
      req.body.id
    );
    await busStation.updateBusStation(req.body.id);
    res.status(200).json({
      message: "update bus station successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
};

export const deleteBusStationNoDistrict = async (
  req: Request,
  res: Response
) => {
  try {
    const busStation = new BusStation(
      req.body.name,
      req.body.buses,
      req.body.lat,
      req.body.long,

      req.body.id
    );
    await busStation.deleteBusStation(req.body.name);
    res.status(200).json({
      message: "delete bus station successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
};

export const getStationsByIds = async (req: Request, res: Response) => {
  try {
    const stationIds = req.body.stationIds; // Bên SwiftUI đang coi name là id

    const busStations = await BusStation.getStationsByNames(stationIds);

    res.status(200).json({
      busStations: busStations,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getStationsByNames:", error);
    res.status(400).json({ message: error });
  }
};
