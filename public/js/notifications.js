/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
    const notifications = {
        allNotifications: [],
        socket: null,
        usid: $('input[name="usid"]').val(),
        init: function () {
            this.cashDom()
            this.bindEvents()

            this.socket = io.connect('/notification')
            this.socket.emit('getnotification', this.usid)
            this.socket.on('success', (data) => {
                console.log(data);
            });
            this.socket.on('notifi', (data) => {
                console.log(data);

                // this.appenedSinglSales(data.newSales)
            });
        },
        cashDom: function () {
            this.$getNotfiBtn = $('#NotfiBtn')
        },
        bindEvents: function () {
            this.$getNotfiBtn.on('click', this.getNotification.bind(this))
            $('.wrapper').on('click', () => { $('#notifications').addClass('none') })
        },
        getNotification: async function (e) {
            $('#notifications .loading').removeClass('none')
            $('#notifications').toggleClass('none')
            if (this.allNotifications.length === 0) {
                const data = await fetchdata(`/public/notification/`, 'get', {}, true)
                if (data) {
                    $('#notifications .no').html('0')
                    this.renderNotifications(data.json)
                    this.allNotifications = data.json
                }
            }
            $('#notifications .loading').addClass('none')
        },
        renderNotifications: function (notifications) {
            $('.all-items .fall-back').remove()
            $('#notifications .all-items').empty()
            if (notifications.length === 0) {
                $('#notifications .all-items').append(`<h3 class="fall-back">Nothing here yet..</h3>`)
            } else {
                notifications.forEach(n => {
                    $('#notifications .all-items').append(`
                    <div class='notification'>
                    <img src="/${n.by.image}" class="notification-img" alt="img">
                    <p>${n.content}</p>
                    </div>
                `)
                });
            }

        }
    }
    notifications.init()
})()
