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
        acceptRequest: function (e) {
            $('.requestMsg').fadeOut()
            const studentId = e.target.firstElementChild.value;
            console.log(studentId);

            $('#loading').css({ display: 'block' })

            fetch(`/public/api/acceptRequest/${studentId}`).then(res => {
                if (res.status === 200) {
                    e.target.parentNode.parentNode.remove()
                    $('#loading').css({ display: 'none' })
                    $('#students-panel').append(
                        `
                        <p class="requestMsg" style="font-size:20px; color:#111; padding:10px; background-color:#95ff7a; border-radius:10px;">Request Accepted</p>
    
                        `
                    )
                    return $('.requestMsg').fadeOut(2000)
                }

            }).catch(err => {
                console.log(err);

            })
        },
        denyRequest: function (e) {
            const studentId = e.target.firstElementChild.value;



            $('.requestMsg').fadeOut()

            $('#loading').css({ display: 'block' })

            fetch(`/public/api/denyRequest/${studentId}`).then(res => {
                if (res.status === 200) {


                    e.target.parentNode.parentNode.remove()
                    $('#students-panel').append(
                        `
                        <p class='requestMsg' style="font-size:20px; color:#111; padding:10px; background-color:#ffeb7a; border-radius:10px;">Request Denied</p>

                        `
                    )
                    $('#loading').css({ display: 'none' })

                    return $('.requestMsg').fadeOut(2000)
                }

            }).catch(err => {
                console.log(err);

            })
        }
    }
    requests.init()
})()