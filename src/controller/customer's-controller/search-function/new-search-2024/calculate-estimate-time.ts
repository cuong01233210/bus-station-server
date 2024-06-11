import { Router } from "express";
import { Request, Response } from "express";
import Bus from "../../../../models/bus";
import { getDistance } from "./LocationIQ";
import { haversineDistance } from "./test-geocoding-controller";
import BusAppearance from "../../../../models/bus-appearance-time";
import moment, { min } from "moment-timezone";
import BusRoute from "../../../../models/bus-route";
import BusInfo from "../../../../models/bus-info";
import fs from "fs";
import path from "path";
import BusStation from "../../../../models/bus-station";
function convertStringTime(timeString: string): {
  hour: number;
  minute: number;
} {
  // Tìm vị trí của ký tự 'h' trong chuỗi
  const indexOfH: number = timeString.indexOf("h");

  // Lấy giờ từ đầu chuỗi đến vị trí của ký tự 'h'
  const hourString: string = timeString.substring(0, indexOfH);
  const hour: number = parseInt(hourString, 10);

  // Lấy phút từ vị trí của ký tự 'h' đến hết chuỗi
  const minuteString: string = timeString.substring(indexOfH + 1);
  const minute: number = parseInt(minuteString, 10);

  // Trả về đối tượng chứa giá trị giờ và phút
  return { hour: hour, minute: minute };
}
function convertDoubleTime(tDouble: number): { hour: number; minute: number } {
  const hour = Math.floor(tDouble); // Lấy phần nguyên
  const minute = Math.round((tDouble - hour) * 60); // Lấy phần thập phân và chuyển đổi thành phút

  return { hour: hour, minute: minute };
}
// ý tưởng: tận dụng thời gian giãn cách giữa các tuyến để đỡ phải dùng vòng lặp nhiều lần
// chỉ cần tính toán ra lần đầu tiên tuyến xuất hiện tại trạm theo chiều đi và về
// sau đó sẽ cộng dồn giãn cách cho tới khi chạm tới giới hạn thời gian hoạt động trong ngày của tuyến
// ex: tuyến 01 thời gian khởi đầu là 5h00, thời điểm kết thúc là 21h00
// giãn cách giữa các chuyến là 15p, vận tốc trung bình ước lượng đc là 25.5 km/h
// thì ở trạm đầu tiên của chiều đi thời gian xuất hiện xe sẽ là 5h00, 5h15, 5h30,... 21h00
// giả sử từ trạm đầu tiên tới trạm thứ 2 mất 5h thì thời gian xuất hiện xe là 5h05, 5h35, ... 20h50
export async function calculateTime(req: Request, res: Response) {
  const route: string = req.body.route;
  const Vtb: number = req.body.Vtb;
  const gianCachTrungBinh = req.body.gianCachTrungBinh;
  const tKDString: string = req.body.tKDString;
  const tKTString: string = req.body.tKTString;
  const firstAppearChieuDi: number[] = [];
  const firstAppearChieuVe: number[] = [];
  firstAppearChieuDi.push(0);
  firstAppearChieuVe.push(0);

  const busRoute = await BusRoute.getBusRoute(route);
  const busInfo = await BusInfo.getBusInfo(route);

  if (!busRoute || !busInfo) {
    res.status(404).json({ message: "Bus route or info not found" });
    return;
  }

  let chieuDi = busRoute.chieuDi;
  let chieuVe = busRoute.chieuVe;
  let tDi = 0;
  let tVe = 0;

  for (let j = 0; j < chieuDi.length - 1; j++) {
    const distance = haversineDistance(
      chieuDi[j].lat,
      chieuDi[j].long,
      chieuDi[j + 1].lat,
      chieuDi[j + 1].long
    );

    const deltaT = distance / Vtb;
    tDi += deltaT;
    firstAppearChieuDi.push(tDi);
  }

  for (let j = 0; j < chieuVe.length - 1; j++) {
    const distance = haversineDistance(
      chieuVe[j].lat,
      chieuVe[j].long,
      chieuVe[j + 1].lat,
      chieuVe[j + 1].long
    );
    const deltaT = distance / Vtb;
    tVe += deltaT;
    firstAppearChieuVe.push(tVe);
  }

  const tKD = convertStringTime(tKDString);
  const tKT = convertStringTime(tKTString);

  for (let j = 0; j < chieuDi.length; j++) {
    const tArray: { hour: number; minute: number }[] = [];
    const tTemp = convertDoubleTime(firstAppearChieuDi[j]);
    tTemp.hour += tKD.hour;
    tTemp.minute += tKD.minute;

    while (
      tTemp.hour < tKT.hour ||
      (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)
    ) {
      tArray.push({ hour: tTemp.hour, minute: tTemp.minute });
      tTemp.minute += gianCachTrungBinh;
      if (tTemp.minute >= 60) {
        tTemp.hour++;
        tTemp.minute -= 60;
      }
    }

    const stationTime = await BusAppearance.getStationTime(chieuDi[j].name);
    if (!stationTime) {
      const appearances: {
        route: string;
        tArray: { hour: number; minute: number }[];
      }[] = [{ route: route, tArray }];

      const busAppearance = new BusAppearance(chieuDi[j].name, appearances);
      await busAppearance.createStationTime(chieuDi[j].name);
    } else {
      const appearances = stationTime.appearances;
      let routeExists = false;

      for (let k = 0; k < appearances.length; k++) {
        if (appearances[k].route === route) {
          routeExists = true;
          break;
        }
      }

      if (!routeExists) {
        appearances.push({ route: route, tArray });
        const busAppearance = new BusAppearance(chieuDi[j].name, appearances);
        await busAppearance.updateStationTime(chieuDi[j].name, appearances);
      }
    }
  }

  for (let j = 0; j < chieuVe.length; j++) {
    const tArray: { hour: number; minute: number }[] = [];
    const tTemp = convertDoubleTime(firstAppearChieuVe[j]);
    tTemp.hour += tKD.hour;
    tTemp.minute += tKD.minute;

    while (
      tTemp.hour < tKT.hour ||
      (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)
    ) {
      tArray.push({ hour: tTemp.hour, minute: tTemp.minute });
      tTemp.minute += gianCachTrungBinh;
      if (tTemp.minute >= 60) {
        tTemp.hour++;
        tTemp.minute -= 60;
      }
    }

    const stationTime = await BusAppearance.getStationTime(chieuVe[j].name);
    if (!stationTime) {
      const appearances: {
        route: string;
        tArray: { hour: number; minute: number }[];
      }[] = [{ route: route, tArray }];

      const busAppearance = new BusAppearance(chieuVe[j].name, appearances);
      await busAppearance.createStationTime(chieuVe[j].name);
    } else {
      const appearances = stationTime.appearances;
      let routeExists = false;

      for (let k = 0; k < appearances.length; k++) {
        if (appearances[k].route === route) {
          routeExists = true;
          break;
        }
      }

      if (!routeExists) {
        appearances.push({ route: route, tArray });
        const busAppearance = new BusAppearance(chieuVe[j].name, appearances);
        await busAppearance.updateStationTime(chieuVe[j].name, appearances);
      }
    }
  }

  console.log("success");
  res.status(200).json({ message: "success" });
}
function splitActivityTime(activityTime: string) {
  // Tách chuỗi bằng ký tự '->'
  const [tKDString, tKTString] = activityTime
    .split(" -> ")
    .map((str) => str.trim());

  return { tKDString, tKTString };
}

// Lấy giờ và phút hiện tại ở Việt Nam
export function getCurrentHourAndMinuteInVietnam(): {
  hour: number;
  minute: number;
} {
  const currentTime = moment().tz("Asia/Ho_Chi_Minh");
  const hour = currentTime.hour();
  const minute = currentTime.minute();
  return { hour, minute };
}

// Define the path to your JSON file
const filePath = path.join(
  "/Users/macbookpro/Desktop/Workspace",
  "busappearance.json"
);

// Define the structure of your JSON data
interface BusAppearanceData {
  stationName: string;
  appearances: {
    route: string;
    tArray: { hour: number; minute: number }[];
  }[];
}

// Function to check if the file exists and initialize it if necessary
async function ensureFileExists() {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.writeFile(filePath, "[]", "utf8", (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  });
}

// Function to read data from the JSON file
async function readJsonFile(): Promise<BusAppearanceData[]> {
  await ensureFileExists();
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(JSON.parse(data) as BusAppearanceData[]);
        } catch (parseError) {
          // If parsing fails, resolve with an empty array and reset the file
          fs.writeFile(filePath, "[]", "utf8", (writeErr) => {
            if (writeErr) {
              reject(writeErr);
            } else {
              resolve([]);
            }
          });
        }
      }
    });
  });
}

// Function to write data to the JSON file
async function writeJsonFile(data: BusAppearanceData[]) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

// Function to round minutes
function roundMinutes(time: { hour: number; minute: number }) {
  time.minute = Math.round(time.minute);
  if (time.minute >= 60) {
    time.hour++;
    time.minute -= 60;
  }
  return time;
}

async function calculateOneRouteTime(busRoute: BusRoute, busInfo: BusInfo) {
  const Vtb = 25;
  const route = busInfo.bus;
  const gianCachTrungBinh = busInfo.gianCachTrungBinh;
  const { tKDString, tKTString } = splitActivityTime(busInfo.activityTime);

  if (!tKDString || !tKTString) {
    throw new Error("Activity time is not properly defined");
  }

  const firstAppearChieuDi: number[] = [];
  const firstAppearChieuVe: number[] = [];
  firstAppearChieuDi.push(0);
  firstAppearChieuVe.push(0);
  let chieuDi = busRoute.chieuDi;
  let chieuVe = busRoute.chieuVe;
  let tDi = 0;
  let tVe = 0;

  for (let j = 0; j < chieuDi.length - 1; j++) {
    const distance = haversineDistance(
      chieuDi[j].lat,
      chieuDi[j].long,
      chieuDi[j + 1].lat,
      chieuDi[j + 1].long
    );

    const deltaT = distance / Vtb;
    tDi += deltaT;
    firstAppearChieuDi.push(tDi);
  }

  for (let j = 0; j < chieuVe.length - 1; j++) {
    const distance = haversineDistance(
      chieuVe[j].lat,
      chieuVe[j].long,
      chieuVe[j + 1].lat,
      chieuVe[j + 1].long
    );
    const deltaT = distance / Vtb;
    tVe += deltaT;
    firstAppearChieuVe.push(tVe);
  }

  let tKD, tKT;
  try {
    tKD = convertStringTime(tKDString);
    tKT = convertStringTime(tKTString);
  } catch (error) {
    console.error("Error converting time strings:", { tKDString, tKTString });
    throw error;
  }

  const jsonData = await readJsonFile();
  for (let j = 0; j < chieuDi.length; j++) {
    const tArray: { hour: number; minute: number }[] = [];
    const tTemp = convertDoubleTime(firstAppearChieuDi[j]);
    tTemp.hour += tKD.hour;
    tTemp.minute += tKD.minute;

    while (
      tTemp.hour < tKT.hour ||
      (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)
    ) {
      tArray.push(roundMinutes({ hour: tTemp.hour, minute: tTemp.minute }));
      tTemp.minute += gianCachTrungBinh;
      if (tTemp.minute >= 60) {
        tTemp.hour++;
        tTemp.minute -= 60;
      }
    }

    const station = jsonData.find(
      (station: BusAppearanceData) => station.stationName === chieuDi[j].name
    );
    if (!station) {
      jsonData.push({
        stationName: chieuDi[j].name,
        appearances: [{ route: route, tArray }],
      });
    } else {
      const appearances = station.appearances;
      const routeExists = appearances.some(
        (appearance) => appearance.route === route
      );
      if (!routeExists) {
        appearances.push({ route: route, tArray });
      }
    }
  }

  for (let j = 0; j < chieuVe.length; j++) {
    const tArray: { hour: number; minute: number }[] = [];
    const tTemp = convertDoubleTime(firstAppearChieuVe[j]);
    tTemp.hour += tKD.hour;
    tTemp.minute += tKD.minute;

    while (
      tTemp.hour < tKT.hour ||
      (tTemp.hour === tKT.hour && tTemp.minute < tKT.minute)
    ) {
      tArray.push(roundMinutes({ hour: tTemp.hour, minute: tTemp.minute }));
      tTemp.minute += gianCachTrungBinh;
      if (tTemp.minute >= 60) {
        tTemp.hour++;
        tTemp.minute -= 60;
      }
    }

    const station = jsonData.find(
      (station: BusAppearanceData) => station.stationName === chieuVe[j].name
    );
    if (!station) {
      jsonData.push({
        stationName: chieuVe[j].name,
        appearances: [{ route: route, tArray }],
      });
    } else {
      const appearances = station.appearances;
      const routeExists = appearances.some(
        (appearance) => appearance.route === route
      );
      if (!routeExists) {
        appearances.push({ route: route, tArray });
      }
    }
  }

  await writeJsonFile(jsonData);
  console.log("tuyen ", route, " is success");
}

export async function calculateRoutesTime(req: Request, res: Response) {
  const busRoutes = await BusRoute.getAllBusRoutes();
  const busInfos = await BusInfo.getAllBusInfos();
  for (let i = 0; i < busInfos.length; i++) {
    try {
      await calculateOneRouteTime(busRoutes[i], busInfos[i]);
    } catch (error) {
      console.error("Error processing route ", busInfos[i].bus, ": ", error);
      console.log("tuyen ", busInfos[i].bus, " is failed");
    }
  }
  res.status(200).json({ message: "success" });
}

export async function getApprearanceTime(req: Request, res: Response) {
  try {
    const appTime = await BusAppearance.getAllStationTimes();
    res.status(200).json({ appTime: appTime });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
}

export async function getOneTime(req: Request, res: Response) {
  try {
    const appearance = await BusAppearance.getStationTime(req.body.stationName);
    res.status(200).json({ appearance: appearance });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
}

export async function findStartTime(
  startPlaceLat: number,
  startPlaceLong: number,
  userInputHour: number,
  userInputMinute: number,
  route: string,
  stationName: string
) {
  let startHour = -1;
  let startMinute = -1;
  try {
    let tArray = await BusAppearance.getTArrayForStationAndRoute(
      stationName,
      route
    );
    // xác định thời gian người dùng di chuyển được từ vị trí người dùng ra trạm
    const stationInfo = await BusStation.getBusStationByName(stationName);
    const dis = haversineDistance(
      startPlaceLat,
      startPlaceLong,
      stationInfo.lat,
      stationInfo.long
    );
    const walkingTime = dis / 5;
    const roundedWalkingTime = Math.ceil(walkingTime);
    //console.log("roundedWalkingTime: ", roundedWalkingTime);
    userInputMinute = userInputMinute + roundedWalkingTime;
    while (userInputMinute >= 60) {
      userInputMinute = userInputMinute - 60;
      userInputHour = userInputHour + 1;
      if (userInputHour == 24) userInputHour = 0;
    }
    tArray = tArray.filter((time: { hour: number; minute: number }) => {
      if (time.hour > userInputHour) {
        return true;
      } else if (time.hour === userInputHour) {
        return time.minute >= userInputMinute;
      }
      return false;
    });
    if (tArray.length > 0) {
      startHour = tArray[0].hour;
      startMinute = tArray[0].minute;
    }
    // console.log(userInputHour, " ", userInputMinute);
    //console.log(tArray)
  } catch (error) {}
  return { startHour, startMinute };
}
