const express = require('express');
const router = express.Router();
const user_controller = require("../controllers/userController");

router.post("/signup", user_controller.user_create);

router.post('/login', user_controller.login);

module.exports = router;
