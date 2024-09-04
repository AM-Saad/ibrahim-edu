const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
    center: {
      type: String,
      required: true,
    },
    parentNo: {
      type: String,
    },

    school: {
      type: String,
    },

    image: {
      type: String,
      default: "images/student.png",
    },

    isStudent: {
      type: Boolean,
      default: true,
    },
    exams: [
      {
        section: String,
        originalExam: Schema.Types.ObjectId,
        exam: Schema.Types.ObjectId,
      },
    ],
    homeworks: [
      {
        section: String,
        originalHomework: Schema.Types.ObjectId,
        homework: Schema.Types.ObjectId,
      },
    ],
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    attendance: [
      {
        sessionId: {
          type: Schema.Types.ObjectId,
          ref: "Session",
        },
        number: Number,
        date: String,
        center: String,
        section: String, // update this in production 28/9
      },
    ],
    membership: {
      startingDate: String,
      expirationDate: String,
    },
    activated: { type: Boolean, default: false },
    notifications: Number,
    code: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("student", studentSchema);
