/*jslint browser: true*/

/*global console, alert, $, jQuery*/



$(document).ready(function () {
    'use strict';
    const questionNumber = document.querySelectorAll('.questionNumber');
    for (let i = 0; i < questionNumber.length; i++) {

        questionNumber[i].innerHTML = parseInt(questionNumber[i].innerHTML, 10) + 1
    }
    const questionLength = document.querySelectorAll('.exam-question').length;
    console.log(questionLength);

    $("#pagination ul li").click(function (e) {
        e.preventDefault();

        $('html, body').animate({
            scrollTop: $('#' + $(this).data('scroll')).offset().top
        }, 1500);
    });

    $('input[value="null"]').attr('checked', true).parent().css({ display: 'none' })
  
    $('input[type="checkbox"]').click(function () {

        $(this).prop("checked", true);


        const parentDiv = $(this).parents('fieldset.exam-answers')
        $(parentDiv).find('input[type="checkbox"]').not($(this)).prop("checked", false)
    });

    $('#open-pagination').on('click', function(){
        $('#pagination').toggleClass('hidden')
    })

});
