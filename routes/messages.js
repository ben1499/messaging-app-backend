const express = require('express');
const router = express.Router();
const message_controller = require("../controllers/messageController");

router.post("/", message_controller.message_create);

module.exports = router;