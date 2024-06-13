"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const app_database_1 = require("../databases/app-database");
class Comment {
    // search ra getComment(userId) -> null -> createCommnet
    // else update comment array , comment array + 1 element
    constructor(userId, suggestion, date, rating, id) {
        this.id = id;
        this.userId = userId;
        this.suggestion = suggestion;
        this.date = date;
        this.rating = rating;
    }
    createComment(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            //const usersDb: Db = UsersDatabase.getDb();
            const db = app_database_1.AppDatabase.getDb();
            delete this.id;
            // await usersDb.collection("comments").insertOne({ ...this });
            const insertOneResult = yield db
                .collection("comments")
                .insertOne(Object.assign({}, this));
            const userComments = yield Comment.getComments(userId);
            return userComments;
        });
    }
    static getAllComments() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = app_database_1.AppDatabase.getDb();
            const documents = yield usersDb.collection("comments").find().toArray();
            const userComments = documents.map((doc) => new Comment(doc.userId, doc.suggestion, doc.date, doc.rating));
            return userComments;
        });
    }
    static getComments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = app_database_1.AppDatabase.getDb();
            const documents = yield usersDb
                .collection("comments")
                .find({ userId: userId })
                .toArray();
            const userComments = documents.map((doc) => new Comment(doc.userId, doc.suggestion, doc.date, doc.rating));
            return userComments;
        });
    }
    updateComments(userId, newSuggestion, newDate, newRating) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersDb = app_database_1.AppDatabase.getDb();
            yield usersDb.collection("comments").updateOne({ _id: new mongodb_1.ObjectId(this.id) }, {
                $set: {
                    comment: newSuggestion,
                    date: newDate,
                    rating: newRating,
                },
            });
            const newUserComment = yield Comment.getComments(userId);
            return newUserComment;
        });
    }
}
exports.default = Comment;
