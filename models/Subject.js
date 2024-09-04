const mongoose = require("mongoose");
var ms = require("ms")
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
    name: String,
    grade: Number,
    section:String,
    teachers: [
        {
            type: Schema.Types.ObjectId,
            required: true
        }
    ],
    image:String,
});


module.exports = mongoose.model("subject", SubjectSchema);