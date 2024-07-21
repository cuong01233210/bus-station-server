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

  async deleteBusStation(name: string) {
    const db: Db = BusStationsDatabase.getDb();
    const result = await db.collection("busStations").deleteOne({ name: name });
    // console.log(result);
  }

  // Lấy các trạm xe buýt theo mảng name truyền vào
  static async getStationsByNames(busStationNames: string[]) {
    console.log("da vao ham getStationsByNames");
    const db: Db = BusStationsDatabase.getDb();

    // Kiểm tra đầu vào
    console.log("Tên trạm đầu vào:", busStationNames);

    const documents = await db
      .collection("busStations")
      .find({ name: { $in: busStationNames } })
      .toArray();

    // Kiểm tra kết quả truy vấn
    console.log("Tài liệu từ cơ sở dữ liệu:", documents);

    const busStations: BusStation[] = documents.map(
      (doc) => new BusStation(doc.name, doc.buses, doc.lat, doc.long)
    );

    // Kiểm tra kết quả cuối cùng
    console.log("Các trạm xe buýt:", busStations);

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

  static async getBusStationsAsMap() {
    const db: Db = BusStationsDatabase.getDb();

    await db.collection("busStations").createIndex({ name: 1 });

    const documents = await db
      .collection("busStations")
      .find()
      .sort({ name: 1 })
      .toArray();

    const busStationMap: Map<string, BusStation> = new Map();
    documents.forEach((doc) => {
      const busStation = new BusStation(
        doc.name,
        doc.buses,
        doc.lat,
        doc.long,
        doc._id.toString()
      );
      busStationMap.set(doc.name, busStation);
    });

    return busStationMap;
  }
}

export default BusStation;
