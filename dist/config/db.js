"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // carga las variables de entorno del .env
const connectDBMongo = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log("Conexión a MongoDB Atlas exitosa");
    }
    catch (error) {
        console.error("Error al conectar con MongoDB:", error);
    }
};
exports.default = connectDBMongo;
