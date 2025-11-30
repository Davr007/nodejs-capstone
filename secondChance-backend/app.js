/*jshint esversion: 8 */
import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';

import logger from './logger.js';
import connectToDatabase from './models/db.js';
import {loadData} from "./util/import-mongo/index.js";

import secondChanceItemsRoutes from './routes/secondChanceItemsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import authRoutes from './routes/authRoutes.js';


const app = express();
app.use("*",cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const port = 3070;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    return loadData();
}).then(() => {
    logger.info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));

// Route files
app.use('/api/auth', authRoutes)
app.use('/api/secondchance/items', secondChanceItemsRoutes);
app.use('/api/secondchance/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
