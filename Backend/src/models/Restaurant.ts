import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  price: number;
  cuisine: string;
  tags: string[];
}

const RestaurantSchema = new Schema<IRestaurant>({
  placeId: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  rating: { type: Number, default: 3.5 },
  price: { type: Number, default: 20 },
  cuisine: { type: String, default: 'local' },
  tags: [{ type: String }],
});

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
