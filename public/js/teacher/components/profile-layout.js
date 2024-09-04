function displayProfile(student, profile) {
  profile.append(`
            <i id="" style="cursor:pointer;" class="fas fa-times close closeWindow p-2"></i>
            <input type="hidden" value="${student._id}" name="studentId" />

            <div class="p-4 mt-2">
                <div class="flex gap-5 items-center justify-end mb-3">
                    <a class="whatsapp-btn w-6 h-6" target="_blank" href="https://wa.me/02${student.mobile}">
                        <img class="w-full h-full" src="/images/whatsapp.svg">
                    </a>
                    <a class="get-information cursor-pointer h-5">
                        <i class="fas fa-qrcode "></i>
                    </a>
                    <a class="change-center cursor-pointer">
                        <i class="fas fa-cogs"></i>
                    </a>
                </div>

                <div class="bg-gray-50 grid md:grid-cols-2 p-3 rounded shadow">
             
                    <div>
                        <h3 class="font-medium text-xl"> ${student.name}</h3>
                        <p>Mobile: <a class="c-gray" target="_blank" href="https://wa.me/02${student.mobile }"> ${student.mobile}</a></p>
                        <p>Code:  ${student.code || ""}</p>
                        <p>Parent No: ${`<a class="c-gray" target="_blank" href="https://wa.me/02${student.parentNo}"> ${student.parentNo}</a>` || ""}</p>
                        <p>School: ${student.school || ""}</p>
                        <p>Exams: ${student.exams.length}</p>
                        <p>Grade: ${student.grade}</p>
                        <p>Center: <span class="student-center"> ${student.center}</span> </p>
                    </div>
              
                    <div class="flex items-start justify-center gap-5 w-full h-fit">
                        <div class="qrcode"></div>
                    </div> 

                </div>

                <div class="flex items-center gap-3 flex-wrap my-2">
                 
                    <div class="onoffswitch ${student.activated ? 'active' : ''}">
                        <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" tabindex="0" ${student.activated ? "checked" : ""} />
                          <label class="onoffswitch-label" for="myonoffswitch">
                          <span class="onoffswitch-inner ${ student.activated ? "active" : ""}"></span>
                          <span class="onoffswitch-switch ${student.activated ? 'active' : ''}"></span>
                        </label>
                    </div>

                    <button class="btn btn-small btn-warning get-attendance" id="">Attendances</button>
                    <button class="btn btn-small btn-info reset-password">Reset Password</button>
                    <button class="btn btn-small btn-danger delete-student">Delete</button>

                </div>

              </div>

        

            <div class="dynamic-tabs">
                <ul class="tabs-list flex  m-4 gap-3">
                  <li class="active " data-content=".content-one">
                    <button class="btn ">Exams</button>
                  </li>
                  <li class="" data-content=".content-two">
                    <button class="btn " >Homeworks</button>
                  </li>
                </ul>

             
                 
                <div class="content-list">
                    <div class="allLessons exams content-one p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 relative z-20"></div>
                    <div class="allLessons homeworks content-two p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-20 hidden"></div>
                </div>
            </div>
       
            `);
}
function attendanceSheet(attendance) {
  $(".sheet .all-items").empty();
  $(".sheet.attendance .fall-back").remove();
  if (attendance.length > 0) {
    attendance.forEach((a) => {
      $(".sheet.attendance .all-items").append(
        `<p class="font-xl m-medium p-medium bg-darkgray"><b>Number:${
          a.number
        }</b><br><b>Date:${a.date}</b><br> <b>Center:${a.center}</b><br> ${
          a.section ? `<b>Section ${a.section}</b>` : ""
        }</p>`
      );
    });
  } else {
    $(".sheet.attendance .all-items").append(
      "<h3 class='fall-back p-large'>Didn't attended any day yet...</h3>"
    );
  }
  $(".sheet.attendance").removeClass("hidden");
}

function studentinformation(sts) {
  $(".sheet.information .all-items").empty();
  if (sts.length > 0) {
    for (let i = 0; i < sts.length; i++) {
      $("body").append(`
                <div class=" p-medium bg-w ">
                    <div class="information-body">
                        <h6>Name: ${sts[i].name}</h6>
                        <h6>Code: ${sts[i].code || ""}</h6>
                        <h6>Grade: ${sts[i].grade}</h6>
                        <h6>center: ${sts[i].center}</h6>
                        <canvas id="code128-${sts[i]._id}" ></canvas>
                    </div>
               
                </div>
            `);
      JsBarcode(`#code128-${sts[i]._id}`, sts[i]._id, {
        format: "CODE128",
        displayValue: true,
      });
    }
  }

  $(".sheet.information").removeClass("hidden");
}
