/*jslint browser: true*/

/*global console, alert, $, jQuery*/


(function () {
    const requests = {

        allRequests: [],
        init: function () {
            this.cashDom()
            this.bindEvents()
        },
        cashDom: function () {
            this.$acceptBtn = $('.acceptBtn')
            this.$denyBtn = $('.denyBtn')

        },
        bindEvents: function () {
            this.$acceptBtn.on('click', this.acceptRequest)
            this.$denyBtn.on('click', this.denyRequest)
        },
        acceptRequest: async function (e) {
            $('.requestMsg').fadeOut()
            const studentId = e.target.firstElementChild.value;
            e.target.parentNode.parentNode.classList.add = 'loader-effect'


            const data = await fetchdata(`/public/requests/${studentId}`, 'put', {}, false)
            if (data != null) {
                e.target.parentNode.parentNode.remove()
                return message('Request Accepted', 'success', 'body')
            }
            e.target.parentNode.parentNode.classList.remove = 'loader-effect'

        },
        denyRequest: async function (e) {
            $('.requestMsg').fadeOut()
            const studentId = e.target.firstElementChild.value;
            e.target.parentNode.parentNode.classList.add = 'loader-effect'

            const data = await fetchdata(`/public/requests/${studentId}`, 'delete', {}, false)
            if (data != null) {
                e.target.parentNode.parentNode.remove()
                return message('Request Denied', 'Info', 'body')
            }
            e.target.parentNode.parentNode.classList.remove = 'loader-effect'

        },
    }
    requests.init()
})()
