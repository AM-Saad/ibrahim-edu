const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Assistent = require("../models/Assistent");

const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");

const msg = require("../util/message");




exports.landingpage = async (req, res, next) => {
	
  try {


    if (req.user) {
      if (req.user.isTeacher) {
        return res.redirect('/teacher/home')
      } else if (req.user.isStudent) {
        return res.redirect('/home')
      } else {
        return res.redirect('/assistent/home')
      }
    } else {

      return res.render("public/landing", {
        path: "/home",
        pageTitle: 'Ibrahim Kamel',
        errMessage: null,
        SuccessMessage: null,
        user: null,

      });
    }


  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.getLogin = async (req, res, next) => {
  const msgs = msg(req)
  if (req.user) {
    if (req.user.isTeacher) {
      return res.redirect('/teacher/home')
    } else if (req.user.isStudent) {
      return res.redirect('/home')
    } else {
      return res.redirect('/assistent/home')
    }
  } else {
    return res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      user: null,

      errMessage: msgs.err,
      sucMessage: msgs.success,
    });
  }
};

exports.getVerify = async (req, res, next) => {
  const studentId = req.params.studentId
  const teacherId = req.query.teacherId
  const msgs = msg(req)

  try {
    const student = await Student.findOne({ _id: studentId })

    const teacher = await Teacher.findOne({ _id: teacherId })

    res.render("auth/verify", {
      path: "/verify",
      user: null,

      pageTitle: "Add Your Center",
      centers: teacher.centers,
      teacherId: teacherId,
      studentId: studentId,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      membership: teacher.membership
    });

  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }

}

exports.selectCenter = async (req, res, next) => {
  const center = req.body.center;
  const teacherId = req.params.teacherId;
  const studentId = req.query.studentId;

  try {
    const student = await Student.findOne({ _id: studentId })
    if (!student) {
      req.flash('alert', 'Something went wrong, cannot find student')
      return res.redirect(`/verify/${studentId}`)
    }
    const studentTeachers = [...student.teachers]
    const filteredTeacher = studentTeachers.filter(t => {
      return t.teacherId.toString() === teacherId.toString()

    })

    const teacher = filteredTeacher[0]
    teacher.center = center;

    const allTeachers = studentTeachers.filter(t => {
      return t.teacherId.toString() != teacherId.toString()
    })
    allTeachers.push(teacher)



    student.teachers = allTeachers
    await student.save()
    req.flash('success', "Successfully Added , Login In Now...")
    return res.redirect('/login')
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
}

exports.postLogin = async (req, res, next) => {
  const { mobile, password } = req.body;
  let user;

  if (req.body.isTeacher) {
    user = await Teacher.findOne({ mobile: mobile });
    if (!user) {
      user = await Assistent.findOne({ mobile: mobile })
    }
  } else {
    user = await Student.findOne({ mobile: mobile });
  }

  try {
    if (!user) {
      req.flash("alert", "Invalid mobile or password");
      return res.redirect("/login");
    }
    await bcrypt.compare(password, user.password).then(doMatch => {
      if (!doMatch) {
        req.flash("alert", "Invalid mobile or password...");
        return res.redirect("/login");
      }
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {

          if (user.isTeacher) {
            return res.redirect("/teacher/home");
          }
          if (user.isAssistent) {
            return res.redirect('/assistent/home')
          }
          if (user.isStudent) {

            return res.redirect("/home");

          }
        });
      } else {
        req.flash(
          "alert",
          "Make sure you entered a valid email and password!!"
        );
        return res.redirect("/login");
      }

    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.loginApi = async (req, res, next) => {
  const { mobile, password } = req.body;

  try {

    const user = await Student.findOne({ mobile: mobile });

    if (!user) {
      return res.status(404).json({ message: "Invalid mobile or password..." })
    }
    const doMatch = await bcrypt.compare(password, user.password)
    if (!doMatch) {
      return res.status(404).json({ message: "Invalid mobile or password..." })
    }
    return res.status(200).json(user)

  } catch (error) {
    return res.status(500)
  }

}

exports.getSignup = (req, res, next) => {
  const msgs = msg(req)
  Teacher.find().then(t => {
    if (t) {
      return res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errMessage: msgs.err,
        sucMessage: msgs.success,
        centers: t[0].centers,
        hasError: false,
        user: null,
        oldInputs: {
          name: "",
          password: "",
          confirmPassword: "",
          mobile: "",
          center: "",
          grade: "",
          school: '',
          parentNo: '',
code:''
        }
      });
    }
  })
};



exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  const {
    name,
    password,
    mobile,
    center,
    grade,
    school,
    parentNo,
    code
  } = req.body;



  try {


    const teacher = await Teacher.find()
    if (!errors.isEmpty()) {
      return res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errMessage: errors.array()[0].msg,
        sucMessage: null,
        centers: teacher[0].centers,
        hasError: true,
        oldInputs: {
          name: name,
          password: "",
          confirmPassword: "",
          mobile: mobile,
          center: center,
          grade: grade,
          school: school,
          parentNo: parentNo,
          code: code
        }
      });
    }

    const existUser = await Student.findOne({ $or: [{ mobile: mobile }, { code: code }] });
    if (existUser) {
      return res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errMessage:
          "This Mobile OR Code already exist",
        sucMessage: null,
        hasError: true,
        centers: teacher[0].centers,
        oldInputs: {
          name: name,
          password: password,
          mobile: req.body.mobile,
          teacherMobile: req.body.teacherMobile,
          center: req.body.center,
          grade: req.body.grade,
          school: req.body.school,
          parentNo: req.body.parentNo,
          code: code
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newStudent = new Student({
      name: name,
      password: hashedPassword,
      mobile: mobile,
      section: teacher.section,
      grade: grade,
      center: center,
      image: '',
      isStudent: true,
      exams: [],
      notifications: 0,
      activated: false,
      parentNo: parentNo,
      school: school,
      code: code
    });

    await newStudent.save();
    const teacherRequests = [...teacher[0].requests]
    teacherRequests.unshift(newStudent._id)
    teacher[0].requests = teacherRequests
    await teacher[0].save()
    req.flash('success', "Welcome To The Academy, Login now..")
    return res.redirect(`/home`)
  } catch (error) {

    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/login");
  });
};
