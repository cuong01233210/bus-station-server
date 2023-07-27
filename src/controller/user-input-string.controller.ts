import { userStartStrings } from "./user-start-string-controller";
//import { getUserEndString } from './user-end-string-controller';
//mport { getUserStartString } from './user-start-string-controller';
//import { userStartStrings } from "./user-start-string-controller";
import { Request, Response } from "express";

import { convertIn4 } from "./test-geocoding-controller";
import BusStationsByDistrict from "../models/bus-stations-by-district";

interface UserString {
  id: String;
  startString: String;
  endString: String;
}
export let userStrings: UserString[] = [
  {
    id: "1",
    startString: "",
    endString: "",
  },
];
export const getUserString = async (req: Request, res: Response) => {
  //let convert = convertIn4(startString);
  //console.log(convert.lat);
  res.status(200).json({ userStrings: userStrings });
};
export const updateUserString = async (req: Request, res: Response) => {
  //const userId = req.params.userId;
  //const { userId, startString, endString } = req.body;
  const userId = req.body.id;
  const startString = req.body.startString;
  const endString = req.body.endString;
  // console.log(userId);
  // Find the user data in the array based on the provided userId
  const userString = userStrings.find((user) => user.id === userId);

  if (userString) {
    // Update the user data if found
    userString.startString = startString;
    let startString1 = startString;
    startString1 = startString1.concat(" Hà Nội, Việt Nam");
    startString1 += " Hà Nội";
    //console.log(startString1);
    let endString1 = endString;
    endString1 = endString1.concat(" Hà Nội, Việt Nam");
    endString1 += " Hà Nội";
    const busStationsByDistrict =
      await BusStationsByDistrict.getBusStationsByDistrictIn4();
    try {
      const convert = await convertIn4(startString1);
      if (convert.district.toLowerCase().includes("district")) {
        // Xoá xâu "District" khỏi "district" (không phân biệt chữ hoa/thường)
        convert.district = convert.district.replace(/district/gi, "").trim();
      }

      const busStationsWithSameDistrict = busStationsByDistrict.filter(
        (item) => item.district == convert.district
      );

      console.log(busStationsWithSameDistrict[0]);
      console.log({
        lat: convert.lat,
        long: convert.long,
        district: convert.district,
      });
    } catch (error) {
      console.error("Error converting address to LocationIn4:", error);
      // Handle error if needed
    }
    userString.endString = endString;

    try {
      const convert = await convertIn4(endString1);
      if (convert.district.toLowerCase().includes("district")) {
        // Xoá xâu "District" khỏi "district" (không phân biệt chữ hoa/thường)
        convert.district = convert.district.replace(/district/gi, "").trim();
      }
      const busStationsWithSameDistrict = busStationsByDistrict.filter(
        (item) => item.district == convert.district
      );

      console.log(busStationsWithSameDistrict[0]);
      console.log({
        lat: convert.lat,
        long: convert.long,
        district: convert.district,
      });
    } catch (error) {
      console.error("Error converting address to LocationIn4:", error);
    }
    // console.log("success");
    res
      .status(200)
      .json({ message: "User data updated successfully", userString });
  } else {
    // If the user with the provided userId is not found, return an error
    res.status(404).json({ message: "User not found" });
  }
};
