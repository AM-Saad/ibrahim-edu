

const btn = document.getElementById('searchStudentBtn')
document.querySelector('#searchStudent').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchstudent(btn)
    }
});
const searchstudent = async (btn) => {

    if ($('.activeStudent').length > 0) {
        $('.activeStudent').fadeOut(300).remove()
    }
    const studentnumber = btn.parentNode.querySelector('[name=number]').value;
    if (studentnumber === "" || studentnumber.length < 11) {
        $('.searchResult ').css({ display: 'block' })

        return $('.searchResult').append(`
            <div class="alert alert-warning">Number Must Be 11 Digit</div>
            `)
    }
    $('.searchResult ').css({ display: 'none' })

    $('#searchStudentForm .loading').css({ display: 'block' })
    $('.searchResult .alert').remove()
    console.log(studentnumber);

    const res = await fetch(`/owner/studentByNumber/${studentnumber}`)
    const resData = await res.json()
    $('#searchStudentForm .loading').css({ display: 'none' })
    console.log(resData);

    if (res.status != 200) {

        $('.searchResult ').css({ display: 'block' })
        return $('.searchResult').append(`
            <div class="alert alert-warning">${resData.message}</div>
            `)
    } else {
        $('.student-panel_students-list').prepend(`
            <li class="list-group-item align-items-center activeStudent">
            <img class="loading loading-small" src="/images/loading(3).svg">
            <input type="hidden" name="studentId" value="${resData.student._id}">
            <a href="/teacher/student/${resData.student._id}">
            ${resData.student.name}
            </a>
            <span class="badge badge-primary badge-pill">Taken Exams:
            ${resData.student.lessons.length}
            </span>
            <span class="badge badge-danger badge-pill">
            <a href="/owner/deleteStudnet/${resData.student._id}" class="deleteStudent ">
            <i class="fas fa-trash c-r"></i>
            </a>
            </span>
            <div class="teachers none">
            <i class="fas fa-times closeTeachers"></i>
            <img src="/images/loading(3).svg" class="loading loading-small" alt="">

        </div>
        <a onclick="getStudentTeachers(this)" class="btn btn-info">Student Teachers</a>

            </li>
            `)

    }
}

const activeStudent = async (btn) => {
    $(btn).parents('.list-group-item').find('.loading').css({ display: 'block' })
    const studentId = $(btn).parents('.list-group-item').find('[name=studentId]').val();
    const data = await fetchdata(`/owner/deactivateStudent/${studentId}`, 'put', {}, false)
    if (data != null) {
        $(btn).parent('.teacher').append(`
            <button onclick="deactiveStudent(this)" class="btn btn-danger">Dectivate</button>
            
            `)
        $(btn).fadeOut(200).remove()
    }
    $(btn).parents('.list-group-item').find('.loading').css({ display: 'none' })

}
const deactiveStudent = async (btn) => {

    $(btn).parents('.list-group-item').find('.loading').css({ display: 'block' })
    const studentId = $(btn).parents('.list-group-item').find('[name=studentId]').val();
    const data = await fetchdata(`/owner/deactivateStudent/${studentId}`, 'put', {}, false)
    if (data != null) {
        $(btn).parent('.teacher').append(`
            <button onclick="activeStudent(this)" class="btn btn-success">Activate</button>
            
            `)
        $(btn).fadeOut(200).remove()
    }
    $(btn).parents('.list-group-item').find('.loading').css({ display: 'none' })

}
const deactivateAllStudent = async (e) => {

    if (confirm("Do you want to De-activate all student?")) {
        $('.wrapper').addClass('loader-effect')
        const data = await fetchdata(`/owner/deactivateStudent`, 'put', {}, false)
        if (data != null) {
            message('De-Activated', 'info', 'body')

            setTimeout(() => {

                location.reload();
            }, 2000);
        } else {
            $('.wrapper').removeClass('loader-effect')

        }

    } else {
        e.preventDefault()
    }

}
const activateAllStudent = async (e) => {

    if (confirm("Do you want to Activate all student?")) {

        $('.wrapper').addClass('loader-effect')

        const data = await fetchdata(`/owner/activateAllStudents`, 'put', {}, false)
        if (data != null) {
            message('Activated', 'success', 'body')
            setTimeout(() => {

                location.reload();
            }, 2000);
        } else {
            $('.wrapper').removeClass('loader-effect')
        }

    } else {
        e.preventDefault()
    }
}
$('.deleteStudent').on('click', function (e) {
    if (confirm("Do you want to delete this?")) {
    } else {
        e.preventDefault()
    }
})
