import { Request, Response } from "express";
import UserEndString from "../../../../models/user-end-string";

// use array for future has many user, one user has one id and one thread to solve the problem
export let userEndStrings: UserEndString[] = [
  {
    id: "1",
    endString: "",
  },
];

export const getUserEndString = (req: Request, res: Response) => {
  res.status(200).json({ userEndString: userEndStrings });
};

export async function updateUserEndString(req: Request, res: Response) {
  const { userEndStringID } = req.params;
  //console.log(userStartStringID);
  const { endString } = req.body;

  const index = userEndStrings.findIndex(
    (element) => element.id === userEndStringID
  );

  if (index !== -1) {
    userEndStrings[index].endString = endString;
    res.status(200).json({
      message: "updated successfully",
      userEndString: userEndStrings[index].endString,
    });
  } else {
    res.status(404).json({ message: "User end string not found" });
  }
}
