import { Router } from "express";
import { Request, Response } from "express";
import Bus from "../../../../models/bus";
import { getDistance } from "./LocationIQ";
import { haversineDistance } from "./test-geocoding-controller";
import BusAppearance from "../../../../models/bus-appearance-time";
import moment from "moment-timezone";
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
  const route: string = req.body.route; // tuyến được chọn để tính time
  const Vtb: number = req.body.Vtb; // vận tốc trung bình của tuyến
  const gianCachTrungBinh = req.body.gianCachTrungBinh; //thời gian xuất hiện tuyến tb (minute)
  const tKDString: string = req.body.tKDString; // thời gian tuyến bắt đầu hoạt động trong ngày
  const tKTString: string = req.body.tKTString; // thời gian tuyến dừng hoạt động không nhận thêm khách nữa
  const firstAppearChieuDi = []; // mảng dùng lưu mốc lần đầu xuất hiện của tuyến trong chiều đi
  const firstAppearChieuVe = [];
  firstAppearChieuDi.push(0);
  firstAppearChieuVe.push(0);

  const buses = await Bus.getBusIn4();
  let bus: Bus | undefined = undefined;
  for (let i = 0; i < buses.length; i++) {
    if (buses[i].bus == route) {
      bus = buses[i];
      break;
    }
  }
  if (bus == undefined) return;

  let chieuDi = bus.chieuDi;
  let chieuVe = bus.chieuVe;
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
    tDi = tDi + deltaT;
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
    tVe = tVe + deltaT;
    firstAppearChieuVe.push(tVe);
  }

  const tKD = convertStringTime(tKDString);
  const tKT = convertStringTime(tKTString);

  for (let j = 0; j < chieuDi.length; j++) {
    const tArray: { hour: number; minute: number }[] = []; // mảng lưu trữ các thời điểm tuyến đang xét xuất hiện tại trạm j
    const tTemp = convertDoubleTime(firstAppearChieuDi[j]);
    tTemp.hour = tTemp.hour + tKD.hour;
    tTemp.minute = tTemp.minute + tKD.minute;
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
    if (stationTime == null || stationTime == undefined) {
      // nếu chưa có tí dữ liệu nào về trạm đang xét thì cần khởi tạo
      const appearances: {
        route: string;
        tArray: {
          hour: number;
          minute: number;
        }[];
      }[] = [];

      appearances.push({ route: route, tArray: tArray });

      const busAppearance: BusAppearance = new BusAppearance(
        chieuDi[j].name,
        appearances
      );
      busAppearance.createStationTime(chieuDi[j].name);
    } else {
      // cần check xem có db tuyến đó chưa, nếu chưa có ms add thêm
      const appearances = stationTime.appearances;
      let status = 0; // chưa trùng db
      for (let k = 0; k < appearances.length; k++) {
        if (appearances[k].route == route) {
          status = 1;
          break;
        }
      }
      if (status == 0) {
        appearances.push({ route: route, tArray: tArray });
        const busAppearance: BusAppearance = new BusAppearance(
          chieuDi[j].name,
          appearances
        );
        busAppearance.updateStationTime(chieuDi[j].name, appearances);
      }
    }
  }

  for (let j = 0; j < chieuVe.length; j++) {
    const tArray: { hour: number; minute: number }[] = []; // mảng lưu trữ các thời điểm tuyến đang xét xuất hiện tại trạm j
    const tTemp = convertDoubleTime(firstAppearChieuVe[j]);
    tTemp.hour = tTemp.hour + tKD.hour;
    tTemp.minute = tTemp.minute + tKD.minute;
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
    if (stationTime == null || stationTime == undefined) {
      // nếu chưa có tí dữ liệu nào về trạm đang xét thì cần khởi tạo
      const appearances: {
        route: string;
        tArray: {
          hour: number;
          minute: number;
        }[];
      }[] = [];

      appearances.push({ route: route, tArray: tArray });

      const busAppearance: BusAppearance = new BusAppearance(
        chieuVe[j].name,
        appearances
      );
      busAppearance.createStationTime(chieuVe[j].name);
    } else {
      const appearances = stationTime.appearances;
      let status = 0; // chưa trùng db
      for (let k = 0; k < appearances.length; k++) {
        if (appearances[k].route == route) {
          status = 1;
          break;
        }
      }
      if (status == 0) {
        appearances.push({ route: route, tArray: tArray });
        const busAppearance: BusAppearance = new BusAppearance(
          chieuVe[j].name,
          appearances
        );
        busAppearance.updateStationTime(chieuVe[j].name, appearances);
      }
    }
  }
  console.log("success");

  res.status(200).json({ message: "success" });
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
export async function searchStationRouteTime(
  stationName: string,
  routes: string[]
): Promise<{ route: string; hour: number; minute: number }[]> {
  const stationTime = await BusAppearance.getStationTime(stationName);
  const { hour, minute } = getCurrentHourAndMinuteInVietnam();
  // console.log("Giờ và phút hiện tại ở Việt Nam:", hour, "giờ", minute, "phút");
  let responseLimit = 0; // nếu responseLimit == 3 thì dừng tìm tiếp, mình chỉ tìm tối đa 3 tuyến sắp có xe thôi cho đỡ cực
  const appearTime: { route: string; hour: number; minute: number }[] = [];
  const minRouteTime: { route: string; hour: number; minute: number } = {
    route: "",
    hour: 100,
    minute: 100,
  };
  const route = "";
  //console.log(stationTime);
  const appearances = stationTime.appearances;
  for (let i = 0; i < appearances.length; i++) {
    if (responseLimit == 3) break;
    for (let j = 0; j < routes.length; j++) {
      if (responseLimit == 3) break;
      if (appearances[i].route == routes[j]) {
        // console.log(routes[j]);
        // tìm thời điểm gần nhất với hiện tại
        const tArray = appearances[i].tArray;
        for (let k = 0; k < tArray.length; k++) {
          const timeDiff =
            (tArray[k].hour - hour) * 60 + (tArray[k].minute - minute);
          if (timeDiff > 0) {
            //console.log("thời điểm cần tìm là: ", tArray[k]);
            if (tArray[k].hour < minRouteTime.hour) {
              minRouteTime.hour = tArray[k].hour;
              minRouteTime.minute = tArray[k].minute;
              minRouteTime.route = routes[j];
            } else {
              if (
                tArray[k].minute < minRouteTime.minute &&
                tArray[k].hour == minRouteTime.hour
              ) {
                minRouteTime.hour = tArray[k].hour;
                minRouteTime.minute = tArray[k].minute;
                minRouteTime.route = routes[j];
              }
            }

            responseLimit = responseLimit + 1;
            break;
          }
        }
      }
    }
  }
  console.log("route: ", minRouteTime.route);
  const bus = await Bus.getOnlyOneBus(minRouteTime.route);
  // console.log(bus);
  //console.log("gian cach trung binh: ", bus.gianCachTrungBinh);
  appearTime.push({
    route: minRouteTime.route,
    hour: minRouteTime.hour,
    minute: minRouteTime.minute,
  });
  //return appearTime;
  minRouteTime.minute = minRouteTime.minute + bus.gianCachTrungBinh;
  //console.log("minRouteTime trc update: ", minRouteTime);
  if (minRouteTime.minute >= 60) {
    minRouteTime.minute -= 60;
    minRouteTime.hour += 1;
  }
  //console.log("minRouteTime sau update: ", minRouteTime);
  appearTime.push({
    route: minRouteTime.route,
    hour: minRouteTime.hour,
    minute: minRouteTime.minute,
  });

  minRouteTime.minute = minRouteTime.minute + bus.gianCachTrungBinh;
  if (minRouteTime.minute >= 60) {
    minRouteTime.minute -= 60;
    minRouteTime.hour += 1;
  }

  appearTime.push({
    route: minRouteTime.route,
    hour: minRouteTime.hour,
    minute: minRouteTime.minute,
  });

  return appearTime;
}
