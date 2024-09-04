
$('.openhomework').on('click', checkExamStatus)

async function checkExamStatus(e) {
    e.preventDefault()
    const homeworkId = $(e.target).parents('.item').find('input[name="homeworkId"]').val()
    const lessonId = $('input[name="lessonId"]').val()
    let pin;
    if ($(e.target).parents('.item').find('input[name="pin"]').length > 0) {
        pin = $(e.target).parents('.item').find('input[name="pin"]').val()
        if (pin.length < 4) {
            return message('Add Correct Pin To Start', 'info', 'body')
        }
    }
    $(e.target).parents('.item').addClass('loader-effect')
    const data = await fetchdata(`/checkhomework/${homeworkId}`, 'post', JSON.stringify({ pin: pin }), true)
    if (data != null) {
        return window.location.href = `/homework/${homeworkId}?lessonId=${lessonId}`
    }
    $(e.target).parents('.item').removeClass('loader-effect')





}