import { Request, Response } from "express";
import { StationPoint } from "../../../../models/my-point";
import BusStation from "../../../../models/bus-station";
import KDTree from "./kdTree";

export async function createKDTree(req: Request, res: Response) {
  const busStations = await BusStation.getBusStations();
  //console.log(busStations);
  //console.log("inputIn4: ", inputIn4);
  let stationPoints: StationPoint[] = [];

  let busStationsLength = busStations.length;
  for (let i = 0; i < busStationsLength; i++) {
    const point = {
      name: busStations[i].name,
      lat: busStations[i].lat,
      long: busStations[i].long,
    };
    //console.log(point);
    stationPoints.push(point);
  }
  const tree = new KDTree(null, stationPoints);
  tree.build();
  // Lưu cây vào file JSON
  tree.saveToFile("kdtree.json");
  res.status(200).json({ message: "success" });
}
