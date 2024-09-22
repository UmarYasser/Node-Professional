const express = require('express');
const router = express.Router();
const authCon = require('./../Controllers/authController.js');

router.route('/signup').post(authCon.signup);
router.route('/login').post(authCon.login);
router.route('/forgotPassword').patch(authCon.forgotPassword);
router.route('/resetPassword/:token').patch(authCon.resetPassword);


module.exports = router;