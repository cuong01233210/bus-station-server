import KDTree from "../models/kdTree";
import MyNode from "../models/my-node";
import MyPoint from "../models/my-point";
import BestPair from "../models/best-pair";
import { Request, Response } from "express";
import { userStrings } from "./user-input-string.controller";
import { InputIn4 } from "./user-input-string.controller";
import { updateUserString2 } from "./user-input-string.controller";
import BusStationsByDistrict from "../models/bus-stations-by-district";
import { getDirectionsAndDistance } from "./test-geocoding-controller";
export function testKDtree(req: Request, res: Response) {
  const points: MyPoint[] = [
    new MyPoint(2, 3),
    new MyPoint(5, 4),
    new MyPoint(4, 7),
    new MyPoint(8, 1),
    new MyPoint(7, 2),
  ];
  const tree = new KDTree(null, points);
  tree.build();
  tree.printTree();

  const queryPoint = new MyPoint(6, 6);
  const nearestDistance = tree.nearestDis(queryPoint);
  console.log("Nearest distance:", nearestDistance);

  res.status(200).json({ message: "test sucessfully" });
}

export async function findRouteAndStation(req: Request, res: Response) {
  let nearStartPoints: MyPoint[] = [];
  let nearEndPoints: MyPoint[] = [];
  const userId = req.body.id;
  const startString = req.body.startString;
  const endString = req.body.endString;
  const userKm = req.body.userKm;
  //const userString = userStrings.find((user) => user.id === userId);

  let inputIn4: InputIn4 = await updateUserString2(
    userId,
    startString,
    endString,
    userKm
  );

  // console.log(inputIn4.startIn4);
  // console.log(inputIn4.endIn4);
  // console.log(inputIn4.userKm);

  const busStationsByDistrict =
    await BusStationsByDistrict.getBusStationsByDistrictIn4();
  const busStationsWithSameDistrictNearStart = busStationsByDistrict.filter(
    (item) => item.district == inputIn4.startIn4.district
  );

  const busStationsWithSameDistrictNearEnd = busStationsByDistrict.filter(
    (item) => item.district == inputIn4.endIn4.district
  );

  try {
    for (
      let i = 0;
      i < busStationsWithSameDistrictNearStart[0].busStationIn4.length;
      i++
    ) {
      let tempPoint: MyPoint = {
        x: busStationsWithSameDistrictNearStart[0].busStationIn4[i].lat,
        y: busStationsWithSameDistrictNearStart[0].busStationIn4[i].long,
      };
      nearStartPoints.push(tempPoint);
    }
  } catch (error) {
    // response người dùng nhập các khác (làm sau)
    let tempPoint: MyPoint = {
      x: 1000,
      y: 1000,
    };
    nearStartPoints.push(tempPoint);
  }

  // kd tree cho nearest start point
  const startTree = new KDTree(null, nearStartPoints);
  startTree.build();
  //startTree.printTree();

  const startQueryPoint = new MyPoint(
    inputIn4.startIn4.lat,
    inputIn4.startIn4.long
  );
  const nearestDistanceNearStart = startTree.nearestDis(startQueryPoint);
  console.log("Nearest distance:", nearestDistanceNearStart);
  const xCoordinateStart = nearestDistanceNearStart.point?.x;
  const yCoordinateStart = nearestDistanceNearStart.point?.y;
  if (xCoordinateStart !== undefined && yCoordinateStart !== undefined) {
    const distanceInMeters = await getDirectionsAndDistance(
      inputIn4.startIn4.lat,
      inputIn4.startIn4.long,
      xCoordinateStart,
      yCoordinateStart
    );
    console.log("Distance1:", distanceInMeters, "meters");

    // console.log(busStationsWithSameDistrictNearStart);
    try {
      const nearStartCandidate =
        busStationsWithSameDistrictNearStart[0].busStationIn4.filter(
          (item) =>
            item.lat == xCoordinateStart && item.long == yCoordinateStart
        );
      console.log("nearStartCandidate: ");
      console.log(nearStartCandidate);
    } catch (error) {
      console.log(
        "nearStartCandidate is undefined because now don't have any matched district between db and input location. No matching candidate found."
      );
    }
  }

  if (busStationsWithSameDistrictNearEnd[0]?.busStationIn4 !== undefined) {
    for (
      let j = 0;
      j < busStationsWithSameDistrictNearEnd[0].busStationIn4.length;
      j++
    ) {
      let tempPoint: MyPoint = {
        x: busStationsWithSameDistrictNearEnd[0].busStationIn4[j].lat,
        y: busStationsWithSameDistrictNearEnd[0].busStationIn4[j].long,
      };
      nearEndPoints.push(tempPoint);
    }
  } else {
    // response người dùng nhập các khác (làm sau)
    let tempPoint: MyPoint = {
      x: 1000,
      y: 1000,
    };
    nearEndPoints.push(tempPoint);
  }

  // kd tree cho nearest end point
  const endTree = new KDTree(null, nearEndPoints);
  endTree.build();
  //startTree.printTree();

  const endQueryPoint = new MyPoint(inputIn4.endIn4.lat, inputIn4.endIn4.long);
  const nearestDistanceNearEnd = endTree.nearestDis(endQueryPoint);
  console.log("Nearest distance2:", nearestDistanceNearEnd);
  const xCoordinateEnd = nearestDistanceNearEnd.point?.x;
  const yCoordinateEnd = nearestDistanceNearEnd.point?.y;
  if (xCoordinateEnd !== undefined && yCoordinateEnd !== undefined) {
    const distanceInMeters = await getDirectionsAndDistance(
      inputIn4.endIn4.lat,
      inputIn4.endIn4.long,
      xCoordinateEnd,
      yCoordinateEnd
    );
    console.log("Distance2:", distanceInMeters, "meters");

    try {
      const nearEndCandidate =
        busStationsWithSameDistrictNearEnd[0].busStationIn4.filter(
          (item) => item.lat === xCoordinateEnd && item.long === yCoordinateEnd
        );
      console.log("nearEndCandidate: ");
      console.log(nearEndCandidate);
    } catch (error) {
      console.log(
        "nearEndCandidate is undefined because now don't have any matched district between db and input location. No matching candidate found."
      );
    }
  }
  res.status(200);
}
