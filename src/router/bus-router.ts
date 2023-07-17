import { updateUserCoordinate } from "./../controller/user-coordinate-controller";
import { Double } from "mongodb";
import { Router } from "express";
import * as busController from "../controller/bus-controller";
import * as busStationController from "../controller/bus-station-controller";
import { body } from "express-validator";
import UserCoordinate from "../models/user-coordinate";
import * as userCoordinateController from "../controller/user-coordinate-controller";
import * as kdTreeController from "../controller/kdTree-controller";
const router = Router();
const todoValidator = body("task").trim().notEmpty();
router.get("/buses-data", busController.getAllBuses);
router.get("/bus-stations-data", busStationController.getAllBusStations);

router.patch(
  "/user-coordinate/:userCoordinateId",
  todoValidator,
  userCoordinateController.updateUserCoordinate
);
router.post("/user-coordinate", todoValidator);
router.get("/user-coordinate", userCoordinateController.getUserCoordinate);
router.patch(
  "/user-coordinate/:user-coorID",
  userCoordinateController.updateUserCoordinate
);

router.get("/testKDTree", kdTreeController.testKDtree);
export default router;
