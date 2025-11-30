import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import logger from "../logger.js";
import "dotenv/config"
import {body, validationResult} from "express-validator";

import connectToDatabase from "../models/db.js";
const JWT_SECRET = process.env.secret_key;


router.post(
    "/register",
    [
        body("firstName")
            .trim()
            .notEmpty().withMessage("First name is required"),
        body("lastName")
            .trim()
            .notEmpty().withMessage("Last name is required"),
        body("email")
            .isEmail().withMessage("Valid email is required")
            .normalizeEmail(),
        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error("Validation failed in register user")
            return res.status(400).json({ errors: errors.array() });
        }
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

router.put("/update", async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error("Validation failed in update user")
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const email = req.headers.email;
        if(!email) {
            logger.error("Email not found in request headers")
            return res.status(400).json({ message: "Email not found in request headers" });
        }

        const db = await connectToDatabase();
        const collection = db.collection("users");
        const existingUser = await collection.findOne({ email: email });
        if (!existingUser) {
            logger.error("User not found")
            return res.status(404).json({ message: "User not found" });
        }

        let updates = {}

        if (req.body.firstName) updates.firstName = req.body.firstName;
        if (req.body.lastName) updates.lastName = req.body.lastName;
        if (req.body.password) updates.password = req.body.password;
        updates.updatedAt = new Date();

        const updatedUser = await collection.findOneAndUpdate({ email }, { $set: updates }, { returnDocument: "after" });

        const payload = {
            user: {
                id: updatedUser._id.toString()
            }
        }
        const authToken = jwt.sign(payload, JWT_SECRET)
        logger.info("User updated successfully")
        res.json({authToken, updatedUser});

    } catch (e) {
        logger.error(e);
        res.status(500).json({ message: "Internal error" });
    }
})

export default router;
