const { body, query, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const passport = require("passport");

const Message = require("../models/message");

exports.message_create = [
  passport.authenticate("jwt", { session: false }),
  body("content")
  .trim()
  .isLength({ min: 1 })
  // .escape()
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

      if (message.user_id.toString() === message.to_user_id.toString()) {
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

exports.messages_get = [
  passport.authenticate("jwt", { session: false }),

  query("to_user_id")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("To user id query param is required"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      const sentMessages = await Message.find({ user_id: req.user.user_id, to_user_id: req.query.to_user_id }).lean().exec();
      const receivedMessages = await Message.find({ user_id: req.query.to_user_id, to_user_id: req.user.user_id }).lean().exec();

      sentMessages.forEach((message, index) => {
        sentMessages[index].is_current_user = true;
      })

      receivedMessages.forEach((message, index) => {
        receivedMessages[index].is_current_user = false;
      })

      let allMessages = sentMessages.concat(receivedMessages);

      allMessages = allMessages.map((message) => {
        const date = new Date(message.date);
        delete message.__v;
        return {
          ...message,
          date_formatted: `${date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric"})} ${date.toLocaleTimeString([], { hour: "numeric", minute: "numeric", hour12: true })}`
        }
      })

      allMessages.sort((objA, objB) => {
        return objA.date - objB.date;
      });

      res.status(200).json({ data: allMessages });
    }
  })
]