const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  content: { type: String, required: true },
  date: { type: Date, required: true },
  user_id: { type: Schema.Types.ObjectId, required: true },
  to_user_id: { type: Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model("Message", MessageSchema);