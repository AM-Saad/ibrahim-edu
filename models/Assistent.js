const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const assistentSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
 
    isAssistent: {
        type: Boolean,
        default: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    
    image: String
});

module.exports = mongoose.model("assistent", assistentSchema);
