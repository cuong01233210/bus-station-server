import Comment from "../models/user-comment";

import { Request, Response } from "express";

export async function addComment(req: Request, res: Response) {
  const userId = res.locals.userId;
  const suggestion = req.body.suggestion;
  const rating = req.body.rating;

  const date = new Date().toLocaleString();

  try {
    const comment = new Comment(userId, suggestion, date, rating);
    // const comments = Comment.getComments("1");
    const comments = await comment.createComment(userId);
    console.log(comments);
    res
      .status(200)
      .json({
        suggestion: comments[0].suggestion,
        date: comments[0].date,
        rating: comments[0].rating,
      });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }

  //res.send(`Thời gian khi bạn gửi yêu cầu: ${currentTime}`);
}
