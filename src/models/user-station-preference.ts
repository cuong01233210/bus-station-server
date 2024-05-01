import { AppDatabase } from "../databases/app-database";
class UserStationPreference {
  id?: string;
  userId: string;
  stationId: string;

  constructor(userId: string, stationId: string) {
    this.userId = userId;
    this.stationId = stationId;
  }

  async createUserStationPreference(userId: string) {
    const db = AppDatabase.getDb();
    await db.collection("userStationsPreference").insertOne({ ...this });
    const userStationPreference =
      await UserStationPreference.getUserStationPreference(userId);
    return userStationPreference;
  }

  static empty = new UserStationPreference("", "");

  static async getUserStationPreference(userId: string) {
    const db = AppDatabase.getDb();
    const documents = await db
      .collection("userStationsPreference")
      .find({ userId: userId })
      .toArray();

    const userStationPreferences: UserStationPreference[] = documents.map(
      (doc) => new UserStationPreference(doc.userId, doc.stationId)
    );

    return userStationPreferences;
  }

  static async deleteUserStationPreference(userId: string, stationId: string) {
    const db = AppDatabase.getDb();
    const result = await db
      .collection("userStationsPreference")
      .deleteMany({ userId: userId, stationId: stationId });

    return result.deletedCount; // returns the number of deleted documents
  }
}
export default UserStationPreference;
