import BusStationIn4 from "./bus-station-in4";
import { ObjectId, Db, Double } from "mongodb";
import { BusStationsDatabase } from "../databases/bus-stations-database";
class BusStationsByDistrict {
  id?: string;
  district: string;
  busStationIn4: Array<BusStationIn4>;

  constructor(
    district: string,
    busStationIn4: Array<BusStationIn4>,
    id?: string
  ) {
    this.district = district;
    this.busStationIn4 = busStationIn4;
    this.id = id;
  }

  static async getBusStationsByDistrictIn4(): Promise<BusStationsByDistrict[]> {
    const db: Db = BusStationsDatabase.getDb();
    const documents = await db
      .collection("busStationsByDistrict")
      .find()
      .toArray();

    const busStationsByDistrict: BusStationsByDistrict[] = documents.map(
      (doc) => ({
        id: doc._id.toString(),
        district: doc.district,
        busStationIn4: doc.busStationIn4.map((busStation: BusStationIn4) => ({
          name: busStation.name,
          bus: busStation.bus,
          lat: busStation.lat,
          long: busStation.long,
        })),
      })
    );

    return busStationsByDistrict;
  }
}
export default BusStationsByDistrict;
