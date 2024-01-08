import { ObjectId, Db, Double } from "mongodb";
import { BusStationsDatabase } from "../databases/bus-stations-database";
class BusStation {
  id?: string;
  name: string;
  bus: Array<string>;
  lat: Double;
  long: Double;
  district: string;

  constructor(
    name: string,
    bus: Array<string>,
    lat: Double,
    long: Double,
    district: string,
    id?: string
  ) {
    this.name = name;
    this.bus = bus;
    this.lat = lat;
    this.long = long;
    this.district = district;
    this.id = id;
  }

  static async getBusStationIn4() {
    const db: Db = BusStationsDatabase.getDb();
    console.log(db);
    const documents = await db.collection("busStations").find().toArray();
    // console.log(documents);

    const busStations: BusStation[] = documents.map(
      (doc) =>
        new BusStation(
          doc.name,
          doc.bus,
          doc.lat,
          doc.long,
          doc.district,
          doc._id.toString()
        )
    );
    //console.log(busStations);
    return busStations;
  }

  async createBusStation() {
    const db: Db = BusStationsDatabase.getDb();
    delete this.id;
    const result = await db.collection("busStations").insertOne(this);
    console.log(result);
  }

  async updateBusStation(id: string) {
    const db: Db = BusStationsDatabase.getDb();
    delete this.id;
    const result = await db.collection("busStations").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: this.name,
          bus: this.bus,
          lat: this.lat,
          long: this.long,
          district: this.district,
        },
      }
    );
    console.log(result);
  }

  async deleteBusStation(id: string) {
    const db: Db = BusStationsDatabase.getDb();
    const result = await db
      .collection("busStations")
      .deleteOne({ _id: new ObjectId(id) });
    console.log(result);
  }

  // lấy các trạm xe buýt theo mảng id truyền vào
  static async getStationsByIds(busStationIds: string[]) {
    const db: Db = BusStationsDatabase.getDb();
    const documents = await db
      .collection("busStations")
      .find({ _id: { $in: busStationIds.map((id) => new ObjectId(id)) } })
      .toArray();

    const busStations: BusStation[] = documents.map(
      (doc) =>
        new BusStation(
          doc.name,
          doc.bus,
          doc.lat,
          doc.long,
          doc.district,
          doc._id.toString()
        )
    );
    return busStations;
  }
}
export default BusStation;
