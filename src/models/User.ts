import { Schema, model, Document, Types } from "mongoose";

// Interfaz TypeScript para tipar el usuario
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "admin" | "docente";
  firstName: string;
  lastName: string;
  cardId: string;
  status: boolean;
  doorOpenReminderMinutes: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  resetPasswordToken?: string; // Token para restablecer contraseña
  resetPasswordExpires?: Date; // Fecha de expiración del token
}

// Esquema de Mongoose
const userSchema = new Schema<IUser>(
  {
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email:    { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "docente"], 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    cardId: { 
        type: String, 
        required: false, 
        unique: true,
        sparse: true 
    },
    status: { 
        type: Boolean, 
        default: true 
    },
    doorOpenReminderMinutes: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },  
    lastLogin: { 
        type: Date 
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// exporta el modelo
export const User = model<IUser>("User", userSchema);
