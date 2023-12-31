import { BusStationsDatabase } from "./databases/bus-stations-database";
import express, { Application, NextFunction, Request, Response } from "express";

import { BusesDatabase } from "./databases/buses-database";
import { getAllBuses } from "./controller/customer's-controller/bus-controller";
import router from "./router/bus-router";
import authRouter from "./router/auth-router";
import { LoginDbs } from "./databases/user-login";
import { TodoDatabase } from "./databases/todo-database";
import { UsersDatabase } from "./databases/users-database";

const app: Application = express();

app.use(express.json());
// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log("first middleware");
//   next();
// });
// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log("second middleware");
//   next();
// });
//app.get("/xuatDB", getAllBuses);

app.use("/", router);
app.use("/auth", authRouter);
databaseInit();
async function databaseInit() {
  await BusesDatabase.initialize();
  await BusStationsDatabase.initialize();
  await LoginDbs.initialize();
  await UsersDatabase.initialize();
  await TodoDatabase.initialize();
  app.listen(8000);
}
// passDB: flqOFCtNjd7A6lDH

// mongodb+srv://findBusStation2:<password>@cluster0.qoqmjli.mongodb.net/
