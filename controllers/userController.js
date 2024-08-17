const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const passport = require("passport");
const fs = require("fs").promises;
const User = require("../models/user");
const { uploadToCloudinary, removeFromCloudinary } = require("../config/cloudinary");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Appending extension with original name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

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

exports.login = [
  body("email")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email"),
    body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password is required"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    } else {
      const user = await User.findOne({ email: req.body.email }).exec();

      if (!user) {
        return res.status(400).json({ errors: [{ path: "email", msg: "Email not found" }] })
      }
      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return res.status(400).json({ errors: [{ path: "password", msg: "Password is incorrect"}] });
      }
      jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" }, (err, token) => {
        res.status(200).json({ token: `Bearer ${token}`, user_id: user._id });
      });
    }
  })
]

exports.user_update = [
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
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
  body("about")
    .trim(),
  body("image_url")
    .trim()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let uploadedImage = null;
    if (req.file) {
      uploadedImage = await uploadToCloudinary(`uploads/${req.file.filename}`);
      await fs.unlink(req.file.path);
    }

    let user;
    if (uploadedImage) {
      const existingUser = await User.findById(req.params.id).exec();
      
      const oldImageId = existingUser.image?.img_id;
      if (oldImageId) 
        await removeFromCloudinary(oldImageId);

      user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        about: req.body.about,
        image: {
          img_id: uploadedImage.public_id,
          url: uploadedImage.url
        },
        _id: req.params.id
      })
    } else {
      const existingUser = await User.findById(req.params.id).exec();
      const oldImageId = existingUser.image?.img_id;
      if (oldImageId) 
        await removeFromCloudinary(oldImageId);

      if (req.body.image === "null") {
        user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          about: req.body.about,
          image: null,
          _id: req.params.id
        })
      } else {
        user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          about: req.body.about,
          _id: req.params.id
        })
      }
    }

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      await User.findByIdAndUpdate(req.params.id, user, {});

      res.status(200).json({ message: "User updated successfully" })
    }
  })
]

exports.users_get = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const users = await User.find({ _id: { $ne: req.user.user_id }}, "-password").exec();

    res.status(200).json({ data: users })
  })
]

exports.user_get = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    console.log(req.params.id);
    const user = await User.findById(req.params.id, "-password").lean().exec();

    let data = null;

    if (user._id.toString() === req.user.user_id) {
      data = {
        ...user,
        is_editable: true
      };
    } else {
      data = { ...user };
    }

    res.status(200).json({ data });
  })
]
