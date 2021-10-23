const mongoose = require("mongoose");
const { Schema } = mongoose;

const dataModel = new Schema({
  type: String,
  data: Object,
  prefix: String
}, { 
  timestamps: true 
});
    
module.exports = mongoose.model("database", dataModel);