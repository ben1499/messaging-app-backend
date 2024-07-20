const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  img_id: { type: String, required: true },
  url: { type: String, required: true }
})

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  email: { type: String, required: true, maxLength: 100 },
  password: { type: String, required: true, maxLength: 100},
  about: { type: String },
  image: { type: ImageSchema }
});

module.exports = mongoose.model("User", UserSchema);