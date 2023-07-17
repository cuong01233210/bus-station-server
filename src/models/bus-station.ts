import { ObjectId, Db, Double } from "mongodb";
import { BusStationsDatabase } from "../databases/bus-stations-database";
class BusStation {
  id: string;
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
    id: string
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

    const busStation: BusStation[] = documents.map(
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
    //console.log(buses);
    return busStation;
  }
}
export default BusStation;
