/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
    const events = {
        allEvents: [],
        teacherCenters: [],
        eventcontent: '',
        eventlink: '',
        eventGrade: '',
        eventCenter: '',
        eventType: 'public',
        eventFile: null,
        eventImage: null,
        fetchedComments: [],
        init: function () {
            this.cashDom()
            this.bindEvents()
            this.getEvents()
        },
        cashDom: function () {
            this.$allEventsBox = $('#allEvents')
            this.$openNewEventBtn = $('#new-event-btn')
            this.$closeNewEventBtn = $('#event-btn_close')
            this.$addEvent = $('#addEvent')
            this.$eventImage = $('.eventImage')
            this.$eventType = $('.eventTypeBtn')
            this.$eventGrade = $('.gradeBtn')
            this.$eventCenter = $('.centerBtn')

        },
        bindEvents: function () {
            this.$eventType.on('change', this.getType.bind(this))
            this.$eventImage.on('change', this.getImgFile.bind(this))
            this.$openNewEventBtn.on('click', this.openNewEventBox.bind(this))
            this.$closeNewEventBtn.on('click', this.closeNewEventBox.bind(this))
            this.$eventGrade.on('click', this.getEventGrade.bind(this))
            this.$eventCenter.on('click', this.getEventCenter.bind(this))
            $('.event-content').on('change', this.getEventcontent.bind(this))
            $('.event-link').on('change', this.getEventlink.bind(this))
            $('.eventImage').on('change', this.getImgFile.bind(this))
            $('.submitEvent').on('click', this.addEvent.bind(this))

            $('body').on('click', '.event-sub-menu_btn', this.openEventSubMenu.bind(this))
            $('body').on('click', '.event-sub-menu_delete', this.deleteEvent.bind(this))

            $('body').on('click', '.showComments', this.getComments.bind(this))
            $('body').on('click', '.addNewComment', events.addNewComment)

            $('body').on('click', '#closeComments', events.closeCommentBox.bind(this))

        },

        openNewEventBox: function () {
            $('.events_new-event-box').removeClass('hidden')
        },
        closeNewEventBox: function () {
            $('.events_new-event-box').addClass('hidden')
            events.clearData()
        },
        getImgFile: function (e) {
            let photo = e.target.files[0];  // file from input
            this.eventImage = photo
            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                const tumbnialImage = $(e.target).siblings('.thum-img')
                console.log(tumbnialImage);

                reader.onload = function (e) {
                    tumbnialImage.attr('src', e.target.result);
                }
                reader.readAsDataURL(e.target.files[0]);
                tumbnialImage.removeClass('hidden')
            }
        },
        getEvents: async function (e) {
            const data = await fetchdata('/teacher/events', 'get', {}, true)
            if (data != null) {
                $('#Eventholders').fadeOut(500)
                this.allEvents = data.json.events
                this.renderEvents(data.json.events)
            }
        },
        getType: async function (e) {
            events.clearData()

            $(e.target).parents('.events_new-event-box-selector').find('input[type="radio"]').removeAttr('checked')
            e.target.setAttribute('checked', true)
            const type = $(e.target).val()
            events.eventType = type

            $('.events-type_btn').css({ color: '#000', background: '#fff' })
            $(e.target).parent().css({
                color: '#444',
                background: '#65de72'
            })
            if (type === 'private') {
                $('.event-options').removeClass('hidden')
            } else {
                $('.event-options').addClass('hidden')
            }

        },
        getEventcontent: function (e) {
            this.eventcontent = $(e.target).val()
        },
        getEventlink: function (e) {
            this.eventlink = $(e.target).val()
        },

        getEventGrade: function (e) {
            $('.filter-grade-item').find('input[type="radio"]').not($(e.target)).prop("checked", false)
            e.target.setAttribute('checked', true)
            $('.gradeBtn').removeAttr('checked')
            this.eventGrade = e.target.value
        },
        getEventCenter: function (e) {

            $('.filter-center-item').find('input[type="radio"]').not($(e.target)).prop("checked", false)
            e.target.setAttribute('checked', true)
            $('.centerBtn').removeAttr('checked')
            this.eventCenter = e.target.value
        },
        validateEventData: function () {
            if (this.eventcontent === '' || this.eventcontent === null) {
                message('Content Must Added', 'warning', '.events_new-event-box')
                return false
            }
            if (this.eventType === 'private') {
                if (this.eventGrade === '' || this.eventCenter === '') {
                    message('Group & Grade Must Added', 'warning', '.events_new-event-box')
                    return false
                }
            }
            return true
        },
        addEvent: async function (e) {
            e.preventDefault()
            const valid = this.validateEventData()
            let formData = new FormData()
            if (valid) {
                $('.addeventForm').addClass('loader-effect')
                formData.append('eventType', this.eventType)
                formData.append('content', this.eventcontent)
                formData.append('link', this.eventlink)
                formData.append('eventForGrade', this.eventGrade)
                formData.append('eventForGroup', this.eventCenter)
                formData.append('image', this.eventImage)
                const data = await fetchdata(`/teacher/events`, 'post', formData, false)
                if (data != null) {
                    events.clearData()
                    events.closeNewEventBox()
                    this.allEvents.push(data.json.event)
                    this.renderEvents(this.allEvents)
                }
                $('.addeventForm').removeClass('loader-effect')
            }

        },
        deleteEvent: async function (e) {
            var txt;
            if (confirm("Do you want to delete this?")) {
                $(e.target).parents('.event').append("<img class='loading' src='/images/loading(3).svg' style='display:block'>")
                $(e.target).parents('.event').css({ opacity: .6 })
                const eventId = $(e.target).parent().find('input[name="eventId"]').val()
                const data = await fetchdata(`/teacher/events/${eventId}`, 'delete', true)
                if (data != null) {
                    $(e.target).parents('.event').fadeOut(300).remove()
                    message('Event Deleted', 'success', 'body')
                    events.allEvents = events.allEvents.filter(e => e._id.toString() != eventId.toString())
                    if (events.allEvents.length === 0) return this.$allEventsBox.append(`<h2 class="fall-back">Start adding new posts..<h2>`)

                }
            } else {
                e.preventDefault()
            }
        },
        getComments: async function (e) {
            $('.comments').empty()
            $('#allcomments').toggleClass('hidden', 'loader-effect').animate({ height: '400px', opacity: 1 }, 200)
            e.preventDefault()
            const eventId = $(e.target).parents('.event').find('input[name=eventId]').val()
            const data = await fetchdata(`/public/comments/${eventId}`, 'get', {}, true)
            if (data != null) {
                displaycomments(data.json.comments, eventId)
            }
        },
        addNewComment: async function (e) {
            const itemId = $('input[name="itemId"]').val()
            const comment = $(e.target).parent(".addComment").find('input[name=comment]').val()
            const data = await fetchdata(`/public/comments/${itemId}`, 'post', JSON.stringify({ comment }), true)
            if (data != null) {
                const c = data.json.comment
                events.updatecomments(c)
                $('#newCommentInput').val(' ')
                $(".comments").animate({ scrollTop: $('.comments').prop("scrollHeight") }, 1000);
            }

        },
        updatecomments: function (c) {
            $('#allcomments .fall-back').remove()
            $('#allcomments .comments').append(`
            <div class="comment" >
                <img src="/${c.image}">
                <a href="/public/profile/${c.by}">${c.name}</a>
                <p>${c.comment}</p>
            </div>
        `)
        },
        closeCommentBox: function (e) {
            $('#allcomments').animate({ height: '0' }, 200, function () {
                $(this).css({ opacity: '0' }).addClass('hidden')
                $('.comments').empty()
            })
            this.fetchedComments = []
        },
        renderEvents: function (events) {
            console.log(events);

            $('.fall-back').remove()
            if (events.length === 0) {

                return this.$allEventsBox.append(`
                    <div class="fall-back">
                    <img src="/images/eventHolder.png" class="eventHolder w-64 m-auto block" style="opacity:.5;">
                    <h3 class="text-center text-gray-500">Start adding new posts..</h3>
                    </div>
                `)
            }
            displayevents(events, this.$allEventsBox)
            $(' img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden', height: '30px' })
                }
            })
        },

        openEventSubMenu: function (e) {
            e.stopPropagation()
            $('.event-sub-menu').not($(e.target).parents('.event').find('.event-sub-menu')).removeClass('activeMenu')
            $(e.target).parents('.event').find('.event-sub-menu').toggleClass('activeMenu')
        },
        clearData: function () {
            events.eventType = 'public'
            events.dateRange = null
            events.eventCenter = ''
            events.eventcontent = ''
            events.eventImage = null
            events.eventGrade = ''
            $('.event-content').val('')
            $('input[type="radio"]').prop('checked', false)
        },
    }
    events.init()
})()
