document.addEventListener("DOMContentLoaded", function() {
    // Select the spinner element by its ID
    var spinner = document.getElementById("spinner");

    // Remove the 'show' class to hide the spinner
    if (spinner) {
        spinner.classList.remove("show");
    }

    // Sidebar Toggler
    document.querySelector('.sidebar-toggler').addEventListener('click', function () {
        document.querySelector('.sidebar').classList.toggle("open");
        document.querySelector('.content').classList.toggle("open");
        return false;
    });

    // Account mennu

    let dropdownButton = document.getElementById('account-button');
    let dropdownMenu = document.getElementById('account-menu');

    dropdownButton.addEventListener('click', function() {
            dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', function(e) {
        if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
        }
    });

});

function addTag() {
    const tagInput = document.getElementById('tagInput');
    const tagsContainer = document.getElementById('tagsContainer');
    const tag = tagInput.value.trim();

    if (tag) {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagElement.onclick = function() { removeTag(tagElement); };

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'tags';
        hiddenInput.value = tag;

        tagElement.appendChild(hiddenInput);
        tagsContainer.appendChild(tagElement);

        tagInput.value = '';
    }
}

function removeTag(tagElement) {
    tagElement.remove();
}


