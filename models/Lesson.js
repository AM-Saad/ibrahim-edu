const mongoose = require("mongoose");
var ms = require("ms")

const Schema = mongoose.Schema;

const lessonSchema = new Schema({
  //Exprire After 1 hr  
  createdAt: { type: Date, default: null },
  grade: {
    type: Number,
    required: true
  },
  term: {
    type: Number,
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'unit'
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  lessonNo: {
    type: Number,
    required: true
  },
  section: String,// update this in production 28/9
  modelAnswers: [{
    fileTitle: String,
    fileName: String
  }],
  pdfs: [{
    fileTitle: String,
    fileName: String
  }],
  videos: [{
    title: String,
    path: String
  }],
  exams: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'exam'
  }],
  homeworks: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Homework'
  }],
  students: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Student'
  }],
  locked: Boolean,
  pin: String,
});

module.exports = mongoose.model("lesson", lessonSchema);
