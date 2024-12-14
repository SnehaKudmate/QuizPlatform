const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');


const User = {
    create: async (userData) => { 

        const db = getDb();
        try {
            return await db.collection('users').insertOne(userData);
        } catch (error) {
            throw new Error('Could not create user');
        }
    },

    findByUsername: async (userName) => {
        const db = getDb();
        try {
            return await db.collection('users').findOne({ username: userName });
        } catch (error) {
            throw new Error('Could not find user');
        }
    },

    findByEmail: async (email) => {
        const db = getDb();
        try {
            return await db.collection('users').findOne({ email: email });
        } catch (error) {
            throw new Error('Could not find user');
        }
    },

    findById: async (id) => {
        const db = getDb();
        const objectId = new ObjectId(id);
        try {
            return await db.collection('users').findOne({ _id: objectId });
        } catch (error) {
            throw new Error('Could not find user');
        }
    }
};
findByResetToken : async (resetToken) => {
    const db = getDb();
    try {
        return await db.collection('users').findOne({ resetToken: resetToken });
    } catch (error) {
        throw new Error('Could not find user by reset token');
    }
};

updateResetToken : async (userId, resetToken, resetTokenExpiry) => {
    const db = getDb();
    try {
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { resetToken, resetTokenExpiry } }
        );
    } catch (error) {
        throw new Error('Could not update reset token');
    }
};

updatePassword : async (userId, newPassword) => {
    const db = getDb();
    try {
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: newPassword, resetToken: null, resetTokenExpiry: null } }
        );
    } catch (error) {
        throw new Error('Could not update password');
    }
};


module.exports = User;
