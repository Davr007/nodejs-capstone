import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import logger from './logger.js'
import expressPinoLogger from 'express-pino-logger'
const expressPino = expressPinoLogger({logger})
import natural from 'natural'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(expressPino);

// Define the sentiment analysis route
// Task 3: create the POST /sentiment analysis
app.post('/sentiment', async (req, res) => {

    // Task 4: extract the sentence parameter
    const { sentence } = req.query;

    if (!sentence) {
        logger.error('No sentence provided');
        return res.status(400).json({ error: 'No sentence provided' });
    }

    // Initialize the sentiment analyzer with the Natural's PorterStemmer and "English" language
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn");

    // Perform sentiment analysis
    try {
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        let sentiment = "neutral";

         if (analysisResult < 0) {
             sentiment = "negative";
         } else if (analysisResult > 0.33) {
             sentiment = "positive";
         }

        logger.info(`Sentiment analysis result: ${analysisResult}`);

        res.status(200).json({'message': `Sentiment analysis result: ${analysisResult}, ${sentiment}`})
    } catch (error) {
        logger.error(`Error performing sentiment analysis: ${error}`);
        res.status(500).json({'message': 'Error performing sentiment analysis'})
    }
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
