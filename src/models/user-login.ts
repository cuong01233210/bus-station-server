import { LoginDbs } from "../databases/user-login";
import { Db } from "mongodb";

class LoginUser {
  id?: string;
  name: string;
  email: string;
  password: string;

  constructor(name: string, email: string, password: string, id?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async createUser() {
    const db: Db = LoginDbs.getDb();
    // const documents1 = await db.collection("users").find().toArray();
    // const login1 = documents1.map(
    //   (doc) => new LoginUser(doc.name, doc.email, doc.password)
    // );
    // console.log(login1);
    delete this.id;
    const insertOneResult = await db.collection("users").insertOne({ ...this });
    // const db2: Db = LoginDbs.getDb();
    // const documents2 = await db.collection("users").find().toArray();
    // const login2 = documents2.map(
    //   (doc) => new LoginUser(doc.name, doc.email, doc.password)
    // );
    // console.log(login2);
    return insertOneResult.insertedId.toString();
  }
  static empty = new LoginUser("", "", "", "");

  static async getUser(email: string) {
    const db: Db = LoginDbs.getDb();
    const document = await db.collection("users").findOne({ email: email });
    console.log("user dang login", document);
    if (document != null) {
      return new LoginUser(
        document.name,
        document.email,
        document.password,
        document._id.toString()
      );
    } else return LoginUser.empty;
  }

  async updatePassword(email: string, newPassword: string) {
    const db: Db = LoginDbs.getDb();

    // Kiểm tra xem người dùng có tồn tại dựa trên email
    const user = await db.collection("users").findOne({ email: email });

    if (user) {
      // Người dùng tồn tại, cập nhật mật khẩu
      const updateResult = await db
        .collection("users")
        .updateOne({ email: email }, { $set: { password: newPassword } });

      if (updateResult.modifiedCount === 1) {
        // Cập nhật mật khẩu thành công
        return true;
      } else {
        // Cập nhật mật khẩu thất bại
        return false;
      }
    } else {
      // Người dùng không tồn tại
      return false;
    }
  }
}
export default LoginUser;
