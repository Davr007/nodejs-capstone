import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router();
import connectToDatabase from '../models/db.js';
import logger from '../logger.js';

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });
const db = await connectToDatabase();
const collection = db.collection("secondChanceItems");

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async(req, res,next) => {
    try {
        let secondChanceItem = req.body;
        const lastItem = await collection.find({}).sort({"id": -1}).limit(1).next();

        const newId = lastItem ? (parseInt(lastItem.id) + 1).toString() : "1";

        const dateAdded = Math.floor(new Date().getTime() / 1000);

        secondChanceItem.dateAdded = dateAdded;
        secondChanceItem.id = newId;

        secondChanceItem = await collection.insertOne(secondChanceItem);

        const insertedDoc = await collection.findOne({id: newId})

        res.status(201).json(insertedDoc);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({id: id});
        if(!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }
        res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', upload.single('file'), async(req, res,next) => {
    try {
        const id = req.params.id;
        const existing = await collection.findOne({id: id});

        if(!existing) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        const updates = {
            category: req.body.category,
            condition: req.body.condition,
            description: req.body.description,
            age_years: Number((existing.age_days/365).toFixed(1)),
            updatedAt: Math.floor(new Date().getTime() / 1000)
        }

        if (req.file) {
            updates.image = req.file.filename;
        }

        const updatePreLoveItem = await collection.findOneAndUpdate(
            {id: id},
            {$set: updates},
            {returnDocument: 'after'}
        );

        if (updatePreLoveItem) {
            res.json({"uploaded": "success"});
        } else {
            res.json({"uploaded": "failed"});
        }

    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({id: id});
        if(!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        await collection.deleteOne({id: id});
        res.json({"deleted": "success"});
    } catch (e) {
        next(e);
    }
});

export default router;
