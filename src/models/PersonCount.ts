import { Schema, model, Document } from "mongoose";

export interface IPersonCount extends Document {
  timestamp: Date;
  sensorType: string;
  direction: string;
  location: string;
  detectedObject: string;
  counterValue: number;
  deviceId: string;
}

const PersonCountSchema = new Schema<IPersonCount>({
  timestamp: { type: Date, required: true },
  sensorType: { type: String, required: true },
  direction: { type: String, required: true },
  location: { type: String, required: true },
  detectedObject: { type: String, required: true },
  counterValue: { type: Number, required: true },
  deviceId: { type: String, required: true }
});

export const PersonCount = model<IPersonCount>('PersonCount', PersonCountSchema);