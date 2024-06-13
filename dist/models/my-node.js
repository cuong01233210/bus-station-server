"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyNode2 = exports.MyNode = void 0;
class MyNode {
    constructor(point, left = null, right = null, depth) {
        this.point = point;
        this.left = left;
        this.right = right;
        this.depth = depth;
    }
}
exports.MyNode = MyNode;
class MyNode2 {
    constructor(point, left = null, right = null, depth) {
        this.point = point;
        this.left = left;
        this.right = right;
        this.depth = depth;
    }
}
exports.MyNode2 = MyNode2;
