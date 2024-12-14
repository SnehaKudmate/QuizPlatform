
const express = require('express');
const authRoutes = require('./Routes/authRoutes');
const dotenv= require('dotenv');
const { connectDB }=require('./config/db');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');

dotenv.config();
const app = express(); 
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(express.json());

app.use('/api/user', authRoutes);


app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});