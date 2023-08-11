import { userStartStrings } from "./user-start-string-controller";
//import { getUserEndString } from './user-end-string-controller';
//mport { getUserStartString } from './user-start-string-controller';
//import { userStartStrings } from "./user-start-string-controller";
import { Request, Response } from "express";

import { convertIn4 } from "./test-geocoding-controller";
import BusStationsByDistrict from "../models/bus-stations-by-district";

export interface UserString {
  id: string;
  startString: string;
  endString: string;
  userKm: number;
}
export let userStrings: UserString[] = [
  {
    id: "1",
    startString: "",
    endString: "",
    userKm: 0,
  },
];

export interface StartIn4 {
  name: string;
  district: string;
  lat: number;
  long: number;
}

export interface EndIn4 {
  name: string;
  district: string;
  lat: number;
  long: number;
}

export interface InputIn4 {
  startIn4: StartIn4;
  endIn4: EndIn4;
  userKm: number;
}

export async function updateUserString2(
  userId: string,
  startString: string,
  endString: string,
  userKm: number
): Promise<InputIn4> {
  // console.log(userId);
  // Find the user data in the array based on the provided userId
  const userString = userStrings.find((user) => user.id === userId);

  let startIn4: StartIn4 = {
    name: "",
    district: "",
    lat: 0.0,
    long: 0.0,
  };
  let endIn4: EndIn4 = {
    name: "",
    district: "",
    lat: 0.0,
    long: 0.0,
  };
  let inputIn4: InputIn4 = {
    startIn4: startIn4,
    endIn4: endIn4,
    userKm: 0,
  };
  if (userString) {
    // Update the user data if found
    userString.userKm = userKm;
    userString.startString = startString;
    let startString1 = startString;
    startString1 = startString1.concat(" Hà Nội, Việt Nam");
    startString1 += " Hà Nội";
    //console.log(startString1);
    let endString1 = endString;
    endString1 = endString1.concat(" Hà Nội, Việt Nam");
    endString1 += " Hà Nội";

    try {
      const convert = await convertIn4(startString1);
      if (convert.district.toLowerCase().includes("district")) {
        // Xoá xâu "District" khỏi "district" (không phân biệt chữ hoa/thường)
        convert.district = convert.district.replace(/district/gi, "").trim();
      }

      // const busStationsWithSameDistrict = busStationsByDistrict.filter(
      //   (item) => item.district == convert.district
      // );

      //  console.log(busStationsWithSameDistrict[0]);
      startIn4.name = startString;
      startIn4.district = convert.district;
      startIn4.lat = convert.lat;
      startIn4.long = convert.long;

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
      // const busStationsWithSameDistrict = busStationsByDistrict.filter(
      //   (item) => item.district == convert.district
      // );

      // console.log(busStationsWithSameDistrict[0]);
      endIn4.name = endString;
      endIn4.district = convert.district;
      endIn4.lat = convert.lat;
      endIn4.long = convert.long;

      console.log({
        lat: convert.lat,
        long: convert.long,
        district: convert.district,
      });

      inputIn4.userKm = userKm;
      inputIn4.startIn4 = startIn4;
      inputIn4.endIn4 = endIn4;
    } catch (error) {
      console.error("Error converting address to LocationIn4:", error);
    }
    //return inputIn4;
    // console.log("success");
  } else {
    // If the user with the provided userId is not found, return an error
    console.log("error");
  }
  return inputIn4;
}
