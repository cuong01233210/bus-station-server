import { BusesDatabase } from "../databases/buses-database";
import { ObjectId, Db, Double } from "mongodb";

class Bus {
  id?: string;
  busName: string;
  price: Double;
  activityTime: string;
  timeInterval: string;
  chieuDi: Array<string>;
  chieuVe: Array<string>;

  constructor(
    busName: string,
    price: Double,
    activityTime: string,
    timeInterval: string,
    chieuDi: Array<string>,
    chieuVe: Array<string>,
    id?: string
  ) {
    this.busName = busName;
    this.price = price;
    this.activityTime = activityTime;
    this.timeInterval = timeInterval;
    this.chieuDi = chieuDi;
    this.chieuVe = chieuVe;
  }

  static async getBusIn4() {
    const db: Db = BusesDatabase.getDb();
    const documents = await db.collection("routes").find().toArray();
    // console.log(documents);

    const buses: Bus[] = documents.map(
      (doc) =>
        new Bus(
          doc.busName,
          doc.price,
          doc.activityTime,
          doc.timeInterval,
          doc.chieuDi,
          doc.chieuVe,
          doc._id.toString()
        )
    );
    //console.log(buses);
    return buses;
  }
}

export default Bus;
