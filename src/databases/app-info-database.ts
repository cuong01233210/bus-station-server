import { MongoClient, Db } from "mongodb";

export class AppInfoDatabase {
  private static mongoClient: MongoClient;

  private constructor() {}

  static async initialize() {
    this.mongoClient = await MongoClient.connect(
      "mongodb+srv://findBusStation2:flqOFCtNjd7A6lDH@cluster0.qoqmjli.mongodb.net/App-info?retryWrites=true&w=majority"
    );
  }

  static getDb() {
    return this.mongoClient.db();
  }
}
