import mongoose, { Schema, model, Document } from "mongoose";

export interface IAccessEvent extends Document {
  userId: mongoose.Types.ObjectId;
  userName?: string;
  cardId: string;
  doorId: string;
  doorName?: string;
  timestamp: Date;
  status?: string;
}

const AccessEventSchema = new Schema<IAccessEvent>({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  cardId:   { type: String, required: true },
  doorId:   { type: String },
  doorName: { type: String },
  timestamp:{ type: Date,   default: Date.now },
  status:   { type: String }
});

export const AccessEvent = model<IAccessEvent>("Access_Event", AccessEventSchema);
