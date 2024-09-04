const express = require("express");

const { check, body } = require('express-validator/check');
const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isStudent = require("../middlewear/is-student");
const isOwner = require("../middlewear/is-owner");
const authController = require("../controllers/auth");
const studentController = require("../controllers/student");
const teacherController = require("../controllers/teacher");
const ownerController = require("../controllers/owner");

const router = express.Router();

router.get("/panel", isAuth, isTeacher, isOwner, ownerController.getOwnerPanel);

router.get("/teacherStatus", isAuth, isOwner, ownerController.getTeacherStatus);
router.get("/studentStatus", isAuth, isOwner, ownerController.getStudentsStauts);
// router.get("/studentTeachers/:studentId", isAuth, isOwner, ownerController.studentTeachers);
// router.post("/generatePins", isAuth, isOwner, ownerController.generatePins);


router.get("/subjects/", isAuth, isOwner, ownerController.getSubjects);
router.post("/subjects/", isAuth, isOwner, ownerController.registerSubject);
router.get("/subjects/get/:id", isAuth, isOwner, ownerController.getSubject);
router.get("/subjects/delete/:id", isAuth, isOwner, ownerController.deleteSubject);


router.get("/pins", isAuth, isOwner, ownerController.getPins);
router.post("/pins/", isAuth, isOwner, ownerController.registerPin);
router.put("/pins/print", isAuth, isOwner, ownerController.printpins);



router.put("/api/students/active/:studentId", isAuth, ownerController.activationStudent);
router.put("/api/students/active/all", isAuth, ownerController.activationAllStudents);
module.exports = router;
