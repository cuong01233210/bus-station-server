import { MongoClient, Db } from "mongodb";

export class UsersDatabase {
  private static mongoClient: MongoClient;

  private constructor() {}

  static async initialize() {
    try {
      this.mongoClient = await MongoClient.connect(
        "mongodb+srv://findBusStation2:flqOFCtNjd7A6lDH@cluster0.qoqmjli.mongodb.net/Users?retryWrites=true&w=majority"
      );
    } catch (error) {
      console.log(error);
    }
  }

  static getDb() {
    //console.log(this.mongoClient);
    return this.mongoClient.db();
  }
}
