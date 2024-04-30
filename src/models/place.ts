import { AppDatabase } from "../databases/app-database";
class Place {
  id?: string;
  name: string;
  category: string;
  lat: number;
  long: number;

  constructor(name: string, category: string, lat: number, long: number) {
    this.name = name;
    this.category = category;
    this.lat = lat;
    this.long = long;
  }

  static async getPlaces() {
    const db = AppDatabase.getDb();
    const documents = await db.collection("places").find().toArray();
    const places: Place[] = documents.map(
      (doc) => new Place(doc.name, doc.category, doc.lat, doc.long)
    );
    return places;
  }
}
export default Place;
