const express = require('express');
const router = express.Router();
const  { authController }  = require('../Controller/authController')

router.post('/v1/register', authController.register);
router.post('/v1/login',  authController.login);
router.post('/v1/logout', authController.logout);

router.post('/v1/reset-password-request', authController.resetPasswordRequest);
router.post('/v1/reset-password', authController.resetPassword);

module.exports=router;