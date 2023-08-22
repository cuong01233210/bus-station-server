import axios from "axios";

interface LocationIn4 {
  lat: number;
  long: number;
  district: string;
}
let API_KEY = "AIzaSyBPEI1knB3WaJr0gBlYTBdmpS4CnPchSGc";
export async function convertIn4(address: string): Promise<LocationIn4> {
  const ans: LocationIn4 = {
    lat: 0.0,
    long: 0.0,
    district: "ha noi",
  };
  let compoundCode = "";
  const apiKey = API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  console.log(url);
  try {
    const response = await axios.get(url);
    const data = response.data;
    const results = data.results;
    if (results.length > 0) {
      const firstResult = results[0];
      const geometry = firstResult.geometry;
      const location = geometry.location;
      compoundCode = firstResult.plus_code?.compound_code;
      const firstSpaceIndex = compoundCode.indexOf(" ");
      const modifiedCompoundCode =
        compoundCode.slice(0, firstSpaceIndex) +
        "," +
        compoundCode.slice(firstSpaceIndex + 1);
      const result = modifiedCompoundCode.split(",").map((part) => part.trim());
      ans.district = result[1];
      ans.lat = location.lat;
      ans.long = location.lng;
    }
    return ans;
  } catch (error) {
    //console.error("Error retrieving geocode1:", error);
    // throw error;
    // chỗ này xử lý trường hợp định dạng json của link lại biến đổi
    try {
      const response = await axios.get(url);
      const data = response.data;
      const results = data.results;
      if (results.length > 0) {
        const firstResult = results[0];
        const district = firstResult.address_components[1].long_name;
        const lat = firstResult.geometry.location.lat;
        const long = firstResult.geometry.location.lng;

        ans.district = district;
        ans.lat = lat;
        ans.long = long;
      }
      return ans;
      // console.log(results);
    } catch (error) {
      console.error("Error retrieving geocode2:", error);
    }
    return ans;
  }
}

// Hàm lấy thông tin về đường đi giữa hai điểm A và B
export async function getDirectionsAndDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<number> {
  const apiKey = API_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lng1}&destination=${lat2},${lng2}&key=${apiKey}`;

  console.log("distance url");
  console.log(url);
  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.routes.length > 0) {
      const route = data.routes[0];
      const distanceInMeters = route.legs.reduce(
        (sum: number, leg: any) => sum + leg.distance.value,
        0
      );
      return distanceInMeters;
    } else {
      console.log(data);
      return 999999;
    }
  } catch (error) {
    console.error("Error retrieving directions:", error);
    return 100000000;
  }
}
