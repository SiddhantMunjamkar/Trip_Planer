import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  url: string;
  transcript: string;
  places: string[];
  activities: string[];
  vibes: string[];
  persona: {
    travelStyle: string;
    groupType: string;
    pace: string;
    days: number;
  };
  plans: {
    budget: object;
    comfort: object;
    luxury: object;
  };
  createdAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    url: { type: String, required: true },
    transcript: { type: String, default: '' },
    places: [{ type: String }],
    activities: [{ type: String }],
    vibes: [{ type: String }],
    persona: {
      travelStyle: String,
      groupType: String,
      pace: String,
      days: Number,
    },
    plans: {
      budget: Schema.Types.Mixed,
      comfort: Schema.Types.Mixed,
      luxury: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>('Trip', TripSchema);
