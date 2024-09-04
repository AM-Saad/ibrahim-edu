async function printPins() {
    const pins = $('input[name="reqpins"]').val()
    if (!pins) return message('Write how many pins you want to print', 'info', 'body')
    $('.wrapper').addClass('loader-effect')
    const data = await fetchdata('/owner/pins/print', 'put', JSON.stringify({ pins: pins }), true)
    if (data) {
        pinsheet(data.json.pins)
        $('.external-box').addClass('none')
    }
    $('.wrapper').removeClass('loader-effect')

}

function closepins() {
    $('.sheet.pins .all-items').empty()
    $('.sheet.pins').addClass('none')
}

function togglePrintPins() {
    $('.external-box').toggleClass('none')
}

function startPrint() {
    window.print()
}