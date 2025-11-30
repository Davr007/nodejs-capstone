import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import logger from "../logger.js";
import "dotenv/config"

import connectToDatabase from "../models/db.js";
const JWT_SECRET = process.env.secret_key;


router.post("/register", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error("User already exists")
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email

        const newUser = await collection.insertOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            }
        };

        const authToken = jwt.sign(payload, JWT_SECRET)

        logger.info("User signed successfully")

        res.json({authToken, email});

    } catch (e) {
        logger.error("User registration failed")
        res.status(500).json({ message: "Internal error" });
    }
})


router.post("/login", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        const user = await collection.findOne({ email: req.body.email });

        if (user) {

            const isMatch = await bcryptjs.compare(req.body.password, user.password);
            if (!isMatch) {
                logger.error("User already exists")
            }

            const userName = user.firstName + " " + user.lastName;
            const email = user.email;
            const payload = {
                user: {
                    id: user._id.toString(),
                }
            }
            const authToken = jwt.sign(payload, JWT_SECRET)

            logger.info("User logged in successfully")
            res.json({authToken, userName, email});
        } else {
            logger.error("User not found")
            return res.status(404).json({ message: "User not found" });
        }

    } catch (e) {
        logger.error("User login failed")
        res.status(500).json({ message: "Internal error" });
    }
})

export default router;
