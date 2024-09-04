function displayExam(exam) {
  let conunter = -1
  $('.wrapper').append(`
      
    <form id="exam" action="/submitExam/${exam._id}" method="post" class="carousel-inner">
    <input type="hidden" name="examId" value="${exam._id}">
    
    </form>
    `)
  $('.wrapper').append(`
    <div id="pagination">
    <ul class="pagination-list">
    </ul>
  </div>
    `)
  exam.lessonQuestions.forEach((q, i) => {
    conunter += 1
    console.log(conunter);

    $('.pagination-list').append(`
          <li class="pagination-list_item" >
            <button data-scroll="${conunter}" class="questionNumber btn btn-info">${conunter}</button>
          </li>
      `)
    if (q.questionType === 'choose') {

      $('.wrapper #exam').append(`
        <span class="exam-q-number questionNumber btn btn-info">
        ${conunter}
        </span>
        <div id="${conunter}" class="form-group exam-question">
        <p id="questionText">
        ${q.question}
        </p>
        <img class="exam-q-img ${q.questionImg ? '': 'hidden'}" src="/${q.questionImg}" alt="">
        <input type="hidden" name="questionId" value="${q._id}"/>
        <fieldset class="exam-answers">
        <div class="answer" style="display:none;">
        <input type="checkbox" name="selectedAnswers" value="${q.answers[0].answerNo}" />
        ${q.answers[0].answer}
        </div>
        <div class="answer flex gap-2">
        <input type="checkbox" name="selectedAnswers" value="${q.answers[1].answerNo}" />
        ${q.answers[1].answer}
        </div>
        <div class="answer flex gap-2">
        <input type="checkbox" name="selectedAnswers" value="${q.answers[2].answerNo}" />
        ${q.answers[2].answer}
        </div>
        <div class="answer flex gap-2">
        <input type="checkbox" name="selectedAnswers" value="${q.answers[3].answerNo}" />
        ${q.answers[3].answer}
        </div>
        <div class="answer flex gap-2">
        <input type="checkbox" name="selectedAnswers" value="${q.answers[4].answerNo}" />
            ${q.answers[4].answer}
            </div>
            </fieldset>
            </div> 
            `)
    } else if (q.questionType === 'paragraph') {
      $('.wrapper #exam').append(`
        <span class="exam-q-number questionNumber btn btn-info">
        ${conunter}
        </span>
     
          <div id="${conunter}" class="form-group exam-question">
              <p id="questionText">
                ${q.question}
              </p>
              <p class="answerParagraph paragraphAnswer"><p>
              <img class="exam-q-img" src="/${q.questionImg}" alt="">
              <div class="writeAnswer" data-target="${q._id}">
                <input type="hidden" name="questionId" value="${q._id}" />
                <input type="hidden" name="questionType" value="${q.questionType}" />
                <input class="form-control" type="text" placeholder="Write your answer.." name="answer">

                <a class="confirmWriteAnswer btn btn-success">Add <img src="/images/loading(1).svg"></a>
            </div>
          </div>
            `)
    } else if (q.questionType === 'truefalse') {
      $('.wrapper #exam').append(`
      <span class="exam-q-number questionNumber btn btn-info">
      ${conunter}
      </span>
      <div id="${conunter}" class="form-group exam-question">
      <p id="questionText">
      ${q.question}
      </p>
        <img class="exam-q-img" src="/${q.questionImg}" alt="">
        <input type="hidden" name="questionId" value="${q._id}"/>
        <fieldset class="exam-answers">
            <div class="answer" style="display:none;">
              <input type="checkbox" name="selectedAnswers" value="null" />
              null
            </div>
            <div class="answer flex gap-2">
            <input type="checkbox" name="selectedAnswers" value="1" />
            Ture
            </div>
            <div class="answer flex gap-2">
            <input type="checkbox" name="selectedAnswers" value="0" />
            False
            </div>
        </fieldset>
      </div> 
          `)
    }
    else {
      $('.wrapper #exam').append(`
        <span class="exam-q-number questionNumber btn btn-info">
        ${conunter}
        </span>
      <div id="${exam.lessonQuestions.findIndex(x => x._id === q._id)}" class="form-group exam-question">
          <p id="questionText">
            ${q.question}
          </p>
          <img class="exam-q-img" src="/${q.questionImg}" alt="">
          <div class="writeAnswer" data-target="${q._id}">
            <div class="canvaswrapper">
              <input type="hidden" name="questionId" value="${q._id}" />
              <input type="hidden" name="questionType" value="${q.questionType}" />
          
              <span class="closeCanvas">
                <i class="fas fa-times"></i>
              </span>
              <a class="confirmWriteAnswer">Submit<img src="/images/loading(1).svg" ></a>
              <button type="button" class="clearCanvas " >Clear</button>
            </div>
            <a id="startAnswer" class="startAnswer btn btn-info">Start Answer</a>
        </div>
      </div>
            `)
    }
  })
  $('.wrapper #exam').append(`
    <button id="submitExam" class="btn btn-success">Finish Exam
    <img src="/images/loading(1).svg" >
    </button>
    `)

}