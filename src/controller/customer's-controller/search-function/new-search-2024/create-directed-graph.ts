import Bus from "../../../../models/bus";
import { haversineDistance } from "./test-geocoding-controller";
import fs from "fs";
import { Request, Response } from "express";
// ý tưởng
// dùng list liền kề (adjacencyList) + map để lưu trữ dữ liệu theo các cạnh
// nói chung dùng list để tiện cho việc từ 1 key (điểm xuất phát) dễ dàng nhìn thấy được luôn các đích (des) có thể tới
// ví dụ : A -> [{B, 15, [90]}, {C, 20, [98, 32]}]
//         B -> {D, 90, [01]}
// biết rõ ngay từ A đi xe 90 trạm tiếp theo dừng là B và mất 15m
// tương tự A -> C có thể đi trực tiếp bằng xe 98 hoặc 32 và mất 20m
// B -> D có thể đi được bằng tuyến 01

// ý tưởng hàm createGraph
// từ mảng danh sách các tuyến xe buýt đã có
// đầu tiên lấy được trường tên tuyến xe buýt (ex : 98)
// tiếp theo duyệt vào mảng chiều đi và chiều về của xe buýt
// ta sẽ duyệt hết tất cả các phần tử trong mảng chiều đi làm ví dụ
// mỗi phần tử ta sẽ cho nó vào hàm addVertex(thêm node vào cây)
// sau đó kiểm tra, nếu nó không phải phần tử cuối của mảng
// lấy thông tin về tên trạm đó, toạ độ lat long + tên trạm phía sau ptu(i + 1) + lat long sau
// cho vào hàm tạo cạnh đường đi (addEdge)

// ý tưởng hàm addEdge
// đầu tiên để chắc ăn ta thêm 2 đỉnh trạm nguồn và trạm đích vào đồ thị
// sau đó kiểm tra xem cạnh này đã tồn tại chưa
// nếu chưa thì dùng lat , long của 2 đầu tính ra khoảng cách ước lượng và sau đó tạo cạnh
// nếu rồi thì hãy truy cập vào cạnh đó và bổ sung tuyến xe buýt hiện tại cũng đi trùng cạnh đó
// ví dụ trước đó tuyến 01 tạo cạnh AB, bâyh xét tuyến 02 thì cũng đi qua cạnh AB -> cần bổ sung

// ý tưởng hàm addVertex
// hàm này chỉ đơn giản là kiểm tra xem đã có cạnh trong bộ đồ thị hay chưa, nếu chưa có thì bổ sung
export class DirectedGraph {
  // key có kiểu là string
  // value có kiểu là 1 mảng chứa các phần tử có dạng { vertex: string; weight: number }
  adjacencyList: Map<string, Edge[]> = new Map();

  addVertex(vertex: string) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(
    source: string,
    destination: string,
    sourceLat: number,
    sourceLong: number,
    desLat: number,
    desLong: number,
    bus: string,
    pathType: "bus" | "walk" // Add pathType parameter
  ) {
    // Thêm cả hai đỉnh vào đồ thị nếu chưa tồn tại
    this.addVertex(source);
    this.addVertex(destination);

    const edgeExists = this.adjacencyList
      .get(source)
      ?.some((edge) => edge.vertex === destination);
    const weigh =
      haversineDistance(sourceLat, sourceLong, desLat, desLong) * 1000;
    if (!edgeExists) {
      this.adjacencyList.get(source)?.push({
        vertex: destination,
        weight: weigh,
        buses: [bus],
        lat: desLat,
        long: desLong,
        pathType: pathType,
      });
    } else {
      // Nếu đã tồn tại đường đi từ source đến destination
      // Thêm bus vào mảng buses tương ứng
      const edges = this.adjacencyList.get(source);
      const existingEdge = edges?.find((edge) => edge.vertex === destination);
      if (existingEdge && existingEdge.buses[0] != "Walk" && bus != "Walk") {
        existingEdge.buses.push(bus);
      }
    }
  }

  // state 1: tạo đồ thị không có cạnh là đường đi bộ
  // state 2: tạo đồ thị có cạnh là đường đi bộ
  createGraph(buses: Bus[], state: number) {
    buses.forEach((bus) => {
      // Xử lý tách biệt cho chiều đi và chiều về
      bus.chieuDi.forEach((stop, index) => {
        this.addVertex(stop.name); // Thêm đỉnh
        if (index < bus.chieuDi.length - 1) {
          this.addEdge(
            stop.name,
            bus.chieuDi[index + 1].name,
            stop.lat,
            stop.long,
            bus.chieuDi[index + 1].lat,
            bus.chieuDi[index + 1].long,
            bus.bus,
            "bus"
          );
        }
      });

      bus.chieuVe.forEach((stop, index) => {
        this.addVertex(stop.name); // Thêm đỉnh
        if (index < bus.chieuVe.length - 1) {
          this.addEdge(
            stop.name,
            bus.chieuVe[index + 1].name,
            stop.lat,
            stop.long,
            bus.chieuVe[index + 1].lat,
            bus.chieuVe[index + 1].long,
            bus.bus,
            "bus"
          );
        }
      });
      if (state == 2) {
        // Xử lý đường đi bộ giữa các trạm không liền kề và khác chiều
        bus.chieuDi.forEach((stopDi) => {
          bus.chieuVe.forEach((stopVe) => {
            const dist =
              haversineDistance(
                stopDi.lat,
                stopDi.long,
                stopVe.lat,
                stopVe.long
              ) * 1000; // Nhân với 1000 để đổi từ km sang mét

            if (dist < 200) {
              // Khoảng cách nhỏ hơn 200m
              this.addEdge(
                stopDi.name,
                stopVe.name,
                stopDi.lat,
                stopDi.long,
                stopVe.lat,
                stopVe.long,
                "Walk",
                "walk"
              );
              this.addEdge(
                stopVe.name,
                stopDi.name,
                stopVe.lat,
                stopVe.long,
                stopDi.lat,
                stopDi.long,
                "Walk",
                "walk"
              );
            }
          });
        });
      }
    });
  }
}

// Define a type for the objects that are stored in the arrays of the adjacency list
type Edge = {
  vertex: string;
  weight: number;
  buses: string[];
  lat: number;
  long: number;
  pathType: "bus" | "walk"; // Add pathType parameter
};

// Define a type for the serializable list which will have string keys
// and values that are arrays of Edge
type SerializableList = {
  [key: string]: Edge[];
};

// Define the type for the adjacency list which is a map where each string key is mapped to an array of Edge
type AdjacencyList = Map<string, Edge[]>;

// Serialization function
function serializeGraph(adjacencyList: AdjacencyList): string {
  let serializableList: SerializableList = {};
  adjacencyList.forEach((edges, vertex) => {
    serializableList[vertex] = edges.map((edge) => ({
      vertex: edge.vertex,
      weight: edge.weight,
      buses: edge.buses,
      lat: edge.lat,
      long: edge.long,
      pathType: edge.pathType,
    }));
  });
  return JSON.stringify(serializableList);
}

// This function now accepts req and res parameters
export async function writeGraphToFile(req: Request, res: Response) {
  const state = req.body.state;
  const filename = req.body.filename;
  try {
    const buses = await Bus.getBusIn4();
    const graph = new DirectedGraph();
    graph.createGraph(buses, state);
    const adjacencyListString = serializeGraph(graph.adjacencyList);
    fs.writeFileSync(filename, adjacencyListString, "utf8");
    res.status(200).send("Graph data saved successfully.");
  } catch (error) {
    // Handle the error appropriately
    res.status(500).send("Error saving graph data: ");
  }
}

function deserializeGraph(serializedData: SerializableList) {
  let adjacencyList = new Map();
  Object.entries(serializedData).forEach(([vertex, edges]) => {
    adjacencyList.set(
      vertex,
      edges.map((edge) => ({
        vertex: edge.vertex,
        weight: edge.weight,
        buses: edge.buses,
        lat: edge.lat,
        long: edge.long,
        pathType: edge.pathType,
      }))
    );
  });
  return adjacencyList;
}

export function readGraphFromFile(filename: string) {
  const fileContent = fs.readFileSync(filename, "utf8");
  const serializedData = JSON.parse(fileContent);
  const adjacencyList = deserializeGraph(serializedData);
  const graph = new DirectedGraph();
  graph.adjacencyList = adjacencyList;
  return graph;
}
