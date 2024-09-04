const express = require("express");

const { check, body } = require("express-validator/check");
const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isAdmin = require("../middlewear/is-admin");
const teacherController = require("../controllers/teacher");
const router = express.Router();


router.get("/home", isAuth, isTeacher, teacherController.home);
router.get("/search/:searchVal", isAuth, isTeacher, teacherController.search);


router.get('/settings', isAuth, isTeacher, teacherController.settings)
router.post("/settings/info", isAuth, isTeacher, teacherController.updateTeacherInfo);
router.post("/settings/password", isAuth, isTeacher, teacherController.changeTeacherPass);

router.get("/centers/", isAuth, isTeacher, teacherController.getTeacherCenters);
router.post("/centers/:center", isAuth, isTeacher, teacherController.addTeacherCenter);
router.delete("/centers/:center", isAuth, isTeacher, teacherController.removeTeacherCenter);


router.get("/students/", isAuth, isTeacher, teacherController.studentspage);
router.delete("/api/students/:studentId", isAuth, isTeacher, teacherController.deleteStudent);

router.post("/students/sheet", isAuth, isTeacher, teacherController.studentsExecl);
router.post("/questions/sheet/:examId", isAuth, isTeacher, teacherController.examExecl);
router.get("/excel/demo", isAuth, teacherController.downloadDemo);
router.get("/excel/demo/questions", isAuth, teacherController.downloadQuestionDemo);



router.get("/assistents/", isAuth, isTeacher, teacherController.assistentspage);
router.post("/assistents", isAuth, isTeacher, [check("name").isLength({ min: 1 }).trim().withMessage("Add assistent name"),
body(
    "password",
    'password must be  atleast " 8 " characters'
)
    .isLength({ min: 8 })
    .isAlphanumeric()
    .trim(),
body("confPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error("Password NOT match!");
    }
    return true;
}),
],
    teacherController.postAddAssistant
);
router.post("/deleteAssistent/:assistentId", isAuth, isTeacher, teacherController.deleteAssistent);
router.post("/assistents/state/:assistentId", isAuth, isTeacher, teacherController.assistentState);


router.get("/units/new", isAuth, isAdmin, teacherController.getNewUnit);
router.post("/units", isAuth, isAdmin, [body("unitName").trim().isLength({ min: 4 }).withMessage('Unit Name Must Be Added')], isAuth, teacherController.postNewUnit);
router.get("/units", isAuth, isAdmin, teacherController.unitsPage);
router.get("/api/units", isAuth, teacherController.getAllUnit);
router.get('/units/:unitId', isAuth, teacherController.getUnit)
router.put("/api/units/:unitId", isAuth, teacherController.editUnit);
router.get("/units/delete/:unitId", isAuth, teacherController.deleteUnit);


router.get("/lesson/:lessonId", isAuth, isAdmin, teacherController.getLessonPage);
router.get("/addLesson/:unitId", isAuth, isAdmin, teacherController.getAddLesson);
router.post("/lesson/:unitId", isAuth, isAdmin, [body("lessonName").trim().isLength({ min: 4 }).withMessage('Lesson Name Must Have Atleast 4 characters'), body("lessonNo").trim().isLength({ min: 1 }).withMessage('Lesson number is required')], teacherController.postAddLesson);
router.get("/lesson/delete/:lessonId", isAuth,  teacherController.deleteLesson);
router.post("/lesson/edit/:lessonId", isAuth, isAdmin, teacherController.editLesson);
router.post("/lesson/files/:id", isAuth, isAdmin, teacherController.uploadFile);
router.get("/lesson/files/:id", isAuth,  teacherController.deleteFile);

router.get("/videos/:videoId", isAuth, teacherController.openvideo);
router.post("/videos/:lessonId", isAuth, isAdmin, teacherController.newvideo);
router.get("/videos/delete/:lessonId", isAuth, isAdmin, teacherController.deletevideo);


router.post("/exam/:lessonId", isAuth, isAdmin, teacherController.createExam);
router.get("/exam/delete/:lessonId", isAuth,  teacherController.deleteExam);
router.get("/exam/:examId", isAuth, isAdmin, teacherController.getExamPage);
router.get("/exam/api/:examId", isAuth, teacherController.getExamAPI);

router.put("/exam/questions/:examId", isAuth, teacherController.editQuestion);
router.post("/exam/questions/:examId", isAuth, [body("question").trim().isLength({ min: 1 }).withMessage(' Must Have Question..'), body("correctAnswer").trim()], teacherController.addQuestion);
router.delete("/exam/questions/:examId", isAuth, teacherController.deleteQuestion);
router.post("/exam/settings/:examId", isAuth, teacherController.updateExamSettings);




router.post("/homework/:lessonId", isAuth,  teacherController.createhomework);
router.get("/homework/delete/:lessonId", isAuth,  teacherController.deletehomework);
router.get("/homework/:homeworkId", isAuth,  teacherController.gethomeworkPage);
router.get("/homework/api/:homeworkId", isAuth, teacherController.gethomeworkAPI);
router.post("/homework/settings/:homeworkId", isAuth, teacherController.updateHomeworkSettings);

router.put("/homework/questions/:homeworkId", isAuth, teacherController.edithomeworkQuestion);
router.post("/homework/questions/:homeworkId", isAuth, [body("question").trim().isLength({ min: 1 }).withMessage(' Must Have Question..'), body("correctAnswer").trim()], teacherController.addhomeworkQuestion);
router.delete("/homework/questions/:homeworkId", isAuth, teacherController.deletehomeworkQuestion);



router.get("/events/", isAuth, teacherController.getEvents);
router.post("/events/", isAuth, teacherController.addEvent);
router.delete("/events/:eventId", isAuth, teacherController.deleteEvent);



router.get("/pins", isAuth, teacherController.getPins);
router.post("/pins/", isAuth, teacherController.registerPin);
router.get("/pins/print", isAuth, teacherController.getprintpins);
router.post("/pins/print", isAuth, teacherController.printpins);
router.get("/pins/:id/delete", isAuth, teacherController.deletePin);


module.exports = router;