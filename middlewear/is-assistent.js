module.exports = (req, res, next) => {
    if (!req.session.user.isAssistent ) {
        if (req.session.user.isTeacher) {
            return res.redirect("/teacher/home");
        } else {
            return res.redirect('/')
        }
    }

    next();
};
