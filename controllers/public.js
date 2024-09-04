const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Comment = require("../models/Comment");
const Event = require("../models/Event");
const Lecture = require("../models/Lecture");
const User = require("../models/Users");
const Exam = require("../models/Exam");
const TakenExam = require("../models/TakenExam");
const Homework = require("../models/Homework");
const TakenHomework = require("../models/TakenHomework");
const msg = require("../util/message");
const Notifications = require("../models/Notifications");
const pushNotification = require("../util/notification");
const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

exports.studentExams = async (req, res, next) => {
  const studentId = req.params.studentId;

  let isTeacher = req.user.isStudent ? false : true;
  let userType = req.user.isTeacher
    ? "teahcer"
    : req.user._id.toString() !== studentId.toString()
    ? "colleague"
    : "same";
  let exams;
  try {
    const student = await Student.findOne({ _id: studentId });
    if (!student)
      return res
        .status(404)
        .json({ message: "Cannot find this student", messageType: "alert" });
    if (isTeacher) {
      exams = await TakenExam.find({ student: studentId });
      homeworks = await TakenHomework.find({ student: studentId });
    } else {
      homeworks = await TakenHomework.find({ student: studentId });
      exams = await TakenExam.find({ student: studentId });
    }

    return res.status(200).json({
      exams: exams,
      homeworks: homeworks,
      isTeacher: isTeacher,
      userType: userType,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.studentsTakenExam = async (req, res, next) => {
  const center = req.body.center;
  const examId = req.params.examId;

  const all = [];
  try {
    async function getexams() {
      const exam = await Exam.findOne({ _id: examId });
      const students = await exam.populate("students").execPopulate();
      const filteredStudents = students.students.filter(
        (s) => s.center == center
      );

      for (const s of filteredStudents) {
        const exam = await TakenExam.findOne({
          student: s._id,
          examId: examId,
        });

        exam.student = s;
        all.push(exam);
      }
      return res.status(200).json({ exams: all });
    }
    getexams();
  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  const studentId = req.params.studentId;
  try {
    const student = await Student.findOne({ _id: studentId });
    const teacher = await Teacher.findOne();

    if (!student) {
      req.flash("alert", "Cannot found this student");
      return res.redirect("/");
    }
    let center = student.center;
    return res.render("student/profile", {
      path: "/",
      pageTitle: `${student.name} Profile`,
      errMessage: null,
      sucMessage: null,
      username: req.user.name,
      isTeacher: req.user.isTeacher ? true : null,
      student: student,
      user: req.user,
      centers: teacher.centers,
      studentCenter: center,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.addStudentScore = async (req, res, next) => {
  const examId = req.params.examId;
  const questionId = req.query.questionId;
  const newscore = req.body.score;
  const newScore = parseInt(newscore, 10);
  try {
    if (!newscore)
      return res
        .status(401)
        .json({ message: `Add new score`, messageType: "info" });
    const exam = await TakenExam.findById(examId);
    const questionIndex = exam.lessonQuestions.findIndex(
      (q) => q._id.toString() === questionId.toString()
    );
    if (questionIndex >= 0) {
      if (exam.lessonQuestions[questionIndex].questionScore < newscore)
        return res.status(401).json({
          message: `Max points for this question is ${exam.lessonQuestions[questionIndex].questionScore}`,
          messageType: "info",
        });
      exam.lessonQuestions[questionIndex].point = newScore;
      await exam.save();
      return res
        .status(200)
        .json({ message: "Points Changed", messageType: "success" });
    } else {
      return res.status(404).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, try again later",
      messageType: "danger",
    });
  }
};
exports.addHomeworkScore = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const questionId = req.query.questionId;
  const newscore = req.body.score;
  const newScore = parseInt(newscore, 10);
  try {
    if (!newscore)
      return res
        .status(401)
        .json({ message: `Add new score`, messageType: "info" });
    const exam = await TakenHomework.findById(homeworkId);
    const questionIndex = exam.lessonQuestions.findIndex(
      (q) => q._id.toString() === questionId.toString()
    );
    if (questionIndex >= 0) {
      if (exam.lessonQuestions[questionIndex].questionScore < newscore)
        return res.status(401).json({
          message: `Max points for this question is ${exam.lessonQuestions[questionIndex].questionScore}`,
          messageType: "info",
        });
      exam.lessonQuestions[questionIndex].point = newScore;
      await exam.save();
      return res
        .status(200)
        .json({ message: "Points Changed", messageType: "success" });
    } else {
      return res.status(404).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, try again later",
      messageType: "danger",
    });
  }
};

exports.removeTakenExam = async (req, res, next) => {
  const examId = req.query.examId;
  const studentId = req.params.studentId;
  try {
    const student = await Student.findOne({ _id: studentId });
    const exam = await TakenExam.findById(examId);
    if (!student)
      return res.status(401).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    if (!exam)
      return res.status(401).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    const presistexams = student.exams.filter(
      (e) => e.exam.toString() != examId.toString()
    );
    student.exams = presistexams;
    await exam.remove();
    await student.save();

    //update this in production
    //Remove student from orginal exam

    const originalExam = await Exam.findById(exam.examId);

    if (originalExam) {
      originalExam.students = originalExam.students.filter(
        (s) => s.toString() !== studentId.toString()
      );
      await originalExam.save();
    }

    return res
      .status(200)
      .json({ message: "Taken Exam Deleted", messageType: "success" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Somthing went wrong please try again",
      messageType: "warning",
    });
  }
};

exports.removeHomework = async (req, res, next) => {
  const studentId = req.params.studentId;
  const homeworkId = req.query.homeworkId;
  try {
    const student = await Student.findOne({ _id: studentId });
    const exam = await TakenHomework.findById(homeworkId);
    if (!student)
      return res.status(401).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    if (!exam)
      return res.status(401).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    const presistexams = student.homeworks.filter(
      (e) => e.homework.toString() !== homeworkId.toString()
    );
    student.homeworks = presistexams;
    await exam.remove();
    await student.save();

    //update this in production
    //Remove student from orginal exam

    const originalExam = await Homework.findById(exam.homeworkId);

    if (originalExam) {
      originalExam.students = originalExam.students.filter(
        (s) => s.toString() !== studentId.toString()
      );
      await originalExam.save();
    }

    return res
      .status(200)
      .json({ message: "Homework Deleted", messageType: "success" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Somthing went wrong please try again",
      messageType: "warning",
    });
  }
};

exports.updateStudentCenter = async (req, res, next) => {
  const studentId = req.params.studentId;
  const center = req.body.center;
  const name = req.body.name;
  const mobile = req.body.mobile;
  const parent = req.body.parent;
  const code = req.body.code;
  try {
    const student = await Student.findOne({ _id: studentId });
    if (!student)
      return res
        .status(404)
        .json({ message: "Cannot find this student", messageType: "warning" });
    if (center !== student.center) {
      student.center = center;
      // add student to lecture related to new center
      const lectures = await Lecture.find({
        grade: student.grade,
        center: center,
      });
      if (lectures.length > 0) {
        lectures.forEach(async (l) => {
          const exist = l.students.findIndex(
            (s) => s.id.toString() === student._id.toString()
          );
          if (exist === -1) {
            l.students.push({
              id: student._id,
              name: student.name,
              attended: false,
              date: "",
              note: "",
            });
            await l.save();
          }
        });
      }
    }
    student.name = name || student.name;
    student.mobile = mobile || student.mobile;
    student.parentNo = parent || student.parentNo;
    student.code = code || student.code;
    await student.save();

    return res
      .status(200)
      .json({ message: "Center Updated", messageType: "success" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.aboutUs = (req, res, next) => {
  return res.render("public/about", {
    path: "/about",
    pageTitle: "About us",
    errMessage: null,
    SuccessMessage: null,
  });
};
exports.contactUs = (req, res, next) => {
  return res.render("public/contact", {
    path: "/contact",
    pageTitle: "Contact us",
    errMessage: null,
    SuccessMessage: null,
  });
};
exports.policy = (req, res, next) => {
  return res.render("public/policy-terms", {
    path: "/policy",
    pageTitle: "Policy and terms",
    errMessage: null,
    SuccessMessage: null,
  });
};

exports.getCompetionResult = async (req, res, next) => {
  const grade = 1;
  const term = 1;
  try {
    const students = await Student.find({ grade: grade });
    const spicifictermlessons = students.forEach((s) => {
      const lessonForTrem = s.lessons.filter((l) => {
        if (l.lessonTerm !== undefined || l.lessonTerm !== null) {
          return l.lessonTerm === term;
        }
        return lessonForTrem;
      });
    });
  } catch (error) {}
};

exports.getRequests = (req, res, next) => {
  const teacherId = req.user._id;
  const msgs = msg(req);

  Teacher.findOne()
    .then((teacher) => {
      teacher
        .populate("requests")
        .execPopulate()
        .then((response) => {
          const mappedRequests = response.requests.map((r) => ({
            student: r,
          }));
          return res.render("teacher/requests", {
            path: "/requests",
            pageTitle: "Requests",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            userId: req.user._id,
            students: mappedRequests,
            user: req.user,
          });
        });
    })
    .catch((err) => {
      console.log(err);

      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.acceptRequest = async (req, res, next) => {
  const studentId = req.params.studentId;
  try {
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      return res.status(404).json({
        message: "Something went wrong, we cannot find this student",
        messageType: "info",
      });
    }
    student.activated = true;

    await student.save();

    const teacher = await Teacher.findOne({});
    const filteredRequests = teacher.requests.filter((r) => {
      return r.toString() != student._id.toString();
    });
    teacher.requests = filteredRequests;
    await teacher.save();
    return res.status(200).json({ message: "He/She Following You Now" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.denyRequest = async (req, res, next) => {
  const studentId = req.params.studentId;
  try {
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      return res.status(404).json({
        message: "Something went wrong, we cannot find this student",
        messageType: "info",
      });
    }
    student.activated = false;

    await student.save();

    const teacher = await Teacher.findOne({});
    const filteredRequests = teacher.requests.filter((r) => {
      return r.toString() != student._id.toString();
    });
    teacher.requests = filteredRequests;
    await teacher.save();
    return res
      .status(200)
      .json({ message: "Request Denied", messageType: "info" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const studentId = req.params.studentId;

  try {
    const student = await Student.findOne({ _id: studentId });
    student.password =
      "$2a$12$.m9hXgag0rMTBbiXkbhReOWG7C9g8ADna0Y/XBMgfNMKweZ/gGBCG";
    await student.save();
    return res
      .status(200)
      .json({ message: "Password reseted", messageType: "success" });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};

exports.students = async (req, res, next) => {
  const studentPerPage = 1;
  const pageNum = +req.query.page || 1;
  try {
    const numStudnets = await Student.find().countDocuments();
    let totalstudent = numStudnets;
    const students = await Student.find()
      .skip((pageNum - 1) * studentPerPage)
      .limit(studentPerPage);

    const pagination = {
      currentPage: pageNum,
      hasNextPage: studentPerPage * pageNum < totalstudent,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum + 1,
      prevPage: pageNum - 1,
      lastPage: Math.ceil(totalstudent / studentPerPage),
    };
    return res.status(200).json({ students: students, pagination: pagination });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.searchStudent = async (req, res, next) => {
  const { grade, center } = req.body;
  const code = req.query.code;
  let students;
  try {
    if (code) {
      students = await Student.find({
        $or: [{ code: code }, { mobile: code }],
      });
    } else {
      if (grade && center)
        students = await Student.find({ grade: grade, center: center });
      if (!grade) students = await Student.find({ center: center });
      if (!center) students = await Student.find({ grade: grade });
    }

    if (!students)
      return res
        .status(404)
        .json({ message: "No Student Found", messageType: "info" });
    return res.status(200).json({ students: students });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};

exports.studentAttendance = async (req, res, next) => {
  const studentId = req.params.studentId;
  try {
    const student = await Student.findById(studentId);
    if (!student)
      return res.status(404).json({
        message: "No student found, Please try again ",
        messageType: "info",
      });
    const lectures = student.populate("attendance").execPopulate();
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};

exports.getbarcodes = async (req, res, next) => {
  const { grade, center } = req.query;
  const msgs = msg(req, res);
  let students;
  try {
    if (grade && center)
      students = await User.find({ grade: grade, center: "smart" });
    if (!grade) students = await User.find({ center: "smart" });
    if (!center) students = await User.find({ grade: grade });
    return res.render("teacher/barcodes", {
      path: "/barcodes",
      pageTitle: "barcodes",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      userId: req.user._id,
      students: students,
      user: req.user,
      center: center,
      grade: grade,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};
exports.attendancepage = async (req, res, next) => {
  const msgs = msg(req);
  Teacher.findOne()
    .then((t) => {
      return res.render("teacher/attendance", {
        path: "/attendance",
        pageTitle: "attendance",
        errMessage: msgs.err,
        sucMessage: msgs.success,
        userId: req.user._id,
        user: req.user,
        centers: t.centers,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.createsession = async (req, res, next) => {
  const { grade, center, number, section } = req.body;
  try {
    let lectures = [];
    if (!grade || !center || !number)
      return res.json(401).json({
        message: "Make sure to select grade, center and session number",
        messageType: "warning",
      });

    let query = { number: number, grade: grade, center: center };
    const exist = await Lecture.findOne(query);

    if (exist)
      return res.status(401).json({
        message: "Session with same informations already exist",
        messageType: "info",
      });

    const students = await Student.find({ grade: grade, center: center });
    let allstudents = [];

    if (students.length > 0)
      allstudents = students.map((s) => ({
        id: s._id,
        name: s.name,
        attended: false,
        date: "",
        center: s.center,
        note: "",
      }));

    let lecture = new Lecture({
      students: allstudents,
      date: moment().format("YYYY-MM-DD"),
      grade: grade,
      center: center,
      number: number,
      section: section || null,
    });
    await lecture.save();
    lectures.push(lecture);

    return res.status(201).json({
      message: "Created",
      messageType: "success",
      lectures: lectures,
      students: students,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  const { from, to, number, grade, center } = req.body;
  let section;
  let query = { grade: grade, center: center };
  if (!grade || !center)
    return res
      .status(401)
      .json({ message: "Select center and grade", messageType: "warning" });

  try {
    const lectures = await Lecture.find(query);
    if (lectures.length === 0)
      return res.status(404).json({
        messageType: "info",
        message: "No Session found, create new one",
      });
    const students = await Student.find({ grade: grade, center: center });
    return res.status(200).json({ lectures: lectures, students: students });
  } catch (err) {
    return res.status(500).json({
      error: err,
      message: "something went wrong, please try again later",
      messageType: "error",
    });
  }
};

exports.deleteSession = async (req, res, next) => {
  const lectureId = req.params.lectureId;
  try {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture)
      return res.status(404).json({
        message: "Something went wrong, please try again later",
        messageType: "warning",
      });
    await lecture.remove();
    const lectures = await Lecture.find({
      grade: lecture.grade,
      center: lecture.center,
    });
    const students = await Student.find({
      grade: lecture.grade,
      center: lecture.center,
    });

    return res.status(200).json({
      message: "Session Deleted",
      messageType: "success",
      lectures: lectures,
      students: students,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "something went wrong, please try again later",
      messageType: "error",
    });
  }
};

exports.confirmAttendance = async (req, res, next) => {
  const studentId = req.params.studentId.toLowerCase();
  const sessionNo = req.body.number;
  const grade = req.body.grade;
  const center = req.body.center;
  const date = req.body.date;
  let lecture;
  let section;

  if (!grade || !center || !sessionNo)
    return res.json(401).json({
      message: "Please make sure to select grade, center and session number",
      messageType: "warning",
    });
  if (!studentId)
    return res.json(404).json({
      message: "Please refresh the page and try again",
      messageType: "warning",
    });
  try {
    let query = { number: sessionNo, grade: grade, center: center };

    //Check existence of student and lecture
    // change id to _id
    const student = await Student.findOne({
      _id: studentId,
      grade: grade,
      center: center,
    });
    if (!student)
      return res.status(404).json({
        message: ` Cannot Find this Student, maybe not in Grade: ${grade} and center ${center}`,
        messageType: "warning",
      });
    let lecture = await Lecture.findOne(query);
    if (!lecture)
      return res.status(404).json({
        message:
          "Something went wrong we cannot find this session, please make sure yo have one",
        messageType: "warning",
      });

    const stuIndex = lecture.students.findIndex(
      (s) => s.id.toString() === student._id.toString()
    );

    if (stuIndex >= 0) {
      if (lecture.students[stuIndex].attended)
        return res
          .status(401)
          .json({ message: "Student already attended", messageType: "info" });
      //Save
      lecture.students[stuIndex].date = date;
      lecture.students[stuIndex].attended = true;
      student.attendance.push({
        sessionId: lecture._id,
        date: date,
        center: center,
        number: sessionNo,
        section: section || null,
      });
      await student.save();
      await lecture.save();
      return res
        .status(200)
        .json({ message: "Done", messageType: "success", student });
    } else {
      return res.status(404).json({
        message: "Something went wrong, please try again",
        messageType: "info",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};

exports.comment = async (req, res, next) => {
  const comment = req.body.comment;
  const itemId = req.params.itemId;
  let person = req.query.person;
  let itemname = req.query.itemname;
  const user = req.user;
  try {
    const newComment = new Comment({
      by: {
        name: user.name,
        image: user.image,
        id: user._id,
      },
      item: itemId,
      comment: comment,
    });

    await newComment.save();
    if (itemname === "event") {
      const event = await Event.findById(itemId);
      if (event) {
        event.comments += 1;
        await event.save();
      }
    } else {
      const exam = await TakenExam.findById(itemId);
      if (exam) {
        exam.comments += 1;
        await exam.save();
      }
    }

    if (person) {
      const result = await pushNotification(
        {
          date: "21-8-20202",
          to: person,
          item: itemId,
          content: `${user.name} commented on your ${itemname}`,
        },
        Notifications,
        user
      );
      // console.log(io.of('/notification'));
      // io.broadcast.to(data.toid).emit('notifi',{
      //     msg:'hey',
      //     name:data.name
      // });

      // io.to("notifications").emit("notifi", "Hole");

      // io.to(person).emit('notifi', { message: 'hola' })
      if (itemname === "event") {
        await Teacher.findOneAndUpdate({}, { $inc: { notifications: 1 } });
      } else {
        await Student.findOneAndUpdate(
          { _id: person },
          { $inc: { notifications: 1 } }
        );
      }
    }
    return res
      .status(200)
      .json({ message: "addedd", messageType: "success", comment: newComment });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Somthing went wrong please try again",
      messageType: "warning",
    });
  }
};

exports.getcomments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ item: req.params.itemId });
    return res
      .status(200)
      .json({ message: "fetched", messageType: "success", comments: comments });
  } catch (err) {
    return res.status(500).json({
      message: "Somthing went wrong please try again",
      messageType: "warning",
    });
  }
};

exports.getNotification = async (req, res, next) => {
  const user = req.user;
  try {
    const notifications = await Notifications.find({ to: user._id });
    if (user.isTeacher) {
      await Teacher.findByIdAndUpdate(user._id, { notifications: 0 });
    } else {
      await Student.findByIdAndUpdate(user._id, { notifications: 0 });
    }
    req.user.notifications = 0;
    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error, messageType: "error" });
  }
};
exports.markNotificationAsSeen = async (req, res, next) => {
  const studentId = req.params.studentId;
  try {
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      return res
        .status(404)
        .json({ message: "No Student Found!!", messageType: "alert" });
    }
    const notifications = student.notifications;
    for (let i = 0; i < notifications.length; i++) {
      notifications[i].seen = true;
    }
    await student.save();

    return res.status(202).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error, messageType: "error" });
  }
};

exports.activationAllStudents = async (req, res, next) => {
  const state = req.query.state;
  const { center, grade } = req.body;
  // console.log(center);

  try {
    let query = {};
    if (center && grade) {
      query = { grade: grade, center: center };
    }
    if (center && !grade) {
      query = { center: center };
    }
    if (!center && grade) {
      query = { grade: grade };
    }
    await Student.updateMany(query, { $set: { activated: state } });

    return res
      .status(200)
      .json({ message: "Students Updated", messageType: "success" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};

exports.activationStudent = async (req, res, next) => {
  const studentId = req.params.studentId;
  const state = req.query.state;
  try {
    const student = await Student.findOne({ _id: studentId });
    student.activated = state;
    await student.save();
    return res
      .status(200)
      .json({ message: "Activated", messageType: "success" });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again later",
      messageType: "danger",
    });
  }
};
