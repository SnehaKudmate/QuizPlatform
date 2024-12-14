const fs = require('fs');
const path = require('path');
const blacklistFile = path.join(__dirname, 'blacklist.json');

const isTokenBlacklisted = (token) => {
    return new Promise((resolve, reject) => {
        fs.readFile(blacklistFile, 'utf8', (err, data) => {
            if (err) return reject(err);
            const blacklist = JSON.parse(data || '[]');
            resolve(blacklist.includes(token));
        });
    });
};

const addTokenToBlacklist = (token) => {
    return new Promise((resolve, reject) => {
        fs.readFile(blacklistFile, 'utf8', (err, data) => {
            if (err) return reject(err);
            const blacklist = JSON.parse(data || '[]');
            blacklist.push(token);
            fs.writeFile(blacklistFile, JSON.stringify(blacklist, null, 2), 'utf8', (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

module.exports = {
    isTokenBlacklisted,
    addTokenToBlacklist
};
