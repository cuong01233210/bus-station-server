import BestPair from "../../../../models/best-pair";
import { MyNode, MyNode2 } from "../../../../models/my-node";
import MyPoint from "../../../../models/my-point";
import { StationPoint } from "../../../../models/my-point";
import fs from "fs";
class KDTree {
  root: MyNode2 | null;
  data: StationPoint[];

  constructor(root: MyNode2 | null = null, data: StationPoint[]) {
    this.root = root;
    this.data = data;
  }

  private _build(points: StationPoint[], d: number): MyNode2 | null {
    if (points.length === 0) {
      return null;
    }

    const k = points.length;
    const axis = d % k;
    const sortedPoints = points.sort((p1, p2) => {
      if (axis === 0) {
        return p1.lat - p2.lat;
      } else {
        return p1.long - p2.long;
      }
    });
    const mid = Math.floor(points.length / 2);
    const node = new MyNode2(sortedPoints[mid], null, null, d);
    const left = sortedPoints.slice(0, mid);
    const right = sortedPoints.slice(mid + 1);
    node.left = this._build(left, d + 1);
    node.right = this._build(right, d + 1);
    return node;
  }

  build() {
    this.root = this._build(this.data, 0);
  }

  private printNLR(node: MyNode2 | null, d: number) {
    if (!node) return;
    console.log(node.point.lat, node.point.long);
    this.printNLR(node.left, d + 1);
    this.printNLR(node.right, d + 1);
  }

  printTree() {
    this.printNLR(this.root, 0);
  }

  private euclideanDistance(a: StationPoint, b: StationPoint): number {
    let dist: number = 0;
    dist += Math.pow(a.lat - b.lat, 2);
    dist += Math.pow(a.long - b.long, 2);
    return Math.sqrt(dist);
  }

  private findNearestPoints2(
    queryPoint: StationPoint,
    node: MyNode2 | null,
    bestPairs: BestPair[],
    n: number
  ): BestPair[] {
    if (!node) return bestPairs;

    let dist: number = this.euclideanDistance(node.point, queryPoint);
    let insertionIndex: number = bestPairs.length;

    for (let i = 0; i < bestPairs.length; i++) {
      if (dist < bestPairs[i].dist) {
        insertionIndex = i;
        break;
      }
    }

    bestPairs.splice(insertionIndex, 0, { point: node.point, dist: dist });
    if (bestPairs.length > n) {
      bestPairs.pop();
    }

    const axis: number = node.depth % 2;
    let queryTemp: number = axis === 0 ? queryPoint.lat : queryPoint.long;
    let nodeTemp: number = axis === 0 ? node.point.lat : node.point.long;

    let goodSide: MyNode2 | null;
    let badSide: MyNode2 | null;

    if (queryTemp < nodeTemp) {
      goodSide = node.left;
      badSide = node.right;
    } else {
      badSide = node.left;
      goodSide = node.right;
    }

    bestPairs = this.findNearestPoints2(queryPoint, goodSide, bestPairs, n);
    if (Math.abs(nodeTemp - queryTemp) < bestPairs[bestPairs.length - 1].dist) {
      bestPairs = this.findNearestPoints2(queryPoint, badSide, bestPairs, n);
    }

    return bestPairs;
  }

  nearestNodes(queryPoint: StationPoint, n: number): BestPair[] {
    const bestPairs: BestPair[] = [];
    this.findNearestPoints2(queryPoint, this.root, bestPairs, n);
    return bestPairs;
  }

  private findNearestPoint(
    queryPoint: StationPoint,
    node: MyNode2 | null,
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
      queryTemp = queryPoint.lat;
      nodeTemp = node.point.lat;
    } else {
      queryTemp = queryPoint.long;
      nodeTemp = node.point.long;
    }

    let goodSide: MyNode2 | null;
    let badSide: MyNode2 | null;

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

  nearestDis(queryPoint: StationPoint): BestPair {
    const bestTemp: BestPair = { point: null, dist: Infinity };
    const bestPair: BestPair = this.findNearestPoint(
      queryPoint,
      this.root,
      bestTemp
    );
    return bestPair;
  }

  private findNodesInRadius(
    queryPoint: StationPoint,
    radius: number,
    node: MyNode2 | null,
    foundPoints: BestPair[]
  ): void {
    if (!node) return;

    let dist: number = this.euclideanDistance(node.point, queryPoint);
    if (dist <= radius * 1000) {
      // Chuyển km sang mét
      foundPoints.push({ point: node.point, dist });
    }

    const axis: number = node.depth % 2;
    let nodeTemp: number = axis === 0 ? node.point.lat : node.point.long;
    let queryTemp: number = axis === 0 ? queryPoint.lat : queryPoint.long;

    let primarySide = queryTemp < nodeTemp ? node.left : node.right;
    let secondarySide = queryTemp < nodeTemp ? node.right : node.left;

    this.findNodesInRadius(queryPoint, radius, primarySide, foundPoints);
    if (Math.abs(nodeTemp - queryTemp) <= radius * 1000) {
      this.findNodesInRadius(queryPoint, radius, secondarySide, foundPoints);
    }
  }

  public findNodesWithinRadius(
    queryPoint: StationPoint,
    radius: number
  ): BestPair[] {
    const foundPoints: BestPair[] = [];
    this.findNodesInRadius(queryPoint, radius, this.root, foundPoints);
    return foundPoints.sort((a, b) => a.dist - b.dist);
  }

  private serializeNode(node: MyNode2 | null): any {
    if (!node) return null;
    return {
      point: node.point,
      depth: node.depth,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right),
    };
  }

  saveToFile(filePath: string) {
    if (!this.root) return;
    const jsonTree = JSON.stringify(this.serializeNode(this.root));
    fs.writeFileSync(filePath, jsonTree);
  }

  private deserializeNode(data: any): MyNode2 | null {
    if (!data) return null;
    const node = new MyNode2(data.point, null, null, data.depth);
    node.left = this.deserializeNode(data.left);
    node.right = this.deserializeNode(data.right);
    return node;
  }

  loadFromFile(filePath: string) {
    const jsonTree = fs.readFileSync(filePath, "utf-8");
    const treeData = JSON.parse(jsonTree);
    this.root = this.deserializeNode(treeData);
  }
}

export default KDTree;
