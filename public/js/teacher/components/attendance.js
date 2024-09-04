function attendanceSheet(lectures, students, edit, section) {
  $(".content .dates").empty();
  $(".content .students").empty();
  $(".body .attendance").empty();
  $(".attendance-sheet .user").remove();
  $(".inside-wrapper .go-back").remove();
  $(".attendance-sheet").removeClass("hidden");
  $(".stop-scan").removeClass("hidden");
  $("#center").val(null);
  $("#grade").val(null);
  $("#number").val(null);
  students.forEach((s) => {
    let exams;
    let homeworks;
    if (section) {
      exams = s.exams.filter((e) => e.section == section).length;
      homeworks = s.homeworks.filter((e) => e.section == section).length;
    } else {
      exams = s.exams.length;
      homeworks = s.homeworks.length;
    }
    $(".content .students").append(`
            <div class="">
                <input type="hidden" name="id" value="${s._id}">
              <span class="flex items-center gap-3 break-words h-[60px]"> ${s.name}</span>
               
            <div>`);

    $(".body .attendance").append(`
            <div class="flex studentAttend">
                <input type="hidden" name="id" value="${s._id}">
            <div>`);
  });

  lectures.forEach((l) => {
    $(".content .dates").append(
      `<div data-session=${l.number} class="dates-date font-bold text-center w-[150px] border-r text-xs h-full flex items-center justify-center">
      Session No: ${l.number}
      <i class="fas fa-ellipsis-v question-sub-menu-btn"></i>
      <ul class="question-list_item-sub-list">

          <li data-session=${l.number} class="edit-session question-list_item-sub-list-action">
              Edit
          </li>
          <li data-session=${l._id} class="delete-session question-list_item-sub-list-action">
             Delete
          </li>
      </ul>

      </div>`
    );
    l.students.forEach((s) => {
      $(".body .attendance")
        .find(`input[value="${s.id}"]`)
        .parent(".studentAttend")
        .append(
          `<div class="dates-date font-bold text-center w-[150px] h-[60px] border-r text-xs flex items-center justify-center break-words" data-sid=${
            s.id
          } data-sessionno=${l.number}> ${
            s.attended
              ? `<i class="far fa-check-circle c-g"></i> ${s.date} `
              : '<i class="far fa-times-circle c-r"></i>'
          }</div> `
        );
    });
  });
  $("h3.title").html(
    `Sessions for ${lectures[0].grade} | ${lectures[0].center}`
  );

  if (edit) {
    $(".inside-wrapper").append(
      '<i class="close go-back fas fa-arrow-left"></i>'
    );
    $("h3.title").html(
      `Session Number ${lectures[0].number} <br> <p class=""><b>Grade: ${lectures[0].grade}</b> & <b>Center: ${lectures[0].center}</b></p>`
    );
    $("#center").val(lectures[0].center);
    $("#grade").val(lectures[0].grade);
    $("#number").val(lectures[0].number);
  }
}
