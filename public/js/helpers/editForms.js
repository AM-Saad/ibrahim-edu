// /*jslint browser: true*/

/*global console, alert*/

const editForms = (function () {
    // cash DOM
    console.log('editForms');

    // Add Event
    document.body.addEventListener('click', function (e) {
        console.log(e.target)
        if (e.target.matches('.editForm')) {
            console.log(e.target)
            editForm(e);
        }
    });

    // Edit Functions
    function editForm(e) {
        e.preventDefault();

        let form = e.target.closest('form');
        console.log(form);

        let inputs = form.querySelectorAll('input');
        inputs.forEach(input => input.removeAttribute('disabled'));

        let selects = form.querySelectorAll('select');
        selects.forEach(select => select.removeAttribute('disabled'));

        let itemActions = form.querySelector('.item-actions');
        itemActions.classList.add('hidden');

        let tumbnialImage = form.querySelector('.tumbnialImage');
        tumbnialImage.classList.remove('hidden');

        let updatedBtn = form.querySelector('.updatedBtn');
        updatedBtn.classList.remove('hidden');

        let cancelBtn = form.querySelector('.cancelBtn');
        cancelBtn.classList.remove('hidden');

        cancelBtn.addEventListener('click', function (e) {
            e.preventDefault();
            inputs.forEach(input => input.setAttribute('disabled', true));
            selects.forEach(select => select.setAttribute('disabled', true));
            itemActions.classList.remove('hidden');
            updatedBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
            tumbnialImage.classList.add('hidden');
            
            let thumImg = form.querySelector('.thum-img');
            if (thumImg) {
                thumImg.classList.add('hidden');
                thumImg.src = '';
            }
        });
    }

    return {
        editForm: editForm
    };
})();
