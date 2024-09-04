const mongoose = require("mongoose");
var ms = require("ms")

const Schema = mongoose.Schema;

const examSchema = new Schema({
    timer: Number,
    pin: { type: Number },
    lesson: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'lesson'
    },
    section:String,// update this in production 28/9
	name:String,
    allQuestions: [
        {
            question: String,
            questionImg: String,
            questionType: String,
            questionScore: Number,
            answers: [
                { answer: String, answerNo: Number },
                { answer: String, answerNo: Number },
                { answer: String, answerNo: Number },
                { answer: String, answerNo: Number }
            ],
            correctAnswer: Number
        }
    ],
    students: [
        {
            type: Schema.Types.ObjectId,
            ref: 'student',
            required: true
        }],
        isOpened: {
            type: Boolean,
            default: false
        },
});

module.exports = mongoose.model("exam", examSchema);
