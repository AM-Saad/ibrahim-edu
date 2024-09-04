const express = require("express");

const { check, body } = require("express-validator/check");
const isAuth = require("../middlewear/is-auth");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/", authController.landingpage);

router.post("/api/login", authController.loginApi);
router.get("/login", authController.getLogin);
router.post(
  [
    "/login",
    body("email")
      .isEmail()
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.get("/signup", authController.getSignup);
router.post("/signup",
  [
    body('password', 'Password must be atleast " 8 " characters')
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password NOT match!')
      }
      return true
    }),
    body('mobile', 'Write correct mobile number, and should be only numbers')
      .isNumeric()
      .isLength({ min: 11 })
      .isLength({ max: 11 })
      .trim(),
    body('grade', 'Choose Your Grade')
      .isLength({ min: 1 }),
    body('center', 'Choose Your Center')
      .isLength({ min: 1 }),
    body('parentNo', 'Write correct parent number,')
      .isNumeric()
      .isLength({ min: 11 })
      .isLength({ max: 11 })
      .trim(),
    body('code', 'Please add your code')
      .isNumeric()
      .trim(),
  ], authController.postSignup);

router.get("/verify/:studentId", authController.getVerify);
router.post("/selectCenter/:teacherId", authController.selectCenter);
router.get("/logout", authController.postLogout);
module.exports = router;
