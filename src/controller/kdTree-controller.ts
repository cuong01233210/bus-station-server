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
import Bus from "../models/bus";
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

interface BusIn4Struct {
  name: string;
  bus: Array<string>;
  lat: number;
  long: number;
}

// hàm tìm các điểm cùng quận
function findNearPoints(
  busStationsWithSameDistrict: BusStationsByDistrict[]
): MyPoint[] {
  let nearPoints: MyPoint[] = [];
  try {
    for (
      let i = 0;
      i < busStationsWithSameDistrict[0].busStationIn4.length;
      i++
    ) {
      let tempPoint: MyPoint = {
        x: busStationsWithSameDistrict[0].busStationIn4[i].lat,
        y: busStationsWithSameDistrict[0].busStationIn4[i].long,
      };
      nearPoints.push(tempPoint);
    }
  } catch (error) {
    // response người dùng nhập các khác (làm sau)
    //res.status(400).json({ message: "không có quận nào ở gần xuất phát //đâu" });
    let tempPoint: MyPoint = {
      x: 1000,
      y: 1000,
    };
    nearPoints.push(tempPoint);
  }
  return nearPoints;
}

// hàm tìm các ứng cử viên, kiểu chọn ra điểm nào gần vị trí ng dùng yêu cầu nhất trong tập các điểm cùng quận đó
function findCandidate(
  nearPoints: MyPoint[],
  queryPoint: MyPoint,
  busStationsWithSameDistrict: BusStationsByDistrict[]
): BusIn4Struct[] {
  let nearCandidate: BusIn4Struct[] = [];
  const tree = new KDTree(null, nearPoints);
  tree.build();
  const nearestDistanceLocate = tree.nearestDis(queryPoint);
  const xCoor = nearestDistanceLocate.point?.x;
  const yCoor = nearestDistanceLocate.point?.y;

  if (xCoor !== undefined && yCoor !== undefined) {
    try {
      nearCandidate = busStationsWithSameDistrict[0].busStationIn4.filter(
        (item) => item.lat === xCoor && item.long === yCoor
      );
    } catch (error) {
      console.log(
        "nearEndCandidate is undefined because now don't have any matched district between db and input location. No matching candidate found."
      );
      const falseCandidate = {
        name: "falseCandidate",
        bus: [],
        lat: 1000,
        long: 1000,
      };
      nearCandidate.push(falseCandidate);
    }
  } else {
    const falseCandidate = {
      name: "falseCandidate",
      bus: [],
      lat: 1000,
      long: 1000,
    };
    nearCandidate.push(falseCandidate);
  }
  return nearCandidate;
}

export async function findRouteAndStation(req: Request, res: Response) {
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

  const busStationsByDistrict =
    await BusStationsByDistrict.getBusStationsByDistrictIn4();
  const busStationsWithSameDistrictNearStart: BusStationsByDistrict[] =
    busStationsByDistrict.filter(
      (item) => item.district == inputIn4.startIn4.district
    );

  const busStationsWithSameDistrictNearEnd = busStationsByDistrict.filter(
    (item) => item.district == inputIn4.endIn4.district
  );

  let nearStartCandidate: Array<BusIn4Struct> = [];

  // tìm các điểm cùng quận với nơi người dùng đứng
  let nearStartPoints: MyPoint[] = findNearPoints(
    busStationsWithSameDistrictNearStart
  );
  if (nearStartPoints[0].x == 1000) {
    // response người dùng nhập các khác (làm sau)
    res.status(400).json({ message: "không có quận nào ở gần xuất phát đâu" });
    return;
  }

  // tìm các điểm cùng quận nơi đích người dùng muốn đến
  let nearEndPoints: MyPoint[] = findNearPoints(
    busStationsWithSameDistrictNearEnd
  );
  if (nearEndPoints[0].x == 1000) {
    res
      .status(400)
      .json({ message: "không có trạm nào cùng quận ở gần đích đâu" });
    return;
  }

  // tìm ứng cử viên cùng quận ng dùng nhập mà gần nhất của đích
  const endQueryPointp = new MyPoint(inputIn4.endIn4.lat, inputIn4.endIn4.long);
  let nearEndCandidate: Array<BusIn4Struct> = findCandidate(
    nearEndPoints,
    endQueryPointp,
    busStationsWithSameDistrictNearEnd
  );
  if (nearEndCandidate[0].lat == 1000) {
    res.status(400).json({
      message:
        "không tìm được ứng cử viên gần đích vì quận ở đích bạn nhập không có trong database",
    });
    return;
  }

  while (nearStartPoints.length > 0) {
    const startQueryPoint = new MyPoint(
      inputIn4.startIn4.lat,
      inputIn4.startIn4.long
    );
    // tìm ứng cử viên cùng quận ng dùng nhập mà gần nhất của xuất phát
    nearStartCandidate = findCandidate(
      nearStartPoints,
      startQueryPoint,
      busStationsWithSameDistrictNearStart
    );
    if (nearStartCandidate[0].lat == 1000) {
      res.status(400).json({
        message:
          "không tìm được ứng cử viên gần vị trí xuất phát vì quận ở đích bạn nhập không có trong database",
      });
      return;
    }

    const buses = await Bus.getBusIn4();
    //console.log(buses);
    const endQueryPoint = new MyPoint(
      inputIn4.endIn4.lat,
      inputIn4.endIn4.long
    );
    for (let busCount = 0; busCount < buses.length; busCount++) {
      let chieuDiLength = buses[busCount].chieuDi.length;
      let chieuVeLength = buses[busCount].chieuVe.length;

      let f1Points: MyPoint[] = [];
      let chieuDiCount = 0;
      let chieuVeCount = 0;
      for (; chieuDiCount < chieuDiLength; ) {
        //console.log(buses[busCount].chieuDi[chieuDiCount]);
        if (
          // fix lại đoạn này là phải gần nearEndCandidate, bây giờ bước 1 là tìm lại nearEndCandidate đã
          // kiểu đây là ngồi trên xe buýt từ vị trí X rồi nên xuống đâu chả được,chứ ai lại đi bộ tới tít cái nearEnd
          buses[busCount].chieuDi[chieuDiCount].stationName ==
          nearEndCandidate[0].name
        ) {
          // console.log(chieuDiCount);
          //console.log(buses[busCount].chieuDi[chieuDiCount]);
          for (; chieuDiCount < chieuDiLength; ) {
            let f1Point = {
              x: buses[busCount].chieuDi[chieuDiCount].lat,
              y: buses[busCount].chieuDi[chieuDiCount].long,
            };
            f1Points.push(f1Point);
            chieuDiCount++;
          }
        }
        chieuDiCount++;
      }
      //console.log(f1Points);
      console.log("");

      if (f1Points.length > 0) {
        const f1Tree = new KDTree(null, f1Points);
        f1Tree.build();
        const nearestDistanceNearEnd = f1Tree.nearestDis(endQueryPoint);

        console.log(nearestDistanceNearEnd);
        const xCoordinateEnd = nearestDistanceNearEnd.point?.x;
        const yCoordinateEnd = nearestDistanceNearEnd.point?.y;
        let distanceEndInMeters = -1;
        if (xCoordinateEnd !== undefined && yCoordinateEnd !== undefined) {
          distanceEndInMeters = await getDirectionsAndDistance(
            inputIn4.endIn4.lat,
            inputIn4.endIn4.long,
            xCoordinateEnd,
            yCoordinateEnd
          );
          console.log(
            "khoảng cách cách điểm đích ở trạm xe buýt cuối:",
            distanceEndInMeters,
            "meters"
          );
        }

        if (
          distanceEndInMeters > 0 &&
          distanceEndInMeters < inputIn4.userKm * 1000
        ) {
          try {
            const nearEnd = busStationsByDistrict.flatMap((district) =>
              district.busStationIn4.filter(
                (station) =>
                  station.lat === nearestDistanceNearEnd.point?.x &&
                  station.long === nearestDistanceNearEnd.point.y
              )
            );
            console.log("route: ", buses[busCount].bus);
            console.log("trạm xe buýt gần đích người dùng cần đến", nearEnd);
            res.status(200).json({
              route: buses[busCount].bus,
              stationName: nearEnd[0].name,
              distanceInMeters: distanceEndInMeters,
            });
            return;
          } catch (error) {
            console.log("cùng quận ở địa điểm đích không có trạm xe buýt");
          }
        }
        // nếu không khoảng cách > người dùng cho thì tìm tiếp
        f1Points = [];
      }

      for (; chieuVeCount < chieuVeLength; ) {
        if (
          buses[busCount].chieuVe[chieuVeCount].stationName ==
          nearEndCandidate[0].name
        ) {
          for (; chieuVeCount < chieuVeLength; ) {
            let f1Point = {
              x: buses[busCount].chieuVe[chieuVeCount].lat,
              y: buses[busCount].chieuVe[chieuVeCount].long,
            };
            f1Points.push(f1Point);
            chieuVeCount++;
          }
        }
        chieuVeCount++;
      }
      if (f1Points.length > 0) {
        const f1Tree = new KDTree(null, f1Points);
        f1Tree.build();
        const nearestDistanceNearEnd = f1Tree.nearestDis(endQueryPoint);

        //console.log(nearestDistanceNearEnd);

        const xCoordinateEnd = nearestDistanceNearEnd.point?.x;
        const yCoordinateEnd = nearestDistanceNearEnd.point?.y;
        let distanceEndInMeters = -1;
        if (xCoordinateEnd !== undefined && yCoordinateEnd !== undefined) {
          distanceEndInMeters = await getDirectionsAndDistance(
            inputIn4.endIn4.lat,
            inputIn4.endIn4.long,
            xCoordinateEnd,
            yCoordinateEnd
          );

          console.log(
            "khoảng cách gần nhất với đích ở trạm xe buýt cuối:",
            distanceEndInMeters,
            "meters"
          );
        }

        if (
          distanceEndInMeters > 0 &&
          distanceEndInMeters < inputIn4.userKm * 1000
        ) {
          try {
            const nearEnd = busStationsByDistrict.flatMap((district) =>
              district.busStationIn4.filter(
                (station) =>
                  station.lat === nearestDistanceNearEnd.point?.x &&
                  station.long === nearestDistanceNearEnd.point.y
              )
            );
            console.log("route: ", buses[busCount].bus, "\n xuong dong \n /n");
            console.log("trạm xe buýt gần đích người dùng cần đến", nearEnd);
            res.status(200).json({
              route: buses[busCount].bus,
              stationName: nearEnd[0].name,
              distanceInMeters: distanceEndInMeters,
            });
            return;
          } catch (error) {
            console.log(error);
          }
        }
        // nếu không khoảng cách > người dùng cho thì tìm tiếp
        f1Points = [];
      }
    }

    // Lọc các phần tử có giá trị x và y không trùng với nearestDistanceNearStart
    const filteredNearStartPoints = nearStartPoints.filter(
      (point) =>
        point.x !== nearStartCandidate[0].lat ||
        point.y !== nearStartCandidate[0].long
    );

    // Gán lại mảng mới cho nearStartPoints để xoá các phần tử không thỏa mãn
    nearStartPoints = filteredNearStartPoints;
  }

  res.status(400).json({ message: "lọc hết rồi mà không có cái nào phù hợp" });
  return;
}

// chưa giải quyết trường hợp nếu khoảng cách từ vị trí ng dùng -> trạm xuất phát > ng dùng nhập
// chiều nghiên cứu nốt đoạn đó nên cắt gọt như nào là ok
