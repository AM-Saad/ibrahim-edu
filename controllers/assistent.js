const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Assistent = require("../models/Assistent");
const bcrypt = require("bcryptjs");
const msg = require("../util/message");

exports.getHome = async (req, res, next) => {
    const msgs = msg(req)
    try {
        const teacher = await Teacher.find()
        if (teacher.length > 0) {
            return res.render('assistent/events', {
                pageTitle: 'Home',
                path: '/assistenthome',
                user: req.user,
                teacher: teacher[0],
                centers: teacher[0].centers,
                errMessage: msgs.err,
                sucMessage: msgs.success,
            })
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

}


exports.getStudents = async (req, res, next) => {
    const msgs = msg(req)
    try {
        const teacher = await Teacher.find()
        if (teacher.length > 0) {
            res.render('assistent/students', {
                pageTitle: 'Students',
                path: '/assistenthome',
                user: req.user,
                teacher: teacher[0],
                errMessage: msgs.err,
                sucMessage: msgs.success,
            })
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

}

exports.getSettings = async (req, res, next) => {
    const msgs = msg(req)

    try {
        const assistent = await Assistent.findOne({ _id: req.user._id })

        return res.render('assistent/settings', {
            pageTitle: 'Settings',
            path: '/settings',
            user: assistent,
            errMessage: msgs.err,
            sucMessage: msgs.success,
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.updateInfo = async (req, res, next) => {
    const assistentId = req.body.assistentId;
    const assistentName = req.body.updatedName;
    let newImage;
    try {
        const assistent = await Assistent.findOne({ _id: assistentId })
        console.log(assistent);

        if (!assistent) {
            req.flash('alert', 'No Assistent Found!!')
            return res.redirect('/assistent/settings')
        }

        if (req.file === undefined) {
            if (assistent.image === null || assistent.image === '') {
                newImage = ''
            }
            newImage = assistent.image
        } else {
            newImage = req.file.path.replace("\\", "/");
        }

        assistent.name = assistentName
        assistent.image = newImage

        await assistent.save()
        console.log(assistent);
        req.flash('success', "infromation updated")
        return res.redirect('/assistent/settings')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.changePass = async (req, res, next) => {
    const assistentId = req.body.assistentId;
    const oldPass = req.body.oldPass;
    const newPass = req.body.newPass;

    try {
        const assistent = await Assistent.findOne({ _id: assistentId })
        if (!assistent) {
            req.flash('alert', 'No Assistent Found!!')
            return res.redirect('/assistent/settings')
        }
        console.log(assistent);

        const doMatch = await bcrypt.compare(oldPass, assistent.password)
        if (!doMatch) {
            req.flash("alert", "Old Password Is Incorrect...");
            return res.redirect("/assistent/settings");
        }
        const hashedNewPassword = await bcrypt.hash(newPass, 12)
        assistent.password = hashedNewPassword
        await assistent.save()
        req.flash('success', 'Password Changed Successfully')
        return res.redirect('/assistent/settings')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.getRequests = async (req, res, next) => {
    const msgs = msg(req)
    try {
        const teacher = Teacher.find()
        const response = await teacher
            .populate('requests')
            .execPopulate()
        console.log(response);

        const mappedRequests = response.requests.map(r => ({
            student: r.studentId,
            studentCenter: r.studentId.teachers.filter(t => { return t.teacherId.toString() === teacher._id.toString() })[0].center
        }))

        res.render("assistent/teacherRequests", {
            path: "/teacherRequests",
            pageTitle: "Teacher Requests",
            sucMessage: sucMessage,
            errMessage: errMessage,
            userId: req.user._id,
            students: mappedRequests,
            user: req.user,

        });
    } catch (err) {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }



}

exports.acceptRequest = async (req, res, next) => {

    const studentId = req.params.studentId;
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            req.flash('alert', 'Something went wrong, we cannot find this student')
            return res.redirect('/assistenthome')
        }
        student.activated = true
        await student.save()

        const teacher = await Teacher.findOne({})

        const filteredRequests = teacher.requests.filter(r => {
            return r.studentId.toString() != student._id.toString()
        })
        teacher.requests = filteredRequests
        await teacher.save()
        req.flash('success', 'Request Accepted')
        return res.redirect('/assistent/teacherrequests')

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}


exports.denyRequest = async (req, res, next) => {

    const studentId = req.params.studentId;
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            req.flash('alert', 'Something went wrong, we cannot find this student')
            return res.redirect('/assistenthome')
        }
        student.activated = false
        await student.save()

        const teacher = await Teacher.findOne({})

        const filteredRequests = teacher.requests.filter(r => {
            return r.studentId.toString() != student._id.toString()
        })
        teacher.requests = filteredRequests
        await teacher.save()
        req.flash('success', 'Request Accepted')
        return res.redirect('/assistent/teacherrequests')

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}