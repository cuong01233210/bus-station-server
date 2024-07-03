export interface ReturnRoute {
  source: string;
  destination: string;
  buses: string[];
  transportTime: number;
  transportS: number;
  pathType: "bus" | "walk";
}
export default ReturnRoute;
