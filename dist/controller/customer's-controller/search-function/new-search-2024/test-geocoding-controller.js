"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineDistance = void 0;
// áp dụng công thức haversine để tính khoảng cách giữa 2 điểm với lat long cho trước (đường chim bay)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính trái đất ở đơn vị kilômét
    // Đổi độ sang radian
    const lat1Rad = (Math.PI / 180) * lat1;
    const lon1Rad = (Math.PI / 180) * lon1;
    const lat2Rad = (Math.PI / 180) * lat2;
    const lon2Rad = (Math.PI / 180) * lon2;
    // Độ thay đổi của latitude và longitude
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    // Sử dụng công thức Haversine để tính khoảng cách
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
exports.haversineDistance = haversineDistance;
// Sử dụng hàm để tính khoảng cách giữa hai điểm
const lat1 = 21.00365; // Vĩ độ điểm 1
const lon1 = 105.6356667; // Kinh độ điểm 1
const lat2 = 21.0495026; // Vĩ độ điểm 2
const lon2 = 105.8849267; // Kinh độ điểm 2
const result = haversineDistance(lat1, lon1, lat2, lon2);
//console.log(`Khoảng cách giữa hai điểm là ${result.toFixed(2)} km`);
