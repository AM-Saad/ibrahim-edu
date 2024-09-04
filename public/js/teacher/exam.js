/*jslint browser: true*/




(function () {
    const lessonConfig = {
        exam: null,
        editing: false,
        questionId: null,
        allQuestions: [],
        symbols: new Array("&#8730;", "&#8804;", "&#8805;", "&#8773;", "&#8835;", "	&#8834;", "&#8839;", "&#8838;", "&#8836;", "&#9674;", "&#8592;", "&#8594;", "&#8593;", "&#8595;", "&#8596;", "&#176;", "&#177;", "&#188;", "&#189;", "&#190;", "&#8734;", "&#8736;", "&#8743;", "&#8744;", "&#8756;", "&#9668;", "&#9658;", "&#9650;", "&#9660;"),
        targetInput: 'questionText',
        questionType: 'choose',
        questionScore: '',
        questionText: '',
        questionImg: '',
        answerone: '',
        answertwo: '',
        answerthree: '',
        answerfour: '',
        correctAnswer: '',
        examId: $('input[name="examId"]').val(),

        selectedCenter: null,
        init: async function () {
            const r = await this.getExam()
            if (r === true) {
                return this.readyStatus()
            } else {
                return window.location.href = '/'
            }
        },
        cashDom: function () {
            this.$questionForm = $('#NewQuestionForm')
            this.tabsBtn = $('.tabs-list li')
            this.$addQuestionBtn = $('#addQuestion')
            this.$closeQuestionForm = $('#closeQuestionForm')
            this.$questionFormInputs = $('#NewQuestionForm').find('input')
            this.$questionperview = $('.question-perview')
            this.$questionsInputs = $('.questionsInputs')
            this.$textFormater = $('#textFormater')
            this.$addInput = $('#addInput')
            this.$questionImg = $('.questionImg')
            this.$questionBox = $('.question-list_item')


            this.centers = $('#toggle-centers')
            this.search = $('#search')
            this.chooseCenter = $('.form-check-input')
        },
        bindEvents: function () {
            this.$addQuestionBtn.on('click', this.openForm.bind(this))
            $('.delete-question').on('click', this.deleteQuestion.bind(this))
            $('.edit-question').on('click', this.editQuestion.bind(this))
            this.$closeQuestionForm.on('click', this.closeForm.bind(this))
            this.tabsBtn.on('click', this.getQuestionType.bind(this))
            this.$questionsInputs.on('click', this.openTextFormater.bind(this))
            this.$addInput.on('click', this.addInput.bind(this))
            this.$questionImg.on('change', this.getImgFile.bind(this))
            $('.toggle-settings').on('click', () => { $('.settings').toggleClass('hidden') })
            $('body').on('click', '.submitQuestion', this.submitQuestion.bind(this))
            $('body').on('click', '.question-sub-menu-btn', this.openSubMenu.bind(this))
            $('body').on('click', '.question-list_item p', this.getQuestionAnswers.bind(this))
            $('body').on('click', '.expandQ', this.getQuestionAnswers.bind(this))
            $('body').on('click', '.ql-editor', lessonConfig.checkActiveInput.bind(this))
            $('body').on('click', '.closeCorrectAnswer', function () { $('.correctAnsweBox').remove() })
            $('body').on('click', '#truefalseInput input', function (e) { $('#truefalseInput input').not($(e.target)).prop("checked", false) })



            this.centers.on('click', this.toggleCenters.bind(this))
            this.chooseCenter.on('click', this.getCenter.bind(this))
            $('.toggle-analytics').on('click', () => { $('.monthly-analytics').toggleClass('slide') })
            this.search.on('click', this.getTakenStudents.bind(this))

        },
        getExam: async function () {
            let { json } = await fetchdata(`/teacher/exam/api/${this.examId}`, 'get', {}, true);
            if (json != null) {
                this.allQuestions = json.questions
                displayinformation(json.exam)
                displayquestions(this.allQuestions)
                return true
            } else {
                return false
            }
        },

        readyStatus: () => {
            lessonConfig.cashDom()
            lessonConfig.bindEvents()
            $('#holders').css({ display: 'none' }).remove()
            var toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                // [{ 'header': 1 }, { 'header': 2 }], 
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                // [{ 'indent': '-1' }, { 'indent': '+1' }],    
                // [{ 'direction': 'rtl' }],                        
                // [{ 'size': ['small', false, 'large', 'huge'] }], 
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
            ];
            new Quill('.editor', {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow',
            });
            $('.ql-editor').addClass('mainContent')
            $('.ql-editor').attr('tabindex', "0")

            lessonConfig.renderSymbols()
            $('.header').animate({ opacity: 1 }, 500)
            $('#openSymbols').on('click', function () { $('#symbols').toggle() })
            $('img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden', height: '30px' })
                }
            })

        },
        renderSymbols: function () {
            lessonConfig.symbols.forEach((s, i) => {
                $('#symbols').append(`
                    <button class="symbol" data-i="${i}">${s}</button>
                `)
            })
            $('.symbol').on('click', lessonConfig.addTextToElement)
        },
        openForm: function () {
            this.$questionForm.removeClass("hidden");
            $('#addQuestion').off('click')
            lessonConfig.checkActiveInput()
            questionPerview(lessonConfig.questionType)
        },
        closeForm: function () {
            this.$questionForm.addClass("hidden");
            $('#addQuestion').on('click', this.openForm.bind(this))
            this.resetData()
        },
        addTextToElement: function (e) {
            const element = $('.mainContent')
            const insertText = lessonConfig.symbols[$(e.target).data('i')]
            $(element).append(insertText)
        },
        addSymbolToElement: function (e) {
            const element = $('.mainContent')
            const insertText = lessonConfig.symbols[$(e.target).data('i')]
            var originalContent = element.innerHTML;

            var selection = document.getSelection();
            var range = selection.getRangeAt(0);

            var originalStart = range.startOffset;
            var originalEnd = range.endOffset;

            var front = originalContent.substring(0, originalStart);
            var back = originalContent.substring(originalEnd, originalContent.length);

            element.innerHTML = front + insertText + back;
        },
        preventParagraph: function (e) {
            const key = e.which || e.keyCode
            if (key == 13) {
                if ($('.mainContent')) {
                    console.log('exost');
                } else {
                    console.log('not');
                }
            }
        },
        checkActiveInput: function (e) {
            if (lessonConfig.targetInput === '') {
                $('.confirm-question').removeClass('submitQuestion')
                return lessonConfig.alertButtons()
            }
            console.log(lessonConfig.questionType);

            if (lessonConfig.questionType === 'choose') {
                if (lessonConfig.questionText === '' || lessonConfig.answerone === '' || lessonConfig.answertwo === '' || lessonConfig.answerthree === '' || lessonConfig.answerfour === '' || lessonConfig.correctAnswer === '') {
                    $('.confirm-question').css({ opacity: .3 })
                    return $('.confirm-question').removeClass('submitQuestion')
                } else {
                    $('.confirm-question').css({ opacity: 1 })
                    return $('.confirm-question').addClass('submitQuestion')
                }
            } else {
                if (lessonConfig.questionType === 'truefalse') {
                    console.log('im here');

                    if (lessonConfig.questionText === '' || lessonConfig.correctAnswer === '') {
                        $('.confirm-question').css({ opacity: .3 })
                        return $('.confirm-question').removeClass('submitQuestion')
                    } else {
                        $('.confirm-question').css({ opacity: 1 })
                        return $('.confirm-question').addClass('submitQuestion')
                    }

                } else {

                    if (lessonConfig.questionText === '') {
                        $('.confirm-question').css({ opacity: .3 })
                        return $('.confirm-question').removeClass('submitQuestion')
                    } else {
                        $('.confirm-question').css({ opacity: 1 })
                        return $('.confirm-question').addClass('submitQuestion')
                    }
                }
            }
        },
        openTextFormater: function (e) {
            this.targetInput = $(e.target).data('id')
            $('.questionsInputs').removeClass('inputActive')
            $(e.target).addClass('inputActive')
            if (this.targetInput === 'correctAnswer') {

                if (this.questionType === 'truefalse') {
                    $('#textFormater').append(`
                    <div class="correctAnsweBox absolute left-0 top-0 p-2 border bg-gray-200 w-full">
                        <form id="truefalseInput">
                            <div class="flex">
                                <div class="m-r-3">
                                    <input type="checkbox" id="true" class="form-control" value="1">
                                    <label for="true">True</label>
                                </div>
                                <div class="m-l-3">
                                    <input type="checkbox" id="false" class="form-control" value="0">
                                    <label for="false">False</label>

                                </div>
                            </div>
                        </form>
                    </div>`)
                } else {

                    $('#textFormater').append(`
                            <div class="correctAnsweBox absolute left-0 top-0 p-2 border bg-gray-200 w-full">
                            <i class="fas fa-times closeCorrectAnswer"></i>
                                <input type="number" class="form-control" min="1" max="4" id="correctAnswerInput" placeholder="Add Correct Answer Number.">
                            </div>
                    `)
                }

                $('#correctAnswerInput').focus()
            } else if (this.targetInput === 'questionScore') {
                $('#textFormater').append(`
                <div class="correctAnsweBox absolute left-0 top-0 p-2 border bg-gray-200 w-full" >
                <i class="fas fa-times closeQuestionScore"></i>
                    <input type="number" class="form-control" min="1" id="questionScoreInput" placeholder="Add Question Score Number.">
                </div>`)
                $('#questionScoreInput').focus()
            } else {
                $('.ql-editor.ql-blank').focus()
                $('.correctAnsweBox').remove()
            }
            questionPerview(lessonConfig.questionType)
        },
        addInput: function () {
            if (this.targetInput === '' || this.targetInput == undefined || this.targetInput == null) {
                return message('Please select input to add', 'info', 'body')
            }
            const targtedInput = this.targetInput
            if (this.targetInput === 'correctAnswer') {

                if (this.questionType === 'truefalse') {
                    let answr = $('#truefalseInput input:checked').val()


                    if (answr === '' || answr == undefined || answr === ' ' || answr == null) {
                        return message("add the correct answer", 'info', 'body')
                    } else {
                        lessonConfig[targtedInput] = answr
                        $('.question-perview_head span').html(`${answr == 1 ? 'true' : 'false'} `)
                        $('.correctAnsweBox').remove()
                    }
                } else {
                    let answer = $('input#correctAnswerInput').val()
                    if (answer === '' || answer == undefined || answer === ' ' || answer == null) {
                        return message("add the correct answer number", 'info', 'body')
                    } else {
                        if (answer == 0 || answer > 4) {
                            return message("Correct answer must be between 1 to 4", 'info', 'body')
                        }
                        lessonConfig[targtedInput] = answer
                        $('.question-perview_head span').html(`${answer}`)
                        $('.correctAnsweBox').remove()
                    }
                }


            } else if (this.targetInput === 'questionScore') {
                const questionScore = $('input#questionScoreInput').val()
                if (questionScore === '' || questionScore == undefined || questionScore === ' ' || questionScore == null) {
                    return message("add the correct answer number", 'info', 'body')
                } else {
                    if (questionScore == 0) {
                        return message("Correct answer must be between 1 to 4", 'info', 'body')
                    }
                    lessonConfig[targtedInput] = questionScore
                    $('.question-perview_head span').html(`${questionScore}`)
                    $('.correctAnsweBox').remove()
                }
            } else {
                const inputsVal = $('.ql-editor').html();
                if (inputsVal === '<br>' || inputsVal == '<p><br></p>' || inputsVal == null || inputsVal == '') {
                    return message("Make sure to Choose & Fill the inputs", 'info', 'body')
                } else {
                    lessonConfig[targtedInput] = inputsVal
                    $('#' + targtedInput).html(inputsVal)
                    $('.ql-editor p').html('').click()
                }
            }

            $(`[data-id=${targtedInput}] i`).addClass('fulfilled')
            $(`[data-id=${targtedInput}]`).removeClass('inputActive')
            const nextElement = $('#' + targtedInput).next().attr('id')
            $(`[data-id= ${nextElement}]`).trigger('click')
            this.checkActiveInput()
        },
        getQuestionType: function (e) {
            $(e.target).addClass('active').siblings().removeClass('active');
            $('.content-list > div').hide();
            $($(e.target).data('content')).fadeIn();
            this.questionType = $(e.target).data('questiontype')
            this.targetInput = ''
            $('.questionsInputs').removeClass('inputActive')
            $('.question-perview_head span').html('')
            if (this.questionType == 'choose') {
                $('.question-perview_head p').html('Correct Answer:')
            } else if (this.questionType == 'truefalse') {
                $('.question-perview_head p').html('Answer:')
            } else {
                $('.question-perview_head p').html('Score:')
            }
            return lessonConfig.checkActiveInput()
        },
        getImgFile: function (e) {
            let photo = e.target.files[0];  // file from input
            this.questionImg = photo
            $(`[data - id= image]i`).addClass('.fulfilled')
            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('.question_preview_image').attr('src', e.target.result);
                }
                reader.readAsDataURL(e.target.files[0]);
            }
            lessonConfig.checkActiveInput()

            $('.question_preview_image').animate({ opacity: 1 }, 300)
        },
        alertButtons() {
            $('.questionsInputs').addClass('inputActive')
            setTimeout(() => {
                $('.questionsInputs').removeClass('inputActive')
            }, 1000);
        },
        validateQuestion() {

            if (lessonConfig.questionType === 'choose') {
                if (lessonConfig.questionText === ''
                    || lessonConfig.answerone === ''
                    || lessonConfig.answertwo === ''
                    || lessonConfig.answerthree === ''
                    || lessonConfig.answerfour === ''
                    || lessonConfig.correctAnswer === '') {
                    message('Dont leave any field empty', 'warning', 'body')
                    return false
                }
            } else {
                if (lessonConfig.questionText === '') {
                    lessonConfig.alertButtons()
                    message('Dont leave any field empty', 'warning', 'body')
                    return false
                }
            }
            return true
        },
        createQuestionForm() {
            let formData = new FormData();
            if (lessonConfig.questionType === 'choose') {
                formData.append("image", lessonConfig.questionImg);
                formData.append("answer1", lessonConfig.answerone);
                formData.append("answer2", lessonConfig.answertwo);
                formData.append("answer3", lessonConfig.answerthree);
                formData.append("answer4", lessonConfig.answerfour);
                formData.append("correctAnswer", parseInt(lessonConfig.correctAnswer, 10));
                formData.append("question", lessonConfig.questionText);
            } else if (lessonConfig.questionType === 'truefalse') {
                formData.append("image", lessonConfig.questionImg);
                formData.append("question", lessonConfig.questionText);
                formData.append("correctAnswer", parseInt(lessonConfig.correctAnswer, 10));
            }
            else {
                formData.append("image", lessonConfig.questionImg);
                formData.append("question", lessonConfig.questionText);
                formData.append("questionScore", parseInt(lessonConfig.questionScore, 10))
            }
            return formData
        },
        submitQuestion: async function (e) {
            $('.confirm-question').removeClass('submitQuestion')

            e.preventDefault()
            const valid = lessonConfig.validateQuestion()

            if (valid) {
                $('.confirm-question').css({ opacity: .25 })
                const form = lessonConfig.createQuestionForm()

                let data;
                if (lessonConfig.editing) {
                    data = await fetchdata(`/teacher/exam/questions/${lessonConfig.examId}?questionId=${lessonConfig.questionId} `, 'put', form, false);
                } else {
                    console.log('no');
                    data = await fetchdata(`/teacher/exam/questions/${lessonConfig.examId}?type=${lessonConfig.questionType} `, 'post', form, false);
                }
                if (data != null) {
                    console.log(data);

                    message('Question Added', 'success', 'body')
                    lessonConfig.allQuestions = data.json.questions
                    displayquestions(data.json.questions)
                }
                return lessonConfig.resetData()
            }
        },
        resetData: function () {
            lessonConfig.questionText = ''
            lessonConfig.questionImg = ''
            lessonConfig.targetInput = ''
            lessonConfig.answerone = ''
            lessonConfig.answertwo = ''
            lessonConfig.answerthree = ''
            lessonConfig.answerfour = ''
            lessonConfig.correctAnswer = ''
            lessonConfig.questionScore = '' // Update in prodction 28/9
            lessonConfig.editing = false
            lessonConfig.questionId = null
            $('.questionsInputs').removeClass('inputActive')
            $('.question-perview p').html('')
            $('.question_preview_image').attr('src', '')
            $('.submitQuestion').css({ opacity: .25 })

            $('.fa-check-circle').removeClass('fulfilled')

            lessonConfig.RefreshSomeEventListener()
        },
        RefreshSomeEventListener: function () {

            // Remove handler from existing elements
            $(".edit-question").off();
            $(".delete-question").off();

            // Re-add event handler for all matching elements
            $(".delete-question").on("click", lessonConfig.deleteQuestion)
            $(".edit-question").on("click", lessonConfig.editQuestion)
        },
        getQuestionAnswers: function (e) {
            const expandIcon = $(e.target).parent('.question-list_item').find('.expandQ')
            const answersBox = $(e.target).parents('li').find('.answerBox')
            expandIcon.toggleClass("fa-sort-down fa-sort-up");

            if (!answersBox.has('.answer').length > 0) {
                const questionId = $(e.target).parents('.question-list_item').find('input[name="questionId"]').val()
                const question = lessonConfig.allQuestions.find(q => { return q._id.toString() === questionId.toString() })
                if (question.questionType === 'choose') lessonConfig.openAnswers(question, answersBox)
            } else {
                answersBox.html('')
                answersBox.removeClass('collapsed');
            }
        },
        openAnswers: function (question, answersBox) {
            if (question.questionImg === '' || question.questionImg === undefined) {
                answersBox.append(`<img style="opacity:0" src="/${question.questionImg}" > `)
            } else {
                answersBox.append(` <img src="/${question.questionImg}" > `)
            }
            question.answers.forEach(a => {
                if (a.answerNo !== 0) {
                    const answ = document.createElement('p')
                    answ.setAttribute('class', 'flex items-center my-2 answer')
                    answ.innerHTML = `${a.answer} `
                    answersBox.append(answ)
                }
            })
            answersBox.addClass('collapsed');
        },
        openSubMenu: function (event) {
            $(event.target).parent().find('.question-list_item-sub-list').fadeIn(300)
            $(".wrapper").on('click', function () { $('.question-list_item-sub-list').fadeOut(); });
            $(".question-list_item-sub-list").click(function (e) { e.stopPropagation(); });
        },
        editQuestion: function (e) {
            lessonConfig.editing = true
            const questionId = $(e.target).parents('.question-list_item').find("input[name=questionId]").val();
            lessonConfig.questionId = questionId
            const question = lessonConfig.allQuestions.find(q => q._id.toString() == questionId.toString())
            questionPerview(question.questionType)
            lessonConfig.showEditQuestionData(question)
            lessonConfig.openForm()
        },
        showEditQuestionData(question) {
            if (question) {
                lessonConfig.questionText = question.question
                $('#questionText').html(question.question)
                $('.question-perview_head p').html('Correct Answer:')
                $('.question-perview_head span').html(question.correctAnswer)
                lessonConfig.correctAnswer = question.correctAnswer
                const tabbutton = $(`li[data-questiontype="${question.questionType}"]`)
                tabbutton.trigger('click')
                $(`${tabbutton.data('content')}`).find('.questionsInputs i').addClass('fulfilled')
                $('.tabs-list li').off('click')
                if (question.questionType == 'choose') {
                    question.answers.forEach(a => {
                        const element = $("p[data-number='" + a.answerNo + "']")
                        element.html(a.answer)
                        lessonConfig[element.attr('id')] = a.answer
                    })
                } else if (question.questionType == 'truefalse') {
                    lessonConfig.questionScore = 1
                    $('.question-perview_head p').html('Answer:')
                    $('.question-perview_head span').html(question.correctAnswer == 1 ? 'True' : 'False')
                } else {
                    lessonConfig.questionScore = question.questionScore
                    $('.question-perview_head p').html('Score:')
                    $('.question-perview_head span').html(question.questionScore)
                }
            }
        },

        deleteQuestion: async function (e) {
            var txt;
            if (confirm("Do you want to delete this?")) {
                $('body')
                $(e.target).parents('.question-list_item').css({ opacity: .5 })
                const questionId = $(e.target).parents('.question-list_item').find("input[name=questionId]").val();
                const data = await fetchdata(`/teacher/exam/questions/${lessonConfig.examId}?questionId=${questionId} `, 'delete', null, true)
                if (data != null) {
                    lessonConfig.allQuestions = lessonConfig.allQuestions.filter(q => q._id.toString() != questionId.toString())
                    $(e.target).parents('.question-list_item').remove()
                    message('Question Deleted', 'success', 'body')
                }
            } else {

                e.preventDefault()
            }

        },

        toggleCenters: function (e) {
            $('#centers').toggleClass('hidden')
            // analytics.displayChart(Object.keys(orderPerMonth), Object.values(orderPerMonth))
        },
        getCenter: function (e) {
            this.selectedCenter = e.target.value
            console.log(this.selectedCenter);

        },
        getTakenStudents: async () => {
            $('.questions-report .loading').removeClass('hidden')
            const center = lessonConfig.selectedCenter
            if (!center) return message('Choose Center', 'info', 'body')
            const data = await fetchdata(`/public/api/search/exams/${lessonConfig.examId}?center=${center} `, 'put', JSON.stringify({ center: center }), true)
            if (data) {
                lessonConfig.questionAnalytics(data.json.exams)
            }
            $('.questions-report .loading').addClass('hidden')


        },
        questionAnalytics: function (exams) {
            const questions = lessonConfig.allQuestions.map(q => ({
                _id: q._id,
                question: q.question,
                score: q.questionScore,
                correct: 0,
                taken: 0
            }))
            exams.forEach(e => {
                e.lessonQuestions.forEach(qs => {
                    const qstidx = questions.findIndex(q => q._id.toString() === qs._id.toString())
                    questions[qstidx].taken += 1
                    questions[qstidx].correct = qs.point === questions[qstidx].score ? questions[qstidx].correct += 1 : questions[qstidx].correct
                })
            })
            let maxQuestion = questions.reduce((max, i) => max.correct > i.correct ? max : i);
            let minQuestion = questions.reduce((min, i) => min.correct < i.correct ? min : i);
            questionmesure(questions, maxQuestion, minQuestion)
        },

    }
    lessonConfig.init()
})()
