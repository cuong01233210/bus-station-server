import { updateUserCoordinate } from "../controller/customer's-controller/user-coordinate-controller";
import { Double } from "mongodb";
import { Router } from "express";
import * as busController from "../controller/customer's-controller/bus-controller";
import * as busStationController from "../controller/customer's-controller/bus-station-controller";
import { body } from "express-validator";
import UserCoordinate from "../models/user-coordinate";
import * as userCoordinateController from "../controller/customer's-controller/user-coordinate-controller";
import * as kdTreeController from "../controller/customer's-controller/kdTree-controller";
import * as userStartStringController from "../controller/customer's-controller/user-start-string-controller";
import * as userEndStringController from "../controller/customer's-controller/user-end-string-controller";

import * as commentController from "../controller/customer's-controller/comment-controller";
import authValidator from "../middleware/auth-validation";

import * as TodoController from "../controller/customer's-controller/test-todo-controller";
import changePasswordController from "../controller/customer's-controller/change-password";

import { testLocationIQ } from "../controller/customer's-controller/LocationIQ";
import {
  getUserInfor,
  updateUserInfor,
} from "../controller/customer's-controller/user-infor-controller";
import { readComments } from "../controller/staff's-controller/check-comment";
import * as preferController from "../controller/customer's-controller/user-preference-controller";
const router = Router();

router.get("/buses-data", busController.getAllBuses);
router.get("/bus-stations-data", busStationController.getAllBusStations);

router.get("/user-coordinate", userCoordinateController.getUserCoordinate);
router.patch(
  "/user-coordinate/:user-coorID",
  userCoordinateController.updateUserCoordinate
);

router.get("/testKDTree", kdTreeController.testKDtree);

router.get("/user-start-string", userStartStringController.getUserStartString);
router.patch(
  "/user-start-string/:userStartStringID",
  userStartStringController.updateUserStartString
);

router.get("/user-start-string", userStartStringController.getUserStartString);
// router.patch(
//   "/user-start-string/:userStartStringID",
//   userStartStringController.updateUserStartString
// );

router.get("/user-end-string", userEndStringController.getUserEndString);
// router.patch(
//   "/user-end-string/:userEndStringID",
//   userEndStringController.updateUserEndString
// );

//router.patch("/user-input-string", userInputStringController.updateUserString);

//router.get("/test-geocoding", testGeocodingController.callGetUsersRoute);
router.patch("/user-input-string", kdTreeController.findRouteAndStation);
router.patch("/user-input-string2", kdTreeController.findByChangeRoute);

router.patch("/find-bus-station-v1", kdTreeController.findBusStationsV1);

router.post("/add-comment", authValidator, commentController.addComment);
//router.patch("/");

const todoValidator = body("task").trim().notEmpty();
router.get("/todo", TodoController.getAllTodos);
router.post("/todo", todoValidator, TodoController.addTodo);
router.patch("/todo", todoValidator, TodoController.updateTodo);
router.delete("/todo", TodoController.deleteTodo);

router.patch(
  "/change-password",
  [
    body("newPassword")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Bạn nhập mật khẩu quá ngắn"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Xin hãy nhập đúng định dạng email")
      .normalizeEmail(),
  ],
  changePasswordController
);

router.get("/test-location-iq", testLocationIQ);

router.get("/getInfor", authValidator, getUserInfor);
router.patch("/update-user-infor", authValidator, updateUserInfor);

router.get("/get-all-comments", readComments);
router.get("/get-all-bus-in4", busController.getAllBusNames);
router.get("/get-one-bus-data/:bus", busController.getOneBusRoute);

// router thích các trạm xe bus
router.post("/add-bus-prefer", authValidator, preferController.addBusPrefer);
router.delete(
  "/delete-bus-prefer",
  authValidator,
  preferController.deleteBusPreference
);
router.get(
  "/get-all-bus-prefer",
  authValidator,
  preferController.getAllBusPreference
);
//router lấy trạm xe buýt thích dựa vào xâu truyền vào là mảng tên trạm thích đã tìm được ở trên
router.post(
  "/get-bus-prefer-by-array",
  busController.getAllBusesByBusNameArray
);
export default router;
