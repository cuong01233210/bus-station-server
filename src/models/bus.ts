import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class Bus {
  bus: string;
  price: number;
  activityTime: string;
  gianCachChayXe: string;
  chieuDi: {
    name: string;
    bus: string[];
    lat: number;
    long: number;
  }[];
  chieuVe: {
    name: string;
    bus: string[];
    lat: number;
    long: number;
  }[];
  static empty: any;

  constructor(
    bus: string,
    price: number,
    activityTime: string,
    gianCachChayXe: string,
    chieuDi: {
      name: string;
      bus: string[];
      lat: number;
      long: number;
    }[],
    chieuVe: {
      name: string;
      bus: string[];
      lat: number;
      long: number;
    }[]
  ) {
    this.bus = bus;
    this.price = price;
    this.activityTime = activityTime;
    this.gianCachChayXe = gianCachChayXe;
    this.chieuDi = chieuDi;
    this.chieuVe = chieuVe;
  }

  static async getBusIn4() {
    const db: Db = BusesDatabase.getDb();
    const documents = await db.collection("routes").find().toArray();

    const buses: Bus[] = documents.map(
      (doc) =>
        new Bus(
          doc.bus,
          doc.price,
          doc.activityTime,
          doc.gianCachChayXe,
          doc.chieuDi,
          doc.chieuVe
        )
    );
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
          doc.chieuDi,
          doc.chieuVe
        )
    );

    return buses;
  }
}

export default Bus;
