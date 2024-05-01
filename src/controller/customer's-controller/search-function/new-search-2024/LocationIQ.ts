import NodeGeocoder, { Options } from "node-geocoder";
import { Request, Response } from "express";
import LatLong from "../../../../models/lat-long";
import axios from "axios";
const options: Options = {
  provider: "locationiq",
  apiKey: "pk.f9d511f00dc9fe72f59065eb39ef79e5",
  formatter: null,
};
const APIKEY = "pk.f9d511f00dc9fe72f59065eb39ef79e5";
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

export async function getLatLong(location: string): Promise<LatLong> {
  const geocoder = NodeGeocoder(options);

  try {
    const response = await geocoder.geocode(location);

    if (
      response[0].latitude !== undefined &&
      response[0].longitude !== undefined
    ) {
      const latlong: LatLong = {
        lat: response[0].latitude,
        long: response[0].longitude,
      };

      return latlong;
    } else {
      const latLong: LatLong = {
        lat: 0,
        long: 0,
      };

      return latLong;
    }
  } catch (err) {
    console.error(err);

    const latLong: LatLong = {
      lat: 0,
      long: 0,
    };

    return latLong;
  }
}

export async function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  try {
    const url = `https://us1.locationiq.com/v1/directions/driving/${lon1},${lat1};${lon2},${lat2}?key=${APIKEY}&steps=true&alternatives=true&geometries=polyline&overview=full&`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.error) {
      console.error("Error:", data.error);
      return 0;
    } else {
      const distance = data.routes[0].distance;
      return distance;
    }
  } catch (error) {
    console.log("Error:");
    return 0;
  }
}
