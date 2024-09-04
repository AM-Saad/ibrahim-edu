module.exports = (req, res, next) => {
  if (!req.session.user.isTeacher) {
    if (req.session.user.isAssistent) {
      return res.redirect('/assistent/home')
    }
    if (req.session.user.isStudent) {
      return res.redirect("/");
    }
  }


  next();
};
