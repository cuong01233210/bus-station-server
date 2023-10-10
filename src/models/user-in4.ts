import { ObjectId, Db, Double } from "mongodb";
import { UsersDatabase } from "../databases/users-database";
class User {
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

  static async createAccount(userId: string) {
    const db: Db = UsersDatabase.getDb();
    await db.collection("users").insertOne({ ...this });
    const users = await User.getUserIn4(userId);
    return users;
  }
  static empty = new User("", "", "", "", "", "");

  static async getUserIn4(userId: string) {
    const db: Db = UsersDatabase.getDb();
    const document = await db.collection("users").findOne({ userId: userId });
    if (document != null) {
      return new User(
        document.userId,
        document.name,
        document.sex,
        document.dateOfBirth,
        document.phoneNumber,
        document.email
      );
    } else return User.empty;
  }

  async updateUserIn4(userId: string) {
    const db: Db = UsersDatabase.getDb();
    await db.collection("users").updateOne(
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
    const users = await User.getUserIn4(userId);
    return users;
  }
}
export default User;
