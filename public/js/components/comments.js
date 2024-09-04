
function displaycomments(comments, itemId) {
    $('input[name="itemId"]').val(itemId)
    $('#allcomments .fall-back').remove()
    if (comments.length == 0) return $('#allcomments .comments').append(`<h3 class="fall-back p-medium">Start A Discussion..</h3>`)
    comments.forEach(c => {
        $('#allcomments .comments').append(`
            <div class="comment" >
                <img src="/${c.image}">
                <a href="/public/profile/${c.by._id}">${c.by.name}</a>
                <p>${c.comment}</p>
            </div>
        `)
    })

}