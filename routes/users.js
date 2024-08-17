const express = require('express');
const router = express.Router();
const user_controller = require("../controllers/userController");
const passport = require("passport");

router.post("/signup", user_controller.user_create);

router.post("/login", user_controller.login);

router.put("/:id", user_controller.user_update);

router.get("/", user_controller.users_get);

router.get("/:id", user_controller.user_get);

// router.get("/authenticate", passport.authenticate("jwt", { session: false }), (req, res, next) => {
//   res.status(200).json({ message: "Authenticated", user_id: res.req.user.user_id })
// })

module.exports = router;
