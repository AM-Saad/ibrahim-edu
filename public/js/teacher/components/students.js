function displayStudents(students) {
  students.forEach((s) => {
    $("#students").append(
      `  

            <div class="student getProfile rounded-lg shadow cursor-pointer text-white p-2 w-full text-center relative" style="opacity:0;">
                <div class="student-active_icon h-3 w-3 rounded-full absolute right-[4%] top-[4%]  ${
                  s.activated ? "bg-[#00FF15] shadow-md" : "bg-gray-300"
                }"></div>
                <img class="h-40 m-auto" src="/${
                  s.image || "images/student_img.png"
                }" alt="">
                <h5> ${s.name}</h5>
                 <h6>Exams: ${s.exams.length}</h6>

                <div class="mini-bar">
                    <span>Grade: ${s.grade}</span>
                    <span>Center: ${s.center}
                    </span>
                  
                </div>
                <input type="hidden" name="studentId" value="${s._id}">
            </div>
                `
    );
  });
  $(".student").animate({ opacity: 1 }, 200);
}

function displayoptions(grade, center, total) {
  $("#options").empty();
  $("#options").append(`
        <div class="options-inputs hidden">
            <input name="grade" value="${grade || ""}" type="hidden">
            <input name="center" value="${center || ""}" type="hidden">
        </div>
        <div class="options-buttons justify-between p-3 hidden">
            <div class="flex gap-3">
                <button class="btn btn-warning deactivate">Deactivate</button>
                <button class="btn btn-success activate">Activate</button>
            </div>
            <h4> Students: ${total}</h4>
        </div>
    `);
  $("#options .options-buttons").toggleClass("hidden flex");
}
