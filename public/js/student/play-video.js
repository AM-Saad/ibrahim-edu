$('.watch-vid').on('click', startVideo)
$('.close-vid').on('click', closeVideo)

function startVideo(e) {
    console.log(e.target.dataset.vp)

    const videoElm = document.getElementById('video_frame')
    videoElm.children[1].innerHTML = e.target.dataset.vp
    $('#navbar-main').addClass('hidden')
    $('#video_frame').removeClass('hidden')

}

function closeVideo(e) {
    $('#video_frame').addClass('hidden')
    $('#navbar-main').removeClass('hidden')
    const videoElm = document.getElementById('video_frame')
    videoElm.children[1].innerHTML = ""

}

