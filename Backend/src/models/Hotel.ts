import mongoose, { Schema, Document } from 'mongoose';

export interface IHotel extends Document {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  price: number;
  tags: string[];
}

const HotelSchema = new Schema<IHotel>({
  placeId: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  rating: { type: Number, default: 3.5 },
  price: { type: Number, default: 100 },
  tags: [{ type: String }],
});

export default mongoose.model<IHotel>('Hotel', HotelSchema);
