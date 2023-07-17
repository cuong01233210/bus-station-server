import { BusStationsDatabase } from "./databases/bus-stations-database";
import express, { Application, NextFunction, Request, Response } from "express";

import { BusesDatabase } from "./databases/buses-database";
import { getAllBuses } from "./controller/bus-controller";
import busRouter from "./router/bus-router";

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
app.use("/", busRouter);
databaseInit();
async function databaseInit() {
  await BusesDatabase.initialize();
  await BusStationsDatabase.initialize();
  app.listen(8000);
}
// passDB: flqOFCtNjd7A6lDH

// mongodb+srv://findBusStation2:<password>@cluster0.qoqmjli.mongodb.net/
