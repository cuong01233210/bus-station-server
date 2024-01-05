import { Request, Response } from "express";
import Bus from "../../models/bus";

// export const getAllBuses = async (req: Request, res: Response) => {
//   try {
//     const buses = await Bus.getBusIn4();
//     // console.log(buses);
//     // làm thế nào để có thể lấy được thông tin các busStation nhưng mà chỉ là tên thôi
//     // cần phải response tất cả các buses như ví dụ dưới đây
//     // {"buses":[{"bus":"01","price":7000,"activityTime":"5h00 -> 21h00","gianCachChayXe":"10 -> 15 phút/chuyến","chieuDi":["Bến xe Gia Lâm", "Bến xe giáp bát"]
//     // ,"chieuVe":["Bến xe Gia Lâm", "Bến xe giáp bát"]},{"bus":"02","price":7000,"activityTime":"5h00 -> 21h00","gianCachChayXe":"10 -> 15 phút/chuyến","chieuDi":["Bến xe Gia Lâm", "Bến xe giáp bát"]
//     // code như nào để lấy được bây giờ

//     res.status(200).json({
//       buses: buses.map((bus) => ({
//         bus: bus.bus,
//         price: bus.price,
//         activityTime: bus.activityTime,
//         gianCachChayXe: bus.gianCachChayXe,
//         chieuDi: bus.chieuDi.map((di) => di.name),
//         chieuVe: bus.chieuVe.map((ve) => ve.name),
//       })),
//     });
//   } catch (error) {
//     res.status(400).json({ message: "failed to load" });
//   }
// };

export const getAllBuses = async (req: Request, res: Response) => {
  try {
    const buses = await Bus.getBusIn4();
    // console.log(buses);
    res.status(200).json({ buses: buses });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};

export const getAllBusNames = async (req: Request, res: Response) => {
  try {
    const buses = await Bus.getBusIn4();
    res.status(200).json({
      buses: buses.map((bus) => ({
        bus: bus.bus,
        price: bus.price,
        activityTime: bus.activityTime,
        gianCachChayXe: bus.gianCachChayXe,
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
      chieuDi: bus.chieuDi.map((di: { name: string }) => di.name),
      chieuVe: bus.chieuVe.map((ve: { name: string }) => ve.name),
    });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};
