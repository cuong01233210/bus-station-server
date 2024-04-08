// phiên bản test với A,B, C
export interface NodeVertex {
  nameOfVertex: string; // tên node
  weight: number; // lưu trữ khoảng cách giữa 2 node liền kề
}
export interface ReturnVertex {
  name: string;
  buses: string[];
}
export interface ReturnRoute {
  source: string;
  destination: string;
  buses: string[];
}

export interface ResultRoute {
  vertices: string[]; //
  returnRoutes: ReturnRoute[]; //
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
export interface NodeVertex2 {
  name: string; // tên trạm ứng cử cho việc đến tiếp theo
  weight: number; // trọng số theo khoảng cách
  buses: string[]; // là cái mảng lưu các tuyến xe buýt đi qua được (t0102,...) thay bằng mảng đã phải tách xâu
}

export class Vertext2 {
  name: string; // tên trạm bus hiện bắt đầu xuất phát
  nodes: NodeVertex2[]; // mảng chứa vector các đường đi có thể từ điểm A hiện tại (các ứng cử viên cho B)
  weight: number; // lưu trữ khoảng cách từ điểm bắt đầu tới điểm đích tìm được
  frontNode: string; // lưu trữ node kề phía trước sau khi duyệt dijstra

  constructor(theName: string, theNodes: NodeVertex2[], theWeight: number) {
    this.name = theName;
    this.nodes = theNodes;
    this.weight = theWeight;
    this.frontNode = "";
  }
}
export class Vertex {
  name: string; // tên node
  nodes: NodeVertex[]; // mảng chứa vector giữa 2 node hiện tại và node có thể liền kề
  weight: number; // lưu trữ khoảng cách từ điểm bắt đầu tới điểm đích tìm được
  frontNode: string; // lưu trữ node kề phía trước sau khi duyệt dijstra
  buses: string[]; // lưu trữ những xe buýt có thể đi vào đỉnh này
  constructor(
    theName: string,
    theNodes: NodeVertex[],
    theWeight: number,
    buses: string[]
  ) {
    this.name = theName;
    this.nodes = theNodes;
    this.weight = theWeight;
    this.frontNode = "";
    this.buses = buses;
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
    weight: number
  ): ReturnVertex[] {
    let nextVertex: string = finish;
    let arrayWithVertex: string[] = [];
    let returnVextices: ReturnVertex[] = [];
    while (nextVertex != start) {
      if (this.vertices[nextVertex] && this.vertices[nextVertex].buses) {
        //arrayWithVertex.unshift(nextVertex);
        let returnVertex: ReturnVertex = {
          name: nextVertex,
          buses: this.vertices[nextVertex].buses,
        };
        returnVextices.unshift(returnVertex);
        // console.log(
        //   "Trạm: ",
        //   nextVertex,
        //   " Tuyến ",
        //   this.vertices[nextVertex].buses
        // );
        nextVertex = this.vertices[nextVertex].frontNode;
      } else {
        // console.log("Không tìm thấy tuyến đường/ trạm xe buýt phù hơp");
        return [];
      }
    }
    //arrayWithVertex.unshift(nextVertex);
    let returnVertex: ReturnVertex = {
      name: nextVertex,
      buses: this.vertices[nextVertex].buses,
    };
    returnVextices.unshift(returnVertex);
    return returnVextices;
  }
  // thuật toán : xét 2 tập xe buýt c1Buses là tập xe buýt có thể đi được từ trạm j -> j + 1
  // và tập c2Buses là tập xe buýt có thể đi được từ trạm i -> j
  // -> tập xe buýt để đi từ i -> i + 1 sẽ là c1Buses giao c2Buses
  // nếu tập này = null -> phải nhảy tuyến ở trạm j (đổi xe buýt)

  // ví dụ
  // trạm A có xe 02, 89 đi qua và hướng tới trạm B (phần tử 0 trong mảng returnVertexs)
  // trạm B có xe 02 đi qua và hướng tới trạm C
  // trạm C có xe 02, 100 đi qua và hướng tới trạm D
  // trạm D là đích và có xe 100 đi qua

  // theo thuật toán
  // khởi tạo c2Buses = returnVertexs[0].buses = [02, 89], i = 0, j = 0 (i == j)
  // A -> B: c1Buses = (returnVertexs[0].buses giao returnVertexs[1].buses) = [02] (xét tuyến đi được từ j = 0 -> j + 1 = 1)
  // -> để đi được từ trạm i -> j + 1 sẽ cần (giao của c2Buses (i -> j) và c1Buses (j -> j + 1)) là c3Buses = [02] khác null
  // -> gán c2Buses = c3Buses = [02], j = 1 và xét tiếp từ B -> C

  // B -> C: c1Buses = (returnVertexs[1].buses giao returnVertexs[2].buses) = [02] (xét tuyến đi được từ j = 1 -> j + 1 = 2)
  // -> để đi được từ trạm i -> j + 1 sẽ cần (giao của c2Buses (i -> j) và c1Buses (j -> j + 1)) là c3Buses = [02] khác null
  // gán c2Buses = c3Buses = [02], j = 2 và xét tiếp từ C -> D

  // C -> D: c1Buses = [02, 100] giao [100] = [100]
  // c2Buses = [02]
  // c3Buses = c2Buses giao c1Buses = [02] giao [100] = null
  // -> ở trạm C phải nhảy tuyến
  // -> saveC sẽ lưu vào 1 đối tượng gồm {trạm đầu: returnVertexs[i].name, trạm đích: returnVertexs[j].name, buses: c2Buses}
  // saveC[0] = {returnVertexs[0].name, returnVertexs[2].name, c2Buses} = {A, C, [02]}
  // sau đó cần cập nhật dữ liệu i = j = 2, c2Buses = returnVertexs[i].buses = [02, 100] và xét tiếp
  // lúc này c3Buses = [100] -> cập nhật j = 3, c2Buses [100]

  // D: đã ở đích -> lưu nốt đoạn đường còn lại vào saveC
  // saveC.push({returnVertexs[2].name, returnVertexs[3].name, c2Buses})
  // saveC.push(C, D, [100])
  // và cuối cùng ta có kết quả để đi được tới đích cần 2 giai đoạn
  // A -> C với xe 02
  // C -> D với xe 100
  filterBusesEachRoute(returnVertices: ReturnVertex[]): ReturnRoute[] {
    let i = 0; // trạm khởi đầu combo
    let j = 0; // trạm kết thúc combo
    let saveI: number[] = []; // lưu các i
    let saveJ: number[] = []; // lưu các j

    let c1Buses: string[] = []; // dùng để kiểm tra xem j -> j + 1 được không
    // khi build đồ thị có hướng cho các trạm xe buýt và dùng thuật toán dijstra nên 100% c1Bus khác null
    // tuy nhiên cứ check cho chắc
    // trong trường hợp c1Bus == null thì phải báo người dùng đi bộ sang trạm j -> j + 1 rồi làm tiếp
    let c2Buses: string[] = []; // là tập xe buýt có thể dùng để đi từ i -> j

    let c3Buses: string[] = []; // bằng c1Buses giao c2Buses

    c2Buses = returnVertices[0].buses; // khởi tạo gồm dữ liệu trạm xuất phát

    let saveC: ReturnRoute[] = [];

    if (returnVertices.length == 1) {
      console.log("Trạm xuất phát trùng trạm đích");
      saveC.push({
        source: returnVertices[0].name,
        destination: returnVertices[0].name,
        buses: returnVertices[0].buses,
      });
      return saveC;
    }
    // saveCBus lưu các route + trạm xuất phát và trạm đích của 1 lộ trình có thể đi được bằng tối thiểu 1 tuyến
    for (let index = 0; index < returnVertices.length - 1; index++) {
      c1Buses = returnVertices[index].buses.filter((item) =>
        returnVertices[index + 1].buses.includes(item)
      );
      //console.log("c1Buses: ", c1Buses);
      if (c1Buses.length > 0) {
        // có trạm xe buýt chung từ j -> j + 1 -> kiểm tra tiếp xem cần nhảy tuyến ko
        c3Buses = c2Buses.filter((item) => c1Buses.includes(item));
        //console.log("c3Buses: ", c3Buses);
        if (c3Buses.length == 0) {
          // trường hợp này phải nhảy tuyến
          // lưu lộ trình này lại
          //console.log("c2Buses save: ", c2Buses);
          saveC.push({
            source: returnVertices[i].name,
            destination: returnVertices[j].name,
            buses: c2Buses,
          });
          // cập nhật i, j, c2Buses để tìm lộ trình tiếp theo
          i = j;
          c2Buses = returnVertices[i].buses;
          // tiếp tục xét tiếp đoạn lúc nãy đang giang dở
          c3Buses = c2Buses.filter((item) => c1Buses.includes(item)); // lần này 100% c3Buses khác null
          c2Buses = c3Buses;
          j++;
        } else {
          // trường hợp không cần nhảy tuyến thì đi tiếp đến trạm tiếp theo
          j++;
          //console.log("c3Buses trc update: ", c3Buses);
          c2Buses = c3Buses;
          //console.log("c2Buses sau update: ", c2Buses);
        }
      } else {
        // trong trường hợp c1Buses null cần người dùng đi bộ đến trạm j + 1 tính sau
      }
    }
    // khi đến đích thì thêm nốt lộ trình còn lại vào saveC
    saveC.push({
      source: returnVertices[i].name,
      destination: returnVertices[j].name,
      buses: c2Buses,
    });

    return saveC;
  }
  findShortestWay(start: string, finish: string): ResultRoute {
    let nodes: any = {};
    let visitedVertex: string[] = [];

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
      );
      let currentVertex: Vertex = this.vertices[sortedVisitedByWeight[0]];
      for (let j of currentVertex.nodes) {
        const calculateWeight: number = currentVertex.weight + j.weight;
        if (calculateWeight < this.vertices[j.nameOfVertex].weight) {
          this.vertices[j.nameOfVertex].weight = calculateWeight;
          this.vertices[j.nameOfVertex].frontNode = currentVertex.name;
        }
      }
      delete nodes[sortedVisitedByWeight[0]];
    }
    const finishWeight: number = this.vertices[finish].weight;
    // console.log(
    //   "danh sách các node và node phía trước tương ứng và khoảng cách từ điểm đó tới điểm xuất phát là"
    // );
    // for (let i in this.vertices) {
    //   console.log(
    //     this.vertices[i].name,
    //     this.vertices[i].frontNode,
    //     this.vertices[i].weight
    //   );
    // }

    let returnVertices: ReturnVertex[] = this.findPointsOfShortestWay(
      start,
      finish,
      finishWeight
    );
    let vertices: string[] = []
    for (let i = 0; i < returnVertices.length; i++) {
      vertices.push(returnVertices[i].name)
      //console.log(returnVertices[i].name, " ", returnVertices[i].buses);
    }
    let returnRoutes: ReturnRoute[] = [];
    if (returnVertices.length > 0) {
      returnRoutes = this.filterBusesEachRoute(returnVertices);
      // console.log("\n Lộ trình tìm được là");
      // for (let index = 0; index < returnRoutes.length; index++) {
      //   console.log("source: ", returnRoutes[index].source);
      //   console.log("destination: ", returnRoutes[index].destination);
      //   console.log("buses: ", returnRoutes[index].buses);
      // }
    }
    let resultRoute: ResultRoute = {
      returnRoutes: returnRoutes,
      vertices: vertices,
    };

    return resultRoute;
  }
}
