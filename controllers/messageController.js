const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const passport = require("passport");

const Message = require("../models/message");

exports.message_create = [
  passport.authenticate("jwt", { session: false }),
  body("content")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("Message content is required"),
  // body("user_id")
  // .trim()
  // .isLength({ min: 1 })
  // .escape()
  // .withMessage("User id is required"),
  body("to_user_id")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("To User id is required"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
    } else {
      const message = new Message({
        content: req.body.content,
        date: new Date(),
        user_id: req.user.user_id,
        to_user_id: req.body.to_user_id
      })

      if (message.user_id === message.to_user_id) {
        return res.status(200).json({ message: "Cannot send message to same user" });
      }

      await message.save();
      res.status(200).json({ message: "Message sent successfully" });
    }
  })
]

exports.message_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    if (!req.params.id) {
      return res.status(400).json({ message: "Id params is required" })
    }

    const message = await Message.findById(req.params.id).exec();

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (req.user.user_id !== message.user_id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this message" })
    }

    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted successfully" });
  })
]