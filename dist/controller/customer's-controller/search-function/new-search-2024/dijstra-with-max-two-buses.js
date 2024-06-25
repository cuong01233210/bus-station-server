"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dijkstraWithTwoBuses = void 0;
class PriorityQueue {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    enqueue(value) {
        this.heap.push(value);
        this.bubbleUp();
    }
    dequeue() {
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this.bubbleDown();
        }
        return top;
    }
    bubbleUp() {
        let index = this.heap.length - 1;
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (this.comparator(element, parent) >= 0)
                break;
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = element;
    }
    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        const element = this.heap[0];
        while (true) {
            let leftIndex = 2 * index + 1;
            let rightIndex = 2 * index + 2;
            let left, right;
            let swapIndex = -1;
            if (leftIndex < length) {
                left = this.heap[leftIndex];
                if (this.comparator(left, element) < 0) {
                    swapIndex = leftIndex;
                }
            }
            if (rightIndex < length) {
                right = this.heap[rightIndex];
                if ((swapIndex === -1 && this.comparator(right, element) < 0) ||
                    (swapIndex !== -1 && this.comparator(right, left) < 0)) {
                    swapIndex = rightIndex;
                }
            }
            if (swapIndex === -1)
                break;
            this.heap[index] = this.heap[swapIndex];
            index = swapIndex;
        }
        this.heap[index] = element;
    }
}
const dijkstraWithTwoBuses = (start, end, adjacencyList) => {
    const pq = new PriorityQueue((a, b) => a.weight - b.weight);
    const distances = new Map();
    const previous = new Map();
    const visited = new Set(); // Thêm tập hợp để theo dõi các đỉnh đã thăm
    // Initialize distances and previous
    adjacencyList.forEach((_, vertex) => {
        distances.set(vertex, Infinity);
        previous.set(vertex, null);
    });
    distances.set(start, 0);
    pq.enqueue({ vertex: start, weight: 0, buses: new Set() });
    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        // Kiểm tra nếu đỉnh đã được thăm
        if (visited.has(current.vertex))
            continue;
        visited.add(current.vertex);
        if (current.vertex === end)
            break;
        for (const edge of adjacencyList.get(current.vertex) || []) {
            const newBuses = new Set(current.buses);
            edge.buses.forEach((bus) => newBuses.add(bus));
            // Kiểm tra kích thước của tập hợp
            if (newBuses.size > 2)
                continue;
            const newWeight = current.weight + edge.weight;
            if (newWeight < (distances.get(edge.vertex) || Infinity)) {
                distances.set(edge.vertex, newWeight);
                previous.set(edge.vertex, current.vertex);
                pq.enqueue({ vertex: edge.vertex, weight: newWeight, buses: newBuses });
            }
        }
    }
    const path = [];
    let at = end;
    while (at !== null) {
        path.unshift(at);
        at = previous.get(at) || null;
    }
    return path[0] === start ? path : [];
};
exports.dijkstraWithTwoBuses = dijkstraWithTwoBuses;
