import MyPoint from "./my-point";
class MyNode {
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
export default MyNode;
