import { MongoClient, Db } from "mongodb";

export class TodoDatabase {
  private static mongoClient: MongoClient;

  private constructor() {}

  static async initialize() {
    this.mongoClient = await MongoClient.connect(
      "mongodb+srv://cuong16102002:16102002@cluster0.syfnhhe.mongodb.net/todo?retryWrites=true&w=majority"
    );
  }

  static getDb() {
    //console.log(this.mongoClient.db());
    return this.mongoClient.db();
  }
}
