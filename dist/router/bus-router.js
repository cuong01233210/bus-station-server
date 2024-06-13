"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const busController = __importStar(require("../controller/customer's-controller/bus-controller"));
const busStationController = __importStar(require("../controller/customer's-controller/bus-station-controller"));
const express_validator_1 = require("express-validator");
// import * as userCoordinateController from "../controller/customer's-controller/search-function/old-search-2023/user-coordinate-controller";
const commentController = __importStar(require("../controller/customer's-controller/comment-controller"));
const auth_validation_1 = __importDefault(require("../middleware/auth-validation"));
const change_password_1 = __importDefault(require("../controller/customer's-controller/change-password"));
const LocationIQ_1 = require("../controller/customer's-controller/search-function/new-search-2024/LocationIQ");
const user_infor_controller_1 = require("../controller/customer's-controller/user-infor-controller");
const check_comment_1 = require("../controller/staff's-controller/check-comment");
const preferController = __importStar(require("../controller/customer's-controller/user-preference-controller"));
const appInfoController = __importStar(require("../controller/staff's-controller/app-info-controller"));
const SearchRouteController = __importStar(require("../controller/customer's-controller/search-function/new-search-2024/search-route"));
const calculateEstimateTime = __importStar(require("../controller/customer's-controller/search-function/new-search-2024/calculate-estimate-time"));
const CreateGraph = __importStar(require("../controller/customer's-controller/search-function/new-search-2024/create-directed-graph"));
const PlaceController = __importStar(require("../controller/customer's-controller/place-controller"));
const CreateKDTree = __importStar(require("../controller/customer's-controller/search-function/new-search-2024/create-kdtree"));
const ConnectionStationController = __importStar(require("../controller/customer's-controller/search-function/new-search-2024/connection-stations"));
const router = (0, express_1.Router)();
router.get("/buses-data", busController.getAllBuses);
router.post("/add-comment", auth_validation_1.default, commentController.addComment);
//router.patch("/");
const todoValidator = (0, express_validator_1.body)("task").trim().notEmpty();
router.patch("/change-password", [
    (0, express_validator_1.body)("newPassword")
        .trim()
        .isLength({ min: 5 })
        .withMessage("Bạn nhập mật khẩu quá ngắn"),
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail()
        .withMessage("Xin hãy nhập đúng định dạng email")
        .normalizeEmail(),
], change_password_1.default);
router.get("/test-location-iq", LocationIQ_1.testLocationIQ);
router.get("/getInfor", auth_validation_1.default, user_infor_controller_1.getUserInfor);
router.patch("/update-user-infor", auth_validation_1.default, user_infor_controller_1.updateUserInfor);
router.get("/get-all-comments", check_comment_1.readComments);
router.get("/get-all-bus-in4", busController.getAllBusNames);
router.get("/get-one-bus-data/:bus", busController.getOneBusRoute);
// router thích các trạm xe bus
router.post("/add-bus-prefer", auth_validation_1.default, preferController.addBusPrefer);
router.delete("/delete-bus-prefer", auth_validation_1.default, preferController.deleteBusPreference);
router.get("/get-all-bus-prefer", auth_validation_1.default, preferController.getAllBusPreference);
//router lấy trạm xe buýt thích dựa vào xâu truyền vào là mảng tên trạm thích đã tìm được ở trên
router.post("/get-bus-prefer-by-array", busController.getAllBusesByBusNameArray);
// router để crud các trạm xe buýt theo db không chơi nhóm quận
router.get("/get-all-bus-stations", busStationController.getAllBusStationsNoDistrict);
router.post("/get-stations-by-ids", busStationController.getStationsByIds);
router.post("/add-bus-station", busStationController.addBusStationNoDistrict);
router.patch("/update-bus-station", busStationController.updateBusStationNoDistrict);
router.delete("/delete-bus-station", busStationController.deleteBusStationNoDistrict);
// router để làm tính năng người dùng yêu thích trạm
router.get("/get-all-stations-prefer", auth_validation_1.default, preferController.getAllStationsPreference);
router.post("/add-station-prefer", auth_validation_1.default, preferController.addStationPrefer);
router.delete("/delete-station-prefer", auth_validation_1.default, preferController.deleteStationPreference);
// router để xử lý crud các tuyến xe buýt
router.post("/add-bus", busController.createBus);
router.patch("/update-bus", busController.updateBus);
router.delete("/delete-bus", busController.deleteBus);
// router để cru thông tin về app
router.get("/get-app-info", appInfoController.readAppInfo);
router.post("/add-app-info", appInfoController.createAppInfo);
router.patch("/update-app-info", appInfoController.updateAppInfo);
//router để tìm kiếm tuyến đường trường hợp đi liền không nhảy tuyến 2024
router.post("/search-route", SearchRouteController.findRoute);
// router để tìm kiếm thời gian xuất hiện tuyến xe buýt tại trạm
router.post("/find-bus-appearance-time", calculateEstimateTime.calculateTime);
router.post("/find-buses-appearance-time", calculateEstimateTime.calculateRoutesTime);
router.get("/get-all-appearance", calculateEstimateTime.getApprearanceTime);
router.get("/get-one-appearance", calculateEstimateTime.getOneTime);
// router để lấy chạy sao lưu đồ thị đường đi
router.post("/save-graph-into-file", CreateGraph.writeGraphToFile);
// router để lấy các địa điểm gợi ý
router.get("/get-places", PlaceController.getPlaces);
//router để tạo và lưu kdtree vào file json
router.get("/save-kdtree-into-file", CreateKDTree.createKDTree);
//router để tạo và lưu kết nối giữa các trạm xe buýt
router.get("/save-connection-into-file", ConnectionStationController.createConnectedStations);
router.get("/get-connected-stations", ConnectionStationController.getConnectedStations);
exports.default = router;
