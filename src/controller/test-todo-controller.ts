import { Request, Response } from "express";
import Todo from "../models/test-todo";
import { validationResult } from "express-validator";
import Bus from "../models/bus";

export const getAllTodos = async (req: Request, res: Response) => {
  try {
    const buses = await Bus.getBusIn4();
    console.log(buses);
  } catch (error) {}
  try {
    const todos = await Todo.getTodos();
    res.status(200).json({ message: "succesfully", todos: todos });
  } catch (error) {
    res.status(400).json({ message: "failed to load", error: error });
  }
};

export const addTodo = async (req: Request, res: Response) => {
  // const result = validationResult(req);
  // if (result.isEmpty()) {
  //   res.status(400).json({ message: "cannot add empty todo" });
  //   return;
  // }
  const task = req.body.task;
  const isDone = req.body.isDone;
  try {
    const todo = new Todo(task, isDone);
    const todos = await todo.createTodo();
    res.status(200).json({ message: "successfully", todos: todos });
  } catch (error) {}
};

export const updateTodo = (req: Request, res: Response) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    res.status(400).json({ message: "cannot add empty todo" });
    return;
  }
  const { todoId } = req.params;
  const task = req.body.task;
  const isDone = req.body.isDone;
};

export const deleteTodo = (req: Request, res: Response) => {
  const { todoId } = req.params;
};
