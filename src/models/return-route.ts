export interface ReturnRoute {
  source: string;
  destination: string;
  destinationLat: number;
  destinationLong: number;
  buses: string[];
  transportTime: number;
  transportS: number;
  pathType: "bus" | "walk";
}
export default ReturnRoute;
