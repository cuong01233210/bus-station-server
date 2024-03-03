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

export interface InputIn4 {
  startIn4: StartIn4;
  endIn4: EndIn4;
}

export interface InputRawIn4 {
  startString: string;
  endString: string;
}
