import ReturnRoute from "./return-route";
export interface ResultRoute {
  startStation: string; // trạm xuất phát và đích
  endStation: string;
  buses: string[]; // các xe buýt cần dùng ;
  cost: number; // giá tiền
  transportHour: number; // thời gian cần để di chuyển
  transportMinute: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  stations: string[]; //
  returnRoutes: ReturnRoute[]; //
}
export default ResultRoute;
