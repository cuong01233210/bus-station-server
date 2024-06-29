"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const my_node_1 = require("../../../../models/my-node");
const fs_1 = __importDefault(require("fs"));
const test_geocoding_controller_1 = require("./test-geocoding-controller");
class KDTree {
    constructor(root = null, data) {
        this.root = root;
        this.data = data;
    }
    _build(points, d) {
        if (points.length === 0) {
            return null;
        }
        const k = points.length;
        const axis = d % k;
        const sortedPoints = points.sort((p1, p2) => {
            if (axis === 0) {
                return p1.lat - p2.lat;
            }
            else {
                return p1.long - p2.long;
            }
        });
        const mid = Math.floor(points.length / 2);
        const node = new my_node_1.MyNode2(sortedPoints[mid], null, null, d);
        const left = sortedPoints.slice(0, mid);
        const right = sortedPoints.slice(mid + 1);
        node.left = this._build(left, d + 1);
        node.right = this._build(right, d + 1);
        return node;
    }
    build() {
        this.root = this._build(this.data, 0);
    }
    printNLR(node, d) {
        if (!node)
            return;
        console.log(node.point.lat, node.point.long);
        this.printNLR(node.left, d + 1);
        this.printNLR(node.right, d + 1);
    }
    printTree() {
        this.printNLR(this.root, 0);
    }
    findNearestPoints2(queryPoint, node, bestPairs, n) {
        if (!node)
            return bestPairs;
        // let dist: number = this.euclideanDistance(node.point, queryPoint);
        let dist = (0, test_geocoding_controller_1.haversineDistance)(node.point.lat, node.point.long, queryPoint.lat, queryPoint.long) * 1000;
        let insertionIndex = bestPairs.length;
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
        const axis = node.depth % 2;
        let queryTemp = axis === 0 ? queryPoint.lat : queryPoint.long;
        let nodeTemp = axis === 0 ? node.point.lat : node.point.long;
        let goodSide;
        let badSide;
        if (queryTemp < nodeTemp) {
            goodSide = node.left;
            badSide = node.right;
        }
        else {
            badSide = node.left;
            goodSide = node.right;
        }
        bestPairs = this.findNearestPoints2(queryPoint, goodSide, bestPairs, n);
        if (Math.abs(nodeTemp - queryTemp) < bestPairs[bestPairs.length - 1].dist) {
            bestPairs = this.findNearestPoints2(queryPoint, badSide, bestPairs, n);
        }
        return bestPairs;
    }
    nearestNodes(queryPoint, n) {
        const bestPairs = [];
        this.findNearestPoints2(queryPoint, this.root, bestPairs, n);
        return bestPairs;
    }
    findNearestPoint(queryPoint, node, bestPair) {
        if (!node)
            return bestPair;
        let dist = (0, test_geocoding_controller_1.haversineDistance)(node.point.lat, node.point.long, queryPoint.lat, queryPoint.long) * 1000;
        if (dist < bestPair.dist) {
            bestPair.dist = dist;
            bestPair.point = node.point;
        }
        const axis = node.depth % 2;
        let queryTemp = 0;
        let nodeTemp = 0;
        if (axis === 0) {
            queryTemp = queryPoint.lat;
            nodeTemp = node.point.lat;
        }
        else {
            queryTemp = queryPoint.long;
            nodeTemp = node.point.long;
        }
        let goodSide;
        let badSide;
        if (queryTemp < nodeTemp) {
            goodSide = node.left;
            badSide = node.right;
        }
        else {
            badSide = node.left;
            goodSide = node.right;
        }
        bestPair = this.findNearestPoint(queryPoint, goodSide, bestPair);
        if (Math.abs(nodeTemp - queryTemp) < bestPair.dist) {
            bestPair = this.findNearestPoint(queryPoint, badSide, bestPair);
        }
        return bestPair;
    }
    nearestDis(queryPoint) {
        const bestTemp = { point: null, dist: Infinity };
        const bestPair = this.findNearestPoint(queryPoint, this.root, bestTemp);
        return bestPair;
    }
    findNodesInRadius(queryPoint, radius, node, foundPoints) {
        if (!node)
            return;
        let dist = (0, test_geocoding_controller_1.haversineDistance)(node.point.lat, node.point.long, queryPoint.lat, queryPoint.long) * 1000;
        if (dist <= radius * 1000) {
            // Chuyển km sang mét
            foundPoints.push({ point: node.point, dist });
        }
        const axis = node.depth % 2;
        let nodeTemp = axis === 0 ? node.point.lat : node.point.long;
        let queryTemp = axis === 0 ? queryPoint.lat : queryPoint.long;
        let primarySide = queryTemp < nodeTemp ? node.left : node.right;
        let secondarySide = queryTemp < nodeTemp ? node.right : node.left;
        this.findNodesInRadius(queryPoint, radius, primarySide, foundPoints);
        if (Math.abs(nodeTemp - queryTemp) <= radius * 1000) {
            this.findNodesInRadius(queryPoint, radius, secondarySide, foundPoints);
        }
    }
    findNodesWithinRadius(queryPoint, radius) {
        const foundPoints = [];
        this.findNodesInRadius(queryPoint, radius, this.root, foundPoints);
        return foundPoints.sort((a, b) => a.dist - b.dist);
    }
    serializeNode(node) {
        if (!node)
            return null;
        return {
            point: node.point,
            depth: node.depth,
            left: this.serializeNode(node.left),
            right: this.serializeNode(node.right),
        };
    }
    saveToFile(filePath) {
        if (!this.root)
            return;
        const jsonTree = JSON.stringify(this.serializeNode(this.root));
        fs_1.default.writeFileSync(filePath, jsonTree);
    }
    deserializeNode(data) {
        if (!data)
            return null;
        const node = new my_node_1.MyNode2(data.point, null, null, data.depth);
        node.left = this.deserializeNode(data.left);
        node.right = this.deserializeNode(data.right);
        return node;
    }
    loadFromFile(filePath) {
        const jsonTree = fs_1.default.readFileSync(filePath, "utf-8");
        const treeData = JSON.parse(jsonTree);
        this.root = this.deserializeNode(treeData);
    }
}
exports.default = KDTree;
