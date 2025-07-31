import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import connectDBMongo from './config/db';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoute);

connectDBMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`El servidor funciona en el puerto: ${PORT}`);
  });
});
