import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // carga las variables de entorno del .env

const connectDBMongo = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }
  
  try {
    await mongoose.connect(mongoUri);
    console.log("Conexión a MongoDB Atlas exitosa");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
  }
};

export default connectDBMongo;
