/*jslint browser: true*/

/*global console, alert, $, jQuery*/

$('.toggle-import').on('click', togglefrom);
document.getElementById('upload').addEventListener('change', handleFileSelect, false);


function togglefrom() {
    $('.import-form').toggleClass('hidden')
}


let students = []
var ExcelToJSON = function () {

    this.parseExcel = function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });
            workbook.SheetNames.forEach(function (sheetName) {
                // Here is your object
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var json_object = JSON.stringify(XL_row_object);
                students = JSON.parse(json_object).map(el => {
                    var o = Object.assign({}, el);
                    o.password = '$2a$12$.m9hXgag0rMTBbiXkbhReOWG7C9g8ADna0Y/XBMgfNMKweZ/gGBCG';
                    o.name = el.name || null
                    o.grade = el.grade || null
                    o.center = el.center || null
                    o.mobile =  el.mobile ? 0 + el.mobile : null
                    o.parentNo =  el.parentNo ? 0 + el.parentNo : null
                    o.code = el.code || null

                    return o;
                })

                const valid = validateData(students)
                if (valid) {
                    $('#confirm-students').removeClass('opacity-5').on('click', uploadStudents)
                    $('.import-form .info-message.success').html('Your students ready to upload, click button below')
                } else {
                    $('.import-form .info-message.error').html('Sheet missing critical info(e.g name, mobile, etc..) please check the demo')

                }
                $('.import-form').removeClass('loader-effect')

            })
        };
        reader.onerror = function (ex) {
        };

        reader.readAsBinaryString(file);
    };
};

function handleFileSelect(evt) {
    $('.import-form').addClass('loader-effect')
    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
}


async function uploadStudents() {
    $('.import-form').addClass('loader-effect')

    if (students.length > 0) {
        const data = await fetchdata('/teacher/students/sheet', 'post', JSON.stringify({ students: students }), true)
        if (data) {
            message('Student Created', 'success', 'body')
            setTimeout(() => {
                location.reload(true)
            }, 1500);
        }
        $('.import-form').removeClass('loader-effect')

    }
}

function validateData(students) {
    const fileKeys = Object.keys(students[0])

    const requiredKeys = ["name", "center", "mobile", "parentNo", "grade", "password", "code"]
    requiredKeys.forEach(k => {
        if (!fileKeys.includes(k)) return false
    });
    for (let i = 0; i < students.length; i++) {
        let s = students[i]
        if (isEmpty(s.name) || isEmpty(s.mobile) || isEmpty(s.grade) || isEmpty(s.center)) {
            return false
        }
    }

    return true
}
function isEmpty(str) {
    console.log(str);

    return str === null || str.match(/^ *$/) !== null
}
