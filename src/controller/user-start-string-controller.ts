import { Request, Response } from "express";
import UserStartString from "../models/user-start-string";

// use array for future has many user, one user has one id and one thread to solve the problem
export let userStartStrings: UserStartString[] = [
  {
    id: "1",
    startString: "",
  },
];

export const getUserStartString = (req: Request, res: Response) => {
  res.status(200).json({ userStartString: userStartStrings });
};

export async function updateUserStartString(req: Request, res: Response) {
  const { userStartStringID } = req.params;
  // console.log(userStartStringID);
  const { startString } = req.body;

  const index = userStartStrings.findIndex(
    (element) => element.id === userStartStringID
  );

  if (index !== -1) {
    userStartStrings[index].startString = startString;
    res.status(200).json({
      message: "updated successfully",
      userStartString: userStartStrings,
    });
  } else {
    res.status(404).json({ message: "User start string not found" });
  }
}
