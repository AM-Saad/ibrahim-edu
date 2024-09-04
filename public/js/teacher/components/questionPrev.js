function questionPerview(questionType) {

    if (!$('#question-perview').length > 0) {
        $('#NewQuestionForm').append(`
        <div class="question-perview border p-3" style="opacity:0" id="question-perview">
        <div class="question-perview_head flex items-center justify-between">
            <h4 style=" opacity: .7; font-size: 18px;">Question Perview<h4>
            <div>
                <p>Correct Answer:</p><span></span>
            </div>
        </div>
        <p id="questionText"></p>
        <p class="answerPrev my-2" id="answerone" data-number="1"></p>
        <p class="answerPrev my-2" id="answertwo" data-number="2"></p>
        <p class="answerPrev my-2" id="answerthree" data-number="3"></p>
        <p class="answerPrev my-2" id="answerfour" data-number="4"></p>
        <p class="answerPrev my-2" id="correctanswer"></p>
        <img src="" class="question_preview_image">
      </div>
        `)

        $('.question-perview').animate({ opacity: 1 }, 1000)
    }
}