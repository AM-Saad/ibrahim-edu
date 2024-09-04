const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ownerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  ownerKey: {
    type: Number,
    default: 1020300
  }
});

module.exports = mongoose.model("owner", ownerSchema);
