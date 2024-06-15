import { ObjectId, Db } from "mongodb";
import { BusStationsDatabase } from "../databases/bus-stations-database";

class BusStation {
  id?: string;
  name: string;
  buses: string[];
  lat: number;
  long: number;

  constructor(
    name: string,
    buses: string[],
    lat: number,
    long: number,
    id?: string
  ) {
    this.name = name;
    this.buses = buses;
    this.lat = lat;
    this.long = long;
    this.id = id;
  }

  static async getBusStations() {
    const db: Db = BusStationsDatabase.getDb();

    await db.collection("busStations").createIndex({ name: 1 });

    const documents = await db
      .collection("busStations")
      .find()
      .sort({ name: 1 })
      .toArray();
    // console.log("Documents in busStations collection:", documents);

    const busStations: BusStation[] = documents.map(
      (doc) =>
        new BusStation(
          doc.name,
          doc.buses,
          doc.lat,
          doc.long,
          doc._id.toString()
        )
    );
    //.log(busStations);
    return busStations;
  }

  async createBusStation() {
    const db: Db = BusStationsDatabase.getDb();
    delete this.id;
    const result = await db.collection("busStations").insertOne(this);
    //console.log(result);
  }

  async updateBusStation(id: string) {
    const db: Db = BusStationsDatabase.getDb();
    delete this.id;
    const result = await db.collection("busStations").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: this.name,
          buses: this.buses, // Corrected from 'bus' to 'buses'
          lat: this.lat,
          long: this.long,
        },
      }
    );
    // console.log(result);
  }

  async deleteBusStation(id: string) {
    const db: Db = BusStationsDatabase.getDb();
    const result = await db
      .collection("busStations")
      .deleteOne({ _id: new ObjectId(id) });
    // console.log(result);
  }

  // Lấy các trạm xe buýt theo mảng id truyền vào
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
          doc.buses,
          doc.lat,
          doc.long,
          doc._id.toString()
        )
    );
    return busStations;
  }

  // Get a bus station by name
  static async getBusStationByName(stationName: string) {
    const db: Db = BusStationsDatabase.getDb();

    const document = await db
      .collection("busStations")
      .findOne({ name: stationName });

    if (!document) {
      throw new Error(`Bus station with name ${stationName} not found`);
    }

    return new BusStation(
      document.name,
      document.buses,
      document.lat,
      document.long,
      document._id.toString()
    );
  }
}

export default BusStation;
