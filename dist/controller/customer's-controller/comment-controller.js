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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = void 0;
const user_comment_1 = __importDefault(require("../../models/user-comment"));
function addComment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = res.locals.userId;
        const suggestion = req.body.suggestion;
        const rating = req.body.rating;
        const date = new Date().toLocaleString();
        try {
            const comment = new user_comment_1.default(userId, suggestion, date, rating);
            // const comments = Comment.getComments("1");
            const comments = yield comment.createComment(userId);
            console.log(comments);
            res.status(200).json({
                suggestion: comments[0].suggestion,
                date: comments[0].date,
                rating: comments[0].rating,
            });
        }
        catch (error) {
            res.status(400).json({ message: "failed to load" });
        }
        //res.send(`Thời gian khi bạn gửi yêu cầu: ${currentTime}`);
    });
}
exports.addComment = addComment;
