import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';
import aiRouter from './Router/aiRouter.js';
import authRouter from './Router/authRouter.js';


const app = express(); 


const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // for log management


app.use('/auth/user', authRouter);
app.use('/api/v1/user', aiRouter);

app.get('/', (req, res) => {
    res.send("hello Briefly");
})

app.all('/{*path}', (req, res) => {
  res.status(404).send('oops! 404 page not found.');
})

app.use(errorMiddleware); // generic middleware for error handling.

export default app;