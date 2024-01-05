// class to connect to the userBusesPreference collection in the database

import { UsersDatabase } from "../databases/users-database";

class UserBusPreference {
  id?: string;
  userId: string;
  bus: string;

  constructor(userId: string, bus: string) {
    this.userId = userId;
    this.bus = bus;
  }

  async createUserBusPreference(userId: string) {
    const db = UsersDatabase.getDb();
    await db.collection("userBusesPreference").insertOne({ ...this });
    const userBusesPreference = await UserBusPreference.getUserBusesPreference(
      userId
    );
    return userBusesPreference;
  }

  static empty = new UserBusPreference("", "");

  static async getUserBusesPreference(userId: string) {
    const db = UsersDatabase.getDb();
    const documents = await db
      .collection("userBusesPreference")
      .find({ userId: userId })
      .toArray();

    const userBusesPreferences: UserBusPreference[] = documents.map(
      (doc) => new UserBusPreference(doc.userId, doc.bus)
    );

    return userBusesPreferences;
  }

  static async deleteUserBusPreference(userId: string, bus: string) {
    const db = UsersDatabase.getDb();
    const result = await db
      .collection("userBusesPreference")
      .deleteMany({ userId: userId, bus: bus });

    return result.deletedCount; // returns the number of deleted documents
  }
}

export default UserBusPreference;
