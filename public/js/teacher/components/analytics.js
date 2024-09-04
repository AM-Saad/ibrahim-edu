function questionmesure(questions, max, min) {
    $('.questions-report .question').remove()
    if (questions.length > 0) {
        questions.forEach(q => {
            $('.questions-report').append(`
                <div class="question p-3 bg-lightgray m-3"> 
                    <p>${q.question}</p>
                    <p>Taken: <b>${q.taken}</b> Times</p>
                    <p>Correct: <b>${q.correct}</b> Times</p>
                </div>
            `)

        });

        $('.questions-details').append(`
            <h3>${max.question} is heigest corrected aswered question</h3>
            <h3>${min.question} is lowest corrected aswered question</h3>
        `)
    }
    
}