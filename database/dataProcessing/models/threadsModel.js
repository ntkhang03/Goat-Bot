const mongoose = require("mongoose");
const { Schema } = mongoose;

const Threads = new Schema({
  id: String,
  name: String,
  prefix: String,
  emoji: String,
  members: Object,
  adminIDs: Array,
  avatarbox: String,
  banned: Object,
  data: Object
}, { timestamps: true });
    
module.exports = mongoose.model("threads", Threads);