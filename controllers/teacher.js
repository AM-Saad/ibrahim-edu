const fs = require("fs");
const Assistent = require("../models/Assistent");
const Lesson = require("../models/Lesson");
const Exam = require("../models/Exam");
const Homework = require("../models/Homework");
const Teacher = require("../models/Teacher");
const Unit = require("../models/Unit");
const Student = require("../models/Student");
const Event = require("../models/Event");
const Pin = require("../models/Pin");
const bcrypt = require("bcryptjs");
const msg = require("../util/message");
const Notifications = require("../models/Notifications");
const pushNotification = require("../util/notification");
const { validationResult } = require("express-validator/check");

exports.search = async (req, res, next) => {
  const searchValue = req.params.searchVal;
  let students;
  try {
    students = await Student.findOne({});
    if (students.length > 0) {
      return await res.status(200).json(students);
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.home = async (req, res, next) => {
  const msgs = msg(req);

  try {
    return res.render("teacher/home", {
      path: "/home",
      pageTitle: "Home",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      userId: req.user._id,
      user: req.user,
      teacher: req.user,
      centers: req.user.centers,
    });
  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.studentspage = async (req, res, next) => {
  const msgs = msg(req);
  console.log(req.user.centers);
  try {
    return res.render("teacher/students", {
      path: "/students",
      pageTitle: "Students",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      userId: req.user._id,
      user: req.user,
      teacher: req.user,
    });
  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.settings = async (req, res, next) => {
  const msgs = msg(req);
  const teacher = await Teacher.findOne({});

  try {
    return res.render("teacher/settings", {
      path: "/settings",
      pageTitle: "settings",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      userId: req.user._id,
      user: req.user,
      teacher: teacher,
      hasError: false,
      oldInputs: {
        name: "",
        password: "",
        confirmPassword: "",
        mobile: "",
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.updateTeacherInfo = async (req, res, next) => {
  const teacherId = req.body.teacherId;
  const updatedName = req.body.updatedName;
  let imageUrl;
  try {
    const teacher = await Teacher.findOne({ _id: teacherId });
    if (req.file === undefined) {
      imageUrl = teacher.image;
    } else {
      imageUrl = req.file.path.replace("\\", "/");
    }
    teacher.image = imageUrl;
    teacher.name = updatedName;
    await teacher.save();
    req.flash("success", "updated successfully");
    return res.redirect("/teacher/settings");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getTeacherCenters = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({});
    return res.status(200).json({ centers: teacher.centers });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: err, messageType: "danger" });
  }
};
exports.addTeacherCenter = async (req, res, next) => {
  const center = req.params.center.toLowerCase().trim();
  const teacherId = req.user._id;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId });
    const filteredCenters = teacher.centers.filter((c) => c === center);

    if (filteredCenters.length > 0) {
      return res
        .status(400)
        .json({ message: "This Center Already Exist", messageType: "warning" });
    }
    teacher.centers.push(center);
    await teacher.save();
    req.user.centers.push(center);
    return res
      .status(200)
      .json({ message: "Center Added", messageType: "success" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.removeTeacherCenter = async (req, res, next) => {
  const centerName = req.params.center;
  const teacherId = req.user._id;
  if (centerName === "default")
    return res.status(500).json({
      message: 'Cannot Delete "Default" section',
      messageType: "warning",
    });
  try {
    const teacher = await Teacher.findOne({ _id: teacherId });
    if (!teacher)
      res.status(500).json({
        message: "Something went wrong please try again later",
        messageType: "warning",
      });

    const filteredCenter = teacher.centers.filter((c) => c != centerName);
    teacher.centers = filteredCenter;
    req.user.centers = filteredCenter;
    await teacher.save();

    await Student.updateMany(
      { center: centerName },
      { $set: { center: "default" } }
    );

    return res
      .status(200)
      .json({ message: "Center Deleted", messageType: "success" });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, try again later.",
      messageType: "danger",
    });
  }
};
exports.changeTeacherPass = async (req, res, next) => {
  const teacherId = req.body.teacherId;
  const oldPass = req.body.oldPassword;
  const newPass = req.body.newPassword;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId });

    const doMatch = await bcrypt.compare(oldPass, teacher.password);
    if (!doMatch) {
      req.flash("alert", "Old Password Is Incorrect...");
      return res.redirect("/teacher/settings");
    }
    const hashedNewPassword = await bcrypt.hash(newPass, 12);
    teacher.password = hashedNewPassword;
    await teacher.save();
    req.flash("success", "Password Changed Successfully");
    return res.redirect("/teacher/settings");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.assistentspage = async (req, res, next) => {
  const msgs = msg(req);

  try {
    const assistentsForTeacher = await Assistent.find();

    return res.render("teacher/assistents", {
      path: "/assistents",
      pageTitle: "Assistents",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      userId: req.user._id,
      user: req.user,
      teacher: req.user,
      assistents: assistentsForTeacher,
      hasError: false,
      oldInputs: {
        name: "",
        password: "",
        confirmPassword: "",
        mobile: "",
      },
    });
  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddAssistant = async (req, res, next) => {
  // const OwnerKey = 1020300;
  const { name, password, confPassword, mobile, teacherId } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("teacher/teacherPanel", {
      path: "/teacherPanel",
      pageTitle: "Teacher Panel",
      errMessage: errors.array()[0].msg,
      sucMessage: errors.array()[0].msg,
      userId: req.user._id,
      user: req.user,
      hasError: true,
      oldInputs: {
        name: name,
        password: password,
        confPassword: confPassword,
        mobile: mobile,
      },
    });
  }

  try {
    const isExist = await Assistent.findOne({ mobile: mobile });
    if (isExist) {
      req.flash("alert", "This Mobile Is Already Exist");
      return res.redirect("/teacher/assistents");
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAssistent = new Assistent({
      name: name,
      password: hashedPassword,
      mobile: mobile,
      isAssistent: true,
    });
    await newAssistent.save();

    req.flash("success", `Added Assistent Successfully`);
    return res.redirect("/teacher/assistents");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.assistentState = async (req, res, next) => {
  const assistentId = req.params.assistentId;
  const state = req.query.state;
  try {
    const assistent = await Assistent.findOne({ _id: assistentId });
    if (!assistent) {
      req.flash("alert", "Cannot Found Assistent, Please Try Again Later");
      return res.redirect("/teacher/assistents");
    }
    assistent.blocked = state === "false" ? false : true;
    await assistent.save();
    req.flash(
      "alert",
      `You've ${state === "true" ? "blocked" : "unblocked"}  ${assistent.name}.`
    );
    return res.redirect("/teacher/assistents");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteAssistent = async (req, res, next) => {
  const assistentId = req.params.assistentId;
  try {
    const assistent = await Assistent.findOne({ _id: assistentId });
    await assistent.remove();
    req.flash("success", "Assistent Removed");
    return res.redirect("/teacher/assistents");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  const studnetId = req.params.studentId;
  try {
    const student = await Student.findOneAndRemove({ _id: studnetId });
    return res.status(200).json({ message: "Student Deleted!" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewUnit = async (req, res, next) => {
  const msgs = msg(req);


  return res.render("teacher/addUnit", {
    path: "/addUnit",
    pageTitle: "Add New Unit",
    errMessage: msgs.err,
    sucMessage: msgs.success,
    username: req.user.name,
    isTeacher: req.user.isTeacher,
    user: req.user,
    hasError: false,
  });
};
exports.postNewUnit = async (req, res, next) => {
  const { grade, term, section, unitName, unitNo } = req.body;
  let unitImage;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("teacher/addUnit", {
      path: "/new-unit",
      pageTitle: "New Unit",
      errMessage: errors.array()[0].msg,
      sucMessage: errors.array()[0].msg,
      userId: req.user._id,
      user: req.user,
      hasError: true,
      oldInputs: {
        grade: grade,
        term: term,
        section: section,
        unitName: unitName.toLowerCase(),
        unitNo: unitNo,
      },
    });
  }
  const exist = await Unit.findOne({
    "unitDetails.name": unitName,
    "unitInfo.grade": grade,
    "unitInfo.term": term,
  });
  if (exist) {
    req.flash("alert", "Unit with same name exist!!");
    return res.redirect("teacher/units/new");
  }
  if (req.file) {
    unitImage = req.file.path.replace("\\", "/");
  } else {
    unitImage = "images/unitImage.jpg";
  }
  try {
    const newUnit = new Unit({
      unitInfo: {
        grade: grade,
        term: term,
        section: section,
      },
      unitDetails: {
        number: unitNo,
        name: unitName.toLowerCase(),
        image: unitImage,
      },
      allLessons: [],
    });
    await newUnit.save();
    console.log(newUnit);
    req.flash("success", "New unit created");
    return res.redirect("/teacher/units");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.unitsPage = async (req, res, next) => {
  const msgs = msg(req);

  try {
    res.render("teacher/units", {
      pageTitle: "All Units",
      path: "/all-units",
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
exports.getAllUnit = async (req, res, next) => {
  try {
    const units = await Unit.find({});
    if (!units) {
      req.flash("alert", "No units found..");
      return res
        .status(404)
        .json({ message: "No Unit avilable", messageType: "warning" });
    }
    return res.status(200).json({ units: units });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteUnit = async (req, res, next) => {
  const unitId = req.params.unitId;
  const teacherId = req.user._id;

  try {
    const unit = await Unit.findOne({ _id: unitId });
    if (!unit) {
      req.flash("alert", "This unit not found!");
      return res.redirect("/teacher/units");
    }
    await Lesson.deleteMany({ "unit.unitId": unitId });
    await unit.remove();
    req.flash("success", "Unit deleted.");
    return res.redirect(`/teacher/units`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.editUnit = async (req, res, next) => {
  const unitId = req.params.unitId;
  const { updatedName, updatedGrade, updatedSection, updatedTerm, section } =
    req.body;

  try {
    const unit = await Unit.findOne({ _id: unitId });
    if (!unit)
      return res
        .status(401)
        .json({ message: "No Unit Found", messageType: "success" });

    let imageUrl;
    if (req.file === undefined) {
      if (unit.unitDetails.image === "") {
        imageUrl = null;
      }
      imageUrl = unit.unitDetails.image;
    } else {
      imageUrl = req.file.path.replace("\\", "/");
    }

    unit.unitInfo.grade = updatedGrade;
    unit.unitInfo.term = updatedTerm;
    unit.unitDetails.name = updatedName.toLowerCase();
    unit.unitDetails.image = imageUrl;
    if (unit.unitInfo.grade === 3) {
      if (unit.unitInfo.section != updatedSection) {
        unit.unitInfo.section = updatedSection;
        await Lesson.update(
          { unit: unit._id },
          { $set: { section: updatedSection } },
          { multi: true }
        );
      }
    }
    await unit.save();
    return res
      .status(200)
      .json({ message: "Unit Updated", messageType: "success" });
  } catch (err) {
    return res.status(500).json({
      message: "Something went worng, please try again later",
      messageType: "danger",
    });
  }
};
exports.getUnit = async (req, res, next) => {
  const unitId = req.params.unitId;
  const msgs = msg(req);

  Unit.findOne({ _id: unitId })
    .then((unit) => {
      if (!unit) {
        req.flash("alert", "This Unit Not Found");
        return res.redirect("/teacher/units");
      }
      return unit
        .populate("lessons")
        .execPopulate()
        .then((lessons) => {
          return res.render("teacher/unit", {
            path: `/unit/${unit._id}`,
            pageTitle: `Unit: ${unit.unitDetails.name.toUpperCase()}`,
            unit: unit,
            user: req.user,
            lessons: lessons.lessons,
            errMessage: msgs.err,
            sucMessage: msgs.success,
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLessonPage = async (req, res, next) => {
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

    return res.render("teacher/lesson", {
      path: "/lesson",
      pageTitle: `${lesson.lessonName}`,
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

exports.getAddLesson = async (req, res, next) => {
  const unitId = req.params.unitId;
  const msgs = msg(req);

  try {
    const unit = await Unit.findOne({ _id: unitId });
    if (!unit) {
      req.flash("alert", "Cannot find this unit");
      return res.redirect(`/teacher/units`);
    }
    return res.render("teacher/addLesson", {
      path: "/addLesson",
      pageTitle: "Add Exam",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      hasError: false,
      user: req.user,
      unitId: unitId,
      oldInputs: {
        lessonName: "",
        lessonNo: "",
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddLesson = async (req, res, next) => {
  const unitId = req.params.unitId;
  const { lessonName, lessonNo, locked } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("alert", `${errors.array()[0].msg}`);
    return res.redirect(`/teacher/addLesson/${unitId}`);
  }

  let imageUrl = req.file
    ? req.file.path.replace("\\", "/")
    : "images/lesson-image.png";

  try {
    const unit = await Unit.findOne({ _id: unitId });
    if (!unit) {
      req.flash(
        "alert",
        "Something went worng. We cannot find this unit, Please Try Again Later"
      );
      return res.redirect(`/teacher/units`);
    }

    //check if unit has lesson with same number
    const exsistLesson = await Lesson.findOne({
      unit: unit._id,
      lessonNo: lessonNo,
    });
    if (exsistLesson) {
      req.flash("alert", "You've lesson with same number");
      return res.redirect(`/teacher/addLesson/${unit._id}`);
    }

    //create new lesson
    const newLesson = new Lesson({
      grade: unit.unitInfo.grade,
      term: unit.unitInfo.term,
      unit: unit._id,
      name: lessonName.toLowerCase(),
      image: imageUrl,
      lessonNo: lessonNo,
      exams: [],
      modelAnswers: [],
      pdfFiles: [],
      videos: [],
      locked: locked === "on" ? true : false,
    });

    // add the new lesson to unit
    unit.lessons.push(newLesson._id);

    await unit.save();
    await newLesson.save();
    return res.redirect(`/teacher/units/${unit._id}`);
  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.editLesson = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const { lessonName, lessonNo, lessonPin } = req.body;
  let imageUrl;
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    if (!lesson) {
      req.flash(
        "alert",
        "Cant get lesson now, maybe it related to network issues"
      );
      return res.redirect("/teacher/lessons");
    }

    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    } else {
      imageUrl = lesson.image;
    }
    lesson.name = lessonName.toLowerCase();
    lesson.image = imageUrl;
    lesson.lessonNo = lessonNo;
    if (lessonPin !== "") {
      lesson.pin = lessonPin;
    }
    await lesson.save();
    req.flash("success", "Lesson Information Updated");
    return res.redirect(`/teacher/units/${lesson.unit}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const unitId = req.query.unitId;
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    const unit = await Unit.findOne({ _id: unitId });
    unit.lessons = unit.lessons.filter((lesson) => {
      return lesson.toString() !== lessonId.toString();
    });
    await unit.save();
    await lesson.remove();
    req.flash("success", "Lesson Deleted Successfully");
    return res.redirect(`/teacher/units/${unitId}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.createExam = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    if (!lesson) {
      req.flash("alert", "No Lesson Found!");
      return res.redirect("/teacher/units");
    }

    const newExam = new Exam({
      pin: null,
      secion: lesson.section,
      timer: null,
      lesson: lesson._id,
      allQuestions: [],
    });
    await newExam.save();
    lesson.exams.push(newExam._id);
    await lesson.save();
    return res.redirect(`/teacher/exam/${newExam._id}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getExamPage = async (req, res, next) => {
  const examId = req.params.examId;
  const msgs = msg(req);
  try {
    const teacher = await Teacher.findOne({});
    return res.render("teacher/exam", {
      path: "/lesson",
      pageTitle: "Exam",
      examId: examId,
      user: req.user,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      teacher: teacher,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.getExamAPI = async (req, res, next) => {
  const examId = req.params.examId;
  try {
    await Exam.updateMany({ isOpened: true });
    await Homework.updateMany({ isOpened: true });
    const exam = await Exam.findOne({ _id: examId });
    if (!exam)
      return res
        .status(404)
        .json({ message: "Cannot Found this exam", messageType: "warning" });
    const lesson = await Lesson.findById(exam.lesson);
    if (!lesson)
      return res.status(404).json({
        message: "Something went wrong. Cannot Found this exam",
        messageType: "warning",
      });
    const lessonexam = {
      lessonName: lesson.lessonName,
      lessonImg: lesson.lessonImg,
      grade: lesson.grade,
      secion: lesson.section,
      term: lesson.term,
      pin: exam.pin,
      name: exam.name,
      timer: exam.timer,
      isOpened: exam.isOpened,
      allQuestions: exam.allQuestions,
    };
    return res
      .status(200)
      .json({ exam: lessonexam, questions: exam.allQuestions });
  } catch (err) {
    return res.status(500).json({
      message: "Interval Error Something went worng",
      messageType: "warning",
    });
  }
};
exports.updateExamSettings = async (req, res, next) => {
  const { min, pin, name } = req.body;
  const examId = req.params.examId;
  /// check if min is 0
  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.redirect(`${req.headers.referer}`);
    }

    exam.pin = pin || null;
    exam.timer = min || null;
    exam.name = name || null;
    await exam.save();
    return res.redirect(`${req.headers.referer}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.updateHomeworkSettings = async (req, res, next) => {
  const { min, pin, name } = req.body;
  const homeworkId = req.params.homeworkId;
  /// check if min is 0
  try {
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.redirect(`${req.headers.referer}`);
    }

    homework.pin = pin || null;
    homework.timer = min || null;
    homework.name = name || null;
    await homework.save();
    return res.redirect(`${req.headers.referer}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteExam = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const examId = req.query.examId;
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      req.flash("alert", "Cannot find this lesson, maybe it's deleted already");
      return res.redirect("/teacher/units");
    }
    const exam = await Exam.findById(examId);
    if (!exam) {
      req.flash("alert", "Cannot find this exam , maybe it's deleted already");
      return res.redirect("/teacher/units");
    }

    const exams = lesson.exams.filter((e) => {
      return e._id.toString() !== examId.toString();
    });
    lesson.exams = exams;
    await exam.remove();
    await lesson.save();
    req.flash("success", "Exam Deleted");
    return res.redirect(`/teacher/lesson/${lessonId}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.addQuestion = async (req, res, next) => {
  const examId = req.params.examId;
  const questionText = req.body.question;
  const correctAnswer = req.body.correctAnswer;
  const questionScore = parseInt(req.body.questionScore, 10);
  const { answer1, answer2, answer3, answer4 } = req.body;
  const type = req.query.type;
  let imageUrl;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  } else {
    imageUrl = "";
  }
  try {
    const exam = await Exam.findOne({ _id: examId });
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res
        .status(401)
        .json({ message: errors.array()[0].msg, messageType: "danger" });
    if (!exam)
      res.status(401).json({
        message: "Something went wrong. try again",
        messageType: "warning",
      });

    const oldQuestions = [...exam.allQuestions];
    let newQuestion = {
      question: questionText,
      questionImg: imageUrl,
      questionType: type,
      questionScore: questionScore || 1,
      answers: [],
      correctAnswer: correctAnswer || null,
    };

    if (type === "choose") {
      newQuestion.answers = [
        {
          answer: "null",
          answerNo: 0,
        },
        {
          answer: answer1,
          answerNo: 1,
        },
        {
          answer: answer2,
          answerNo: 2,
        },
        {
          answer: answer3,
          answerNo: 3,
        },
        {
          answer: answer4,
          answerNo: 4,
        },
      ];
    } else {
      newQuestion.answers = [
        {
          answerImage: "",
          answerNo: -1,
        },
      ];
    }
    oldQuestions.push(newQuestion);
    exam.allQuestions = oldQuestions;
    await exam.save();
    return res.status(201).json({
      message: "Question added",
      messageType: "success",
      questions: exam.allQuestions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

exports.editQuestion = async (req, res, next) => {
  const examId = req.params.examId;
  const questionId = req.query.questionId;
  const updatedQuestion = req.body.question;
  const { answer1, answer2, answer3, answer4 } = req.body;

  const updatedCorrectAnswer = req.body.correctAnswer;
  const updatedScore = req.body.questionScore;
  let imageUrl;

  try {
    const exam = await Exam.findOne({ _id: examId });
    if (!exam) {
      return res.status(401).json({
        message: "Something went wrong, try again later",
        messageType: "warning",
      });
    }

    const oldQuestions = [...exam.allQuestions];
    const questionIndex = oldQuestions.findIndex((q) => {
      return q._id.toString() === questionId.toString();
    });

    if (questionIndex >= 0) {
      if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
      } else {
        imageUrl = exam.allQuestions[questionIndex].questionImg;
      }

      exam.allQuestions[questionIndex].question = updatedQuestion;
      exam.allQuestions[questionIndex].questionImg = imageUrl;
      // check this urgent
      if (exam.allQuestions[questionIndex].questionType === "choose") {
        const updatedAnswersArray = [
          {
            answer: "null",
            answerNo: 0,
          },
          {
            answer: answer1,
            answerNo: 1,
          },
          {
            answer: answer2,
            answerNo: 2,
          },
          {
            answer: answer3,
            answerNo: 3,
          },
          {
            answer: answer4,
            answerNo: 4,
          },
        ];

        exam.allQuestions[questionIndex].answers = updatedAnswersArray;
        exam.allQuestions[questionIndex].correctAnswer = updatedCorrectAnswer;
      } else if (
        exam.allQuestions[questionIndex].questionType === "truefalse"
      ) {
        exam.allQuestions[questionIndex].correctAnswer = updatedCorrectAnswer;
      } else {
        exam.allQuestions[questionIndex].questionScore = updatedScore;
      }

      await exam.save();
      return res.status(200).json({
        message: "Question Updated",
        messageType: "success",
        questions: exam.allQuestions,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong, try again later",
      messageType: "warning",
    });
  }
};

exports.deleteQuestion = async (req, res, next) => {
  const examId = req.params.examId;
  const questionId = req.query.questionId;
  try {
    const exam = await Exam.findOne({ _id: examId });
    if (!exam) {
      return res.status(404).json({
        message: "Something went wrong, please try again",
        messageType: "wraning",
      });
    }

    const oldQuestions = [...exam.allQuestions];
    const filteredQuestion = oldQuestions.filter((q) => {
      return q._id.toString() !== questionId.toString();
    });
    exam.allQuestions = filteredQuestion;
    await exam.save();
    return res
      .status(200)
      .json({ message: "Question Deleted", messageType: "success" });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong, Please try again later",
      messageType: "danger",
    });
  }
};

exports.gethomeworkPage = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  try {
    const msgs = msg(req);
    return res.render("teacher/homework", {
      path: "/homework",
      pageTitle: "Homework",
      homeworkId: homeworkId,
      user: req.user,
      errMessage: msgs.err,
      sucMessage: msgs.success,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.gethomeworkAPI = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  try {
    const homework = await Homework.findOne({ _id: homeworkId });
    if (!homework) {
      return res.status(404).json({
        message: "Cannot Found this home work",
        messageType: "warning",
      });
    }
    const lesson = await Lesson.findById(homework.lesson);
    if (!lesson) {
      return res.status(404).json({
        message: "Something went wrong. Cannot Found this home work",
        messageType: "warning",
      });
    }
    const lessonhomework = {
      lessonName: lesson.lessonName,
      lessonImg: lesson.lessonImg,
      grade: lesson.grade,
      term: lesson.term,
      secion: lesson.section,
      allQuestions: homework.allQuestions,
      pin: homework.pin || null,
      name: homework.name || null,
      timer: homework.timer || null,
      isOpened: homework.isOpened,
    };
    return res
      .status(200)
      .json({ homework: lessonhomework, questions: homework.allQuestions });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Interval Error Something went worng",
      messageType: "warning",
    });
  }
};

exports.createhomework = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    if (!lesson) {
      req.flash("alert", "No Lesson Found!");
      return res.redirect("/teacher/units");
    }

    const newhomework = new Homework({ lesson: lesson._id, allQuestions: [] });
    await newhomework.save();
    lesson.homeworks.push(newhomework._id);
    await lesson.save();
    return res.redirect(`/teacher/homework/${newhomework._id}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deletehomework = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const homeworkId = req.query.homeworkId;
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      req.flash("alert", "Cannot find this lesson, maybe it's deleted already");
      return res.redirect("/teacher/units");
    }
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      req.flash(
        "alert",
        "Cannot find this home work , maybe it's deleted already"
      );
      return res.redirect("/teacher/units");
    }

    const homeworks = lesson.homeworks.filter((e) => {
      return e._id.toString() !== homeworkId.toString();
    });
    lesson.homeworks = homeworks;
    await homework.remove();
    await lesson.save();
    req.flash("success", "Home work Deleted");
    return res.redirect(`/teacher/lesson/${lessonId}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.addhomeworkQuestion = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const questionText = req.body.question;
  const correctAnswer = req.body.correctAnswer;
  const questionScore = parseInt(req.body.questionScore, 10);
  const { answer1, answer2, answer3, answer4 } = req.body;
  const type = req.query.type;
  let imageUrl;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  } else {
    imageUrl = "";
  }
  try {
    const homework = await Homework.findOne({ _id: homeworkId });
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res
        .status(401)
        .json({ message: errors.array()[0].msg, messageType: "danger" });
    if (!homework)
      res.status(401).json({
        message: "Something went wrong. try again",
        messageType: "warning",
      });

    const oldQuestions = [...homework.allQuestions];
    let newQuestion = {
      question: questionText,
      questionImg: imageUrl,
      questionType: type,
      questionScore: questionScore || 1,
      answers: [],
      correctAnswer: correctAnswer || null,
    };

    if (type === "choose") {
      newQuestion.answers = [
        {
          answer: "null",
          answerNo: 0,
        },
        {
          answer: answer1,
          answerNo: 1,
        },
        {
          answer: answer2,
          answerNo: 2,
        },
        {
          answer: answer3,
          answerNo: 3,
        },
        {
          answer: answer4,
          answerNo: 4,
        },
      ];
    } else {
      newQuestion.answers = [
        {
          answerImage: "",
          answerNo: -1,
        },
      ];
    }
    oldQuestions.push(newQuestion);
    homework.allQuestions = oldQuestions;
    await homework.save();
    return res.status(201).json({
      message: "Question added",
      messageType: "success",
      questions: homework.allQuestions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

exports.edithomeworkQuestion = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const questionId = req.query.questionId;
  const updatedQuestion = req.body.question;
  const { answer1, answer2, answer3, answer4 } = req.body;

  const updatedCorrectAnswer = req.body.correctAnswer;
  const updatedScore = req.body.questionScore;
  let imageUrl;

  try {
    const homework = await Homework.findOne({ _id: homeworkId });
    if (!homework)
      return res.status(401).json({
        message: "Something went wrong, try again later",
        messageType: "warning",
      });

    const oldQuestions = [...homework.allQuestions];

    const questionIndex = oldQuestions.findIndex((q) => {
      return q._id.toString() === questionId.toString();
    });

    if (questionIndex >= 0) {
      if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
      } else {
        imageUrl = homework.allQuestions[questionIndex].questionImg;
      }

      homework.allQuestions[questionIndex].question = updatedQuestion;
      homework.allQuestions[questionIndex].questionImg = imageUrl;
      // check this urgent
      if (homework.allQuestions[questionIndex].questionType === "choose") {
        const updatedAnswersArray = [
          {
            answer: "null",
            answerNo: 0,
          },
          {
            answer: answer1,
            answerNo: 1,
          },
          {
            answer: answer2,
            answerNo: 2,
          },
          {
            answer: answer3,
            answerNo: 3,
          },
          {
            answer: answer4,
            answerNo: 4,
          },
        ];

        homework.allQuestions[questionIndex].answers = updatedAnswersArray;
        homework.allQuestions[questionIndex].correctAnswer =
          updatedCorrectAnswer;
      } else if (
        homework.allQuestions[questionIndex].questionType === "truefalse"
      ) {
        homework.allQuestions[questionIndex].correctAnswer =
          updatedCorrectAnswer;
      } else {
        homework.allQuestions[questionIndex].questionScore = updatedScore;
      }

      await homework.save();
      return res.status(200).json({
        message: "Question Updated",
        messageType: "success",
        questions: homework.allQuestions,
      });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Something went wrong, try again later",
      messageType: "warning",
    });
  }
};

exports.deletehomeworkQuestion = async (req, res, next) => {
  const homeworkId = req.params.homeworkId;
  const questionId = req.query.questionId;
  try {
    const homework = await Homework.findOne({ _id: homeworkId });
    if (!homework) {
      return res.status(404).json({
        message: "Something went wrong, please try again",
        messageType: "wraning",
      });
    }

    const oldQuestions = [...homework.allQuestions];
    const filteredQuestion = oldQuestions.filter((q) => {
      return q._id.toString() !== questionId.toString();
    });
    homework.allQuestions = filteredQuestion;
    await homework.save();
    return res
      .status(200)
      .json({ message: "Question Deleted", messageType: "success" });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong, Please try again later",
      messageType: "danger",
    });
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({});
    const allevents = events.map((e) => ({
      _id: e._id,
      content: e.content,
      image: e.image,
      teacher: {
        id: req.user._id,
        name: req.user.name,
        image: req.user.profileImage,
      },
      type: e.eventtype,
      date: e.date,
      group: e.group,
      grade: e.grade,
      comments: e.comments,
      attachedlink: e.attachedlink,
      timeRange: e.timeRange,
    }));
    return res.status(200).json({ events: allevents });
  } catch (error) {
    return res.status(500).json({
      message: "Something Went Wrong, Please try again later",
      messageType: "danger",
    });
  }
};
exports.addEvent = async (req, res, next) => {
  const { content, link, eventType, eventForGroup, eventForGrade } = req.body;
  let imageUrl;
  if (req.file === undefined) {
    imageUrl = "";
  } else {
    imageUrl = req.file.path.replace("\\", "/");
  }

  try {
    const newEvent = new Event({
      eventtype: eventType,
      content: content,
      image: imageUrl,
      file: "",
      attachedlink: link,
      grade: eventForGrade || "",
      group: eventForGroup || "",
      comments: 0,
      date: new Date().toISOString(),
    });
    await newEvent.save();
    console.log(newEvent);

    let query = {};
    if (eventType === "private") {
      query = { grade: eventForGrade, center: eventForGroup };
    }
    const students = await Student.find(query);
    students.forEach(async (s) => {
      await pushNotification(
        {
          date: "21-8-20202",
          to: s._id,
          item: newEvent._id,
          content: `Mr. ${req.user.name} added new post `,
        },
        Notifications,
        req.user
      );
      s.notifications = s.notifications + 1;
      await s.save();
    });

    return res.status(200).json({
      event: newEvent,
      message: "Event Added",
      messageType: "success",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong, try again later",
      messageType: "danger",
    });
  }
};

exports.deleteEvent = async (req, res, next) => {
  const eventId = req.params.eventId;

  try {
    await Event.findByIdAndDelete(eventId);
    return res
      .status(200)
      .json({ message: "Event Deleted", messageType: "success" });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, try again later",
      messageType: "danger",
    });
  }
};

exports.uploadFile = async (req, res, next) => {
  const lessonId = req.params.id;
  const fileTitle = req.body.fileTitle;
  const fileType = req.body.fileType;

  if (req.file === undefined) {
    req.flash("alert", "You have to select file");
    return res.redirect(`/teacher/lesson/${lessonId}`);
  } else {
    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        req.flash("alert", "Something went wrong, please try again later!!");
        return res.redirect(`/`);
      }
      lesson[fileType].push({
        fileTitle: fileTitle,
        fileName: req.file.originalname,
      });

      await lesson.save();
      req.flash("success", "File Uploaded");
      return res.redirect(`/teacher/lesson/${lessonId}`);
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  }
};

exports.deleteFile = async (req, res, next) => {
  const lessonId = req.params.id;
  const fileId = req.query.fileId;
  const fileType = req.query.type;

  try {
    const lesson = await Lesson.findById(lessonId);
    const files = lesson[fileType].filter((f) => {
      return f._id.toString() != fileId.toString();
    });
    lesson[fileType] = files;
    await lesson.save();
    req.flash("success", "File Deleted!");
    return res.redirect(`/teacher/lesson/${lessonId}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.newvideo = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const { title } = req.body;
  const url = req.body.path;
  try {
    const lesson = await Lesson.findById(lessonId);
    lesson.videos.push({ title: title, path: url });
    await lesson.save();

    return res
      .status(200)
      .json({ message: "Uploaded", messageType: "success" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something Went Wrong, Please try again later",
      messageType: "danger",
    });
  }
};
exports.deletevideo = async (req, res, next) => {
  const lessonId = req.params.lessonId;
  const videoId = req.query.vidId;
  try {
    const lesson = await Lesson.findById(lessonId);
    lesson.videos = lesson.videos.filter(
      (v) => v._id.toString() != videoId.toString()
    );
    await lesson.save();

    req.flash("success", "File Deleted!");
    return res.redirect(`/teacher/lesson/${lessonId}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.openvideo = async (req, res, next) => {
  const videoId = req.params.videoId;
  const lessonId = req.query.lessonId;

  try {
    const lesson = await Lesson.findById(lessonId);

    const video = lesson.videos.find(
      (i) => i._id.toString() == videoId.toString()
    );
    if (video) {
      const stat = fs.statSync(video.path);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(video.path, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(video.path).pipe(res);
      }
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.downloadDemo = async (req, res, next) => {
  process.cwd();
  const file = `${process.cwd()}/pdf/students_demo.xlsx`;

  return res.download(file); // Set disposition and send it.
};
exports.downloadQuestionDemo = async (req, res, next) => {
  process.cwd();
  const file = `${process.cwd()}/pdf/question_demo.xlsx`;

  return res.download(file); // Set disposition and send it.
};

exports.studentsExecl = async (req, res, next) => {
  try {
    const students = await Student.insertMany(req.body.students);
    return res
      .status(200)
      .json({ message: "Students Created", messageType: "successs" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.examExecl = async (req, res, next) => {
  const examId = req.params.examId;
  const questions = req.body.questions;
  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res
        .status(404)
        .json({ message: "Exam Not Found", messageType: "warning" });
    }

    // exam.allQuestions = req.body.questions;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const newQuestion = {
        question: question.question,
        questionImg: "",
        questionType: "choose",
        questionScore: 1,
        answers: [
          {
            answer: "null",
            answerNo: 0,
          },
          {
            answer: question.answer1,
            answerNo: 1,
          },
          {
            answer: question.answer2,
            answerNo: 2,
          },
          {
            answer: question.answer3,
            answerNo: 3,
          },
          {
            answer: question.answer4,
            answerNo: 4,
          },
        ],
        correctAnswer: question.correctAnswer,
      };
      exam.allQuestions.push(newQuestion);
    }
    await exam.save();

    return res
      .status(200)
      .json({ message: "Imported", messageType: "successs" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getPins = async (req, res, next) => {
  const msgs = msg(req);
  const pinPerPage = 50;
  const pageNum = +req.query.page || 1;

  // await Pin.updateMany({}, { printed: true });
  // await Pin.deleteMany({});
  const printed = await Pin.find({
    printed: true,
  }).countDocuments();
  const numPins = await Pin.find({}).countDocuments();
  let totalpins = numPins;
  const pins = await Pin.find({})
    .skip((pageNum - 1) * pinPerPage)
    .limit(pinPerPage);

  try {
    return res.render("teacher/pins", {
      path: "/",
      pageTitle: `All Pins`,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      user: req.session.user,
      pins: pins,
      numPins: numPins,
      printed: printed,
      currentPage: pageNum,
      hasNextPage: pinPerPage * pageNum < totalpins,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum + 1,
      prevPage: pageNum - 1,
      lastPage: Math.ceil(totalpins / pinPerPage),
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.registerPin = async (req, res, next) => {
  let pinsLength = req.body.pinsLength;

  if (!pinsLength)
    return res
      .status(404)
      .json({ message: "Add Your Pin", messageType: "warning" });

  try {
    function generatePassword(length) {
      (charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
        (retVal = "");
      for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }

    let pins = [];
    for (let i = 0; i < pinsLength; i++) {
      const pin = generatePassword(10);
      if (!pins[pin]) {
        pins.push({
          pin: pin,
          printed: false,
          used: false,
          user: null,
        });
      }
    }

    await Pin.insertMany(pins);
    req.flash("success", `${pinsLength} Pins has been created`);
    return res.redirect("/teacher/pins");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.deletePin = async (req, res, next) => {
  const id = req.params.id;

  try {
    const pin = await Pin.deleteOne({ _id: id });

    req.flash("success", `Pin has been deleted`);
    return res.redirect("/teacher/pins");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.getprintpins = async (req, res, next) => {
  const msgs = msg(req);

  const pins = parseInt(req.body.reqpins, 10);

  if (!pins) {
    req.flash("alert", "Add pins number");
    return res.redirect("/teacher/pins");
  }
  try {
    const notprinted = await Pin.find({
      printed: false,
    }).countDocuments();
    if (pins > notprinted) {
      req.flash("alert", "You dont have enough pins to proceed, create new");
      return res.redirect("/teacher/pins");
    }

    const allpins = await Pin.find({ printed: false })
      .skip((1 - 1) * pins)
      .limit(pins);
    return res.render("teacher/printpins", {
      path: "/",
      pageTitle: `All Pins`,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      user: req.session.user,
      pins: allpins,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};
exports.printpins = async (req, res, next) => {
  const pins = parseInt(req.body.pins, 10);

  if (!pins)
    return res
      .status(404)
      .json({ message: "Add pins number", messageType: "warning" });
  try {
    const notprinted = await Pin.find({
      printed: false,
    }).countDocuments();
    if (pins > notprinted) {
      req.flash("alert", "You dont have enough pins to proceed, create new");
      return res.redirect("/teacher/pins");
    }
    const items = await Pin.find({ printed: false })
      .skip((1 - 1) * pins)
      .limit(pins);

    const bulkOps = items.map((update) => ({
      updateOne: {
        filter: { _id: update._id },
        // Where field is the field you want to update
        update: {
          $set: { printed: true }, //update whole document
        },
        upsert: true,
      },
    }));

    // where Model is the name of your model
    const ids = items.map((item) => item.pin);

    return Pin.collection
      .bulkWrite(bulkOps)
      .then((results) => {
        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Content-Disposition": 'attachment; filename="ids.txt"',
        });

        return res.end(ids.join("\n"));

        // req.flash('success', "Pins")
        // return res
        //   .status(200)
        //   .json({ message: "Fetched", messageType: "success" });
      })
      .catch((err) => console.log(err));
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};
