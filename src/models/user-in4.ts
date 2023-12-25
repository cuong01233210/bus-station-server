import { ObjectId, Db, Double } from "mongodb";
import { UsersDatabase } from "../databases/users-database";
class UserIn4 {
  userId: string;
  name: string;
  sex: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;

  constructor(
    userId: string,
    name: string,
    sex: string,
    dateOfBirth: string,
    phoneNumber: string,
    email: string
  ) {
    this.userId = userId;
    this.name = name;
    this.sex = sex;
    this.dateOfBirth = dateOfBirth;
    this.phoneNumber = phoneNumber;
    this.email = email;
  }

  async createAccount(userId: string) {
    const db: Db = UsersDatabase.getDb();
    await db.collection("informations").insertOne({ ...this });
    const users = await UserIn4.getUserIn4(userId);
    return users;
  }
  static empty = new UserIn4("", "", "", "", "", "");

  static async getUserIn4(userId: string) {
    const db: Db = UsersDatabase.getDb();
    const document = await db
      .collection("informations")
      .findOne({ userId: userId });
    if (document != null) {
      return new UserIn4(
        document.userId,
        document.name,
        document.sex,
        document.dateOfBirth,
        document.phoneNumber,
        document.email
      );
    } else return UserIn4.empty;
  }

  async updateUserIn4(userId: string) {
    const db: Db = UsersDatabase.getDb();
    await db.collection("informations").updateOne(
      { userId: new ObjectId(this.userId) },
      {
        $set: {
          userId: this.userId,
          name: this.name,
          sex: this.sex,
          dateOfBirth: this.dateOfBirth,
          phoneNumber: this.phoneNumber,
          email: this.email,
        },
      }
    );
    const users = await UserIn4.getUserIn4(userId);
    return users;
  }
}
export default UserIn4;
