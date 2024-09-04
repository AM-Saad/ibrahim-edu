const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema({

    eventtype: String, // public Or Privte
    content: String,
    image: String,
    file: String,
    group: String,
    grade: String,
    date: String,
    comments: Number,
    attachedlink: String,
    timeRange: {
        from: String,
        to: String
    },

});


module.exports = mongoose.model("event", eventSchema);
