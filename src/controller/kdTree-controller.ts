import KDTree from "../models/kdTree";
import MyNode from "../models/my-node";
import MyPoint from "../models/my-point";
import BestPair from "../models/best-pair";
import { Request, Response } from "express";
const points: MyPoint[] = [
  new MyPoint(2, 3),
  new MyPoint(5, 4),
  new MyPoint(4, 7),
  new MyPoint(8, 1),
  new MyPoint(7, 2),
];

export function testKDtree(req: Request, res: Response) {
  const tree = new KDTree(null, points);
  tree.build();
  tree.printTree();

  const queryPoint = new MyPoint(6, 6);
  const nearestDistance = tree.nearestDis(queryPoint);
  console.log("Nearest distance:", nearestDistance);

  res.status(200).json({ message: "test sucessfully" });
}
