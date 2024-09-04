const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const takenHomeworkSchema = new Schema({
    homeworkId: {
        type: Schema.Types.ObjectId,
        ref: 'Homework',
    },
    lessonUnit: {
        type: Schema.Types.ObjectId,
        ref: 'unit',
    },
    lessonTerm: Number,
    lessonNo: Number,
    section: String, // update this in production 28/9
    lessonName: String,
examname:String,
    lessonImage: String,
    lessonQuestions: [
        {
            question: String,
            questionType: String,
            questionImg: String,
            questionScore: Number,
            answers: [
                {
                    answerNo: Number,
                    answer: String
                }
            ],
            selectedAnswer: {
                type: Object
            },
            correctAnswer: Number,
            point: Number,
            note: '',
        }
    ],
    totalScore: Number,
    byTeacher: {
        type: Schema.Types.ObjectId,
        ref: 'teacher',
    },
    takenAt: {
        type: String
    },
    comments: [
        {
            commentedBy: {
                type: Schema.Types.ObjectId,
                ref: 'student',
                required: true
            },
            name: String,
            image: String,
            comment: {
                type: String,
                required: true
            }
        }
    ],
    student: {
        type: Schema.Types.ObjectId,
        ref: 'student',
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model("TakenHomework", takenHomeworkSchema);
