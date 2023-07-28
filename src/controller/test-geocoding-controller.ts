import axios from "axios";

interface LocationIn4 {
  lat: number;
  long: number;
  district: string;
}

export async function convertIn4(address: string): Promise<LocationIn4> {
  const ans: LocationIn4 = {
    lat: 0.0,
    long: 0.0,
    district: "ha noi",
  };
  let compoundCode = "";
  const apiKey = "AIzaSyD7cbZWKU14bbQl9qv1G62kSH2gyyo8i0g";
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
    console.error("Error retrieving geocode:", error);
    // throw error;
    // chỗ này xử lý trường hợp định dạng json của link lại biến đổi
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
  const apiKey = "AIzaSyD7cbZWKU14bbQl9qv1G62kSH2gyyo8i0g";
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lng1}&destination=${lat2},${lng2}&key=${apiKey}`;

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
    }
  } catch (error) {
    console.error("Error retrieving directions:", error);
  }

  return 100000000;
}
