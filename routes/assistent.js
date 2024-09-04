const express = require("express");

const { check, body } = require('express-validator/check');
const studentController = require("../controllers/student");
const teacherController = require("../controllers/teacher");
const assistentController = require("../controllers/assistent");

const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isAdmin = require("../middlewear/is-admin");

const router = express.Router();

router.get('/home', isAuth, isAdmin, assistentController.getHome)
router.get('/students', isAuth, isAdmin, assistentController.getStudents)
router.get('/settings', isAuth, isAdmin, assistentController.getSettings)
router.post('/updateinfo', isAuth, isAdmin, assistentController.updateInfo)
router.post('/changePass', isAuth, isAdmin, assistentController.changePass)

router.get("/teacherrequests", isAuth, isAdmin, assistentController.getRequests);


module.exports = router;
