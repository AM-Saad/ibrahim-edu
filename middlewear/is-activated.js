module.exports = (req, res, next) => {
    if (!req.session.user.activated) {
        return res.redirect("/");
    } else {
        next();
    }

};
