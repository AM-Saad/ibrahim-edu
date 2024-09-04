function message(message, messageType, selector) {
    $(selector).prepend(`<p class="message p-2 rounded alert alert-${messageType}">${message}</p>`)
    $('.message').animate({ top: '80px' }, 200)
    setTimeout(function () { $('.message').animate({ top: '0' }, 100, function () { $(this).remove() }) }, 6000);
}