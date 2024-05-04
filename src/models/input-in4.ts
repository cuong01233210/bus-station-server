import { StationPoint } from "./my-point";

export interface StartIn4 {
  name: string;
  district: string;
  lat: number;
  long: number;
}

export interface EndIn4 {
  name: string;
  district: string;
  lat: number;
  long: number;
}
export interface InputPlace {
  name: string;
  category: string;
  lat: number;
  long: number;
}
export interface InputIn4 {
  startIn4: StationPoint;
  endIn4: StationPoint;
}

export interface InputRawIn4 {
  startString: string;
  endString: string;
}
