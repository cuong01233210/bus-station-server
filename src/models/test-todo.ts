import { TodoDatabase } from "../databases/todo-database";
import { ObjectId, Db } from "mongodb";

class Todo {
  id?: string;
  task: string;
  isDone: boolean;

  constructor(task: string, isDone: boolean, id?: string) {
    this.id = id;
    this.task = task;
    this.isDone = isDone;
  }

  async createTodo() {
    const db: Db = TodoDatabase.getDb();
    delete this.id;
    await db.collection("todos").insertOne({ ...this });
    const todos = await Todo.getTodos();
    return todos;
  }

  static async getTodos() {
    const db: Db = TodoDatabase.getDb();
    const documents = await db.collection("todos").find().toArray();

    const todos: Todo[] = documents.map(
      (doc) => new Todo(doc.task, doc.isDone, doc._id.toString())
    );
    return todos;
  }
}
export default Todo;
