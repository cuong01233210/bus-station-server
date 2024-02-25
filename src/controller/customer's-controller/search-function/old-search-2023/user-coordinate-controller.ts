//import { updateUserCoordinate } from "./user-coordinate-controller";
import { Request, Response } from "express";
import UserCoordinate from "../../../../models/user-coordinate";
import { validationResult } from "express-validator";
import { testKDtree } from "./kdTree-controller";
import KDTree from "../../../../models/kdTree";
import MyPoint from "../../../../models/my-point";
import BusStation from "../../../../models/bus-station";
// chú ý sau này phải sửa lại cái id theo user id để tránh trường hợp nhiều người dùng 1 lúc mà 1 cái server thì loạn
export let userCoordinates: UserCoordinate[] = [
  {
    id: "change-coordinate",
    lat: 2000,
    long: 1500,
  },
];

export const getUserCoordinate = (req: Request, res: Response) => {
  res.status(200).json({ userCoordinates: userCoordinates });
};

const points: MyPoint[] = [];
export async function updateUserCoordinate(req: Request, res: Response) {
  const { userCoordinateId } = req.params;
  //console.log(userCoordinateId);
  // console.log(userCoordinates[0].id);
  const { lat, long } = req.body;
  //const newLat = parseFloat(lat);
  //const newLong = parseFloat(long);
  const index = userCoordinates.findIndex(
    (element) => element.id === userCoordinateId
  );
  //console.log(index);

  try {
    const busStations = await BusStation.getBusStationIn4();
    for (let i = 0; i < busStations.length; i++) {
      const { lat, long } = busStations[i];
      const myPoint = new MyPoint(Number(lat), Number(long));
      points.push(myPoint);
    }
    //console.log(busStations);
  } catch (error) {
    console.log("Get Bus Station In4 failed");
  }

  userCoordinates[index].lat = lat;
  userCoordinates[index].long = long;

  const tree = new KDTree(null, points);
  tree.build();

  const queryPoint = new MyPoint(lat, long);
  const nearestDistance = tree.nearestDis(queryPoint);
  console.log("Nearest distance:", nearestDistance);

  res
    .status(200)
    .json({ message: "updated sucessfully", userCoordinates: userCoordinates });
}
