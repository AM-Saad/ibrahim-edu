module.exports.addStar = (student, stars) => {
    const filtedredStars = stars.filter(star => {
        return star.studentId.toString() === student._id.toString();
    });
    if (filtedredStars.length > 0) {
        return false
    } else {
        const updatedStarsItems = [...stars];
        updatedStarsItems.push({
            studentId: student._id,
            name: student.name,
        });

        return updatedStarsItems;
    }

};


module.exports.removeStar = (student, stars) => {

    const filtedredStars = stars.filter(star => {
        return star.studentId.toString() != student._id.toString();
    });
    const updatedStars = [...filtedredStars];
    
    return updatedStars;

}