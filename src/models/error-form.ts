import { AppDatabase } from "./../databases/app-database";

import { ObjectId, Db } from "mongodb";

class ErrorForm {
  id?: string;
  source: string;
  destination: string;
  busName: string;
  time: string;
  date: string;
  errorDescription: string;
  static empty: ErrorForm = new ErrorForm("", "", "", "", "", "", "");

  constructor(
    source: string,
    destination: string,
    busName: string,
    time: string,
    date: string,
    errorDescription: string,
    id?: string
  ) {
    this.source = source;
    this.destination = destination;
    this.busName = busName;
    this.time = time;
    this.date = date;
    this.errorDescription = errorDescription;
    this.id = id;
  }

  static async getAllErrors() {
    let startTime = performance.now();
    const db: Db = AppDatabase.getDb();
    const documents = await db
      .collection("error_form")
      .find()
      .sort({ date: 1 })
      .toArray();

    const errors: ErrorForm[] = documents.map(
      (doc) =>
        new ErrorForm(
          doc.source,
          doc.destination,
          doc.busName,
          doc.time,
          doc.date,
          doc.errorDescription,
          doc._id.toString()
        )
    );
    let endTime = performance.now();
    console.log(`Thời gian đọc từ DB: ${endTime - startTime} milliseconds`);
    return errors;
  }

  static async getOneError(id: string) {
    const db: Db = AppDatabase.getDb();
    const document = await db
      .collection("error_form")
      .findOne({ _id: new ObjectId(id) });
    if (document != null) {
      return new ErrorForm(
        document.source,
        document.destination,
        document.busName,
        document.time,
        document.date,
        document.errorDescription,
        document._id.toString()
      );
    } else return ErrorForm.empty;
  }

  async createError() {
    const { id, ...errorData } = this; // Loại bỏ trường id
    const db: Db = AppDatabase.getDb();
    await db.collection("error_form").insertOne({ ...errorData });
  }

  async updateError(id: string) {
    const { id: errorId, ...errorData } = this; // Loại bỏ trường id
    const db: Db = AppDatabase.getDb();
    await db
      .collection("error_form")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...errorData } });
  }

  static async deleteError(id: string) {
    const db: Db = AppDatabase.getDb();
    await db.collection("error_form").deleteOne({ _id: new ObjectId(id) });
  }
}

export default ErrorForm;
