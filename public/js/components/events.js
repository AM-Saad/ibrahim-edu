function displayevents(events, allEventsBox) {
    var arabic = /[\u0600-\u06FF]/;
    $('.event').remove()
    events.reverse()
    events.forEach(e => {
        allEventsBox.append(`
            <div class='event'>
            <i class="fas fa-ellipsis-h event-sub-menu_btn" style="position: absolute; right: 9px;
            top: 4px;"></i>
            <input type="hidden" value="${e._id}" name="eventId">
            <input type="hidden" value="${e.teacher}" name="teacherId">
            <ul class="event-sub-menu">
            <input type="hidden" value="${e._id}" name="eventId">
                <li class="event-sub-menu_delete">Delete</li>
            </ul>
                <div class="event-header">
                    <div>
                        <p class="event-header_time">${e.date.slice(0, 10)}</p>

                    </div>
                <div class="flex">
                    <p class="event-header_type">
                        <i class="fas fa-${e.type == 'public' ? 'lock-open' : 'lock'}"></i>
                    </p>
                    <div class="event-info ${e.type == 'private' ? 'flex' : ''}">
                        <p>${e.group || ''}</p>
                        <p>${e.grade || ''}</p>
                    </div>
                </div>
            </div>
            <div  class="event-body"> 
                <p style="${arabic.test(e.content) ? 'text-align:right;' : ''}">${e.content}</p>
                ${e.attachedlink ? `<a href="${e.attachedlink}" class="btn btn-main">Open</a>` : ''}
            </div>
            <img src="/${e.image}" class="event-img" alt="img">
            <input type="hidden" value="${e._id}" name="eventId">
            <div class="event-actions">
                <input type="hidden" value="${e._id}" name="eventId">
                <span class="showComments">Comments: ${e.comments}</span>
            </div>
            </div>
        `)


    });
}
