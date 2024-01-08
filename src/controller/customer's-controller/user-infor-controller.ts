import { Request, Response } from "express";
import UserIn4 from "../../models/user-in4";

export const getUserInfor = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  console.log(userId);
  try {
    const userIn4 = await UserIn4.getUserIn4(userId);
    console.log("userIn4: ", userIn4);
    res.status(200).json({
      name: userIn4.name,
      sex: userIn4.sex,
      dateOfBirth: userIn4.dateOfBirth,
      phoneNumber: userIn4.phoneNumber,
      email: userIn4.email,
    });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};

export const updateUserInfor = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  // const userIn4 = req.body.userIn4;
  const name = req.body.name;
  const sex = req.body.sex;
  const dateOfBirth = req.body.dateOfBirth;
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;
  // console.log("da vao trong ham update user in4");
  // console.log(userId);
  // // console.log(userIn4);
  // console.log(name);
  // console.log(sex);
  // console.log(dateOfBirth);
  // console.log(phoneNumber);
  // console.log(email);

  const userIn4 = new UserIn4(
    userId,
    name,
    sex,
    dateOfBirth,
    phoneNumber,
    email
  );
  try {
    const user = await userIn4.updateUserIn4(userId);
    console.log(user);
    res.status(200).json({ message: "Successfully updated" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to update" });
  }
};

// export const updateTodo = async (req: Request, res: Response) => {
//   const result = validationResult(req);

//   if (!result.isEmpty()) {
//     res.status(400).json({ message: "can't add empty todo" });
//     return;
//   }
//   const { todoId } = req.params;
//   const { task, isDone } = req.body;
//   const userId = res.locals.userId;
//   const todo = new Todo(userId, task, isDone, todoId);
//   try {
//     const todos = await todo.updateTodo(userId);
//     res.status(200).json({ message: "Successfully updated", todos: todos });
//   } catch (error) {
//     res.status(400).json({ message: "failed to edit" });
//   }
// };
