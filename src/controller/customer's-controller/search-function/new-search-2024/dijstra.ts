import BusStation from "../../../../models/bus-station";
import { busInfoMap } from "./search-route";
import ReturnRoute from "../../../../models/return-route";
import ResultRoute from "../../../../models/result-route";

// phiên bản test với A,B, C
export interface NodeVertex {
  nameOfVertex: string; // tên node
  weight: number; // lưu trữ khoảng cách giữa 2 node liền kề
  pathType: "bus" | "walk"; // cách đi lại giữa 2 node
}
export interface ReturnVertex {
  name: string;
  buses: string[];
}

// ý tưởng: ban đầu mình chập lại các tuyến đi được từ A -> B
// A->B là 2 đỉnh của 1 cạnh có đường đi trực tiếp từ A -> B
// ví dụ có các tuyến 01, 02, 89 đi từ Bến Xe Yên Nghĩa -> 807 Quang Trung - Hà Đông
// chập 3 ô 01,02,89 lại làm 1 tuyến duy nhất có mã định danh tuyến là t010289
// và coi như là 1 đường duy nhất từ A -> B
// tiếp theo là từ B -> C
// ví dụ lúc này chỉ có tuyến 01, 02 đi được từ 807 Quang Trung - Hà Đông -> 83 Nguyễn Lương Bằng
// tiếp tục chập lại với mã định danh là t0102
// kết luận muốn đi từ A -> C thì so mã định danh A -> B và B -> C
// có điểm chung là 01 và 02
// so tiêu chí phụ
// giả sử trung bình giữa 2 trạm thì cứ 10p ô 01 xuất hiện 1 nháy
// còn trung bình 15p ô 02 xuất hiện 2 lần
// hoặc gợi ý cả 2 ô 01, 02 hoặc hiện mỗi 01
// tóm lại là cứ dùng dijstra như cũ để tìm route theo quãng đường khoảng cách như làm A, B, C còn lại thì fix

// phiên bản real đầu tiên với các trạm xe buýt

function getAllRoutes(routes: ReturnRoute[]): string[][] {
  const paths = routes.map((route) => route.buses);
  return cartesianProduct(paths);
}

function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => {
      return acc.flatMap((a) => curr.map((c) => [...a, c]));
    },
    [[]]
  );
}

function calculateRoutePrices(
  routes: string[][]
): { route: string[]; price: number }[] {
  return routes.map((route) => {
    const price = route.reduce(
      (total, bus) => (total += busInfoMap[bus]?.price || 0),
      0
    );
    return { route, price };
  });
}
export class Vertex {
  name: string; // tên node
  nodes: NodeVertex[]; // mảng chứa vector giữa 2 node hiện tại và node có thể liền kề
  weight: number; // lưu trữ khoảng cách từ điểm bắt đầu tới điểm đích tìm được
  frontNode: string; // lưu trữ node kề phía trước sau khi duyệt dijstra
  buses: string[]; // lưu trữ những xe buýt có thể đi vào đỉnh này
  pathType: "bus" | "walk";
  constructor(
    theName: string,
    theNodes: NodeVertex[],
    theWeight: number,
    buses: string[],
    pathType: "bus" | "walk"
  ) {
    this.name = theName;
    this.nodes = theNodes;
    this.weight = theWeight;
    this.frontNode = "";
    this.buses = buses;
    this.pathType = pathType;
  }
}

export class Dijkstra {
  vertices: any;
  constructor() {
    this.vertices = {};
  }

  addVertex(vertex: Vertex): void {
    this.vertices[vertex.name] = vertex;
  }

  findPointsOfShortestWay(
    start: string,
    finish: string,
    busStations: Map<String, BusStation>
  ): ResultRoute[] {
    let currentVertex: string = finish;

    let deltaS = 0; // biến lưu tổng quãng đường di chuyển trên cùng 1 loại phương thức liên tục
    let tempVehical = ""; // lưu phương thức di chuyển trạm n - 1 -> n
    let frontNode = "";
    let saveBuses: string[] = [];
    const returnRoutes: ReturnRoute[] = [];
    let destination = ""; // trạm đích của 1 hành trình
    let stations = []; // mảng chứa đầy đủ tên các trạm đi qua
    let ceilS = 0; //tổng quãng đường khi được làm tròn
    let startStation: string = start;
    let endStation: string = finish;
    let transportHour: number = 0;
    let transportMinute: number = 0;

    while (currentVertex != start) {
      if (this.vertices[currentVertex] && this.vertices[currentVertex].buses) {
        //arrayWithVertex.unshift(nextVertex);
        frontNode = this.vertices[currentVertex].frontNode;
        if (this.vertices[currentVertex].pathType == "bus") {
          startStation = frontNode;
        }

        if (tempVehical == "") {
          // khởi tạo
          if (this.vertices[currentVertex].pathType == "bus") {
            tempVehical = this.vertices[currentVertex].pathType;
            destination = currentVertex;
            endStation = currentVertex; //cố định được trạm kết thúc
            saveBuses.push(...this.vertices[currentVertex].buses);
          } else {
            // do mình nếu giữa 2 trạm cuối cùng có thể đi bộ thì mình lấy trạm cuối n -1 thay vì trạm cuối n để báo cho người dùng
            saveBuses = ["Walk"];
          }
        } else {
          // nếu trùng nhau pathType
          if (tempVehical == this.vertices[currentVertex].pathType) {
            if (tempVehical == "bus") {
              let tempBuses: string[] = this.vertices[
                currentVertex
              ].buses.filter(
                (item: string) => saveBuses.includes(item) && item !== "Walk"
              );
              if (tempBuses.length == 0) {
                // nếu không còn xe trùng nhau thì phải nhảy tuyến
                // tức là tạo ra thêm 1 hành trình khác
                deltaS = Math.round(
                  this.vertices[destination].weight -
                    this.vertices[currentVertex].weight
                );
                ceilS += deltaS;
                const destinationIn4 = busStations.get(destination);
                let returnRoute: ReturnRoute = {
                  source: currentVertex,
                  destination: destination,
                  destinationLat: destinationIn4?.lat || 0,
                  destinationLong: destinationIn4?.long || 0,
                  buses: saveBuses,
                  transportTime: Math.ceil((deltaS * 60) / 22.5 / 1000),
                  transportS: deltaS,
                  pathType: tempVehical,
                };
                transportMinute += returnRoute.transportTime;
                returnRoutes.unshift(returnRoute);

                saveBuses = this.vertices[frontNode].buses;
                destination = currentVertex;
              } else {
                saveBuses = tempBuses; // cập nhật lại những xe buýt trùng nhau
              }
            }
          } else {
            deltaS = Math.round(
              this.vertices[destination].weight -
                this.vertices[currentVertex].weight
            );
            ceilS += deltaS;
            // nếu khác nhau pathType
            if (tempVehical == "bus") {
              saveBuses = this.vertices[currentVertex].buses.filter(
                (item: string) => saveBuses.includes(item) && item !== "Walk"
              );
              const destinationIn4 = busStations.get(destination);
              let returnRoute: ReturnRoute = {
                source: currentVertex,
                destination: destination,
                destinationLat: destinationIn4?.lat || 0,
                destinationLong: destinationIn4?.long || 0,
                buses: saveBuses,
                transportTime: Math.ceil((deltaS * 60) / 22.5 / 1000),
                transportS: deltaS,
                pathType: tempVehical,
              };
              transportMinute += returnRoute.transportTime;
              returnRoutes.unshift(returnRoute);

              saveBuses = this.vertices[frontNode].buses;
              destination = currentVertex;

              tempVehical = "walk";
            } else if (tempVehical == "walk") {
              const destinationIn4 = busStations.get(destination);
              let returnRoute: ReturnRoute = {
                source: currentVertex,
                destination: destination,
                destinationLat: destinationIn4?.lat || 0,
                destinationLong: destinationIn4?.long || 0,
                buses: ["Walk"],
                transportTime: Math.ceil((deltaS * 60) / 5 / 1000),
                transportS: deltaS,
                pathType: tempVehical,
              };
              transportMinute += returnRoute.transportTime;
              returnRoutes.unshift(returnRoute);

              saveBuses = this.vertices[frontNode].buses;
              destination = currentVertex;

              tempVehical = "bus";
            }
          }
        }

        stations.unshift(currentVertex);
        // console.log(
        //   "Trạm: ",
        //   currentVertex,
        //   " Tuyến ",
        //   this.vertices[currentVertex].buses,
        //   " loại hình di chuyển: ",
        //   this.vertices[currentVertex].pathType
        // );
        currentVertex = frontNode;
      } else {
        // console.log("Không tìm thấy tuyến đường/ trạm xe buýt phù hơp");
        return [];
      }
    }

    // console.log(
    //   "Trạm: ",
    //   currentVertex,
    //   " Tuyến ",
    //   this.vertices[currentVertex].buses
    // );

    if (tempVehical == "bus") {
      deltaS = Math.round(
        this.vertices[destination].weight - this.vertices[currentVertex].weight
      );
      saveBuses = this.vertices[currentVertex].buses.filter(
        (item: string) => saveBuses.includes(item) && item !== "Walk"
      );
      ceilS += deltaS;
      let deltaT = Math.ceil((deltaS * 60) / 22.5 / 1000);
      const destinationIn4 = busStations.get(destination);
      let returnRoute: ReturnRoute = {
        source: currentVertex,
        destination: destination,
        destinationLat: destinationIn4?.lat || 0,
        destinationLong: destinationIn4?.long || 0,
        buses: saveBuses,
        transportTime: deltaT,
        transportS: deltaS,
        pathType: tempVehical,
      };
      transportMinute += returnRoute.transportTime;
      returnRoutes.unshift(returnRoute);
      startStation = currentVertex;
      stations.unshift(currentVertex);
    }

    while (transportMinute >= 60) {
      transportHour += 1;
      transportMinute -= 60;
    }
    console.log();

    let allRoutes = getAllRoutes(returnRoutes);

    console.log(allRoutes);
    const pricedRoutes = calculateRoutePrices(allRoutes);
    pricedRoutes.forEach(({ route, price }) => {
      console.log(`Hành trình: ${route.join(" -> ")}, Giá tiền: ${price} đồng`);
    });

    // bắt đầu tổng hợp các cách đi
    let resultRoutes: ResultRoute[] = [];
    for (let i = 0; i < allRoutes.length; i++) {
      const startStationIn4 = busStations.get(startStation);
      const endStationIn4 = busStations.get(endStation);

      let resultRoute: ResultRoute = {
        startStation: startStation,
        endStation: endStation,
        startStationLat: startStationIn4?.lat || 0,
        startStationLong: startStationIn4?.long || 0,
        endStationLat: endStationIn4?.lat || 0,
        endStationLong: endStationIn4?.long || 0,
        buses: allRoutes[i],
        cost: pricedRoutes[i].price,
        transportHour: transportHour,
        transportMinute: transportMinute,
        startHour: 0,
        startMinute: 0,
        endHour: 0,
        endMinute: 0,
        stations: stations,
        returnRoutes: returnRoutes,
      };
      resultRoutes.push(resultRoute);
    }
    return resultRoutes;
  }

  findShortestWay(
    start: string,
    finish: string,
    busStations: Map<string, BusStation>
  ): ResultRoute[] {
    let nodes: any = {};

    for (let i in this.vertices) {
      if (this.vertices[i].name === start) {
        this.vertices[i].weight = 0;
      } else {
        this.vertices[i].weight = Number.MAX_VALUE;
      }
      nodes[this.vertices[i].name] = this.vertices[i].weight;
    }

    while (Object.keys(nodes).length !== 0) {
      let sortedVisitedByWeight: string[] = Object.keys(nodes).sort(
        (a, b) => this.vertices[a].weight - this.vertices[b].weight
      ); // dòng này để sắp xếp lại đỉnh theo trọng số từ nhỏ -> lớn
      let currentVertex: Vertex = this.vertices[sortedVisitedByWeight[0]]; // chọn ra đỉnh có trọng số min a

      // xét các đỉnh kề b của đỉnh a
      for (let j of currentVertex.nodes) {
        // if (j.pathType == "walk") continue; // tạm thời skip việc sử dụng walk
        const calculateWeight: number = currentVertex.weight + j.weight;
        // nếu khoảng cách từ đỉnh gốc tới đỉnh b nhỏ hơn khoảng cách hiện tại được ghi nhận
        // thì cập nhật giá trị và cập nhật đỉnh kể a vào khoảng cách hiện tại của b
        if (calculateWeight < this.vertices[j.nameOfVertex].weight) {
          this.vertices[j.nameOfVertex].weight = calculateWeight;
          this.vertices[j.nameOfVertex].frontNode = currentVertex.name;
          this.vertices[j.nameOfVertex].pathType = j.pathType; // lưu được cách đi được từ node a -> node b
        }
      }
      // loại bỏ đỉnh a khỏi ds xét
      delete nodes[sortedVisitedByWeight[0]];
    }
    let resultRoutes: ResultRoute[] = this.findPointsOfShortestWay(
      start,
      finish,
      busStations
    );
    return resultRoutes;
  }
}
