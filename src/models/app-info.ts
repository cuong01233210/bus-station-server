import { ObjectId, Db, Double } from "mongodb";
import { AppInfoDatabase } from "../databases/app-info-database";

class AppInfo {
  id?: string;
  version: string;
  updated: string;
  content: string;
  constructor(version: string, updated: string, content: string) {
    this.version = version;
    this.updated = updated;
    this.content = content;
  }

  async createAppInfo() {
    const db: Db = AppInfoDatabase.getDb();
    delete this.id;
    await db.collection("app-info").insertOne({ ...this });
  }

  async updateAppInfo(id: string) {
    const db: Db = AppInfoDatabase.getDb();
    await db
      .collection("app-info")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...this } });
  }

  static async getAppInfo() {
    const db: Db = AppInfoDatabase.getDb();
    const documents = await db.collection("app-info").find().toArray();
    const appInfos: AppInfo[] = documents.map(
      (doc) => new AppInfo(doc.version, doc.updated, doc.content)
    );
    return appInfos;
  }
}
export default AppInfo;
