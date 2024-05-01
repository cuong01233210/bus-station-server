import KDTree from "../../../../models/kdTree";

import MyPoint from "../../../../models/my-point";
import BestPair from "../../../../models/best-pair";
import { Request, Response } from "express";

import { InputIn4 } from "../../../../models/input-in4";
import { convertInputData } from "./user-input-string.controller";
import BusStationsByDistrict from "../../../../models/bus-stations-by-district";
import {
  convertIn4,
  getDirectionsAndDistance,
  haversineDistance,
} from "../new-search-2024/test-geocoding-controller";
import Bus from "../../../../models/bus";
// export function testKDtree(req: Request, res: Response) {
//   const points: MyPoint[] = [
//     new MyPoint(2, 3),
//     new MyPoint(5, 4),
//     new MyPoint(4, 7),
//     new MyPoint(8, 1),
//     new MyPoint(7, 2),
//   ];
//   const tree = new KDTree(null, points);
//   tree.build();
//   tree.printTree();

//   const queryPoint = new MyPoint(6, 6);
//   const nearestDistance = tree.nearestDis(queryPoint);
//   console.log("Nearest distance:", nearestDistance);

//   // Tìm 3 điểm gần nhất với điểm truy vấn
//   const nearestNodes = tree.nearestNodes(queryPoint, 3);
//   // In ra các điểm gần nhất
//   console.log("Các điểm gần nhất với điểm truy vấn:");
//   nearestNodes.forEach((pair, index) => {
//     if (pair.point) {
//       console.log(
//         `Điểm ${index + 1}: (${pair.point.x}, ${pair.point.y}), Khoảng cách: ${
//           pair.dist
//         }`
//       );
//     } else {
//       console.log(`Điểm ${index + 1}: null, Khoảng cách: ${pair.dist}`);
//     }
//   });
//   res.status(200).json({ message: "test sucessfully" });
// }

// interface BusIn4Struct {
//   name: string;
//   bus: Array<string>;
//   lat: number;
//   long: number;
// }

// interface OutputIn4 {
//   route: string;
//   stationStartName: string;
//   stationEndName: string;
//   distanceInMeters: number;
//   stationStartLat: number;
//   stationStartLong: number;
//   stationEndLat: number;
//   stationEndLong: number;
// }

// async function processDirection(
//   busCount: number,
//   busesByDirection: BusIn4Struct[],
//   route: string,
//   nearStartCandidate: Array<BusIn4Struct>,
//   nearEndCandidate: Array<BusIn4Struct>,
//   directionLength: number,
//   inputIn4: InputIn4
// ): Promise<OutputIn4> {
//   let outputIn4: OutputIn4 = {
//     route: "1000",
//     stationStartName: "false station",
//     stationEndName: "false station",
//     distanceInMeters: -1,
//     stationStartLat: 21,
//     stationStartLong: 105,
//     stationEndLat: 21,
//     stationEndLong: 105,
//   };
//   let f1Points: MyPoint[] = [];
//   let directionCount = 0;
//   let distanceNearStart = 0;
//   let endQueryPoint = {
//     x: inputIn4.endIn4.lat,
//     y: inputIn4.endIn4.long,
//   };
//   //console.log("busesByDirection", busesByDirection);
//   //console.log("nearEndCandidate", nearEndCandidate);
//   console.log("directionLength", directionLength);
//   for (; directionCount < directionLength; ) {
//     if (busesByDirection[directionCount].name == nearEndCandidate[0].name) {
//       for (; directionCount < directionLength; ) {
//         let f1Point = {
//           x: busesByDirection[directionCount].lat,
//           y: busesByDirection[directionCount].long,
//         };
//         f1Points.push(f1Point);
//         directionCount++;
//       }
//     }
//     directionCount++;
//   }
//   console.log("f1Points", f1Points);
//   if (f1Points.length > 0) {
//     const f1Tree = new KDTree(null, f1Points);
//     f1Tree.build();
//     const nearestDistanceNearEnd = f1Tree.nearestDis(endQueryPoint);
//     console.log(nearestDistanceNearEnd);
//     const xCoordinateEnd = nearestDistanceNearEnd.point?.x;
//     const yCoordinateEnd = nearestDistanceNearEnd.point?.y;
//     let distanceEndInMeters = -1;
//     const busStationsByDistrict =
//       await BusStationsByDistrict.getBusStationsByDistrictIn4();

//     if (xCoordinateEnd !== undefined && yCoordinateEnd !== undefined) {
//       distanceEndInMeters = await getDirectionsAndDistance(
//         endQueryPoint.x,
//         endQueryPoint.y,
//         xCoordinateEnd,
//         yCoordinateEnd
//       );
//       console.log(
//         "khoảng cách cách điểm đích ở trạm xe buýt cuối:",
//         distanceEndInMeters,
//         "meters"
//       );
//     }

//     if (
//       distanceEndInMeters > 0 &&
//       distanceEndInMeters < inputIn4.userKm * 1000
//     ) {
//       try {
//         const nearEnd = busStationsByDistrict.flatMap((district) =>
//           district.busStationIn4.filter(
//             (station) =>
//               station.lat === nearestDistanceNearEnd.point?.x &&
//               station.long === nearestDistanceNearEnd.point?.y
//           )
//         );
//         console.log("route: ", route);
//         console.log("trạm xe buýt gần đích người dùng cần đến", nearEnd);

//         outputIn4 = {
//           route: route,
//           stationStartName: nearStartCandidate[0].name,
//           stationEndName: nearEnd[0].name,
//           distanceInMeters: distanceEndInMeters,
//           stationStartLat: nearStartCandidate[0].lat,
//           stationStartLong: nearStartCandidate[0].long,
//           stationEndLat: nearEnd[0].lat,
//           stationEndLong: nearEnd[0].long,
//         };
//         return outputIn4;
//       } catch (error) {
//         console.log("cùng quận ở địa điểm đích không có trạm xe buýt");
//       }
//     }
//   }
//   return outputIn4;
// }

// // Lọc các phần tử có giá trị x và y không trùng với nearestDistanceNearStart
// function getNewNearPoints(
//   nearPoints: MyPoint[],
//   nearCandidate: Array<BusIn4Struct>
// ): MyPoint[] {
//   return nearPoints.filter(
//     (point) =>
//       point.x !== nearCandidate[0].lat || point.y !== nearCandidate[0].long
//   );
// }
// // hàm tìm các điểm cùng quận
// function findNearPoints(
//   busStationsWithSameDistrict: BusStationsByDistrict[]
// ): MyPoint[] {
//   let nearPoints: MyPoint[] = [];
//   try {
//     for (
//       let i = 0;
//       i < busStationsWithSameDistrict[0].busStationIn4.length;
//       i++
//     ) {
//       let tempPoint: MyPoint = {
//         x: busStationsWithSameDistrict[0].busStationIn4[i].lat,
//         y: busStationsWithSameDistrict[0].busStationIn4[i].long,
//       };
//       nearPoints.push(tempPoint);
//     }
//   } catch (error) {
//     // response người dùng nhập các khác (làm sau)
//     //res.status(400).json({ message: "không có quận nào ở gần xuất phát //đâu" });
//     let tempPoint: MyPoint = {
//       x: 1000,
//       y: 1000,
//     };
//     nearPoints.push(tempPoint);
//   }
//   return nearPoints;
// }

// // hàm tìm các ứng cử viên, kiểu chọn ra điểm nào gần vị trí ng dùng yêu cầu nhất trong tập các điểm cùng quận đó
// function findCandidate(
//   nearPoints: MyPoint[],
//   queryPoint: MyPoint,
//   busStationsWithSameDistrict: BusStationsByDistrict[]
// ): BusIn4Struct[] {
//   let nearCandidate: BusIn4Struct[] = [];
//   const tree = new KDTree(null, nearPoints);
//   tree.build();
//   const nearestDistanceLocate = tree.nearestDis(queryPoint);
//   const xCoor = nearestDistanceLocate.point?.x;
//   const yCoor = nearestDistanceLocate.point?.y;

//   if (xCoor !== undefined && yCoor !== undefined) {
//     try {
//       nearCandidate = busStationsWithSameDistrict[0].busStationIn4.filter(
//         (item) => item.lat === xCoor && item.long === yCoor
//       );
//     } catch (error) {
//       console.log(
//         "nearCandidate is undefined because now don't have any matched district between db and input location. No matching candidate found."
//       );
//       const falseCandidate = {
//         name: "falseCandidate",
//         bus: [],
//         lat: 1000,
//         long: 1000,
//       };
//       nearCandidate.push(falseCandidate);
//     }
//   } else {
//     const falseCandidate = {
//       name: "falseCandidate",
//       bus: [],
//       lat: 1000,
//       long: 1000,
//     };
//     nearCandidate.push(falseCandidate);
//   }
//   return nearCandidate;
// }

// // export async function findRouteAndStation(req: Request, res: Response) {
// //   const userId = req.body.id;
// //   const startString = req.body.startString;
// //   const endString = req.body.endString;
// //   const userKm = req.body.userKm;
// //   //const userString = userStrings.find((user) => user.id === userId);

// //   let inputIn4: InputIn4 = await convertInputData(
// //     userId,
// //     startString,
// //     endString,
// //     userKm
// //   );

// //   const busStationsByDistrict =
// //     await BusStationsByDistrict.getBusStationsByDistrictIn4();
// //   const busStationsWithSameDistrictNearStart: BusStationsByDistrict[] =
// //     busStationsByDistrict.filter(
// //       (item) => item.district == inputIn4.startIn4.district
// //     );

// //   const busStationsWithSameDistrictNearEnd = busStationsByDistrict.filter(
// //     (item) => item.district == inputIn4.endIn4.district
// //   );

// //   let nearStartCandidate: Array<BusIn4Struct> = [];

// //   // tìm các điểm cùng quận với nơi người dùng đứng
// //   let nearStartPoints: MyPoint[] = findNearPoints(
// //     busStationsWithSameDistrictNearStart
// //   );
// //   if (nearStartPoints[0].x == 1000) {
// //     // response người dùng nhập các khác (làm sau)
// //     res.status(400).json({ message: "không tìm được trạm xe buýt phù hợp" });
// //     return;
// //   }

// //   // tìm các điểm cùng quận nơi đích người dùng muốn đến
// //   let nearEndPoints: MyPoint[] = findNearPoints(
// //     busStationsWithSameDistrictNearEnd
// //   );
// //   if (nearEndPoints[0].x == 1000) {
// //     res.status(400).json({ message: "không tìm được trạm xe buýt phù hợp" });
// //     return;
// //   }

// //   // tìm ứng cử viên cùng quận ng dùng nhập mà gần nhất của đích
// //   const endQueryPointp = new MyPoint(inputIn4.endIn4.lat, inputIn4.endIn4.long);
// //   let nearEndCandidate: Array<BusIn4Struct> = findCandidate(
// //     nearEndPoints,
// //     endQueryPointp,
// //     busStationsWithSameDistrictNearEnd
// //   );
// //   if (nearEndCandidate[0].lat == 1000) {
// //     res.status(400).json({
// //       message:
// //         "không tìm được ứng cử viên gần đích vì quận ở đích bạn nhập không có trong database",
// //     });
// //     return;
// //   }

// //   while (nearStartPoints.length > 0) {
// //     const startQueryPoint = new MyPoint(
// //       inputIn4.startIn4.lat,
// //       inputIn4.startIn4.long
// //     );
// //     // tìm ứng cử viên cùng quận ng dùng nhập mà gần nhất của xuất phát
// //     nearStartCandidate = findCandidate(
// //       nearStartPoints,
// //       startQueryPoint,
// //       busStationsWithSameDistrictNearStart
// //     );

// //     if (nearStartCandidate[0].lat == 1000) {
// //       // skip tới bước tiếp theo
// //       nearStartPoints = getNewNearPoints(nearStartPoints, nearStartCandidate);
// //       continue;
// //     }

// //     // kiểm tra xem khoảng cách điểm xuất phát người dùng nhập với trạm xe buýt gợi ý hiện tại không
// //     // nếu được thì làm phần xử lý ở dưới
// //     // nếu không được thì skip lên bước tiếp theo luôn
// //     const distanceNearStart = await getDirectionsAndDistance(
// //       inputIn4.startIn4.lat,
// //       inputIn4.startIn4.long,
// //       nearStartCandidate[0].lat,
// //       nearStartCandidate[0].long
// //     );

// //     if (distanceNearStart > 1000 * inputIn4.userKm) {
// //       nearStartPoints = getNewNearPoints(nearStartPoints, nearStartCandidate);
// //       continue;
// //     }

// //     const buses = await Bus.getBusIn4();
// //     //console.log(buses);
// //     const endQueryPoint = new MyPoint(
// //       inputIn4.endIn4.lat,
// //       inputIn4.endIn4.long
// //     );
// //     let busLength = buses.length;
// //     for (let busCount = 0; busCount < busLength; busCount++) {
// //       let directionLength = buses[busCount].chieuDi.length;
// //       const outwardDirectionResult = await processDirection(
// //         busCount,
// //         buses[busCount].chieuDi,
// //         buses[busCount].bus,
// //         nearStartCandidate,
// //         nearEndCandidate,
// //         directionLength,
// //         inputIn4
// //       );

// //       console.log("outwardStart", outwardDirectionResult);
// //       if (outwardDirectionResult.distanceInMeters != -1) {
// //         res.status(200).json({
// //           route: outwardDirectionResult.route,
// //           stationStartName: outwardDirectionResult.stationStartName,
// //           stationEndName: outwardDirectionResult.stationEndName,
// //           distanceInMeters: outwardDirectionResult.distanceInMeters,
// //           stationStartLat: outwardDirectionResult.stationStartLat,
// //           stationStartLong: outwardDirectionResult.stationStartLong,
// //           stationEndLat: outwardDirectionResult.stationEndLat,
// //           stationEndLong: outwardDirectionResult.stationEndLong,
// //         });
// //         return;
// //       }

// //       directionLength = buses[busCount].chieuVe.length;
// //       const returnDirectionResult = await processDirection(
// //         busCount,
// //         buses[busCount].chieuVe,
// //         buses[busCount].bus,
// //         nearStartCandidate,
// //         nearEndCandidate,
// //         directionLength,
// //         inputIn4
// //       );
// //       console.log("outwardEnd", returnDirectionResult);
// //       if (returnDirectionResult.distanceInMeters != -1) {
// //         res.status(200).json({ result: returnDirectionResult });
// //         return;
// //       }
// //     }

// //     // Gán lại mảng mới cho nearStartPoints để xoá các phần tử không thỏa mãn
// //     nearStartPoints = getNewNearPoints(nearStartPoints, nearStartCandidate);
// //   }

// //   res.status(400).json({ message: "lọc hết rồi mà không có cái nào phù hợp" });
// //   return;
// // }

// // // ------------------------------------------------------------------------------//
// // //                        ĐOẠN TÌM THEO CÁCH NHẢY TUYẾN                          //
// // //
// // //
// // //
// // //
// // //
// // //
// // //

// // function findSimilarBuses(busArr1: string[], busArr2: string[]): string[] {
// //   return busArr1.filter((bus) => busArr2.includes(bus));
// // }
// // interface OutputIn4V2 {
// //   midStation: string;
// //   midStationLat: number;
// //   midStationLong: number;
// //   midToEndRoute: string;
// //   endStation: string;
// //   endStationLat: number;
// //   endStationLong: number;
// // }
// // // kiểm tra xem Y với outwardStation[k] có okela không
// // function checkCanChangeRoute(
// //   outwardStationK: BusIn4Struct,
// //   nearEndCandidateK: BusIn4Struct,
// //   buses: Bus[]
// // ): OutputIn4V2 {
// //   //console.log("outwardStationK: ", outwardStationK.name);
// //   //console.log("nearEndCandidateK: ", nearEndCandidateK.name);
// //   let outputIn4V2: OutputIn4V2 = {
// //     midStation: "",
// //     midStationLat: 0,
// //     midStationLong: 0,
// //     midToEndRoute: "",
// //     endStation: "",
// //     endStationLat: 0,
// //     endStationLong: 0,
// //   };
// //   const similarBuses1 = findSimilarBuses(
// //     outwardStationK.bus,
// //     nearEndCandidateK.bus
// //   );
// //   const similarBuses1Length = similarBuses1.length;
// //   for (let i = 0; i < similarBuses1Length; i++) {
// //     const similarBus = buses.filter((item) => item.bus == similarBuses1[i]);
// //     if (similarBus !== undefined && similarBus.length > 0) {
// //       //console.log("similarBus chieu di", similarBus[0].chieuDi);
// //       // xét chiều đi của route đang trùng
// //       const outwardLength = similarBus[0].chieuDi.length;
// //       let outwardCount = 0;
// //       for (; outwardCount < outwardLength; outwardCount++) {
// //         // nếu chieudi[m] == outwardStaion[k]
// //         if (similarBus[0].chieuDi[outwardCount].name == outwardStationK.name) {
// //           // xét tiếp nếu chieudi[m + x] == Y
// //           outwardCount++;
// //           for (; outwardCount < outwardLength; outwardCount++) {
// //             if (
// //               similarBus[0].chieuDi[outwardCount].name == nearEndCandidateK.name
// //             ) {
// //               // console.log("nhảy tuyến thành công tại trạm: ", outwardStationK);
// //               outputIn4V2.midStation = outwardStationK.name;
// //               outputIn4V2.midStationLat = outwardStationK.lat;
// //               outputIn4V2.midStationLong = outwardStationK.long;
// //               outputIn4V2.endStation = nearEndCandidateK.name;
// //               outputIn4V2.endStationLat = nearEndCandidateK.lat;
// //               outputIn4V2.endStationLong = nearEndCandidateK.long;
// //               outputIn4V2.midToEndRoute = similarBus[0].bus;
// //               return outputIn4V2;
// //             }
// //           }
// //         }
// //       }

// //       // xét chiều về của route đang trùng
// //       let returnCount = 0;
// //       const returnLength = similarBus[0].chieuVe.length;
// //       for (; returnCount < returnLength; returnCount++) {
// //         // nếu chieuve[m] == returnStation[k]
// //         if (similarBus[0].chieuVe[returnCount].name == outwardStationK.name) {
// //           // xét tiếp chiều về [m + x] == Y
// //           returnCount++;
// //           for (; returnCount < returnLength; returnCount++) {
// //             if (
// //               similarBus[0].chieuVe[returnCount].name == nearEndCandidateK.name
// //             ) {
// //               //console.log("nhảy tuyến thành công tại trạm: ", outwardStationK);
// //               outputIn4V2.midStation = outwardStationK.name;
// //               outputIn4V2.midStationLat = outwardStationK.lat;
// //               outputIn4V2.midStationLong = outwardStationK.long;
// //               outputIn4V2.endStation = nearEndCandidateK.name;
// //               outputIn4V2.endStationLat = nearEndCandidateK.lat;
// //               outputIn4V2.endStationLong = nearEndCandidateK.long;
// //               outputIn4V2.midToEndRoute = similarBus[0].bus;
// //               return outputIn4V2;
// //             }
// //           }
// //         }
// //       }
// //     }
// //   }
// //   //console.log(similarBuses1);
// //   return outputIn4V2;
// // }
// // export async function findByChangeRoute(req: Request, res: Response) {
// //   const userId = req.body.id;
// //   const startString = req.body.startString;
// //   const endString = req.body.endString;
// //   const userKm = req.body.userKm;
// //   //const userString = userStrings.find((user) => user.id === userId);

// //   let inputIn4: InputIn4 = await convertInputData(
// //     userId,
// //     startString,
// //     endString,
// //     userKm
// //   );

// //   const busStationsByDistrict =
// //     await BusStationsByDistrict.getBusStationsByDistrictIn4();
// //   const busStationsWithSameDistrictNearStart: BusStationsByDistrict[] =
// //     busStationsByDistrict.filter(
// //       (item) => item.district == inputIn4.startIn4.district
// //     );

// //   const busStationsWithSameDistrictNearEnd = busStationsByDistrict.filter(
// //     (item) => item.district == inputIn4.endIn4.district
// //   );

// //   // tìm các điểm cùng quận với nơi người dùng đứng
// //   let nearStartPoints: MyPoint[] = findNearPoints(
// //     busStationsWithSameDistrictNearStart
// //   );
// //   if (nearStartPoints[0].x == 1000) {
// //     // response người dùng nhập các khác (làm sau)
// //     res.status(400).json({ message: "không tìm được trạm nào phù hợp" });
// //     return;
// //   }

// //   const startQueryPoint = new MyPoint(
// //     inputIn4.startIn4.lat,
// //     inputIn4.startIn4.long
// //   );
// //   let nearStartCandidate = findCandidate(
// //     nearStartPoints,
// //     startQueryPoint,
// //     busStationsWithSameDistrictNearStart
// //   );
// //   // tìm các điểm cùng quận nơi đích người dùng muốn đến
// //   let nearEndPoints: MyPoint[] = findNearPoints(
// //     busStationsWithSameDistrictNearEnd
// //   );
// //   if (nearEndPoints[0].x == 1000) {
// //     res.status(400).json({ message: "không tìm được trạm nào phù hợp" });
// //     return;
// //   }

// //   let countEndCandidate = 0;
// //   const endQueryPoint = new MyPoint(inputIn4.endIn4.lat, inputIn4.endIn4.long);
// //   let nearEndCandidate: Array<BusIn4Struct> = [];
// //   while (nearEndPoints.length > 0 && countEndCandidate < 3) {
// //     // tìm ứng cử viên cùng quận ng dùng nhập mà gần nhất của xuất phát
// //     let nearEndCandidateT = findCandidate(
// //       nearEndPoints,
// //       endQueryPoint,
// //       busStationsWithSameDistrictNearEnd
// //     );

// //     if (nearEndCandidateT[0].lat == 1000) {
// //       // skip tới bước tiếp theo
// //       nearEndPoints = getNewNearPoints(nearEndPoints, nearEndCandidateT);
// //       continue;
// //     }

// //     // kiểm tra xem đích tìm có okela không
// //     const distanceNearEnd = await getDirectionsAndDistance(
// //       inputIn4.endIn4.lat,
// //       inputIn4.endIn4.long,
// //       nearEndCandidateT[0].lat,
// //       nearEndCandidateT[0].long
// //     );

// //     // nếu cái gần nhất hiện tại fail -> những cái đằng sau xa hơn cũng fail
// //     if (distanceNearEnd > 1000 * inputIn4.userKm) {
// //       nearEndPoints = getNewNearPoints(nearEndPoints, nearEndCandidateT);
// //       break;
// //     } else {
// //       nearEndCandidate.push(nearEndCandidateT[0]);
// //       countEndCandidate++;
// //       nearEndPoints = getNewNearPoints(nearEndPoints, nearEndCandidateT);
// //     }
// //   }

// //   const buses = await Bus.getBusIn4();
// //   let busesInStartCandidateCount = 0;
// //   const busesInStartCandidateLength = nearStartCandidate[0].bus.length;

// //   // vòng lặp cho route của nearStartCandidate
// //   for (
// //     ;
// //     busesInStartCandidateCount < busesInStartCandidateLength;
// //     busesInStartCandidateCount++
// //   ) {
// //     const busesInStartCandidate = buses.filter(
// //       (item) =>
// //         item.bus == nearStartCandidate[0].bus[busesInStartCandidateCount]
// //     );

// //     // chỗ này là do database chưa phủ đủ nên có thể xảy ra tình trạng mảng rỗng
// //     if (busesInStartCandidate.length == 0) {
// //       break;
// //     }
// //     // console.log(
// //     //   "busesInStartCandidateChieuDI: ",
// //     //   busesInStartCandidate[0].chieuDi
// //     // );
// //     // đến đây in4 vẫn đầy đủ
// //     let outwardCount = 0;
// //     const outwardLength = busesInStartCandidate[0].chieuDi.length;
// //     // vòng lặp các trạm xe buýt trên chiều đi
// //     for (; outwardCount < outwardLength; ) {
// //       if (
// //         busesInStartCandidate[0].chieuDi[outwardCount].name ==
// //         nearStartCandidate[0].name
// //       ) {
// //         //outwardCount++;
// //         // xét outwardStation[k] == busesInStartCandidate[0].chieuDi[outwardCount]
// //         // console.log(busesInStartCandidate[0].chieuDi[outwardCount]);
// //         for (; outwardCount < outwardLength; outwardCount++) {
//           // xét lần lượt với 3 cái đích Y1, Y2, Y3
//           let endCandidateCount = 0;
//           const endCandidateLength = nearEndCandidate.length;
//           for (; endCandidateCount < endCandidateLength; endCandidateCount++) {
//             let outputIn4V2 = checkCanChangeRoute(
//               busesInStartCandidate[0].chieuDi[outwardCount],
//               nearEndCandidate[endCandidateCount],
//               buses
//             );
//             if (outputIn4V2.midStation != "") {
//               console.log("outputIn4V2: ", outputIn4V2);
//               res.status(200).json({
//                 startStation: nearStartCandidate[0].name,
//                 startStationLat: nearStartCandidate[0].lat,
//                 startStationLong: nearStartCandidate[0].long,
//                 midStation: outputIn4V2.midStation,
//                 midStationLat: outputIn4V2.midStationLat,
//                 midStationLong: outputIn4V2.midStationLong,
//                 endStation: outputIn4V2.endStation,
//                 endStationLat: outputIn4V2.endStationLat,
//                 endStationLong: outputIn4V2.endStationLong,
//                 startToMidRoute: busesInStartCandidate[0].bus,
//                 midToEndRoute: outputIn4V2.midToEndRoute,
//               });
//               return;
//             }
//           }
//         }
//       }
//       outwardCount++;
//     }
//     // còn vòng lặp chiều về
//     let returnCount = 0;
//     const returnLength = busesInStartCandidate[0].chieuVe.length;
//     // vòng lặp trạm xe buýt trên chiều về
//     for (; returnCount < returnLength; returnCount++) {
//       if (
//         busesInStartCandidate[0].chieuVe[returnCount].name ==
//         nearStartCandidate[0].name
//       ) {
//         for (; returnCount < returnLength; returnCount++) {
//           // xét lần lượt 3 đích Y1, Y2, Y3
//           let endCandidateCount = 0;
//           const endCandidateLength = nearEndCandidate.length;
//           for (; endCandidateCount < endCandidateLength; endCandidateCount++) {
//             let outputIn4V2 = checkCanChangeRoute(
//               busesInStartCandidate[0].chieuVe[returnCount],
//               nearEndCandidate[endCandidateCount],
//               buses
//             );
//             if (outputIn4V2.midStation != "") {
//               console.log("outputIn4V2: ", outputIn4V2);
//               res.status(200).json({
//                 startStation: nearStartCandidate[0].name,
//                 startStationLat: nearStartCandidate[0].lat,
//                 startStationLong: nearStartCandidate[0].long,
//                 midStation: outputIn4V2.midStation,
//                 midStationLat: outputIn4V2.midStationLat,
//                 midStationLong: outputIn4V2.midStationLong,
//                 endStation: outputIn4V2.endStation,
//                 endStationLat: outputIn4V2.endStationLat,
//                 endStationLong: outputIn4V2.endStationLong,
//                 startToMidRoute: busesInStartCandidate[0].bus,
//                 midToEndRoute: outputIn4V2.midToEndRoute,
//               });
//               return;
//             }
//           }
//         }
//       }
//     }
//   }
//   // sáng mai làm nốt cái trả về theo set
//   // trạm xuất phát
//   // tuyến đường
//   // nhảy tại trạm nào
//   // trạm đích
//   // định dạng khung return như trên
//   // check nếu return ok thì dừng thuật toán và response
//   // cuối cùng return ở hàm chính
//   res.status(200).json({
//     nearStartCandidate: nearStartCandidate,
//     nearEndCandidate: nearEndCandidate,
//   });
// }

// // Đoạn tìm không cần theo quận version1
// export async function findBusStationsV1(req: Request, res: Response) {
//   const userId = req.body.id;
//   const startString = req.body.startString;
//   const endString = req.body.endString;
//   const userKm = req.body.userKm;
//   //const userString = userStrings.find((user) => user.id === userId);

//   let inputIn4: InputIn4 = await convertInputData(
//     userId,
//     startString,
//     endString,
//     userKm
//   );

//   const startQueryPoint = new MyPoint(
//     inputIn4.startIn4.lat,
//     inputIn4.startIn4.long
//   );

//   const busStationsByDistrict =
//     await BusStationsByDistrict.getBusStationsByDistrictIn4();
//   //console.log("inputIn4: ", inputIn4);
//   let busStationsPoints: MyPoint[] = [];
//   let busStationsByDistrictLeng = busStationsByDistrict.length;
//   for (let i = 0; i < busStationsByDistrictLeng; i++) {
//     let busStationsIn4Leng = busStationsByDistrict[i].busStationIn4.length;
//     for (let j = 0; j < busStationsIn4Leng; j++) {
//       const point = {
//         x: busStationsByDistrict[i].busStationIn4[j].lat,
//         y: busStationsByDistrict[i].busStationIn4[j].long,
//       };
//       busStationsPoints.push(point);
//     }
//   }
//   // dựng cây kd tree với tất cả các trạm xe buýt
//   const startTree = new KDTree(null, busStationsPoints);
//   startTree.build();
//   // tìm trạm xuất phát gần nhất có thể
//   const startLocation = startTree.nearestDis(startQueryPoint);

//   // tìm thông tin chi tiết của trạm xuất phát
//   let startLocationIn4: BusIn4Struct = {
//     name: "",
//     bus: [],
//     lat: 0,
//     long: 0,
//   };
//   for (let i = 0; i < busStationsByDistrictLeng; i++) {
//     let busStationsIn4Leng = busStationsByDistrict[i].busStationIn4.length;
//     for (let j = 0; j < busStationsIn4Leng; j++) {
//       const point = {
//         x: busStationsByDistrict[i].busStationIn4[j].lat,
//         y: busStationsByDistrict[i].busStationIn4[j].long,
//       };
//       if (
//         startLocation.point?.x == point.x &&
//         startLocation.point?.y == point.y
//       ) {
//         startLocationIn4 = busStationsByDistrict[i].busStationIn4[j];
//       }
//     }
//   }
//   // tìm khoảng cách trạm xe buýt gần nhất với vị trí xuất phát
//   const startDistance = haversineDistance(
//     startLocationIn4.lat,
//     startLocationIn4.long,
//     inputIn4.startIn4.lat,
//     inputIn4.endIn4.long
//   );
//   //console.log(startLocationIn4);
//   // đi tìm in4 của các tuyến bus từ db
//   const buses = await Bus.getBusIn4();
//   //console.log(buses);

//   // lấy đầy đủ in4 các tuyến của trạm xuất phát
//   const routesIn4: Bus[] = [];
//   const startLocationIn4BusesLeng = startLocationIn4.bus.length;
//   const busesLeng = buses.length;
//   for (let i = 0; i < startLocationIn4BusesLeng; i++) {
//     for (let j = 0; j < busesLeng; j++) {
//       if (startLocationIn4.bus[i] == buses[j].bus) {
//         routesIn4.push(buses[j]);
//         j = busesLeng;
//       }
//     }
//   }

//   // mảng lưu các trạm gần nhất so với đích trên mỗi tuyến của trạm xuất phát và các khoảng cách so với đích của chúng
//   const minDistances = []; // mảng lưu khoảng cách oke nhất của trạm đích và đích đến theo các tuyến
//   const minDistancesStations = []; // mảng lưu các đích tương ứng mà oke nhất trên tuyến
//   const minRoutes = []; // mảng lưu tuyến xe buýt để đến trạm tương ứng

//   // vòng for các route của trạm xuất phát
//   const routesIn4Leng = routesIn4.length;

//   for (let i = 0; i < routesIn4Leng; i++) {
//     let minDis = Infinity;
//     let minDisStation = "";
//     const chieuDiLeng = routesIn4[i].chieuDi.length;
//     const chieuVeLeng = routesIn4[i].chieuVe.length;

//     // xét chiều đi của route đó
//     let j = 0;
//     for (; j < chieuDiLeng; j++) {
//       if (routesIn4[i].chieuDi[j].name == startLocationIn4.name) {
//         console.log(
//           "common name: ",
//           startLocationIn4.name,
//           routesIn4[i].chieuDi[j].name
//         );
//         break;
//       }
//     }
//     for (; j < chieuDiLeng; j++) {
//       const tempDis = haversineDistance(
//         inputIn4.endIn4.lat,
//         inputIn4.endIn4.long,
//         routesIn4[i].chieuDi[j].lat,
//         routesIn4[i].chieuDi[j].long
//       );
//       if (tempDis < minDis) {
//         minDis = tempDis;
//         minDisStation = routesIn4[i].chieuDi[j].name;
//       }
//     }
//     if (minDisStation != "") {
//       minDistances.push(minDis);
//       minDistancesStations.push(minDisStation);
//       minRoutes.push(routesIn4[i].bus);
//     }

//     minDis = Infinity;
//     minDisStation = "";
//     j = 0;
//     // xét chiều về của route đó
//     for (; j < chieuVeLeng; j++) {
//       if (routesIn4[i].chieuVe[j].name == startLocationIn4.name) {
//         console.log(
//           "common name: ",
//           startLocationIn4.name,
//           routesIn4[i].chieuVe[j].name
//         );
//         break;
//       }
//     }
//     for (; j < chieuVeLeng; j++) {
//       const tempDis = haversineDistance(
//         inputIn4.endIn4.lat,
//         inputIn4.endIn4.long,
//         routesIn4[i].chieuVe[j].lat,
//         routesIn4[i].chieuVe[j].long
//       );
//       if (tempDis < minDis) {
//         minDis = tempDis;
//         minDisStation = routesIn4[i].chieuVe[j].name;
//       }
//     }
//     if (minDisStation != "") {
//       minDistances.push(minDis);
//       minDistancesStations.push(minDisStation);
//       minRoutes.push(routesIn4[i].bus);
//     }
//   }
//   res.status(200).json({
//     startLocation: startLocationIn4.name,
//     startLocationLat: startLocationIn4.lat,
//     startLocationLong: startLocationIn4.long,
//     minDistances: minDistances,
//     minDistancesStations: minDistancesStations,
//     minRoutes: minRoutes,
//     startDistance: startDistance,
//     startStationLat: inputIn4.startIn4.lat,
//     startStationLong: inputIn4.startIn4.long,
//   });
//   //res.status(200).json({ busStationsByDistrict: busStationsByDistrict });
// }
