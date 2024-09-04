const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    grade: {
        type: Number,
        required: true
    },
    center: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'images/student.svg'
    },

    isStudent: {
        type: Boolean,
        default: true
    },
    exams: [
        {
            originalExam: Schema.Types.ObjectId,
            exam: Schema.Types.ObjectId,
        }
    ],
    attendance: [{
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'Session',
        },
    }],
    activated: { type: Boolean, default: false },
    pin: Number,
    notifications: Number

});

module.exports = mongoose.model("User", userSchema);
