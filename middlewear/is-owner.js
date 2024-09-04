module.exports = (req, res, next) => {
  if (!req.session.user.isOwner || req.session.user.isOwner === undefined) {
    if (req.session.user.isAssistent) {

      return res.redirect("/assistent/assistentHome");
    } else if (req.session.user.isTeacher && !req.session.user.isOwner) {

      return res.redirect("/");
    }else{
      return res.redirect("/home");

    }
  }

  next();
};
