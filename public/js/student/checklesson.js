function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null
}
$('.openExam').on('click', checkExamStatus)

async function checkExamStatus(e) {

    if ($(e.target).parents('.item').find('.lesson-pin').find('input[name="studentpin"]').length > 0) {
        e.preventDefault()
        $(e.target).parents('.item').addClass('loader-effect')
        const lessonId = $(e.target).parents('.item').find('input[name="lessonId"]').val()
        let pin = $(e.target).parents('.item').find('input[name="studentpin"]').val()
        if (pin.length < 4) {
            $(e.target).parents('.item').removeClass('loader-effect')
            return message('Add Correct Pin To Start', 'info', 'body')
        } else {
            const data = await fetchdata(`/checklesson/${lessonId}`, 'post', JSON.stringify({ pin: pin }), true)
            if (data != null) {
                return window.location.href = `/lesson/${lessonId}`
            }
            $(e.target).parents('.item').removeClass('loader-effect')

        }

    }


}