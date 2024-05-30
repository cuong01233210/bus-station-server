import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class Bus {
  bus: string;
  price: number;
  activityTime: string;
  gianCachChayXe: string;
  gianCachTrungBinh: number;
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
    price: number,
    activityTime: string,
    gianCachChayXe: string,
    gianCachTrungBinh: number,
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
    this.price = price;
    this.activityTime = activityTime;
    this.gianCachChayXe = gianCachChayXe;
    this.gianCachTrungBinh = gianCachTrungBinh;
    this.chieuDi = chieuDi;
    this.chieuVe = chieuVe;
  }

  static async getBusIn4() {
    let startTime = performance.now();
    const db: Db = BusesDatabase.getDb();
    const documents = await db.collection("routes").find().toArray();

    const buses: Bus[] = documents.map(
      (doc) =>
        new Bus(
          doc.bus,
          doc.price,
          doc.activityTime,
          doc.gianCachChayXe,
          doc.gianCachTrungBinh,
          doc.chieuDi,
          doc.chieuVe
        )
    );
    let endTime = performance.now();
    console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
    return buses;
  }

  static async getOnlyOneBus(bus: string) {
    const db: Db = BusesDatabase.getDb();
    const document = await db.collection("routes").findOne({ bus: bus });
    if (document != null) {
      return new Bus(
        document.bus,
        document.price,
        document.activityTime,
        document.gianCachChayXe,
        document.gianCachTrungBinh,
        document.chieuDi,
        document.chieuVe
      );
    } else return Bus.empty;
  }

  static async getUserBusesPreferenceByBuses(sbuses: string[]) {
    const db = BusesDatabase.getDb();
    const documents = await db
      .collection("routes")
      .find({ bus: { $in: sbuses } })
      .toArray();

    const buses: Bus[] = documents.map(
      (doc) =>
        new Bus(
          doc.bus,
          doc.price,
          doc.activityTime,
          doc.gianCachChayXe,
          doc.gianCachTrungBinh,
          doc.chieuDi,
          doc.chieuVe
        )
    );

    return buses;
  }
  async createBus() {
    const db: Db = BusesDatabase.getDb();
    await db.collection("routes").insertOne({ ...this });
  }

  async updateBus(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db
      .collection("routes")
      .updateOne({ bus: bus }, { $set: { ...this } });
  }

  static async deleteBus(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db.collection("routes").deleteOne({ bus: bus });
  }
}

export default Bus;
