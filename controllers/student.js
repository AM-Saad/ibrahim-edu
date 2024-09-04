const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Lesson = require("../models/Lesson");
const Exam = require("../models/Exam");
const TakenExam = require("../models/TakenExam");
const TakenHomework = require("../models/TakenHomework");
const Homework = require("../models/Homework");
const Event = require("../models/Event");
const Unit = require("../models/Unit");
const Pin = require("../models/Pin");
const starMethods = require("../models/methods/starMethods");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const msg = require("../util/message");
const moment = require("moment");

exports.getHome = async (req, res, next) => {
  const msgs = msg(req);
  try {
    const teachers = await Teacher.find({});
    const student = await Student.findOne({ _id: req.user._id });
    if (!req.user) {
      return req.session.destroy((err) => {
        console.log(err);
        res.redirect("/login");
      });
    }

    // Assuming student.membership.expirationDate is a string
    const expirationDate = moment(
      student.membership.expirationDate,
      "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ"
    );

    if (student.activated && moment().isAfter(expirationDate, "day")) {
      student.activated = false;
      await student.save();
    }

    return res.render("student/home", {
      pageTitle: "Home",
      path: "/home",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      user: student,
      teachers: teachers,
      colleagues: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

// CHECK THIS URGENT

exports.getColleagues = async (req, res, next) => {
  try {
    const colleagues = await Student.find({
      group: req.user.group,
      grade: req.user.grade,
    });
    return res.status(200).json({ colleagues: colleagues });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSingleColleague = async (req, res, next) => {
  const colleagueId = req.params.colleagueId;
  const msgs = msg(req);

  try {
    const colleague = await Student.findOne({ _id: colleagueId });
    if (!colleague) {
      req.flash("alert", "Cannot found this student!!");
      return res.redirect(`/home`);
    }
    return res.render("student/colleague", {
      pageTitle: "Teeaching Zones",
      path: "/colleague",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      user: req.user,
      colleague: colleague,
      teacherId: "",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getTeacherCenters = async (req, res, next) => {
  try {
    const teacher = await Teacher.find();
    const centers = teacher[0].centers;
    return await res.status(200).json({ centers: centers });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddCenter = async (req, res, next) => {
  const center = req.body.center;
  const studentId = req.user._id;

  try {
    const student = await Student.findOne({ _id: studentId });
    student.group = center;
    await student.save();
    return res.redirect("/home");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getTremUnits = async (req, res, next) => {
  const userGrade = req.user.grade;
  const term = req.params.termNo;
  const student = req.user;
  const msgs = msg(req);

  console.log(term);
  try {
    const student = await Student.findById(req.user._id);
    let query = {
      "unitInfo.grade": student.grade,
      "unitInfo.term": term,
    };
    console.log(query);
    const termUnits = await Unit.find(query);
    console.log(termUnits);
    if (!termUnits) {
      req.flash(
        "alert",
        "Something went wrong (No Unit Found) please try again in few minutes"
      );
      return res.redirect("/home");
    }
    return res.render("student/units", {
      pageTitle: "Units",
      path: "/units",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      username: req.user.name,
      userId: req.user._id,
      units: termUnits,
      user: student,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
// units api

exports.getTremUnitsApi = async (req, res, next) => {
  const userGrade = 1;
  const term = req.params.termNo;
  const student = req.user;
  const msgs = msg(req);

  try {
    const termUnits = await Unit.find({
      "unitInfo.grade": userGrade,
      "unitInfo.term": term,
    });

    if (!termUnits) {
      req.flash(
        "alert",
        "Something went wrong (No Unit Found) please try again in few minutes"
      );
      return res.redirect("/home");
    }

    return res.status(200).json(termUnits);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  const userId = req.user._id;
  const msgs = msg(req);

  try {
    const user = await Student.findOne({ _id: userId });
    const exams = await TakenExam.find({ student: user._id });
    if (!user) {
      req.flash("alert", "Couldnt Find This User Now, Try Again Later");
      return res.redirect("/home");
    }
    return res.render("student/profile", {
      pageTitle: "Profile",
      path: "/Profile",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      hasError: false,
      student: user,
      user: req.user,
      lessons: exams,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.changepassword = async (req, res, next) => {
  const { oldpass, newpass } = req.body;

  try {
    const doMatch = await bcrypt.compare(oldpass, req.user.password);
    if (!doMatch) {
      req.flash("alert", "Old Password Is Incorrect...");
      return res.redirect("/profile");
    }
    const hashedNewPassword = await bcrypt.hash(newpass, 12);
    req.user.password = hashedNewPassword;
    const user = await Student.findOne({ _id: req.user._id });
    user.password = hashedNewPassword;
    console.log(user);
    req.flash("success", "Password Changed Successfully");
    return res.redirect("/profile");
  } catch (error) {
    console.log(error);
  }
};
exports.followNewTeacher = async (req, res, next) => {
  //   const studentId = req.params.studentId;
  //   const teacherNumber = req.body.teacherNumber;
  //   console.log(studentId);
  //   try {
  //     const teacher = await Teacher.findOne({ mobile: teacherNumber })
  //     if (!teacher) {
  //       req.flash('alert', "There's no teacher with same number, Make sure to add a valid number")
  //       return res.redirect('/home')
  //     }
  //     const student = await Student.findOne({ _id: studentId })
  //     console.log(student);
  //     if (!student) {
  //       req.flash('alert', "Something went wrong, Student Not Found")
  //       return res.redirect('/home')
  //     }
  //     const teacherRequests = [...teacher.requests];
  //     const filterRequests = teacherRequests.filter(r => {
  //       return r.studentId.toString() === studentId.toString()
  //     })
  //     if (filterRequests.length > 0) {
  //       req.flash('alert', `You Already Requested Mr.${teacher.name}, Please wait Until Been Accepted`)
  //       return res.redirect('/profile')
  //     }
  //     const newRequest = {
  //       studentId: student._id
  //     }
  //     teacherRequests.unshift(newRequest)
  //     teacher.requests = teacherRequests
  //     const studentTeachers = [...student.teachers]
  //     const filteredTeachers = studentTeachers.filter(t => {
  //       return t.teacherId.toString() === teacher._id.toString()
  //     })
  //     if (filteredTeachers.length > 0) {
  //       req.flash('alert', `You Already Follow Mr.${teacher.name} `)
  //       return res.redirect('/profile')
  //     }
  //     const newTeacher = {
  //       teacherId: teacher._id,
  //       center: 'unknown',
  //       requestApproved: false
  //     }
  //     studentTeachers.push(newTeacher)
  //     student.teachers = studentTeachers
  //     await teacher.save()
  //     await student.save()
  //     req.flash('success', "Select your center to make your teacher identify you(يجب ان تحدد مركزك التعليمي لسهولة التعرف عليك) ")
  //     return res.redirect(`/verify/${student._id}?teacherId=${teacher._id}`)
  //   } catch (err) {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   }
};

exports.editPresonalInfo = async (req, res, next) => {
  const updatedName = req.body.updatedName;
  const updatedGrade = req.body.updatedGrade;
  const updatedMobile = req.body.updatedMobile;
  const updatedParentNo = req.body.updatedParentNo;
  const updatedSchool = req.body.updatedSchool;
  const studentId = req.body.studentId;
  let profileImage;

  try {
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      req.flash("alert", "Somthing went wrong please try again later..");
      req.redirect("/profile");
    }

    if (req.file === undefined) {
      profileImage = student.image;
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    req.user.image = profileImage;
    student.name = updatedName;
    student.grade = updatedGrade;
    student.image = profileImage;
    student.mobile = updatedMobile;
    student.parentNo = updatedParentNo;
    student.school = updatedSchool;

    req.user.grade = updatedGrade;
    req.user.name = updatedName;
    req.user.parentNo = updatedParentNo;

    await student.save();
    req.flash("success", "Informations Updated.");
    return res.redirect("/profile");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getTakenExam = async (req, res, next) => {
  const examId = req.query.examId;
  const studentId = req.params.studentId;
  try {
    const student = await Student.findOne({ _id: studentId });

    const exam = student.exams.filter((l) => {
      return l._id.toString() === examId.toString();
    });
    if (exam.length <= 0) {
      req.flash("alert", "Exam Not Found.");
      return res.redirect("/profile");
    }

    return res.render("student/prev-takenExam.ejs", {
      // pageTitle: `${exam[0].lessonName}`,
      path: "/takenExam ",
      errMessage: null,
      sucMessage: null,
      hasError: false,
      user: req.user,
      exam: exam[0],
      studentId: studentId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
// exports.getSettings = async (req, res, next) => {
//   const studentId = req.user._id;
//   // try {
//   Student.findOne({ _id: studentId }).then(student => {
//     student
//       .populate('teachers.teacherId')
//       .execPopulate().then(res => {
//         const mapedTeachers = res.teachers.map(t => ({
//           teacher: t.teacherId
//         }))

//         console.log(mapedTeachers[0].teacher);

//       }).catch(err => {
//         console.log(err);

//       })
//   })
//   //   if (!student) {
//   //     req.flash('alert', 'Something went wrong, please try again after some minutes')
//   //     return res.redirect('/home')
//   //   }

//   // } catch (err) {
//   //   const error = new Error(err);
//   //   error.httpStatusCode = 500;
//   //   return next(error);
//   // }
// }

exports.getUnitLessons = async (req, res, next) => {
  const unitId = req.params.unitId;
  const msgs = msg(req);
  try {
    const unit = await Unit.findOne({ _id: unitId });
    if (unit) {
      return unit
        .populate("lessons")
        .execPopulate()
        .then((lessons) => {
          return res.render("student/singleUnit", {
            path: `/unit/${unit._id}`,
            pageTitle: `Unit: ${unit.unitDetails.name.toUpperCase()}`,
            unit: unit,
            lessons: lessons.lessons,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            user: req.user,
          });
        });
    } else {
      req.flash(
        "alert",
        "Something went wrong, we're working on it. Please try again later"
      );
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getLesson = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const msgs = msg(req);
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      req.flash("alert", "This Lesson Not Found");
      return res.redirect("/teacher/units");
    }

    const exams = await lesson.populate("exams").execPopulate();
    const homework = await lesson.populate("homeworks").execPopulate();

    return res.render("student/lesson", {
      path: "/lesson",
      pageTitle: `${lesson.name.toUpperCase()}`,
      lesson: lesson,
      exams: exams.exams,
      homework: homework.homeworks,
      user: req.user,
      errMessage: msgs.err,
      sucMessage: msgs.success,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.searchLesson = async (req, res, next) => {
  const lessonname = req.params.name.toLowerCase();
  try {
    const exam = await Lesson.findOne({ lessonName: lessonname });
    if (!exam) {
      return res.status(404).json({
        message: "No Exams Found, Check spellings OR try another one!.",
        messageType: "warning",
      });
    }
    if (exam.grade !== req.user.grade) {
      return res
        .status(404)
        .json({ message: "No Exams Found.", messageType: "warning" });
    }
    return res
      .status(200)
      .json({ message: "Exam Fetched", messageType: "success", exam: exam });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, please try again later.",
      messageType: "warning",
    });
  }
};

exports.searchUnit = async (req, res, next) => {
  const unitName = req.params.unitName.toLowerCase();

  try {
    const unit = await Unit.findOne({ "unitDetails.name": unitName });
    if (!unit) {
      return res.status(404).json({
        message: `No Unit Found.. Maybe  '${unitName}'  Not for your grade or your spellings incorrect check it and try again`,
        messageType: "warning",
      });
    }
    if (unit.unitInfo.grade !== req.user.grade) {
      return res
        .status(404)
        .json({ message: `No Unit Found.. `, messageType: "warning" });
    }

    return res
      .status(200)
      .json({ message: "Unit Fetched", messageType: "success", unit: unit });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, please try again later.",
      messageType: "warning",
    });
  }
};
// exports.searchUnit = async (req, res, next) => {
//   const unitName = req.params.unitName
//   const teacherId = req.user.teachers[0].teacherId
//   try {
//     const unit = await Unit.findOne({ 'unitDetails.name': unitName, 'teacher.teacherId': teacherId })
//     if (!unit) {
//       req.flash('alert', `No Unit Found..Maybe  "${unitName}"  Not for your grade or your spellings incorrect check it and try again`)
//       return res.redirect('/home')
//     }
//     if (unit.unitInfo.grade !== req.user.grade) {
//       req.flash('alert', `No Unit Found..Maybe  "${unitName}"  Not for your grade or your spellings incorrect check it and try again`)
//       return res.redirect('/home')
//     }
//     const unitId = unit._id
//     return res.redirect(`/ getUnit / ${ unitId } `)
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     return next(error);
//   }
// }

exports.checklesson = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const studentId = req.user._id;
  const pin = req.body.pin;

  try {
    const student = await Student.findOne({ _id: studentId });

    const reqTakeExam = await Lesson.findOne({ _id: lessonId });
    if (!reqTakeExam) {
      return res
        .status(404)
        .json({ message: "Cannot Found this Exam", messageType: "danger" });
    }

    const alreadyPurchesed = student.lessons.find(
      (l) => l._id.toString() === lessonId.toString()
    );

    if (!alreadyPurchesed) {
      const existPin = await Pin.findOne({ pin: pin, used: false });
      if (!existPin)
        return res.status(401).json({
          message: "Pin code Not correct",
          messageType: "warning",
          approved: false,
        });
      student.lessons.push(reqTakeExam._id);
      reqTakeExam.students.push(student._id);

      await reqTakeExam.save();
      await student.save();

      await existPin.remove();
    }
    return res.status(200).json({ approved: true });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: 'Your Pin Should be "24" characters exactly',
      messageType: "warning",
    });
  }
};
exports.checkexam = async (req, res, next) => {
  const examId = req.params.examId;
  const studentId = req.user._id;
  const pin = req.body.pin;
  try {
    const student = await Student.findOne({ _id: studentId });
    const isTakenBefore = student.exams.filter(
      (e) => e.originalExam.toString() === examId.toString()
    );
    if (isTakenBefore.length > 0) {
      return res.status(401).json({
        message: "You've taken this exam before, but carry on for another one",
        messageType: "info",
      });
    }
    const reqTakeExam = await Exam.findOne({ _id: examId });
    if (!reqTakeExam) {
      return res
        .status(404)
        .json({ message: "Cannot Found this Exam", messageType: "danger" });
    }
    if (pin == reqTakeExam.pin) {
      return res.status(200).json({ approved: true });
    } else {
      return res.status(401).json({
        message: "Pin code Not correct",
        messageType: "warning",
        approved: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong. Please try again",
      messageType: "danger",
    });
  }
};
exports.getExamPage = async (req, res, next) => {
  const examId = req.params.examId;
  const lessonId = req.query.lessonId;
  try {
    const student = await Student.findById(req.user._id);
    const isTakenBefore = student.exams.filter(
      (e) => e.originalExam.toString() === examId.toString()
    );
    if (isTakenBefore.length > 0) {
      req.flash("alert", "You've taken this before");
      return res.redirect(`/lesson/${lessonId}`);
    }

    return res.render("student/takeExam", {
      pageTitle: "Start Exam",
      path: "/startExam",
      user: req.user,
      examId: examId,
      lessonId: lessonId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.startExam = async (req, res, next) => {
  const examId = req.params.examId;
  const lessonId = req.query.lessonId;
  const studentId = req.user._id;
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    const exam = await Exam.findById(examId);
    const student = await Student.findOne({ _id: studentId });

    const examDate = new Date().toDateString();
    const takenExam = {
      examId: exam._id,
      lessonUnit: lesson.unit.unitId,
      lessonTerm: lesson.term,
      lessonNo: lesson.lessonNo,
      section: lesson.section || "",
      lessonName: lesson.lessonName,
      examname: exam.name || "",
      lessonImage: lesson.lessonImg,
      lessonQuestions: exam.allQuestions.map((ques, index) => ({
        _id: ques._id,
        question: ques.question,
        questionType: ques.questionType,
        questionImg: ques.questionImg,
        answers: [...ques.answers],
        selectedAnswer: { answer: null },
        correctAnswer: ques.correctAnswer,
        point: 0,
        questionScore: ques.questionScore,
        note: "",
      })),
      duration: {
        min: exam.timer,
        endAt: null,
      },
      takenAt: examDate,
      totalScore: 0,
      student: req.user._id,
    };
    const newExam = new TakenExam(takenExam);
    await newExam.save();
    student.exams.push({
      originalExam: exam._id,
      exam: newExam._id,
      section: lesson.section,
    });
    takenExam._id = newExam._id;
    await student.save();

    const examstudents = exam.students.filter(
      (s) => s._id.toString() !== student._id.toString()
    );
    examstudents.push(student._id);
    exam.students = examstudents;
    await exam.save();

    return res.status(200).json({ exam: takenExam });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Something went wrong. Please try again",
      messageType: "danger",
    });
  }
};

exports.submitAnswer = async (req, res, next) => {
  const examId = req.params.examId;
  const questionId = req.query.qid;
  try {
    const takenExam = await TakenExam.findById(examId);

    const question = takenExam.lessonQuestions.find(
      (q) => q._id.toString() === questionId.toString()
    );
    let selectedAnswer;
    if (question.questionType === "written") {
      if (req.file === undefined || req.file === null || req.file === "") {
        return res
          .status(404)
          .json({ message: "You have to add answer", messageType: "info" });
      } else {
        selectedAnswer = { answer: req.file.path.replace("\\", "/") };
      }
    } else {
      //if type question is paragraph
      if (req.query.answer != "") {
        selectedAnswer = { answer: req.body.answer };
      } else {
        return res
          .status(404)
          .json({ message: "You have to add answer", messageType: "info" });
      }
    }
    question.selectedAnswer = selectedAnswer;
    await takenExam.save();

    return res.status(200).json({ message: "added" });
  } catch (error) {
    console.log(error);

    return res.status(200).json({ message: error, messageType: "danger" });
  }
};

exports.submitExam = async (req, res, next) => {
  const examId = req.params.examId;
  const recivedAnswers = req.body.selectedAnswers;
  const selectedAnswers = [...JSON.parse(recivedAnswers)];

  try {
    const takenExam = await TakenExam.findById(examId);
    let chooseQuestions = [];
    takenExam.lessonQuestions.forEach((q) => {
      if (q.questionType === "choose" || q.questionType === "truefalse") {
        chooseQuestions.push(q);
      }
    });
    chooseQuestions.forEach(filterQuestion);
    function filterQuestion(q, index) {
      q.selectedAnswer = { answer: selectedAnswers[index] };
      q.point = selectedAnswers[index] == q.correctAnswer ? 1 : 0;
    }
    let score = 0;
    takenExam.lessonQuestions.forEach((q) => {
      return (score += q.point);
    });
    takenExam.totalScore = score;

    await takenExam.save();
    return res.status(200).json({ message: "submited", exam: takenExam });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getTeachersEvents = async (req, res, next) => {
  try {
    const evs = await Event.find({
      $or: [
        { eventtype: "public" },
        { eventtype: "private", grade: req.user.grade, group: req.user.center },
      ],
    });
    return res
      .status(200)
      .json({ events: evs, message: "Events Fetched", messageType: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Events Cannot Be Fetched", messageType: "error" });
  }
};

exports.addStar = (req, res, next) => {
  const teacherId = req.body.teacherId;
  Teacher.findById(teacherId)
    .then((teacher) => {
      const updatedStars = starMethods.addStar(req.user, teacher.stars);

      teacher.stars = updatedStars;
      teacher.save();
      req.flash("success", "Thank You for your feedback");
      return res.redirect("/home");
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postRemoveStar = (req, res, next) => {
  const teacherId = req.body.teacherId;
  Teacher.findById(teacherId)
    .then((teacher) => {
      const updatedStars = starMethods.removeStar(req.user, teacher.stars);
      teacher.stars = updatedStars;
      teacher.save();
      req.flash("success", "Thank You for your feedback");
      return res.redirect("/home");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subjects.find({
      grade: req.user.grade,
      name: req.params.name,
    });
    if (subject) {
      const teachers = await subject.populate("teachers").execPopulate();
      return res.render("student/teachers", {
        pageTitle: `${subject.name}`,
        path: "/subject",
        subject: subject,
        teachers: teachers,
      });
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getactivate = async (req, res, next) => {
  const msgs = msg(req);
  try {
    const teacher = await Teacher.find({});
    console.log(teacher);
    return res.render("student/activate", {
      pageTitle: `Activate Account`,
      path: "/activate",
      user: req.user,
      errMessage: msgs.err,
      sucMessage: msgs.success,
    });
  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postactivate = async (req, res, next) => {
  const pin = req.body.pin.toString();

  try {
    if (pin) {
      const existpin = await Pin.findOne({ pin: pin });
      console.log(existpin);
      if (!existpin) {
        req.flash("alert", "Your pin is Not correct");
        return res.redirect("/activate");
      }
      const student = await Student.findOne({ _id: req.user._id });
      student.activated = true;
      req.user.activated = true;
      student.membership = {
        expirationDate: moment().add(30, "days"),
        startingDate: moment(),
      };
      req.user.membership = {
        expirationDate: moment().add(30, "days"),
        startingDate: moment(),
      };

      await existpin.remove();
      await student.save();
      req.flash("success", "Your account has been activated");
      return res.redirect("/home");
    } else {
      req.flash("alert", "Add your pin to activate you account");
      return res.redirect("/activate");
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.checkhomework = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const studentId = req.user._id;
  const pin = req.body.pin;
  console.log(homeworkId);

  try {
    const student = await Student.findOne({ _id: studentId });
    const isTakenBefore = student.homeworks.filter(
      (e) => e.originalHomework.toString() === homeworkId.toString()
    );
    // if (isTakenBefore.length > 0)
    //   return res.status(401).json({
    //     message: "Already done this homework before",
    //     messageType: "info",
    //   });
    const reqTakeExam = await Homework.findOne({ _id: homeworkId });
    if (!reqTakeExam)
      return res
        .status(404)
        .json({ message: "Cannot Found this Exam", messageType: "danger" });
    if (pin == reqTakeExam.pin) {
      return res.status(200).json({ approved: true });
    } else {
      return res.status(401).json({
        message: "Pin code Not correct",
        messageType: "warning",
        approved: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong. Please try again",
      messageType: "danger",
    });
  }
};
exports.getHomeworkPage = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const lessonId = req.query.lessonId;
  try {
    const student = await Student.findById(req.user._id);
    const isTakenBefore = student.homeworks.filter(
      (e) => e.originalHomework.toString() === homeworkId.toString()
    );
    // if (isTakenBefore.length > 0) {
    //   req.flash("alert", "You've taken Homework this before");
    //   return res.redirect(`/lesson/${lessonId}`);
    // }

    return res.render("student/homework", {
      pageTitle: "Start Home Work",
      path: "/homework",
      user: req.user,
      homeworkId: homeworkId,
      lessonId: lessonId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.startHomework = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const lessonId = req.query.lessonId;
  const studentId = req.user._id;
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    const exam = await Homework.findById(homeworkId);
    const student = await Student.findOne({ _id: studentId });

    const examDate = new Date().toDateString();
    const takenExam = {
      homeworkId: exam._id,
      lessonUnit: lesson.unit.unitId,
      lessonTerm: lesson.term,
      examname: exam.name || "",
      lessonNo: lesson.lessonNo,
      section: lesson.section || "",
      lessonName: lesson.lessonName,
      lessonImage: lesson.lessonImg,
      lessonQuestions: exam.allQuestions.map((ques, index) => ({
        _id: ques._id,
        question: ques.question,
        questionType: ques.questionType,
        questionImg: ques.questionImg,
        answers: [...ques.answers],
        selectedAnswer: { answer: null },
        correctAnswer: ques.correctAnswer,
        point: 0,
        questionScore: ques.questionScore,
        note: "",
      })),
      takenAt: examDate,
      totalScore: 0,
      student: req.user._id,
    };
    const newExam = new TakenHomework(takenExam);
    await newExam.save();
    student.homeworks.push({
      originalHomework: exam._id,
      homework: newExam._id,
      section: lesson.section,
    });
    takenExam._id = newExam._id;
    await student.save();
    return res.status(200).json({ exam: takenExam });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong. Please try again",
      messageType: "danger",
    });
  }
};

exports.submitHomeworkAnswer = async (req, res, next) => {
  const examId = req.params.homeworkId;
  const questionId = req.query.qid;
  try {
    const takenExam = await TakenHomework.findById(examId);

    if (!takenExam) {
      return res
        .status(404)
        .json({ message: "Something went wrong", messageType: "danger" });
    }
    const question = takenExam.lessonQuestions.find(
      (q) => q._id.toString() === questionId.toString()
    );
    let selectedAnswer;
    if (question.questionType === "written") {
      if (req.file === undefined || req.file === null || req.file === "") {
        return res
          .status(404)
          .json({ message: "You have to add answer", messageType: "info" });
      } else {
        selectedAnswer = { answer: req.file.path.replace("\\", "/") };
      }
    } else {
      //if type question is paragraph
      if (req.query.answer != "") {
        selectedAnswer = { answer: req.body.answer };
      } else {
        return res
          .status(404)
          .json({ message: "You have to add answer", messageType: "info" });
      }
    }
    question.selectedAnswer = selectedAnswer;
    await takenExam.save();

    return res.status(200).json({ message: "added" });
  } catch (error) {
    console.log(error);

    return res.status(200).json({ message: error, messageType: "danger" });
  }
};

exports.submitHomework = async (req, res, next) => {
  const examId = req.params.homeworkId;
  const recivedAnswers = req.body.selectedAnswers;
  const selectedAnswers = [...JSON.parse(recivedAnswers)];

  try {
    const takenExam = await TakenHomework.findById(examId);
    let chooseQuestions = [];
    takenExam.lessonQuestions.forEach((q) => {
      if (q.questionType === "choose" || q.questionType === "truefalse") {
        chooseQuestions.push(q);
      }
    });
    chooseQuestions.forEach(filterQuestion);
    function filterQuestion(q, index) {
      q.selectedAnswer = { answer: selectedAnswers[index] };
      q.point = selectedAnswers[index] == q.correctAnswer ? 1 : 0;
    }
    let score = 0;
    takenExam.lessonQuestions.forEach((q) => {
      return (score += q.point);
    });
    takenExam.totalScore = score;

    await takenExam.save();
    return res.status(200).json({ message: "submited", exam: takenExam });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
