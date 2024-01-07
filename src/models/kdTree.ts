import BestPair from "./best-pair";
import MyNode from "./my-node";
import MyPoint from "./my-point";

class KDTree {
  root: MyNode | null;
  data: MyPoint[];

  constructor(root: MyNode | null = null, data: MyPoint[]) {
    this.root = root;
    this.data = data;
  }

  private _build(points: MyPoint[], d: number): MyNode | null {
    if (points.length === 0) {
      return null;
    }

    const k = points.length;
    const axis = d % k;
    //console.log("points: ", points);
    //console.log("d: ", d);
    const sortedPoints = points.sort((p1, p2) => {
      if (axis === 0) {
        return p1.x - p2.x;
      } else {
        return p1.y - p2.y;
      }
    });
    const mid = Math.floor(points.length / 2);
    const node = new MyNode(sortedPoints[mid], null, null, d);
    const left = sortedPoints.slice(0, mid);
    const right = sortedPoints.slice(mid + 1);
    node.left = this._build(left, d + 1);
    node.right = this._build(right, d + 1);
    return node;
  }

  build() {
    this.root = this._build(this.data, 0);
  }

  private printNLR(node: MyNode | null, d: number) {
    if (!node) return;
    console.log(node.point.x, node.point.y);
    this.printNLR(node.left, d + 1);
    this.printNLR(node.right, d + 1);
  }

  printTree() {
    this.printNLR(this.root, 0);
  }

  private euclideanDistance(a: MyPoint, b: MyPoint): number {
    let dist: number = 0;
    dist += Math.pow(a.x - b.x, 2);
    dist += Math.pow(a.y - b.y, 2);
    return Math.sqrt(dist);
  }

  private findNearestPoint(
    queryPoint: MyPoint,
    node: MyNode | null,
    bestPair: BestPair
  ): BestPair {
    if (!node) return bestPair;

    let dist: number = this.euclideanDistance(node.point, queryPoint);
    if (dist < bestPair.dist) {
      bestPair.dist = dist;
      bestPair.point = node.point;
    }

    const axis: number = node.depth % 2;
    let queryTemp: number = 0;
    let nodeTemp: number = 0;

    if (axis === 0) {
      queryTemp = queryPoint.x;
      nodeTemp = node.point.x;
    } else {
      queryTemp = queryPoint.y;
      nodeTemp = node.point.y;
    }

    let goodSide: MyNode | null;
    let badSide: MyNode | null;

    if (queryTemp < nodeTemp) {
      goodSide = node.left;
      badSide = node.right;
    } else {
      badSide = node.left;
      goodSide = node.right;
    }

    bestPair = this.findNearestPoint(queryPoint, goodSide, bestPair);
    if (Math.abs(nodeTemp - queryTemp) < bestPair.dist) {
      bestPair = this.findNearestPoint(queryPoint, badSide, bestPair);
    }

    return bestPair;
  }
  nearestDis(queryPoint: MyPoint): BestPair {
    const bestTemp: BestPair = { point: null, dist: Infinity };
    const bestPair: BestPair = this.findNearestPoint(
      queryPoint,
      this.root,
      bestTemp
    );
    return bestPair;
  }
}

export default KDTree;
