/*jslint browser: true*/

/*global console, alert, $, jQuery*/

(function () {
    const studentInterface = {
        allStudents: [],
        grade: null,
        center: null,
        studentByNumber: [],


        init: function () {
            this.cashDom()
            this.fetchStudents()
        },
        cashDom: function () {
            this.grade = $('#grade').val()
            this.center = $('#center').val()
            $('body').on('click', '.print-info', this.printInfo.bind(this))

        },


        fetchStudents: async function (page) {
            const data = await fetchdata(`/public/api/students/search`, 'post', JSON.stringify({ grade: this.grade, center: this.center }), true)
            if (data != null) {
                this.allStudents = data.json.students
                this.getallbarcodes(data.json.students, data.json.pagination)
            }
        },

        getallbarcodes: async (e) => {
            $('.wrapper').addClass('loader-effect')
            studentinformation(studentInterface.allStudents)
            $('.information.sheet').removeClass('hidden')
            $('.information.sheet').animate({ left: 0, opacity: 1 }, 500);
            $('.wrapper').removeClass('loader-effect')

        },
        printInfo: function (e) {
            $('.print-info').addClass('hidden')
            $('.getBack').addClass('hidden')
            window.print()
            $('body').css({ 'overflow': 'hidden' })
            setTimeout(() => {
                $('.print-info').removeClass('hidden')
                $('.getBack').removeClass('hidden')
            }, 6000);
        },



    }
    studentInterface.init()
})()
