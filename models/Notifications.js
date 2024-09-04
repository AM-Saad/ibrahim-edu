const mongoose = require("mongoose");
var ms = require("ms")

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  //Exprire After 1 hr  
  date: String,
  by: {
    name: String,
    image: String,
    id: {
      type: Schema.Types.ObjectId,
      ref: 'OnModel'
    }
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'OnModel'
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'OnModel'
  },
  content: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("notification", notificationSchema);
