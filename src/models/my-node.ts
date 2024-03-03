import MyPoint from "./my-point";
import { StationPoint } from "./my-point";
export class MyNode {
  point: MyPoint;
  left: MyNode | null;
  right: MyNode | null;
  depth: number;

  constructor(
    point: MyPoint,
    left: MyNode | null = null,
    right: MyNode | null = null,
    depth: number
  ) {
    this.point = point;
    this.left = left;
    this.right = right;
    this.depth = depth;
  }
}

export class MyNode2 {
  point: StationPoint;
  left: MyNode2 | null;
  right: MyNode2 | null;
  depth: number;

  constructor(
    point: StationPoint,
    left: MyNode2 | null = null,
    right: MyNode2 | null = null,
    depth: number
  ) {
    this.point = point;
    this.left = left;
    this.right = right;
    this.depth = depth;
  }
}
