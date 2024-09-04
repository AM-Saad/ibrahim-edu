/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/
import QrScanner from "../qr-scanner.min.js";

(function () {
  const config = {
    opendedSession: null,
    fetchedStudents: [],
    lectures: [],
    students: [],

    socket: null,
    init: function () {
      // $('#buzzer').get(0).play()
      // $('#gift-close').trigger('click')
      this.cashDom();

      this.bindEvents();

    },
    cashDom: function () {
      this.$center = $('input[name="center"]');
      this.$grade = $('input[name="grade"]');

      this.$opennewSession = $(".new-session");
      this.$create = $(".create-session");

      this.$search = $(".search-attendance");
      this.$scan = $(".start-scan");
      this.$stopScan = $(".stop-scan");
    },
    bindEvents: function () {
      // document.addEventListener('keypress', this.checkKey.bind(this), true)
      this.$center.on("click", this.selectCenter.bind(this));
      this.$grade.on("click", this.selectGrade.bind(this));

      this.$opennewSession.on("click", this.openNewSession.bind(this));
      this.$create.on("click", this.createSession.bind(this));

      this.$search.on("click", this.searchattendance.bind(this));

      this.$scan.on("click", this.startScan.bind(this));
      this.$stopScan.on("click", this.stopScan.bind(this));
      $("body").on("click", ".go-back", this.goBack.bind(this));
      $('body').on('click', '.question-sub-menu-btn', this.openSubMenu.bind(this))
      $("body").on("click", ".edit-session", this.editSession.bind(this));
      $("body").on("click", ".delete-session", this.deleteSession.bind(this));

    },
   
    selectCenter: (e) => {
      $(e.target).prop("checked", true);
      const parentDiv = $(e.target).parents("fieldset.centers");
      $(parentDiv)
        .find('input[type="checkbox"]')
        .not($(e.target))
        .prop("checked", false);
    },
    selectGrade: (e) => {
      $(e.target).prop("checked", true);
      const parentDiv = $(e.target).parents("fieldset.grades");
      $(parentDiv)
        .find('input[type="checkbox"]')
        .not($(e.target))
        .prop("checked", false);

      $("#filter-section").addClass("hidden");
      if ($(e.target).val() === "3") $("#filter-section").removeClass("hidden");
    },
    searchattendance: async (e) => {
      const grade = $("input[name='grade']:checked").val();
      const center = $("input[name='center']:checked").val();
      let section;
      if (!grade || !center)
        return message("select grade and center", "info", "body");

      $(".loading").removeClass("hidden");
      const data = await fetchdata(
        `/public/sessions?section=${section}`,
        "put",
        JSON.stringify({ grade: grade, center: center, number: number }),
        true
      );
      $(".loading").addClass("hidden");

      if (data != null) {
        config.lectures = data.json.lectures;
        config.students = data.json.students;
        attendanceSheet(data.json.lectures, data.json.students, false, section);
        config.makeFilterations(data.json.lectures, data.json.students);
      }
    },
    startScan: (e) => {
      scanSheet(grade, center, number, id);
    },
    openSubMenu: function (event) {
      $(event.target).parent().find('.question-list_item-sub-list').fadeIn(300)
      $(".wrapper").on('click', function () { $('.question-list_item-sub-list').fadeOut(); });
      // $(".question-list_item-sub-list").click(function (e) { e.stopPropagation(); });
  },
    editSession: (e) => {
      console.log(e)
      const sessionNo = $(e.target).data("session");
      if (sessionNo) {
        const session = config.lectures.filter((l) => l.number === sessionNo);
        if (session) {
          config.opendedSession = session;
          let section = $("input[name='section']:checked").val();
          config.detectQR();
          return attendanceSheet(session, config.students, true, section);
        } else {
          return message("Please refresh the page", "info", "body");
        }
      }
    },
    deleteSession : async (e) => {
      e.preventDefault();

      const sessionNo = $(e.target).data("session");

      if (sessionNo) {
       const data = await fetchdata(
          `/public/sessions/${sessionNo}`,
          "delete",
          true
        );
        if (data) {
          attendanceSheet(data.json.lectures, data.json.students, false);
        }
      }
    },
    detectQR: (e) => {
      const video = document.getElementById("qr-video");
      const videoContainer = document.getElementById("video-container");
      const camHasCamera = document.getElementById("cam-has-camera");
      const camList = document.getElementById("cam-list");
      const camHasFlash = document.getElementById("cam-has-flash");
      const flashToggle = document.getElementById("flash-toggle");
      const flashState = document.getElementById("flash-state");
      const camQrResult = document.getElementById("cam-qr-result");
      const camQrResultTimestamp = document.getElementById(
        "cam-qr-result-timestamp"
      );
      const fileSelector = document.getElementById("file-selector");
      const fileQrResult = document.getElementById("file-qr-result");

      let isLoading = false;

      async function setResult(label, result) {
        isLoading = true;
        const studentId = result.data;
        if (studentId) {
          await config.confirmAttendance(studentId);
        }
        isLoading = false;

        label.textContent = result.data;
        camQrResultTimestamp.textContent = new Date().toString();
        label.style.color = "teal";
        clearTimeout(label.highlightTimeout);
        label.highlightTimeout = setTimeout(
          () => (label.style.color = "inherit"),
          100
        );
      }

      const scanner = new QrScanner(
        video,
        (result) => {
          if (!isLoading) {
            // Set a new timer
            setResult(camQrResult, result);
          }
        },
        {
          onDecodeError: (error) => {
            camQrResult.textContent = error;
            camQrResult.style.color = "inherit";
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

        videoContainer.classList.remove("hidden");

      const updateFlashAvailability = () => {
        scanner.hasFlash().then((hasFlash) => {
          camHasFlash.textContent = hasFlash;
          flashToggle.style.display = hasFlash ? "inline-block" : "none";
        });
      };

      scanner.start().then(() => {
        updateFlashAvailability();
        // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
        // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
        // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
        // start the scanner earlier.
        QrScanner.listCameras(true).then((cameras) =>
          cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.id;
            option.text = camera.label;
            camList.add(option);
          })
        );
      });

      QrScanner.hasCamera().then(
        (hasCamera) => (camHasCamera.textContent = hasCamera)
      );

      // for debugging
      window.scanner = scanner;

      document
        .getElementById("scan-region-highlight-style-select")
        .addEventListener("change", (e) => {
          videoContainer.className = e.target.value;
          scanner._updateOverlay(); // reposition the highlight because style 2 sets position: relative
        });

      document
        .getElementById("show-scan-region")
        .addEventListener("change", (e) => {
          const input = e.target;
          const label = input.parentNode;
          label.parentNode.insertBefore(scanner.$canvas, label.nextSibling);
          scanner.$canvas.style.display = input.checked ? "block" : "none";
        });

      document
        .getElementById("inversion-mode-select")
        .addEventListener("change", (event) => {
          scanner.setInversionMode(event.target.value);
        });

      camList.addEventListener("change", (event) => {
        scanner.setCamera(event.target.value).then(updateFlashAvailability);
      });

      flashToggle.addEventListener("click", () => {
        scanner
          .toggleFlash()
          .then(
            () => (flashState.textContent = scanner.isFlashOn() ? "on" : "off")
          );
      });

      // document.getElementById("start-button").addEventListener("click", () => {
      //   scanner.start();
      // });

      // document.getElementById("stop-button").addEventListener("click", () => {
      //   scanner.stop();
      // });

      // fileSelector.addEventListener("change", (event) => {
      //   const file = fileSelector.files[0];
      //   if (!file) {
      //     return;
      //   }
      //   QrScanner.scanImage(file, { returnDetailedScanResult: true })
      //     .then((result) => setResult(fileQrResult, result))
      //     .catch((e) =>
      //       setResult(fileQrResult, { data: e || "No QR code found." })
      //     );
      // });
    },
    stopScan: () => {
      $(".attendance-sheet .user").remove();
      $(".attendance-sheet").addClass("hidden");
    },
    confirmAttendance: async (studentId) => {
      const sessionNo = config.opendedSession[0].number;
      const grade = config.opendedSession[0].grade;
      const center = config.opendedSession[0].center;
      console.log(config.opendedSession);
      if (
        !sessionNo ||
        config.isEmptyOrSpaces(grade) ||
        config.isEmptyOrSpaces(center)
      ) {
        message(
          "Make sure to select session you want to scan and try again",
          "info",
          "body"
        );
        return false;
      }
      $(".inside-wrapper").addClass("loader-effect");

      try {
        const data = await fetchdata(
          `/public/attendance/${studentId}`,
          "post",
          JSON.stringify({
            date: moment().format("YYYY-MM-DD"),
            number: sessionNo,
            grade: grade,
            center: center,
          }),
          true
        );
        $(".inside-wrapper").removeClass("loader-effect");

        if (data) {
          const elm = $(
            `.dates-date[data-sid="${data.json.student._id.toString()}"][data-sessionno="${sessionNo}"]`
          );
          elm.html(
            `<i class="far fa-check-circle c-g m-r-3" aria-hidden="true"></i>${moment().format(
              "YYYY-MM-DD"
            )}`
          );
          message("Confirmed", "info", "body");
          return true;
        }
      } catch (err) {
        $(".inside-wrapper").removeClass("loader-effect");
        message("Something went wrong", "info", "body");

        return false;
      }
    },


    startPrinting: function (e) {
      Popup($(".invoice")[0].outerHTML);
      function Popup(data) {
        window.print();
        return true;
      }
    },
    openNewSession: (e) => {
      $(".startSession").toggleClass("hidden");
    },
    createSession: async (e) => {
      e.preventDefault();
      const grade = $("input[name='sessionGrade']:checked").val();
      const center = $("input[name='sessionCenter']:checked").val();
      let section;
      const sessionnumber = $("input[name='sessionNo']").val();
      if (!grade || !center || !sessionnumber) {
        return message("select grade, center and number", "info", "body");
      }
      $(".inside-wrapper").addClass("loader-effect");
      const data = await fetchdata(
        `/public/sessions`,
        "post",
        JSON.stringify({
          grade: grade,
          center: center,
          number: sessionnumber,
          section: section || null,
        }),
        true
      );
      if (data) {
        $('input[name="sessionNo"]').val(null);
        $('input[name="sessionGrade"]').prop("checked", false);
        $('input[name="sessionCenter"]').prop("checked", false);
        attendanceSheet(data.json.lectures, data.json.students, true);
        config.openNewSession();

      }
      return $(".inside-wrapper").removeClass("loader-effect");
    },

    makeFilterations: function (lectures, students) {
      // const maped = students.map(s => ({
      //     student: { _id: s._id, name: s.name, grade: s.grade, center: s.center },
      //     attendance: lectures.map(l => {
      //         const exist = l.students.find(st => st.id.toString() === s._id.toString())
      //         if(exist){
      //         }
      //     })
      // }))
      // i have all requested sessions
      /// i have all students should be attend this sessions
      //each session has student attended only
      // i need to show all students and all sessions and with each session i have to display if student attend or no with the date if attended
      // const allLec = {}
      // const maped = lectures.map(l => ({
      //     lecture: { number: l.number, date: l.date },
      //     students: students
      // }))
      // students.forEach(s => {
      //     maped.students.find(st => {  })
      // });
      // console.log(maped);
      // scanSheet(lectures, maped)
    },
    isEmptyOrSpaces: (str) => str === null || str.match(/^ *$/) !== null,

    goBack: (e) => {
      attendanceSheet(this.lectures, this.students, false);
    },
  };

  config.init();
})();
