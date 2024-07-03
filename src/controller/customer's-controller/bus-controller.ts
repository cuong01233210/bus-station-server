import { Request, Response } from "express";
import Bus from "../../models/bus";

export const getAllBuses = async (req: Request, res: Response) => {
  try {
    const buses = await Bus.getBusIn4();
    // console.log(buses);
    res.status(200).json({ buses: buses });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};

export const getAllBusesByBusNameArray = async (
  req: Request,
  res: Response
) => {
  try {
    const sbuses = req.body.sbuses;
    console.log(sbuses);
    const buses = await Bus.getUserBusesPreferenceByBuses(sbuses);
    res.status(200).json({
      buses: buses.map((bus) => ({
        id: bus.id ? bus.id : "",
        bus: bus.bus,
        price: bus.price,
        activityTime: bus.activityTime,
        gianCachChayXe: bus.gianCachChayXe,
        gianCachTrungBinh: bus.gianCachTrungBinh,
        //   chieuDi: bus.chieuDi.map((di) => di.name),
        //  chieuVe: bus.chieuVe.map((ve) => ve.name),
      })),
    });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};
export const getAllBusNames = async (req: Request, res: Response) => {
  try {
    const buses = await Bus.getBusIn4();
    res.status(200).json({
      buses: buses.map((bus) => ({
        id: bus.id,
        bus: bus.bus,
        price: bus.price,
        activityTime: bus.activityTime,
        gianCachChayXe: bus.gianCachChayXe,
        gianCachTrungBinh: bus.gianCachTrungBinh,
        //   chieuDi: bus.chieuDi.map((di) => di.name),
        //  chieuVe: bus.chieuVe.map((ve) => ve.name),
      })),
    });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};

export const getOneBusRoute = async (req: Request, res: Response) => {
  //console.log(req.params.bus);
  try {
    const bus = await Bus.getOnlyOneBus(req.params.bus);
    res.status(200).json({
      chieuDi: bus.chieuDi,
      chieuVe: bus.chieuVe,
    });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};

export const createBus = async (req: Request, res: Response) => {
  try {
    const bus = new Bus(
      req.body.bus,
      req.body.price,
      req.body.activityTime,
      req.body.gianCachChayXe,
      req.body.gianCachTrungBinh,
      req.body.chieuDi,
      req.body.chieuVe
    );
    await bus.createBus();
    res.status(200).json({ message: "created" });
  } catch (error) {
    res.status(400).json({ message: "failed to create" });
  }
};

export const updateBus = async (req: Request, res: Response) => {
  try {
    const bus = new Bus(
      req.body.bus,
      req.body.price,
      req.body.activityTime,
      req.body.gianCachChayXe,
      req.body.gianCachTrungBinh,
      req.body.chieuDi,
      req.body.chieuVe
    );
    await bus.updateBus(req.body.bus);
    res.status(200).json({ message: "updated" });
  } catch (error) {
    res.status(400).json({ message: "failed to update" });
  }
};

export const deleteBus = async (req: Request, res: Response) => {
  try {
    //console.log(req.body.bus);
    await Bus.deleteBus(req.body.bus);
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(400).json({ message: "failed to delete" });
  }
};
