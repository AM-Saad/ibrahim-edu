
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('../sw.js').then(() => {
//       console.log('Registered');
//     })
//   }
//   var _beforeInstallPrompt;
  
//   if ("onbeforeinstallprompt" in window) {
//     self.addEventListener("beforeinstallprompt", function beforeInstallPrompt(evt) {
//       document.getElementById('setup_button').style.display = 'inline';
//       evt.preventDefault();
//       console.log(evt);
//       _beforeInstallPrompt = evt;
  
//     })
  
//   } else {
//     alert('not has the event')
//   }
  
  
  function installApp() {
    _beforeInstallPrompt.prompt()
      .then(function (evt) {
  
        // Wait for the user to respond to the prompt
        return _beforeInstallPrompt.userChoice;
  
      })
      .then(function (choiceResult) {
        if (choiceResult === 'accepted') {
          document.getElementById('setup_button').style.display = 'none'
        }
      })
      .catch(function (err) {
  
        if (err.message.indexOf("user gesture") > -1) {
          alert('user gesture');
  
        } else if (err.message.indexOf("The app is already installed") > -1) {
          alert('The app is already installed');
  
        } else {
          alert(err)
          return err;
        }
  
      });
  }
  
  lax.setup(); // init
  
  const updateLax = () => {
    lax.update(window.scrollY);
    window.requestAnimationFrame(updateLax);
  };
  
  $(window).ready(() => {
  
    window.requestAnimationFrame(updateLax);
    $("nav .fa-bars").on("click", function () {
      $("nav .logo").fadeOut(300);
      $(this).fadeOut(500);
      $("nav .sidebar_menu").animate({ right: '3%', opacity: 1 }, 300)
    });
  
    $("nav .fa-times").on("click", function () {
      $(".sidebar_menu").animate({ right: "-100%" }, 300).css({ opacity: 0 });
      $("nav .logo").fadeIn(300);
      $("nav .fa-bars").fadeIn(500);
    });
  
    // $("header .actions button").on("click", function (e) {
    //   e.preventDefault();
  
    //   $("html, body").animate(
    //     {
    //       scrollTop: $("#" + $(this).data("scroll")).offset().top - 60
    //     },
    //     1500
    //   );
    // });
    $("nav .nav-selection a").on("click", function (e) {
      // if ($(e.target).data('scroll') != undefined) {
  
      //   $("html, body").animate(
      //     {
      //       scrollTop: $("#" + $(this).data("scroll")).offset().top - 60
      //     },
      //     1500
      //   );
      // }
  
    });
  
    $(".work-project_images img").click(function (e) {
      var srcimg = $(this).attr("src");
  
      $(".pop-up img").attr("src", srcimg);
      $(".pop-up").fadeIn(500);
    });
  
    $(".pop-up").click(function () {
      $(this).fadeOut();
      $(".pop-up img").attr("src", "");
  
    });
  
    $(".pop-up .inner").click(function (e) {
      e.stopPropagation();
    });
  
    $(".pop-up .cls").click(function (e) {
      e.preventDefault();
  
      $(".pop-up").fadeOut();
      $(".pop-up img").attr("src", "");
    });
  
  
    $('#email').focus(function () {
      $('.msg').fadeOut();
    })
  
    $('.smoke').get(0).play()
  
    $('.descriptions').on('click', function (e) {
      $(e.target).parent().find('.work-project_actions_descriptions').fadeIn(400)
    })
    $('.clsDescriptions').on('click', function (e) {
      $(e.target).parents('.work-project').find('.work-project_actions_descriptions').fadeOut(400)
    })
  
  });
  
  const sendMsg = input => {
    const email = input.parentNode.querySelector("[name=email]").value;
    const name = input.parentNode.querySelector("[name=name]").value;
    const message = input.parentNode.querySelector("[name=message]").value;
    const data = {
      email,
      name,
      message
    };
  
    $.ajax({
      url: "/contact",
      type: "POST",
      data: JSON.stringify({ info: data }),
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        $('#contact-me').prepend('<p class="msg msg-success">Thanks for connect us :), we\'\ll Replay ASAP. <p/>')
        console.log("Successfully Sended");
      },
      error: function (err) {
        $('#contact-me').prepend('<p class="msg msg-err">Please Make Sure to Enter Valid Email And Try Again :) <p/>')
        console.log(err);
  
      }
    });
  
  }