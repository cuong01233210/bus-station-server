import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class BusInfo {
  bus: string;
  price: number;
  activityTime: string;
  gianCachChayXe: string;
  gianCachTrungBinh: number;
  static empty: any;

  constructor(
    bus: string,
    price: number,
    activityTime: string,
    gianCachChayXe: string,
    gianCachTrungBinh: number
  ) {
    this.bus = bus;
    this.price = price;
    this.activityTime = activityTime;
    this.gianCachChayXe = gianCachChayXe;
    this.gianCachTrungBinh = gianCachTrungBinh;
  }

  static async getAllBusInfos() {
    let startTime = performance.now();
    const db: Db = BusesDatabase.getDb();
    const documents = await db
      .collection("bus_infos")
      .find()
      .sort({ bus: 1 })
      .toArray();

    const busInfos: BusInfo[] = documents.map(
      (doc) =>
        new BusInfo(
          doc.bus,
          doc.price,
          doc.activityTime,
          doc.gianCachChayXe,
          doc.gianCachTrungBinh
        )
    );
    let endTime = performance.now();
    console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
    return busInfos;
  }

  static async getBusInfo(bus: string) {
    const db: Db = BusesDatabase.getDb();
    const document = await db.collection("bus_infos").findOne({ bus: bus });
    if (document != null) {
      return new BusInfo(
        document.bus,
        document.price,
        document.activityTime,
        document.gianCachChayXe,
        document.gianCachTrungBinh
      );
    } else return BusInfo.empty;
  }

  static async getUserBusInfosPreference(sbuses: string[]) {
    const db = BusesDatabase.getDb();
    const documents = await db
      .collection("bus_infos")
      .find({ bus: { $in: sbuses } })
      .toArray();

    const busInfos: BusInfo[] = documents.map(
      (doc) =>
        new BusInfo(
          doc.bus,
          doc.price,
          doc.activityTime,
          doc.gianCachChayXe,
          doc.gianCachTrungBinh
        )
    );

    return busInfos;
  }

  async createBusInfo() {
    const db: Db = BusesDatabase.getDb();
    await db.collection("bus_infos").insertOne({ ...this });
  }

  async updateBusInfo(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db
      .collection("bus_infos")
      .updateOne({ bus: bus }, { $set: { ...this } });
  }

  static async deleteBusInfo(bus: string) {
    const db: Db = BusesDatabase.getDb();
    await db.collection("bus_infos").deleteOne({ bus: bus });
  }
}

export default BusInfo;
