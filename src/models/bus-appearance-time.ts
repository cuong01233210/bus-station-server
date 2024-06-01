import { BusAppearanceDatabase } from "./../databases/bus-appearance-time-database";
import { ObjectId, Db, Double } from "mongodb";

class BusAppearance {
  id?: string;
  stationName: string;
  appearances: {
    route: string;
    tArray: {
      hour: number;
      minute: number;
    }[];
  }[];

  constructor(
    stationName: string,
    appearances: {
      route: string;
      tArray: {
        hour: number;
        minute: number;
      }[];
    }[],
    id?: string
  ) {
    this.stationName = stationName;
    this.appearances = appearances;
    this.id = id;
  }

  async createStationTime(stationName: string) {
    //const usersDb: Db = UsersDatabase.getDb();
    const db: Db = BusAppearanceDatabase.getDb();
    delete this.id;

    // await usersDb.collection("comments").insertOne({ ...this });
    const insertOneResult = await db
      .collection("busAppearanceTime")
      .insertOne({ ...this });
    const stationTime = await BusAppearance.getStationTime(stationName);
    return stationTime;
  }

  static async getAllStationTimes() {
    const usersDb: Db = BusAppearanceDatabase.getDb();
    const documents = await usersDb
      .collection("busAppearanceTime")
      .find()
      .toArray();

    const stationTimes: BusAppearance[] = documents.map(
      (doc) => new BusAppearance(doc.stationName, doc.appearances)
    );
    return stationTimes;
  }
  static async getStationTime(stationName: string) {
    const usersDb: Db = BusAppearanceDatabase.getDb();
    const documents = await usersDb
      .collection("busAppearanceTime")
      .find({ stationName: stationName })
      .toArray();

    const stationTimes: BusAppearance[] = documents.map(
      (doc) => new BusAppearance(doc.stationName, doc.appearances)
    );
    //console.log(stationTimes);
    return stationTimes[0];
  }

  static async getTArrayForStationAndRoute(stationName: string, route: string) {
    const usersDb: Db = BusAppearanceDatabase.getDb();

    const document = await usersDb
      .collection("busAppearanceTime")
      .findOne({ stationName: stationName });
    if (!document) {
      throw new Error(`Station with name ${stationName} not found`);
    }

    const appearance = document.appearances.find(
      (appearance: {
        route: string;
        tArray: { hour: number; minute: number }[];
      }) => appearance.route === route
    );

    if (!appearance) {
      throw new Error(`Route ${route} not found for station ${stationName}`);
    }

    return appearance.tArray;
  }

  async updateStationTime(
    stationName: string,
    appearances: {
      route: string;
      tArray: {
        hour: number;
        minute: number;
      }[];
    }[] = []
  ) {
    const usersDb: Db = BusAppearanceDatabase.getDb();

    await usersDb.collection("busAppearanceTime").updateOne(
      { stationName: stationName },
      {
        $set: {
          stationName: stationName,
          appearances: appearances,
        },
      }
    );
    const newStationTime = await BusAppearance.getStationTime(stationName);
    return newStationTime;
  }
}
export default BusAppearance;
