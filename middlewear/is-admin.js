module.exports = (req, res, next) => {
    if (!req.session.user.isAssistent && !req.session.user.isTeacher) {
        return res.redirect('/home')
    }
    next();
};
