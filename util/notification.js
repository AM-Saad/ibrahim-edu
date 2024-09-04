module.exports = async (data, Model, user, socket) => {
    const newnotification = new Model({
        date: data.date,
        by: {
            name: user.name,
            image: user.image,
            id: user._id,
        },
        to: data.to,
        item: data.item,
        content: data.content,
        seen: false

    })

    // send socket
    await newnotification.save()
    return true
}