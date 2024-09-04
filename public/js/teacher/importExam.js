/*jslint browser: true*/

/*global console, alert, $, jQuery*/

$(".toggle-import").on("click", togglefrom);
document
  .getElementById("upload")
  .addEventListener("change", handleFileSelect, false);

function togglefrom() {
  $(".import-form").toggleClass("hidden");
}

let students = [];
var ExcelToJSON = function () {
  this.parseExcel = function (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, { type: "binary" });
      workbook.SheetNames.forEach(function (sheetName) {
        // Here is your object
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        var json_object = JSON.stringify(XL_row_object);
        students = JSON.parse(json_object).map((el) => {
          var o = Object.assign({}, el);
          o.answer1 = el.answer1 || null;
          o.answer2 = el.answer2 || null;
          o.answer3 = el.answer3 || null;
          o.answer4 = el.answer4 || null;
          o.correctAnswer = el.correctAnswer || null;
          o.question = el.question || null;

          return o;
        });

        const valid = validateData(students);
        if (valid) {
          $("#confirm-students")
            .removeClass("opacity-5")
            .on("click", uploadStudents);
          $(".import-form .info-message.success").html(
            "Your sheet ready to upload, click button below"
          );
        } else {
          $(".import-form .info-message.error").html(
            "Sheet missing critical info(e.g name, answer1, etc..) please check the demo"
          );
        }
        $(".import-form").removeClass("loader-effect");
      });
    };
    reader.onerror = function (ex) {};

    reader.readAsBinaryString(file);
  };
};

function handleFileSelect(evt) {
  $(".import-form").addClass("loader-effect");
  var files = evt.target.files; // FileList object
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}

async function uploadStudents() {
  $(".import-form").addClass("loader-effect");
  const examId = $('input[name="examId"]').val();
  if (students.length > 0) {
    const data = await fetchdata(
      `/teacher/questions/sheet/${examId}`,
      "post",
      JSON.stringify({ questions: students }),
      true
    );
    if (data) {
      message("Student Created", "success", "body");
      setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
    $(".import-form").removeClass("loader-effect");
  }
}

function validateData(students) {
  const fileKeys = Object.keys(students[0]);

  const requiredKeys = [
    "question",
    "answer1",
    "answer2",
    "answer3",
    "answer4",
    "correctAnswer",
  ];
  requiredKeys.forEach((k) => {
    if (!fileKeys.includes(k)) return false;
  });
  for (let i = 0; i < students.length; i++) {
    let s = students[i];
    if (
      isEmpty(s.question) ||
      isEmpty(s.answer1) ||
      isEmpty(s.answer2) ||
      isEmpty(s.answer3) ||
      isEmpty(s.answer4) ||
      isEmpty(s.correctAnswer)
    ) {
      return false;
    }
  }

  return true;
}
function isEmpty(str) {
  console.log(str);

  return str === null || str.match(/^ *$/) !== null;
}
