import { Request, Response } from "express";
import Comment from "../../models/user-comment";
export async function readComments(req: Request, res: Response) {
  try {
    const allComments = await Comment.getAllComments();
    console.log(allComments);
    res.status(200).json({ comments: allComments });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching comments" });
  }
}
