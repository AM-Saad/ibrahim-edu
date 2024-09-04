const mongoose = require("mongoose");
var ms = require("ms")
const Schema = mongoose.Schema;

const unitSchema = new Schema({
    unitInfo: {
        grade: {
            type: Number,
            required: true
        },
        term: {
            type: Number,
            required: true
        },
      
        section: {// update this in production 28/9
            type: String,
        }
    },
    unitDetails: {
        number: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String }
    },

    lessons: [{
        type: Schema.Types.ObjectId,
        ref: 'lesson'
    }],


});


module.exports = mongoose.model("unit", unitSchema);