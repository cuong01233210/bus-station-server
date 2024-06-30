import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class Bus {
  id?: string;
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
    }[],
    id?: string
  ) {
    this.bus = bus;
    this.price = price;
    this.activityTime = activityTime;
    this.gianCachChayXe = gianCachChayXe;
    this.gianCachTrungBinh = gianCachTrungBinh;
    this.chieuDi = chieuDi;
    this.chieuVe = chieuVe;
    this.id = id;
  }

  static async getBusIn4() {
    let startTime = performance.now();
    const db: Db = BusesDatabase.getDb();
    const documents = await db
      .collection("routes")
      .find()
      .sort({ bus: 1 })
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
          doc.chieuVe,
          doc._id.toString()
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
      .sort({ bus: 1 })
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
          doc.chieuVe,
          doc._id.toString()
        )
    );

    return buses;
  }
  async createBus() {
    const { id, ...busData } = this; // Loại bỏ trường id
    const db: Db = BusesDatabase.getDb();
    await db.collection("routes").insertOne({ ...busData });
  }

  async updateBus(bus: string) {
    const { id, ...busData } = this; // Loại bỏ trường id
    const db: Db = BusesDatabase.getDb();
    await db
      .collection("routes")
      .updateOne({ bus: bus }, { $set: { ...busData } });
  }

  static async deleteBus(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db.collection("routes").deleteOne({ bus: bus });
  }

  static async getAllBusInfos() {
    let startTime = performance.now();
    const db: Db = BusesDatabase.getDb();
    const documents = await db
      .collection("routes")
      .find(
        {},
        {
          projection: {
            bus: 1,
            price: 1,
            activityTime: 1,
            gianCachChayXe: 1,
            gianCachTrungBinh: 1,
          },
        }
      )
      .sort({ bus: 1 })
      .toArray();

    const busInfos: Bus[] = documents.map(
      (doc) =>
        new Bus(
          doc.bus,
          doc.price,
          doc.activityTime,
          doc.gianCachChayXe,
          doc.gianCachTrungBinh,
          [],
          [],
          doc._id.toString()
        )
    );
    let endTime = performance.now();
    console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
    return busInfos;
  }

  static async getBusInfo(bus: string) {
    const db: Db = BusesDatabase.getDb();
    const document = await db.collection("routes").findOne({ bus: bus });
    if (document != null) {
      return new Bus(
        document.bus,
        document.price,
        document.activityTime,
        document.gianCachChayXe,
        document.gianCachTrungBinh,
        [],
        []
      );
    } else return Bus.empty;
  }

  static async getBusRoute(bus: string) {
    const db: Db = BusesDatabase.getDb();
    const document = await db
      .collection("routes")
      .findOne({ bus: bus }, { projection: { chieuDi: 1, chieuVe: 1 } });
    if (document != null) {
      return new Bus(
        bus,
        0, // Default price value
        "", // Default activityTime value
        "", // Default gianCachChayXe value
        0, // Default gianCachTrungBinh value
        document.chieuDi,
        document.chieuVe
      );
    } else return Bus.empty;
  }

  static async getAllBusRoutes() {
    const db: Db = BusesDatabase.getDb();
    const documents = await db
      .collection("routes")
      .find({}, { projection: { bus: 1, chieuDi: 1, chieuVe: 1 } })
      .sort({ bus: 1 })
      .toArray();

    const busRoutes: Bus[] = documents.map(
      (doc) => new Bus(doc.bus, 0, "", "", 0, doc.chieuDi, doc.chieuVe)
    );

    return busRoutes;
  }
}

export default Bus;
