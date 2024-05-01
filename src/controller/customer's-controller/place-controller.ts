import { Request, Response } from "express";
import Place from "../../models/place";

function categorizePlaces(places: Place[]) {
  const stations: Place[] = [];
  const schools: Place[] = [];
  const hospitals: Place[] = [];
  const markets: Place[] = [];
  const bookstores: Place[] = [];
  const parks: Place[] = [];
  const pagodas: Place[] = [];
  const museums: Place[] = [];
  const diffPlaces: Place[] = [];

  places.forEach((place) => {
    if (place.category == "Bến xe - Nhà ga") {
      stations.push(place);
    }
    if (place.category == "Cơ sở giáo dục") {
      schools.push(place);
    }
    if (place.category == "Bệnh viện") {
      hospitals.push(place);
    }
    if (place.category == "Chợ - Siêu thị") {
      markets.push(place);
    }
    if (place.category == "Nhà sách") {
      bookstores.push(place);
    }
    if (place.category == "Công viên") {
      parks.push(place);
    }
    if (place.category == "Cơ sở tôn giáo") {
      pagodas.push(place);
    }
    if (place.category == "Bảo tàng") {
      museums.push(place);
    }
    if (place.category == "Khác") {
      diffPlaces.push(place);
    }
  });

  return {
    stations,
    schools,
    hospitals,
    markets,
    bookstores,
    parks,
    pagodas,
    museums,
    diffPlaces,
  };
}
export const getPlaces = async (req: Request, res: Response) => {
  try {
    const places = await Place.getPlaces();
    const {
      stations,
      schools,
      hospitals,
      markets,
      bookstores,
      parks,
      pagodas,
      museums,
      diffPlaces,
    } = categorizePlaces(places);
    res.status(200).json({
      places: places,
      stations: stations,
      schools: schools,
      hospitals: hospitals,
      markets: markets,
      bookstores: bookstores,
      parks: parks,
      pagodas: pagodas,
      museums: museums,
      diffPlaces: diffPlaces,
    });
  } catch (error) {
    res.status(400).json({ message: "failed to load" });
  }
};
