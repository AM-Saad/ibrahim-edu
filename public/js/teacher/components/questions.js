function displayquestions(allQuestions) {
  $(".question-list").remove();
  allQuestions.forEach((q, i) => {
    console.log(q.questionType);

    $(".card-body").append(`
        <ul class="question-list">
        <li class="question-list_item p-3 gap-3 mb-2 rounded shadow border relative">
        <div class="flex gap-3">

            <p> ${i + 1}- </p>
            <div class="relative mb-2 cursor-pointer">
              <p>${q.question}</p>
              ${q.questionType == "truefalse"  ? `<span class="text-xs">Answer: ${q.correctAnswer == 1 ? "True" : "False"}` : "" }
              ${ q.questionType == "choose" ? `<span class="text-xs">Correct Answer: ${q.correctAnswer}</span>` : ""}
              ${q.questionType == "paragraph"? `<span class="text-xs">Score : ${q.questionScore}</span>`: "" }
              ${q.questionType == "written"   ? `<span class="text-xs">Score : ${q.questionScore}</span >` : ""}
              
            </div>
            </div>
        <i class="fas fa-ellipsis-v question-sub-menu-btn"></i>
        <ul class="question-list_item-sub-list">
            <input type="hidden" name="questionId" value="${q._id}" />
            <li class="edit-question question-list_item-sub-list-action">
                <a>Edit</a>
            </li>
            <li class="delete-question question-list_item-sub-list-action">
                <a class="">Delete</a>
            </li>
        </ul>

        <div class="answerBox collapsible p-3 bg-gray-100 rounded shadow overflow-hidden ">

        </div>
        <input type="hidden" name="questionId" value="${q._id}" />
        <i style="position:absolute; bottom:0; left:50%;" class="fas fa-sort-down expandQ cursor-pointer p-2"></i>
        </li >
        </ul >

        `);
  });
}

function displayinformation(info) {
  $(".header-info").append(`
    <h4 class="mb-2"><strong>Name:</strong> ${info.name ? info.name : ""}</h4>
    <h4 class="mb-2"><strong>Questions:</strong> ${info.allQuestions.length}</h4>
    <h4 class="mb-2"><strong>Passcode:</strong> ${info.pin ? info.pin : "-"}</h4>
    <h4 class="mb-2"><strong>Duration:</strong> ${info.timer ? info.timer : "-"}  </h4>
    `);
  $(".header-title ").html(`Duration: ${info.timer ? info.timer : "-"} `);
  $(".header-subtitle").html(`Passcode: ${info.pin || "-"}`);

  $('input[name="min"]').val(`${info.timer ? info.timer : ""}`);
  $('input[name="pin"]').val(`${info.pin ? info.pin : ""}`);
  $('input[name="name"]').val(`${info.name ? info.name : ""}`);
}

function displayhomeworkinformation(info) {
  $(".header-info").append(`
    <h4>Name: ${info.name ? info.name : ""}</h4>
    <h4>Questions: ${info.allQuestions.length}</h4>
    `);

  $('input[name="name"]').val(`${info.name ? info.name : ""}`);
}
