$(document).ready(function () {
  console.log("heere");

  $(".toggle-pdf-form").on("click", function () {
    $("#pdfForm").toggleClass("hidden");
  });

  $(".toggle-modelAnswer").on("click", function () {
    $("#ModelAnswerForm").toggleClass("hidden");
  });
  // $('.closeModelAnswerForm').on('click', function () {
  //     $('#ModelAnswerForm').css({ display: "hidden" })
  // })
  $("body").on("click", ".question-sub-menu-btn", (e) => {
    $(e.target).parent().find(".question-list_item-sub-list").fadeIn(300);
  });
  $(".wrapper").on("click", function () {
    $(".question-list_item-sub-list").fadeOut();
  });
});
