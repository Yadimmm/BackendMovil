import { Schema, model, Document } from "mongoose";

export interface IDoor extends Document {
  name: string;        
  state: "open" | "close"; 
}

const DoorSchema = new Schema<IDoor>({
  name: { 
    type: String, 
    required: true 
  },
  state: {
    type: String,
    enum: ["open", "close"],
    required: true,
    default: "close"
  }
}, { timestamps: true });

export const Door = model<IDoor>('Door', DoorSchema);

// cambios muy externos