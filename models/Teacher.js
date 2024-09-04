const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
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
    image: {
        type: String,
        default: 'images/teacher.svg'
    },
    requests: [
        {
            type: Schema.Types.ObjectId,
            ref: 'student',
            required: true
        },
    ],
    centers: [],

    isTeacher: {
        type: Boolean
    },
    stars: [
        {
            studentId: {
                type: Schema.Types.ObjectId,
                ref: 'student',
                required: true
            },
            name: {
                type: String,
                required: true,
            }
        }
    ],
    notifications:Number

});

module.exports = mongoose.model("teacher", teacherSchema);
