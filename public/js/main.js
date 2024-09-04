/*jslint browser: true*/

/*global console, alert, $, jQuery*/

//show search input from admin

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('../sw.js').then(() => {
//     console.log('Registered');
//   })
// }
// var _beforeInstallPrompt;

// if ("onbeforeinstallprompt" in window) {
//   self.addEventListener("beforeinstallprompt", function beforeInstallPrompt(evt) {
//     document.getElementById('setup_button').style.display = 'inline';
//     evt.preventDefault();
//     console.log(evt);
//     _beforeInstallPrompt = evt;

//   })

// } else {
//   alert('not has the event')
// }

function installApp() {
  _beforeInstallPrompt
    .prompt()
    .then(function (evt) {
      // Wait for the user to respond to the prompt
      return _beforeInstallPrompt.userChoice;
    })
    .then(function (choiceResult) {
      if (choiceResult === "accepted") {
        document.getElementById("setup_button").style.display = "none";
      }
    })
    .catch(function (err) {
      if (err.message.indexOf("user gesture") > -1) {
        alert("user gesture");
      } else if (err.message.indexOf("The app is already installed") > -1) {
        alert("The app is already installed");
      } else {
        alert(err);
        return err;
      }
    });
}
$(document).ready(function () {
  "use strict";
  $("body").on("click", ".tabs-list li", function () {
    $(this).addClass("active").siblings().removeClass("active");
    $(".content-list > div").addClass("hidden");
    $($(this).data("content")).removeClass("hidden");
  });

  const center = $("#center");
  if (center[0] != undefined) {
    fetch(url + `/teacherCenters`)
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          const error = new Error("Cant Find");
          return $(".selectCenter").append(
            `
              <div class="alert alert-warning">
                Nothing Found!!
              </div>
            `
          );
        } else {
          $("#search-result .alert").fadeOut();
          return res.json();
        }
      })
      .then((resData) => {
        resData.centers.forEach((c) => {
          $("#center").append(`
            <option value=${c.center} name="center">${c.center}</option>
          `);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  $(".deleteLesson").on("click", function (e) {
    var txt;
    if (confirm("Do you want to delete this?")) {
    } else {
      e.preventDefault();
    }
  });

  document.body.addEventListener(
    "click",
    function (e) {
      if (e.target.closest(".question-sub-menu-btn")) openSubMenu(e);
    }.bind(this)
  );

  function openSubMenu(event) {
    const subMenu = event.target.closest(
      ".question-sub-menu-btn"
    ).nextElementSibling;
    subMenu.style.display = "block"; // Or use a class to control visibility

    document.querySelector(".wrapper").addEventListener("click", function () {
      subMenu.style.display = "none";
    });

    // Preventing propagation if necessary
    subMenu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }


  // Add Event
  document.querySelector().addEventListener("click", function (e) {
    console.log(e.target);
    if (e.target.matches(".editForm")) {
      console.log(e.target);
      editForm(e);
    }
  });

  // Edit Functions
  function editForm(e) {
    e.preventDefault();

    let form = e.target.closest("form");
    console.log(form);

    let inputs = form.querySelectorAll("input");
    inputs.forEach((input) => input.removeAttribute("disabled"));

    let selects = form.querySelectorAll("select");
    selects.forEach((select) => select.removeAttribute("disabled"));

    let itemActions = form.querySelector(".item-actions");
    itemActions.classList.add("hidden");

    let tumbnialImage = form.querySelector(".tumbnialImage");
    tumbnialImage.classList.remove("hidden");

    let updatedBtn = form.querySelector(".updatedBtn");
    updatedBtn.classList.remove("hidden");

    let cancelBtn = form.querySelector(".cancelBtn");
    cancelBtn.classList.remove("hidden");

    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      inputs.forEach((input) => input.setAttribute("disabled", true));
      selects.forEach((select) => select.setAttribute("disabled", true));
      itemActions.classList.remove("hidden");
      updatedBtn.classList.add("hidden");
      cancelBtn.classList.add("hidden");
      tumbnialImage.classList.add("hidden");

      let thumImg = form.querySelector(".thum-img");
      if (thumImg) {
        thumImg.classList.add("hidden");
        thumImg.src = "";
      }
    });
  }

  function detectBrowesr() {
    // Opera 8.0+
    var isOpera =
      (!!window.opr && !!opr.addons) ||
      !!window.opera ||
      navigator.userAgent.indexOf(" OPR/") >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== "undefined";

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari =
      /constructor/i.test(window.HTMLElement) ||
      (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      })(
        !window["safari"] ||
          (typeof safari !== "undefined" && safari.pushNotification)
      );

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome =
      !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = isChrome && navigator.userAgent.indexOf("Edg") != -1;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    if (isFirefox) {
      $("html").addClass("scroller");
    }

    if (isChrome) {
      console.log("isCrom");
    }
  }
  detectBrowesr();
});
