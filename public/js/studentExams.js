/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
  const getExams = {
    fetchedExams: null,
    fetchedHomework: null,
    fetchedComments: [],
    isSame: false,
    isTeacher: false,
    openedExam: null,

    init: function () {
      this.cashDom();
      this.fetchAllLessons();
      // this.bindEvents()
      this.initQrCode();
    },
    cashDom: function () {
      this.$el = $("#allLessons");
      this.$loading = $(" .loading");
      this.$studentId = $('input[name="studentId"]').val();
      this.$teacherId = $('input[name="teacherId"]').val();
      this.commentsDev = document.getElementById("allcomments");
      $("body").on("click", ".lesson.exam", this.openStudentExam.bind(this));
      $("body").on(
        "click",
        ".lesson.homework",
        this.openStudentHomework.bind(this)
      );
      $("body").on("click", ".getBack", this.getBack.bind(this));
      $("body").on(
        "click",
        ".lessons-list_item_body",
        this.openQuestionBox.bind(this)
      );
    },
    getBack: function (e) {
      $(".sheet .all-items").empty();
      $(e.target)
        .parents(".sheet")
        .animate(
          {
            opacity: 0.25,
            left: `-${$(e.target).parent().width() + 50}`,
          },
          500,
          function () {
            this.openedExam = null;
            $(e.target).parents(".sheet").addClass("hidden");
          }
        );
    },
    initQrCode: function () {
      new QRCode(document.getElementById("qrcode"), {
        text: this.$studentId,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    },

    fetchAllLessons: async function () {
      this.$loading.removeClass("hidden");
      const data = await fetchdata(
        `/public/api/students/exams/${this.$studentId}`,
        "get",
        {},
        true
      );
      if (data != null) {
        this.fetchedExams = data.json.exams;
        this.fetchedHomework = data.json.homeworks;
        // if (data.json.userType === "same") getExams.isSame = true;
        if (data.json.isTeacher) getExams.isTeacher = true;

        this.render(this.fetchedExams, this.fetchedHomework);
      }
      this.$loading.addClass("hidden");
    },
    addNewComment: function (e) {
      const lessonId = e.target.parentNode.querySelector(
        "input[name=lessonId]"
      ).value;
      const studentId = e.target.parentNode.querySelector(
        "input[name=studentId]"
      ).value;
      const comment = e.target.parentNode.querySelector(
        "input[name=comment]"
      ).value;
      $(".addComment .loading").css({ display: "block" });
      fetch(`/public/addComment/${lessonId}?studentId=${studentId}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            getExams.showMessage("Something went wrong...", "alert");
          }
          $(".addComment .loading").css({ display: "none" });
          $("");
        })
        .then((resData) => {
          getExams.fetchedComments.push(resData.comment);
          getExams.renderComments(
            getExams.fetchedComments,
            lessonId,
            getExams.teacherId
          );
        })
        .catch((err) => {
          console.log(err);
        });
    },
    closeCommentBox: function () {
      $("#allcomments").animate(
        { height: "0", opacity: 0, zIndex: -2 },
        250,
        function () {
          $("#allcomments").html("");
        }
      );
    },
    showComments: function (e) {
      const lessonId = $(e.target)
        .parents(".lesson")
        .find("input[name=lessonId]")
        .val();
      const comments = getExams.allLessons.find((l) => {
        return l._id.toString() === lessonId.toString();
      }).comments;
      $("#allcomments").animate(
        { zIndex: "99999999", height: "500px", opacity: 1 },
        250
      );

      getExams.fetchedComments = comments;
      getExams.renderComments(comments, lessonId);
    },
    renderComments: function (comments, lessonId) {
      const ID = $("#teacherId").val();
      getExams.commentsDev.innerHTML = "";
      comments.forEach((c) => {
        $(getExams.commentsDev).append(`
                    <div class="comment">
                        <img src="/${c.image}">
                        <a href="/public/student/${c.commentedBy}?teacherId=${ID}">${c.name}</a>
                        <p>${c.comment}</p>
                    </div>
                    `);
      });
      $(getExams.commentsDev).append(
        `
                <div class="addComment">
                <input type="text" id="newCommentInput" name="comment" class="form-control" placeholder="Write comment..">
                <input type="hidden" name="lessonId" value="${lessonId}" class="form-control" placeholder="Write comment..">
                <img class="loading" style="right:50px; width:30px; height:30px" src="/images/loading(3).svg">
                <input type="hidden" name="studentId" value="${this.$studentId}" class="form-control" placeholder="Write comment..">
                <a class="addNewComment btn btn-info">Add</a>
                </div>
                `
      );
      $(getExams.commentsDev).append(
        `<i class="fas fa-times" id="closeComments"></i>`
      );
      $(".addNewComment").on("click", getExams.addNewComment);
      $("#closeComments").on("click", getExams.closeCommentBox);
    },
    render: function (exams, homeworks) {
      displayExams(
        exams,
        homeworks,
        this.$quickLook,
        getExams.isTeacher,
        getExams.isSame
      );

      $("#allLessons img").each(function () {
        if ($(this).attr("src") == "/undefined" || $(this).attr("src") == "/") {
          $(this).css({ visibility: "hidden" });
        }
      });
    },

    getStudentAndLessonIDs: (e) => {
      e.stopPropagation();
      let lessonId;
      let studentId;
      if (!$(e.target).hasClass("deleteLesson")) {
        if ($(e.target).hasClass("lesson")) {
          lessonId = $(e.target).find('input[name="lessonId"]').val();
          studentId = $(e.target).find('input[name="studentId"]').val();
        } else {
          lessonId = $(e.target)
            .parents(".lesson")
            .find('input[name="lessonId"]')
            .val();
          studentId = $(e.target)
            .parents(".lesson")
            .find('input[name="studentId"]')
            .val();
        }
      } else {
        lessonId = $(e.target)
          .parents(".lesson")
          .find('input[name="lessonId"]')
          .val();
        studentId = $(e.target)
          .parents(".lesson")
          .find('input[name="studentId"]')
          .val();
      }
      return { lessonId, studentId };
    },
    filterSingleExam: (lessonId, studentId) => {
      const exam = getExams.fetchedExams.find(
        (l) => l._id.toString() === lessonId.toString()
      );
      getExams.openedExam = exam;
      return exam;
    },
    filterSingleHomework: (lessonId, studentId) => {
      const exam = getExams.fetchedHomework.find(
        (l) => l._id.toString() === lessonId.toString()
      );
      getExams.openedExam = exam;
      return exam;
    },

    openQuestionBox: function (e) {
      const questionId = $(e.target)
        .parents(".lessons-list_item")
        .find('input[name="questionId"]')
        .val();
      const question = getExams.openedExam.lessonQuestions.find((q) => {
        return q._id.toString() === questionId.toString();
      });
      const answersBox = $(e.target)
        .parents(".lessons-list_item")
        .find(".answerBox");
      if (!answersBox.has(".answer").length > 0) {
        
        if (question.questionImg) {
          answersBox.append(`<img src="/${question.questionImg}">`);
        }
        question.answers.forEach((a, i) => {
          if (a.answer != "null") {
            answersBox.append(`<div class="flex items-center gap-1"><p class="answer ">${i}- ${a.answer}</p></div>`);
          }
        });
      } else {
        answersBox.empty();
      }
    },
    getBack: function (e) {
      $(e.target)
        .parent()
        .animate(
          {
            opacity: 0.25,
            left: `-${$(e.target).parent().width() + 50}`,
          },
          500,
          function () {
            this.openedExam = null;
            $("#choosenLesson").addClass("hidden");
            $("#quickLook").css({ display: "none" });
          }
        );
    },
    openStudentExam: function (e) {
      // if (this.isTeacher || this.isSame) {
      const { lessonId, studentId } = this.getStudentAndLessonIDs(e);
      const exam = this.filterSingleExam(lessonId, studentId);
      this.openedExam = exam;
      displayExam(exam);
      //add event listener
      $("#choosenLesson").removeClass("hidden");
      $("#choosenLesson").animate({ left: 0, opacity: 1 }, 50);
      // }
    },
    openStudentHomework: function (e) {
      // if (this.isTeacher || this.isSame) {
      const { lessonId, studentId } = this.getStudentAndLessonIDs(e);
      const exam = this.filterSingleHomework(lessonId, studentId);
      this.openedExam = exam;
      displayExam(exam);
      //add event listener
      $("#choosenLesson").removeClass("hidden");
      $("#choosenLesson").animate({ left: 0, opacity: 1 }, 50);
      // }
    },
  };
  getExams.init();
})();
