const mongoose = require("mongoose");
var ms = require("ms");

const Schema = mongoose.Schema;

const homeworkSchema = new Schema({
  //Exprire After 1 hr
  createdAt: { type: Date, default: null, index: { expires: "5m" } },
  timer: Number,
  pin: { type: Number },
  name: String,
  section: String, // update this in production 28/9
  lesson: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "lesson",
  },
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
        { answer: String, answerNo: Number },
      ],
      correctAnswer: Number,
    },
  ],
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
  ],
  isOpened: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Homework", homeworkSchema);
