const express = require('express');
const router = express.Router();
const { getProfileController, loginController } = require('../controllers/userController');

router.post('/login', loginController);
router.get('/profile', getProfileController);

module.exports = router;