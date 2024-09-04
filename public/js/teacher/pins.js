async function printPins() {
    const pins = window.location.search.replace('?reqpins=', '')
    if (!pins) return message('Write how many pins you want to print', 'info', 'body')
    $('.wrapper').addClass('loader-effect')

    const data = await fetchdata('/teacher/pins/print', 'put', JSON.stringify({ pins: pins }), true)
    if (data) {
        $('button').addClass('hidden')
        $('.wrapper').removeClass('loader-effect')
        window.print()
    }

}



function openForm() {
    $('input[name="reqpins"]').focus()
    $('.external-box').removeClass('hidden')
}

function closeForm() {
    $('input[name="reqpins"]').val('')
    $('.external-box').addClass('hidden')
}
