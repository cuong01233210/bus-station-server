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
  const firstAppearChieuDi = [];
  const firstAppearChieuVe = [];
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
// hàm tìm kiếm thời điểm có xe sắp tới
// ý tưởng:
// bước 1: dùng tên trạm cần tuyến gần nhất để search
// bước 2: sau khi search được dữ liệu cần thiết trong db rồi thì tiếp tục sử dụng mảng tuyến xe buýt mình mong đợi duyệt qua
// chú ý: ở bước 2 để đỡ cực thì mình setup ngầm tối đa 3 tuyến lúc search thôi
// bước 3: ứng với mỗi tuyến thu được ở bước 2, chọc vào phần dữ liệu mảng thời gian tuyến đó xuất hiện
// sau đó so sánh với thời gian thực, nếu nó gần nhất với thời gian thực trong tlai thì chọn thôi
// bước 4: lúc trả về thì so sánh 3 phần tử thời gian đó, cái nào nhỏ nhất thì lấy và báo cho người dùng
// bước 5: có thể lấy thời gian tìm được ở bước 4 + giãn cách trung bình của tuyến đó để báo cho người dùng (thế là phải rebuild db ngại thật @@)

export async function searchStationRouteTimeMode1(
  stationName: string,
  routes: string[],
  userLat: number,
  userLong: number,
  stationLat: number,
  stationLong: number
): Promise<{ [key: string]: { hour: number; minute: number }[] }> {
  const stationTime = await BusAppearance.getStationTime(stationName);
  let { hour, minute } = getCurrentHourAndMinuteInVietnam();

  // xác định thời gian người dùng di chuyển được từ vị trí người dùng ra trạm
  const dis = haversineDistance(userLat, userLong, stationLat, stationLong);
  const walkingTime = dis / 5;
  const roundedWalkingTime = Math.ceil(walkingTime);
  //console.log("roundedWalkingTime: ", roundedWalkingTime);
  minute = minute + roundedWalkingTime;
  if (minute > 60) {
    minute = minute - 60;
    hour = hour + 1;
    if (hour == 24) hour = 0;
  }

  // từ đó thời gian gợi ý xe tối thiểu là thời gian hiện tại + thời gian ng dùng ra trạm
  const routeTime: { [route: string]: { hour: number; minute: number }[] } = {};

  const appearances = stationTime.appearances;
  for (let i = 0; i < appearances.length; i++) {
    for (let j = 0; j < routes.length; j++) {
      if (appearances[i].route == routes[j]) {
        const tArray = appearances[i].tArray;
        const route = routes[j];
        for (let k = 0; k < tArray.length; k++) {
          const timeDiff =
            (tArray[k].hour - hour) * 60 + (tArray[k].minute - minute);
          if (timeDiff > 0) {
            const times = [];
            times.push({ hour: tArray[k].hour, minute: tArray[k].minute });
            if (k + 1 < tArray.length)
              times.push({
                hour: tArray[k + 1].hour,
                minute: tArray[k + 1].minute,
              });
            if (k + 2 < tArray.length)
              times.push({
                hour: tArray[k + 2].hour,
                minute: tArray[k + 2].minute,
              });
            routeTime[route] = times;
            break;
          }
        }
      }
    }
  }

  return routeTime;
}

// Define the path to your JSON file
const filePath = path.join(
  "/Users/macbookpro/Desktop/Workspace",
  "busappearance.json"
);

// Define the structure of your JSON data
interface BusAppearanceData {
  name: string;
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
      (station: BusAppearanceData) => station.name === chieuDi[j].name
    );
    if (!station) {
      jsonData.push({
        name: chieuDi[j].name,
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
      (station: BusAppearanceData) => station.name === chieuVe[j].name
    );
    if (!station) {
      jsonData.push({
        name: chieuVe[j].name,
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
