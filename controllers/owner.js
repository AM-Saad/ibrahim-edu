const path = require('path')
const fs = require('fs')
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Pin = require("../models/Pin");
const Unit = require("../models/Unit");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const PdfDocument = require('pdfkit');
const User = require('../models/Users')
const msg = require("../util/message");


exports.getPins = async (req, res, next) => {
    const msgs = msg(req)
    const pinPerPage = 50;
    const pageNum = +req.query.page || 1

    const printed = await Pin.find({ printed: true }).countDocuments()
    const numPins = await Pin.find().countDocuments()
    let totalpins = numPins;
    const pins = await Pin.find().skip((pageNum - 1) * pinPerPage).limit(pinPerPage)

    try {
        return res.render("owner/pins", {
            path: "/",
            pageTitle: `All Pins`,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            user: req.user,
            pins: pins,
            numPins: numPins,
            printed: printed,
            currentPage: pageNum,
            hasNextPage: pinPerPage * pageNum < totalpins,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1,
            lastPage: Math.ceil(totalpins / pinPerPage)
        });
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}

exports.registerPin = async (req, res, next) => {
    let pinsLength = req.body.pinsLength
    if (!pinsLength) return res.status(404).json({ message: 'Add pins number', messageType: 'warning' })

    for (let i = 0; i <= pinsLength; i++) {
        let newpin = new Pin({ printed: false, used: false })
        await newpin.save()
    }
    req.flash('success', 'Pins created')
    return res.redirect('/owner/panel')

}

exports.printpins = async (req, res, next) => {
    const pins = parseInt(req.body.pins, 10)
    if (!pins) return res.status(404).json({ message: 'Add pins number', messageType: 'warning' })
    try {

        const notprinted = await Pin.find({ printed: false }).countDocuments()
        if (pins > notprinted) return res.status(401).json({ message: `You dont have enough to print max number is ${notprinted}`, messageType: 'info' })
        let allpins = []
        for (let i = 0; i < pins; i++) {
            // let updated = await Pin.findOneAndUpdate({ printed: false }, { printed: true }, { new: true })
            let updated = await Pin.findOne({ printed: false })
            allpins.push(updated)
        }
        return res.status(200).json({ message: 'Fetched', messageType: 'success', pins: allpins })
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}

exports.getOwnerPanel = async (req, res, next) => {
    const msgs = msg(req)
    // const pins = await Pin.find()
    // console.log(pins);

    try {

        return res.render("owner/owner-panel", {
            path: "/",
            pageTitle: `Owner Panel`,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            user: req.user,
        });
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}

exports.getTeacherStatus = async (req, res, next) => {
    const msgs = msg(req)

    try {
        const teachers = await Teacher.find();
        res.render('owner/teacher-status', {
            teachers: teachers,
            pageTitle: 'Teacher Status',
            path: '/teacherStatus',
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.user
        });

    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}

exports.getSubjects = async (req, res, next) => {
    const msgs = msg(req)

    try {
        const subjects = await Subject.find();
        res.render('owner/subjects', {
            subjects: subjects,
            pageTitle: 'All Subjects',
            path: '/subjects',
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.user
        });

    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}
exports.registerSubject = async (req, res, next) => {

    const errors = validationResult(req);

    const _ownerkey = "102030";
    const { name, grade, ownerkey } = req.body;

    if (!errors.isEmpty()) {
        const subjects = await Subject.find();
        return res.status(422).render("owner/teacher-status", {
            path: "/ownerpanel",
            pageTitle: "Owner Panel",
            errMessage: errors.array()[0].msg,
            sucMessage: null,
            subjects: subjects,
            hasError: true,
            user: req.user,
            oldInputs: {
                name: name,
                grade: grade,
            }
        });
    }

    if (ownerkey !== _ownerkey) {
        console.log('Owner Key err');
        req.flash('alert', 'Invalid Owner Key')
        return res.redirect('/owner/subjects')
    }

    try {
        const subject = await Subject.findOne({ name: name, grade: grade })
        if (subject) {
            req.flash('alert', 'Subject with same name and grade Exist!')
            return res.redirect('/owner/subjects')
        }
        let imagePath;
        if (req.file === undefined) {
            imagePath = ''
        } else {
            imagePath = req.file.path.replace("\\", "/");
        }

        const newSubject = new Subject({
            name: name.toLowerCase(),
            grade: grade,
            image: imagePath
        });
        await newSubject.save();
        req.flash('success', "New Subject Added Successfully")
        return res.redirect('/owner/subjects')
    } catch (error) {
        console.log(error);
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}


exports.getSubject = async (req, res, next) => {
    const id = req.params.id
    try {
        const subject = await Subject.findOne({ _id: id })
        console.log(subject);

        if (!subject) {
            req.flash('alert', "No Suject Found!")
            return res.redirect('/owner/subjects')
        }
        const teachers = await subject.populate('teachers').execPopulate()

        res.render('owner/single-subject', {
            subject: subject,
            teachers: teachers,
            pageTitle: `${subject.name}`,
            path: '/subject',
            hasError: false,
            user: req.user,
        })
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}

exports.deleteSubject = async (req, res, next) => {
    const id = req.params.id;
    try {
        const subject = await Subject.findOne({ _id: id })
        if (!subject) {
            req.flash('alert', 'No subject Found')
            return res.redirect('/owner/subjects')
        }
        await subject.remove()


        /// Deal with teachers in  subject


        req.flash('success', "subject Deleted")
        return res.redirect('/owner/subjects')
    } catch (error) {
        console.log(error);

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}

exports.getStudentsStauts = (req, res, next) => {
    const msgs = msg(req)
    Teacher.findOne().then(t => {
        if (t) {

            return res.render('owner/student-status', {
                pageTitle: 'Student Status',
                path: '/Student Statuse',
                user: req.user,
                errMessage: msgs.err,
                sucMessage: msgs.success,
                teacher: t
            });
        }
    })

}

exports.studentTeachers = async (req, res, next) => {
    const studentId = req.params.studentId;

    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            return res.status(500).json({ message: 'Student Dosent exsist yet..', messageType: 'info' })

        }
        const result = await student.populate('teachers.teacherId').execPopulate();
        const mapedTeachers = result.teachers.map(t => {
            return t.teacherId
        })
        return res.status(200).json({ student: student })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }

}
exports.deleteStudnet = async (req, res, next) => {
    const studentId = req.params.studentId
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            req.flash('alert', "Student Not Found!")
            return res.redirect('/owner/ownerpanel')
        }
        await student.remove()
        req.flash('success', "Student Deleted")
        return res.redirect('/owner/ownerpanel')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}
exports.resetPassword = async (req, res, next) => {
    const studentId = req.params.studentId

    try {
        const student = await Student.findOne({ _id: studentId })

        student.password = '$2a$12$.m9hXgag0rMTBbiXkbhReOWG7C9g8ADna0Y/XBMgfNMKweZ/gGBCG'
        await student.save()
        req.flash('success', "Password Reseted")
        return res.redirect('/owner/studentStatus')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.getStudentByNumber = async (req, res, next) => {
    const studentnumber = req.params.studentNumber
    console.log(studentnumber);
    try {
        const student = await Student.findOne({ mobile: studentnumber })
        if (!student) {
            return res.status(404).json({ message: 'No Student Found', messageType: 'info' })
        }
        return res.status(200).json({ student: student })

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}


exports.activationAllStudents = async (req, res, next) => {
    const state = req.query.state
    try {
        const students = await Student.find()
        students.forEach(async (s) => {
            s.activated = state
            await s.save()
        })
        return res.status(200).json({ message: 'Students Updated', messageType: 'success' })
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}


exports.activationStudent = async (req, res, next) => {
    const studentId = req.params.studentId
    const state = req.query.state
    try {
        const student = await Student.findOne({ _id: studentId })
        student.activated = state
        await student.save()
        return res.status(200).json({ message: 'Activated', messageType: 'success' })
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
    }
}