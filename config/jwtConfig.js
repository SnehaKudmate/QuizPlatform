const dotenv=require('dotenv')
dotenv.config(); 

const jwtConfig = {
    secret: process.env.JWT_SECRET || 'ERTY*&^%$KJg', 
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
};


module.exports = jwtConfig;


