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

function removeTag(button) {
    button.parentElement.remove();
}

function addTag(event) {
    if (event.key === 'Enter' && event.target.value.trim() !== '') {
        event.preventDefault(); // Prevent the default form submission behavior
        const tagContainer = document.querySelector('.tag-container');
        const newTag = document.createElement('div');
        newTag.className = 'tag';

        const tagText = document.createElement('span');
        tagText.innerText = event.target.value.trim();
        newTag.appendChild(tagText);

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-tag';
        removeButton.innerText = 'x';
        removeButton.setAttribute('onclick', 'removeTag(this)');
        newTag.appendChild(removeButton);

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'tags';
        hiddenInput.value = event.target.value.trim();
        newTag.appendChild(hiddenInput);

        tagContainer.insertBefore(newTag, event.target);
        event.target.value = '';
    }
}

function addTagManually(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const tag_input = document.getElementById('tag-input');
    const tag_content = tag_input.value.trim();
    
    if(tag_content) {
        const tagContainer = document.querySelector('.tag-container');
        const newTag = document.createElement('div');
        newTag.className = 'tag';

        const tagText = document.createElement('span');
        tagText.innerText = tag_content;
        newTag.appendChild(tagText);

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-tag';
        removeButton.innerText = 'x';
        removeButton.setAttribute('onclick', 'removeTag(this)');
        newTag.appendChild(removeButton);

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'tags';
        hiddenInput.value = tag_content;
        newTag.appendChild(hiddenInput);
        
        tagContainer.insertBefore(newTag, tag_input);
    }
}

function handleSubmit(event) {
    const tagsContainer = document.querySelector('.tag-container');
    const tagElements = tagsContainer.querySelectorAll('.tag');
    if (tagElements.length === 0) {
        event.preventDefault();
        alert('Please add at least one tag.');
    }
}


