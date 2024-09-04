const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const lectureSchema = new Schema({
    students: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'student',
            required: true,
        },
        name: String,
        attended: Boolean,
        date: String,
        center: String,
        note: String
    }],
    date: {
        type: String
    },
    grade: {
        type: String
    },
    center: {
        type: String
    },
    section:String, // update this in production 28/9
    number: Number
});


module.exports = mongoose.model("lecture", lectureSchema);
