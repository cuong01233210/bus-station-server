import { ObjectId, Db } from "mongodb";
import { MongoClient } from "mongodb";
import { AppDatabase } from "../databases/app-database";
class Comment {
  id?: string;
  userId: string;
  suggestion: string;
  date: string;
  rating: number;
  // search ra getComment(userId) -> null -> createCommnet
  // else update comment array , comment array + 1 element

  constructor(
    userId: string,
    suggestion: string,
    date: string,
    rating: number,
    id?: string
  ) {
    this.id = id;
    this.userId = userId;
    this.suggestion = suggestion;
    this.date = date;
    this.rating = rating;
  }

  async createComment(userId: string) {
    //const usersDb: Db = UsersDatabase.getDb();
    const db: Db = AppDatabase.getDb();
    delete this.id;

    // await usersDb.collection("comments").insertOne({ ...this });
    const insertOneResult = await db
      .collection("comments")
      .insertOne({ ...this });
    const userComments = await Comment.getComments(userId);
    return userComments;
  }

  static async getAllComments() {
    const usersDb: Db = AppDatabase.getDb();
    const documents = await usersDb.collection("comments").find().toArray();

    const userComments: Comment[] = documents.map(
      (doc) => new Comment(doc.userId, doc.suggestion, doc.date, doc.rating)
    );
    return userComments;
  }
  static async getComments(userId: string) {
    const usersDb: Db = AppDatabase.getDb();
    const documents = await usersDb
      .collection("comments")
      .find({ userId: userId })
      .toArray();

    const userComments: Comment[] = documents.map(
      (doc) => new Comment(doc.userId, doc.suggestion, doc.date, doc.rating)
    );
    return userComments;
  }

  async updateComments(
    userId: string,
    newSuggestion: string,
    newDate: string,
    newRating: number
  ) {
    const usersDb: Db = AppDatabase.getDb();

    await usersDb.collection("comments").updateOne(
      { _id: new ObjectId(this.id) },
      {
        $set: {
          comment: newSuggestion,
          date: newDate,
          rating: newRating,
        },
      }
    );
    const newUserComment = await Comment.getComments(userId);
    return newUserComment;
  }
}
export default Comment;
