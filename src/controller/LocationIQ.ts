import NodeGeocoder, { Options } from "node-geocoder";
import { Request, Response } from "express";

const options: Options = {
  provider: "locationiq",
  apiKey: "pk.f9d511f00dc9fe72f59065eb39ef79e5",
  formatter: null,
};

export function testLocationIQ(req: Request, res: Response) {
  const geocoder = NodeGeocoder(options);

  const startLocation = req.body.strLocation;
  // Sử dụng geocode method để lấy tọa độ từ địa chỉ
  let lat1 = 0;
  let long1 = 0;
  geocoder
    .geocode("21 Lê Duẩn, Đà Nẵng")
    .then(function (response) {
      console.log(response[0].latitude);
      console.log(response[0].longitude);
      if (
        response[0].latitude !== undefined &&
        response[0].longitude !== undefined
      ) {
        const lat2 = response[0].latitude;
        const long2 = response[0].longitude;
        lat1 = lat2;
        long1 = long2;

        res.status(200).json({ lat: lat1, long: long1 });
        //
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}
