class MyPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export default MyPoint;

export interface StationPoint {
  name: string;
  //district: string;
  lat: number;
  long: number;
}
