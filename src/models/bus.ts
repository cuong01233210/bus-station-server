import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class Bus {
  bus: string;
  price: number;
  activityTime: string;
  gianCachChayXe: string;
  chieuDi: {
    stationName: string;
    hasBus: string[];
    lat: number;
    long: number;
  }[];
  chieuVe: {
    stationName: string;
    hasBus: string[];
    lat: number;
    long: number;
  }[];

  constructor(
    bus: string,
    price: number,
    activityTime: string,
    gianCachChayXe: string,
    chieuDi: {
      stationName: string;
      hasBus: string[];
      lat: number;
      long: number;
    }[],
    chieuVe: {
      stationName: string;
      hasBus: string[];
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
}

export default Bus;
