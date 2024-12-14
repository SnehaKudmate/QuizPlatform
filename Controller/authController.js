const User = require('../models/users');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../Config/jwtConfig');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { isTokenBlacklisted, addTokenToBlacklist } = require('../blacklisting/blacklist');
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating reset token

const authController = {

    register: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, username, password, email } = req.body;

        try {
            const existingUser = await User.findByEmail(email);

            if (existingUser) {
                return res.status(409).json({ message: 'User already exists with same email' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                name,
                username,
                password: hashedPassword,
                email,
                role: 'user'
            });

            res.status(201).json({ message: 'User registered successfully', user: newUser });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password } = req.body;
        try {
            const user = await User.findByUsername(username);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = req.headers['authorization']?.split(' ')[1];

            if (token && await isTokenBlacklisted(token)) {
                return res.status(401).json({ message: 'Token is blacklisted. Please log in again.' });
            }

            const tokenPayload = {
                id: user._id,
                role: user.role,
                name: user.name
            };

            const loginToken = jwt.sign(tokenPayload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

            res.status(200).json({
                message: `Logged in ${username}`,
                loginToken
            });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    logout: async (req, res) => {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        try {
            await addTokenToBlacklist(token);

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    resetPasswordRequest: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

            await User.updateResetToken(user._id, resetToken, resetTokenExpiry);

            // Send the reset token to user's email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,  // Your email
                    pass: process.env.EMAIL_PASS,  // Your email password
                },
            });

            const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ message: 'Failed to send reset email' });
                }
                res.status(200).json({ message: 'Password reset email sent' });
            });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    resetPassword: async (req, res) => {
        const { resetToken, newPassword } = req.body;

        try {
            const user = await User.findByResetToken(resetToken);
            if (!user || user.resetTokenExpiry < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired reset token' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(user._id, hashedPassword);

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = { authController };
