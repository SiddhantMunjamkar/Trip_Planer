import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  name: string;
  lat: number;
  lng: number;
  category: string;
  tripId: string;
}

const PlaceSchema = new Schema<IPlace>({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  category: { type: String, default: 'attraction' },
  tripId: { type: String },
});

export default mongoose.model<IPlace>('Place', PlaceSchema);
