// db.js
import 'dotenv/config'
import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;
import mongoose from 'mongoose'

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {

    if (dbInstance){
        return dbInstance
    }

    try {
        await mongoose.connect(url, {
            dbName: dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        dbInstance = mongoose.connection.db;

        return dbInstance

    } catch (e) {
        console.error(e)
    }



    // Task 1: Connect to MongoDB
    // {{insert code}}



    // Task 2: Connect to database giftDB and store in variable dbInstance
    //{{insert code}}

    // Task 3: Return database instance
    // {{insert code}}
}

export default connectToDatabase;
