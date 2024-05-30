import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class BusRoute {
  bus: string;
  chieuDi: {
    name: string;
    buses: string[];
    lat: number;
    long: number;
  }[];
  chieuVe: {
    name: string;
    buses: string[];
    lat: number;
    long: number;
  }[];
  static empty: any;

  constructor(
    bus: string,
    chieuDi: {
      name: string;
      buses: string[];
      lat: number;
      long: number;
    }[],
    chieuVe: {
      name: string;
      buses: string[];
      lat: number;
      long: number;
    }[]
  ) {
    this.bus = bus;
    this.chieuDi = chieuDi;
    this.chieuVe = chieuVe;
  }

  static async getAllBusRoutes() {
    let startTime = performance.now();
    const db: Db = BusesDatabase.getDb();
    const documents = await db.collection("bus_routes").find().toArray();

    const busRoutes: BusRoute[] = documents.map(
      (doc) => new BusRoute(doc.bus, doc.chieuDi, doc.chieuVe)
    );
    let endTime = performance.now();
    console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
    return busRoutes;
  }

  static async getBusRoute(bus: string) {
    const db: Db = BusesDatabase.getDb();
    const document = await db.collection("bus_routes").findOne({ bus: bus });
    if (document != null) {
      return new BusRoute(document.bus, document.chieuDi, document.chieuVe);
    } else return BusRoute.empty;
  }

  static async getUserBusRoutesPreference(sbuses: string[]) {
    const db = BusesDatabase.getDb();
    const documents = await db
      .collection("bus_routes")
      .find({ bus: { $in: sbuses } })
      .toArray();

    const busRoutes: BusRoute[] = documents.map(
      (doc) => new BusRoute(doc.bus, doc.chieuDi, doc.chieuVe)
    );

    return busRoutes;
  }

  async createBusRoute() {
    const db: Db = BusesDatabase.getDb();
    await db.collection("bus_routes").insertOne({ ...this });
  }

  async updateBusRoute(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db
      .collection("bus_routes")
      .updateOne({ bus: bus }, { $set: { ...this } });
  }

  static async deleteBusRoute(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db.collection("bus_routes").deleteOne({ bus: bus });
  }
}

export default BusRoute;
