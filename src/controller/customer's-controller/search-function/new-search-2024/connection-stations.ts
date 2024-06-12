import { Response, Request } from "express";
import Bus from "../../../../models/bus";
import fs from "fs";
import path from "path";
interface StationConnection {
  stationName: string;
  connectedStations: string[];
  usedBuses: string;
}

class BusRouteProcessor {
  private busData: Bus[] = [];
  private routeConnections: StationConnection[] = [];

  async fetchData() {
    this.busData = await Bus.getBusIn4();
  }

  processRoutes() {
    this.busData.forEach((bus) => {
      this.processDirection(bus.bus, bus.chieuDi);
      this.processDirection(bus.bus, bus.chieuVe);
    });
  }

  processDirection(
    busName: string,
    direction: { name: string; buses: string[]; lat: number; long: number }[]
  ) {
    for (let i = 0; i < direction.length - 1; i++) {
      const startStation = direction[i].name;
      for (let j = i + 1; j < direction.length; j++) {
        const endStation = direction[j].name;
        this.addConnection(startStation, endStation, busName);
      }
    }
  }

  addConnection(startStation: string, endStation: string, busName: string) {
    const existingConnection = this.routeConnections.find(
      (conn) => conn.stationName === startStation && conn.usedBuses === busName
    );

    if (existingConnection) {
      if (!existingConnection.connectedStations.includes(endStation)) {
        existingConnection.connectedStations.push(endStation);
      }
    } else {
      this.routeConnections.push({
        stationName: startStation,
        connectedStations: [endStation],
        usedBuses: busName,
      });
    }
  }

  saveToJson(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(this.routeConnections, null, 2));
  }

  static readFromJson(
    fileName: string
  ): Map<string, { connectedStations: string[]; usedBuses: string }[]> {
    const rawData = fs.readFileSync(fileName, "utf-8");
    const connections: StationConnection[] = JSON.parse(rawData);

    const connectionMap = new Map<
      string,
      { connectedStations: string[]; usedBuses: string }[]
    >();
    connections.forEach((connection) => {
      if (!connectionMap.has(connection.stationName)) {
        connectionMap.set(connection.stationName, []);
      }
      connectionMap.get(connection.stationName)?.push({
        connectedStations: connection.connectedStations,
        usedBuses: connection.usedBuses,
      });
    });

    return connectionMap;
  }
}

export async function createConnectedStations(req: Request, res: Response) {
  const processor = new BusRouteProcessor();
  await processor.fetchData();
  processor.processRoutes();
  processor.saveToJson(
    "/Users/macbookpro/Desktop/Workspace/json-data/connectionRoutes.json"
  );

  res.status(200).json({ message: "success" });
}
export async function getConnectedStations(req: Request, res: Response) {
  const connectionMap = BusRouteProcessor.readFromJson("connectionRoutes.json");
  console.log(connectionMap.get("BX Gia Lâm")!);
  const connectionObject = Object.fromEntries(connectionMap);
  res.status(200).json({ data: connectionObject });
}
