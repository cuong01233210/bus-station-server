import { InputIn4 } from "./../../../../models/input-in4";
import { getLatLong } from "./LocationIQ";
import { StartIn4 } from "../../../../models/input-in4";
import { EndIn4 } from "../../../../models/input-in4";

export async function getLocationIn4(
  startString: string,
  endString: string
): Promise<InputIn4> {
  let startIn4: StartIn4 = {
    name: startString,
    district: "",
    lat: 0.0,
    long: 0.0,
  };

  let endIn4: EndIn4 = {
    name: endString,
    district: "",
    lat: 0.0,
    long: 0.0,
  };
  startString = startString.concat(" Hà Nội, Việt Nam");
  endString = endString.concat(" Hà Nội, Việt Nam");

  const getGeo1 = await getLatLong(startString);
  const getGeo2 = await getLatLong(endString);
  startIn4.name = startString;
  startIn4.lat = getGeo1.lat;
  startIn4.long = getGeo1.long;

  endIn4.name = endString;
  endIn4.lat = getGeo2.lat;
  endIn4.long = getGeo2.long;

  const inputInfo: InputIn4 = {
    startIn4: startIn4,
    endIn4: endIn4,
  };
  inputInfo.startIn4 = startIn4;
  inputInfo.endIn4 = endIn4;
  return inputInfo;
}
