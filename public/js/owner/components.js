function pinsheet(pins) {

    $('.sheet.pins .all-items').empty()
    if (pins.length > 0) {
        let counter = 0
        pins.forEach(p => {
            counter++
            $('.sheet.pins .all-items').append(`<h3 class="p-medium"><b>${counter}__</b>${p._id}</h3>`)
        });
        $('.sheet.pins').removeClass('none')
    }
}