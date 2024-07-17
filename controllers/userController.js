const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

exports.user_create = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name is required")
    .isAlphanumeric()
    .withMessage("First name must not contain spaces"),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name is required")
    .isAlphanumeric()
    .withMessage("Last name must not contain spaces"),
  body("email")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .escape()
    .withMessage("Password must have minimum 5 characters"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
    } else {
      bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
        const user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          password: hashedPassword,
        })

        await user.save();
        res.status(200).json({ message: "User created successfully"})
      })
    }
  })
]

exports.login = asyncHandler(async (req, res, next) => {
  res.send("Login");
})
