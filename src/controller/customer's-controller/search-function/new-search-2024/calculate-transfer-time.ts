import { InputIn4 } from "./../../../../models/input-in4";
import { ResultRoute } from "./dijstra";
import { haversineDistance } from "./test-geocoding-controller";
export interface TransferTime {
  sum: number; // tổng thời gian di chuyển
  eachStep: number[]; //time di chuyển giữa 2 địa điểm trong lộ trình
}
// xp -> tram 1 -> tram 2 -> dich
function calculateTransferTime(resultRoutes: ResultRoute, inputIn4: InputIn4) {
  let transferTime: TransferTime = {
    sum: 0,
    eachStep: [],
  };
  // tính thời gian từ vị trí người dùng -> trạm xp
  // let distance = haversineDistance(inputIn4.startIn4.lat, inputIn4.startIn4.long, resultRoutes.returnRoutes[0].source)
}
