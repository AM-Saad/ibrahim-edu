/*jslint browser: true*/

/*global console, alert, $, jQuery*/




(function () {

    const centersConfig = {
        centers: [],
        init: function () {
            this.cashDom()
            this.bindEvents()
            this.render()

        },
        cashDom: function () {
            this.$el = $('#addCenter')
            this.$input = this.$el.find('input[name=newCenter]')
            this.$centerId = this.$el.find('input[name=centerId]')
            this.$centerName = this.$el.find('input[name=centerName]')
            this.$button = $('#addNewCenter')
            this.$select = this.$el.find('.centers')
            this.$deleteBtn = $('.deleteCenter')

        },
        bindEvents: function () {
            $('body').on('click', '.deleteCenter', this.removeCenter.bind(this))
            this.$button.on('click', this.addCenter.bind(this))
        },
        render: function () {
            console.log(this.centers)
            this.centers.forEach(c => {
                $('ul.centers').append(
                    ` <li class="list-group-item">  ${c}
                    <input type="hidden" value="${c}" name="centerName" />
                    <button class="deleteCenter btn btn-sm btn-danger float-right">Delete</button>
                    </li>
                `
                )
            })
        },
        showMessage: function (message) {
            this.$el.prepend(`<p class="alert alert-${message.messageType}">${message.message}</p>`)
        },
        addCenter: async function () {
            $('#addCenter').addClass('loader-effect')
            this.$el.find('p').remove()
            const data = await fetchdata(`/teacher/centers/${this.$input.val()}`, 'post', {}, false)
            if (data) {
                this.centers.push(this.$input.val())
                this.render()
                this.$input.val('')
                message('Center Added', 'success', 'body')
            }
            return $('#addCenter').removeClass('loader-effect')

        },
        removeCenter: async function (e) {
            $('#addCenter').addClass('loader-effect')

            this.$el.find('p').remove()
            const centerName = $(e.target).parents('.list-group-item').find('input[name="centerName"]').val()
            const data = await fetchdata(`/teacher/centers/${centerName}`, 'delete', {}, true)
            if (data) {
                $(e.target).parents('.list-group-item').remove()
                this.$input.val('')
                 message('Center Deleted', 'success', 'body')
            }
            return  $('#addCenter').removeClass('loader-effect')

        }
    }
    centersConfig.init()
})()