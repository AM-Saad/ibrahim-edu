const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    date: String,
    by: {
        image: String,
        name: String,
        id:{
            type: Schema.Types.ObjectId,
            ref: 'OnModel',
            required: true
        }
    },
    to:{
        type: Schema.Types.ObjectId,
        ref: 'OnModel',
    },
    item:{
        type: Schema.Types.ObjectId,
        ref: 'OnModel',
        required: true
    },
  
    comment: String,

});


module.exports = mongoose.model("comment", commentSchema);
