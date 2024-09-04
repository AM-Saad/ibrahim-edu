const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pinSchema = new Schema({
  grade: String,
  center: String,
  pin: {
    type: String,
  },
  printed: {
    type: Boolean,
    required: true,
  },
  used: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Student",
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "teacher",
  },
  isTest: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("pin", pinSchema);
