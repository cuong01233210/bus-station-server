import { Request, Response } from "express";
import UserStartString from "../../../../models/user-start-string";
import { convertIn4 } from "../new-search-2024/test-geocoding-controller";

// use array for future has many user, one user has one id and one thread to solve the problem
export let userStartStrings: UserStartString[] = [
  {
    id: "1",
    startString: "",
  },
];
let startString1 = "";
export const getUserStartString = (req: Request, res: Response) => {
  //let convert = convertIn4(startString);
  //console.log(convert.lat);
  res.status(200).json({ userStartString: userStartStrings });
};

export async function updateUserStartString(req: Request, res: Response) {
  const { userStartStringID } = req.params;
  // console.log(userStartStringID);
  const { startString } = req.body;

  const index = userStartStrings.findIndex(
    (element) => element.id === userStartStringID
  );

  if (index !== -1) {
    userStartStrings[index].startString = startString;
    startString1 = startString;
    startString1 = startString1.concat(" Hà Nội, Việt Nam");
    //console.log(startString1);

    try {
      const convert = await convertIn4(startString1);
      if (convert.district.toLowerCase().includes("district")) {
        // Xoá xâu "District" khỏi "district" (không phân biệt chữ hoa/thường)
        convert.district = convert.district.replace(/district/gi, "").trim();
      }
      console.log({
        lat: convert.lat,
        long: convert.long,
        district: convert.district,
      });
    } catch (error) {
      console.error("Error converting address to LocationIn4:", error);
      // Handle error if needed
    }
    res.status(200).json({
      message: "updated successfully",
      userStartString: userStartStrings,
    });
  } else {
    res.status(404).json({ message: "User start string not found" });
  }
}
