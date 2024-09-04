module.exports = (req, res, next) => {
  if (!req.session.user.isStudent) {
    if (req.session.user.isTeacher) {
      return res.redirect("/teacher/home");
    } else {
      return res.redirect("/assistent/home");
    }
  }
  next();
};
