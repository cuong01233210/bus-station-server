import axios from "axios";
import { Request, Response } from "express";
const address = "Chợ Ngọc Thuỵ";
const apiKey = "AIzaSyD_aa2r6r8WRRVHUpO8IU18gUD4evNmXt0";
const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  address
)}&key=${apiKey}`;
console.log(url);
export let lat = 0.0;
export let long = 0.0;
export let compoundCode = "";
export let district = "";
export function callGetUsersRoute(req: Request, res: Response) {
  //const url = "http://localhost:8000/test-geocoding";

  // Gửi yêu cầu GET đến route
  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      const results = data.results;
      if (results.length > 0) {
        const firstResult = results[0];
        const geometry = firstResult.geometry;
        const location = geometry.location;
        //const plusCode = firstResult.plus_code;
        compoundCode = firstResult.plus_code?.compound_code;
        const firstSpaceIndex = compoundCode.indexOf(" ");
        const modifiedCompoundCode =
          compoundCode.slice(0, firstSpaceIndex) +
          "," +
          compoundCode.slice(firstSpaceIndex + 1);
        const result = modifiedCompoundCode
          .split(",")
          .map((part) => part.trim());
        //console.log(result);
        district = result[1];
        lat = location.lat;
        long = location.lng;

        console.log(
          `Latitude: ${lat}, Longitude: ${long}, district: ${district}`
        );
        res.status(200).json({ lat: lat, long: long, district: district });
      }
    })
    .catch((error) => {
      console.error("Error retrieving geocode:", error);
      res.status(200).json({ message: "fail" });
    });
}
