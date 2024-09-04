const express = require("express");

// const { check, body } = require('express-validator/check');
const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isStudent = require("../middlewear/is-student");
const isActive = require("../middlewear/is-activated");
const authController = require("../controllers/auth");
const studentController = require("../controllers/student");
const { check, body } = require("express-validator/check");

const router = express.Router();

// router.get('/classroom', isAuth, isStudent, studentController.getClassRoom);
router.get('/home', isAuth, isStudent, studentController.getHome);

router.get('/profile', isAuth, isStudent, isActive, studentController.getProfile);
router.post('/info/password',
    [body("newpass")
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim()],
    isAuth, isStudent, studentController.changepassword);
// router.get('/settings', isAuth, studentController.getSettings);
router.post('/editPresonalInfo', isAuth, isStudent, isActive, studentController.editPresonalInfo);
router.get('/teacherCenters', isAuth, isStudent, isActive, studentController.getTeacherCenters);
router.post('/addCenter', isAuth, isStudent, studentController.postAddCenter);

router.get('/takenExam/:studentId', isAuth, isActive, studentController.getTakenExam);

router.get('/units/:termNo', isAuth, isStudent, isActive, studentController.getTremUnits);
// router.get('/api/units/:termNo', isAuth, isStudent, isActive, studentController.getTremUnitsApi);
router.get('/unit/:unitId', isAuth, isStudent, isActive, studentController.getUnitLessons);
router.get('/lesson/:lessonId', isAuth, isStudent, isActive, studentController.getLesson);
router.get('/searchUnit/:unitName', isAuth, isStudent, studentController.searchUnit);
router.get('/searchExam/:name', isAuth, isStudent, isActive, studentController.searchLesson);



router.post('/checkexam/:examId', isAuth, isStudent, isActive, studentController.checkexam);
router.post('/checklesson/:lessonId', isAuth, isStudent, isActive, studentController.checklesson);
router.get('/exam/:examId', isAuth, isStudent, isActive, studentController.getExamPage);
router.post('/exam/start/:examId', isAuth, isStudent, isActive, studentController.startExam);
router.put('/exam/answer/:examId', isAuth, isStudent, isActive, studentController.submitAnswer);
// router.post('/submitParagraphAnswer/:examId', isAuth, isStudent, isActive, studentController.submitParagraphAnswer);
router.post('/exam/submit/:examId', isAuth, isStudent, isActive, studentController.submitExam);





router.post('/checkhomework/:homeworkId', isAuth, isStudent, isActive, studentController.checkhomework);
router.get('/homework/:homeworkId', isAuth, isStudent, isActive, studentController.getHomeworkPage);
router.post('/homework/start/:homeworkId', isAuth, isStudent, isActive, studentController.startHomework);
router.put('/homework/answer/:homeworkId', isAuth, isStudent, isActive, studentController.submitHomeworkAnswer);
// router.post('/submitParagraphAnswer/:homeworkId', isAuth, isStudent, isActive, studentController.submitParagraphAnswer);
router.post('/homework/submit/:homeworkId', isAuth, isStudent, isActive, studentController.submitHomework);


// router.get('/getColleagues', isAuth, isStudent, studentController.getColleagues)
// router.get('/colleague/:colleagueId', isAuth, isStudent, studentController.getSingleColleague)

router.get('/getTeachersEvents', isAuth, isStudent, studentController.getTeachersEvents)
router.post('/addStar', isAuth, isStudent, studentController.addStar)
router.post('/removeStar', isAuth, isStudent, studentController.postRemoveStar)


router.get('/activate', isAuth, isStudent, studentController.getactivate)
router.post('/activate', isAuth, isStudent, studentController.postactivate)

module.exports = router;
