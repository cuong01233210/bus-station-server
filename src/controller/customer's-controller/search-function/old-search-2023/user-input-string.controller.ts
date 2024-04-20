import { updateBus } from "./../../bus-controller";
import { InputRawIn4 } from "../../../../models/input-in4";
import { userStartStrings } from "./user-start-string-controller";

import { Request, Response } from "express";
import { StartIn4 } from "../../../../models/input-in4";
import { EndIn4 } from "../../../../models/input-in4";
import { InputIn4 } from "../../../../models/input-in4";

import { getLatLong } from "../new-search-2024/LocationIQ";

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

export async function convertInputData(
  startString: string,
  endString: string,
  userInputLat: number,
  userInputLong: number
): Promise<InputIn4> {
  // console.log(userId);
  // Find the user data in the array based on the provided userId
  // const userString = userStrings.find((user) => user.id === userId);
  const rawIn4: InputRawIn4 = {
    startString: "",
    endString: "",
  };
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
  };
  if (
    userInputLat !== 0 &&
    userInputLong !== 0 &&
    userInputLat != undefined &&
    userInputLong != undefined
  ) {
    startIn4.lat = userInputLat;
    startIn4.long = userInputLong;
    startIn4.name = "Vị trí hiện tại";
  } else {
    //startString = startString.concat(" ,Hà Nội, Việt Nam");
    let getGeo1 = await getLatLong(startString.concat(" ,Hà Nội, Việt Nam"));
    if (getGeo1.lat == 0) getGeo1 = await getLatLong(startString);
    startIn4.name = startString;
    startIn4.lat = getGeo1.lat;
    startIn4.long = getGeo1.long;
  }

  //endString = endString.concat(" ,Hà Nội, Việt Nam");
  let getGeo2 = await getLatLong(endString.concat(" ,Hà Nội, Việt Nam"));
  endIn4.name = endString;
  if (getGeo2.lat == 0) {
    getGeo2 = await getLatLong(endString);
  }
  endIn4.lat = getGeo2.lat;
  endIn4.long = getGeo2.long;

  inputIn4.startIn4 = startIn4;
  inputIn4.endIn4 = endIn4;
  inputIn4.startIn4 = startIn4;
  inputIn4.endIn4 = endIn4;
  console.log("inputIn4: ", inputIn4);

  return inputIn4;
}
