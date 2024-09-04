// /*jslint browser: true*/

// /*global console, alert, $, jQuery*/



(function () {
  const examConfig = {
    exam: null,
    blobedFile: '',
    lessonId: $('input[name="lessonId"]').val(),
    homeworkId: $('input[name="originalhomework"]').val(),



    init: function () {
      this.startExam()

    },
    cashDom: function () {
      this.$openPagination = $('#open-pagination')
      this.$paginationItem = $("#pagination ul li")
      this.$answerInput = $('input[type="checkbox"]')
      this.$startAnswer = $('.startAnswer')
      this.$clearCanvas = $('.clearCanvas')
      this.$closeCanvas = $('.closeCanvas')
      this.$confirmAnswer = $('.confirmWriteAnswer')
      this.$examForm = $('#exam')
    },
    bindEvents: function () {
      this.$paginationItem.on('click', this.getQuestionByNumber.bind(this))

      this.$answerInput.on('click', this.selectAnswer.bind(this))

      $('.startAnswer').unbind("click").on('click', this.startAnswer)
      $('input[value="null"]').attr('checked', true).parent().css({ display: 'none' })

      this.$openPagination.on('click', this.openPagination.bind(this))

      this.$clearCanvas.on('click', this.clearCanvas.bind(this))
      this.$closeCanvas.on('click', this.closeCanvas.bind(this))

      this.$confirmAnswer.unbind("click").on('click', this.checkAnswerBeforeSubmit.bind(this))
      this.$examForm.on('submit', this.submitExam.bind(this))
      const questionNumber = document.querySelectorAll('.questionNumber');
      for (let i = 0; i < questionNumber.length; i++) {

        questionNumber[i].innerHTML = parseInt(questionNumber[i].innerHTML, 10) + 1
      }
      const questionLength = document.querySelectorAll('.exam-question').length;
      window.onbeforeunload = function (e) {
        return 'Are you really want to perform the action?';
      }

    },
    startExam: async function () {
      const data = await fetchdata(`/homework/start/${this.homeworkId}?lessonId=${this.lessonId}`, 'Post', {}, false)
      if (data != null) {
        examConfig.exam = data.json.exam
        $('#holders').remove()
        displayExam(examConfig.exam)
        examConfig.cashDom()
        examConfig.bindEvents()
      }
    },
    openPagination: () => {
      $('#pagination').toggleClass('hidden')

    },
    getQuestionByNumber: (e) => {
      e.preventDefault();
      console.log($(e.target))
      console.log($('#' + $(e.target).data('scroll')))
      $('html, body').animate({
        scrollTop: $('#' + $(e.target).data('scroll')).offset().top
      }, 1000);
    },
    selectAnswer: (e) => {
      $(e.target).prop("checked", true);
      const parentDiv = $(e.target).parents('fieldset.exam-answers')
      $(parentDiv).find('input[type="checkbox"]').not($(e.target)).prop("checked", false)
    },
    preventDefault: function (e) {
      e.preventDefault();
    },
    disableScroll: function (e) {
      document.addEventListener('touchmove', this.preventDefault, { passive: false });
    },
    enableScroll: function (e) {
      document.removeEventListener('touchmove', this.preventDefault, false);
    },
    startAnswer: function (e) {
      const wrapperDiv = e.target.parentNode.children[0]
      $('.canvaswrapper').css({ display: 'none' })
      $('#canvas').remove()
      wrapperDiv.style.display = "block"
      $(wrapperDiv).append(`<canvas id="canvas" style="background-color:#fff"></canvas> `)
      function getMousePos(canvasDom, evt) {
        var obj = document.getElementById("canvas");
        var top = 0;
        var left = 0;
        while (obj) {
          top += obj.offsetTop;
          left += obj.offsetLeft;
          obj = obj.offsetParent;
        }
        var mouseX = evt.clientX - left + window.pageXOffset;
        var mouseY = evt.clientY - top + window.pageYOffset;


        // canvas resolution

        // Add the following 3 lines to scale the mouse coordinates to the
        const bounds = canvasDom.getBoundingClientRect();
        mouseX = (mouseX / bounds.width) * canvasDom.width;
        mouseY = (mouseY / bounds.height) * canvasDom.height;

        // your code
        return {
          x: mouseX,
          y: mouseY
        };
      }
      examConfig.disableScroll()
      const canvas = $(wrapperDiv).find('#canvas')[0]
      let dpr = window.devicePixelRatio || 1;
      let rect = canvas.getBoundingClientRect();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let ctx = canvas.getContext("2d");
      // ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#222222";
      ctx.lineWith = 2;
      // Set up mouse events for drawing
      var drawing = false;
      var mousePos = { x: 0, y: 0 };
      var lastPos = mousePos;
      canvas.addEventListener("mousedown", function (e) {
        drawing = true;
        lastPos = getMousePos(canvas, e);
      }, false);
      canvas.addEventListener("mouseup", function (e) {
        drawing = false;
      }, false);
      canvas.addEventListener("mousemove", function (e) {
        mousePos = getMousePos(canvas, e);
      }, false);


      // Get a regular interval for drawing to the screen
      window.requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimaitonFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
      })();

      // Draw to the canvas
      function renderCanvas() {
        if (drawing) {
          ctx.moveTo(lastPos.x, lastPos.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.stroke();
          lastPos = mousePos;
        }
      }

      // Allow for animation
      (function drawLoop() {
        requestAnimFrame(drawLoop);
        renderCanvas();
      })();

      // Get the position of a touch relative to the canvas
      function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
          x: touchEvent.touches[0].clientX - rect.left,
          y: touchEvent.touches[0].clientY - rect.top
        };
      }
      // Set up touch events for mobile, etc
      canvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
      }, false);
      canvas.addEventListener("touchend", function (e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
      }, false);
      canvas.addEventListener("touchmove", function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
      }, false);
    },
    checkAnswerBeforeSubmit: function (e) {
      $(e.target).parents('.exam-question').addClass('loader-effect')
      const wrapperDiv = e.target.parentNode;
      const questionId = e.target.parentNode.children[0].value
      const lessonId = $('input[name="homeworkId"]').val()
      const questionType = e.target.parentNode.children[1].value


      if (questionType === 'written') {
        const existAnswer = wrapperDiv.parentNode.querySelector('img')
        const canvas = document.getElementById('canvas')
        if (existAnswer != null) {
          existAnswer.remove()
        }

        canvas.toBlob(function (blob) {
          blob.lastModifiedDate = new Date();
          blob.name = 'NEWANSWEFORSTUDNET';
          examConfig.createImageFile(blob, wrapperDiv)
          return examConfig.confirmAnswer({ blob, questionId, lessonId, questionType })
        })

      } else {

        const answer = $(e.target).parents('.writeAnswer').find('input[name="answer"]').val()
        if (answer === '' || answer === undefined) {
          return message('You have to add answer before submit', 'warning', 'body')
        } else {
          $(e.target).parents('.exam-question').find('.answerParagraph').html(answer)
          return examConfig.confirmAnswer({ answer, questionId, lessonId, questionType })
        }

      }
    },
    createImageFile: function (blob, wrapperDiv) {
      var createdurl = URL.createObjectURL(blob)
      const newImg = document.createElement('img')
      newImg.style.maxWidth = '100%'
      newImg.onload = function () { URL.revokeObjectURL(createdurl); };
      newImg.src = createdurl;
      wrapperDiv.parentNode.append(newImg)
      examConfig.enableScroll()
      examConfig.clearCanvas()
      examConfig.closeCanvas()

    },

    confirmAnswer: async function (info) {
      let newform = new FormData()
      if (info.questionType == 'written') {
        newform.append("image", info.blob);
      } else {
        newform.append("answer", info.answer);
      }
      const data = await fetchdata(`/homework/answer/${info.lessonId}?qid=${info.questionId}`, 'put', newform, false)
      if (data != null) {
        $('.exam-question').removeClass('loader-effect')
        $('input[name="answer"]').val('')
      }
      $('.exam-question').removeClass('loader-effect')

    },

    clearCanvas: function () {
      const canvas = $('canvas')[0]
      canvas.width = canvas.width;
    },
    closeCanvas: function (e) {
      this.clearCanvas()
      $('#canvas').remove()
      $('.canvaswrapper').css({ display: 'none' })
      // $('#startAnswer').css({visibility: 'visible' })
      this.enableScroll()
    },

    submitExam: async function (e) {
      $('#submitExam').off('click');
      e.preventDefault()
      $('#submitExam').css({ opacity: .70 });
      $('#submitExam img').css({ display: 'block' });
      const lessonId = $('input[name="homeworkId"]').val()
      var selectedAnswers = [];
      $.each($("input[name='selectedAnswers']:checked"), function () {
        selectedAnswers.push($(this).val());

      });
      const examForm = new FormData();
      examForm.append("selectedAnswers", JSON.stringify(selectedAnswers));
      try {
        let r = await fetch(`/homework/submit/${lessonId}`, {
          method: "POST",
          body: examForm,
        });
        if (r.status === 200 || r.status === 201) {

          window.onbeforeunload = null;
          window.location.replace(`/profile`);
        } else {
          return lessonConfig.showMessage('Something went wrong please try again', 'warning', 'body')
        }
      } catch (error) {
        return lessonConfig.showMessage('Something went wrong please try again', 'warning', 'body')

      }

    }
  }
  examConfig.init()
})()