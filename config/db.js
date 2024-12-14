const { MongoClient } = require('mongodb')
const dotenv = require('dotenv').config()
const uri = process.env.MONGO_URI;

let db;

const connectDB = async () => {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        await client.connect();
        db = client.db('QuizPlatform');
        console.log('Database connected')
    } catch (error) {
        console.log('Database error : ', error)
    }
};

const getDb = () => db;

module.exports = { getDb, connectDB }