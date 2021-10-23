const mongoose = require("mongoose");
const { Schema } = mongoose;

const Users = new Schema({
  id: String,
  name: String,
  vanity: String,
  gender: Number,
  isFriend: Boolean,
  money: Number,
  exp: Number,
  banned: Object
}, {
  timestamps: true
});
    
module.exports = mongoose.model("users", Users);