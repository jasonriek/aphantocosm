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

function clearAllTags() {
    const tagContainer = document.querySelector('.tag-container');
    const tags = tagContainer.querySelectorAll('.tag');
    tags.forEach(tag => tag.remove());
}

function removeTag(button) {
    button.parentElement.remove();
}

function tagNameExists(tag_name) {
    const tags = document.getElementsByName('tags');
    for(let tag of tags) {
        if(tag.value === tag_name) {return true;}
    }
    return false;
}


function addTag(event) {
    const tag_content = event.target.value.trim();
    if (event.key === 'Enter' && tag_content !== '') {
        event.preventDefault(); // Prevent the default form submission behavior
        if(tagNameExists(tag_content)) {
            tag_input.value = '';
            return;
        }
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

        tagContainer.insertBefore(newTag, event.target);
        event.target.value = '';
    }
}

function addTagManually(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const tag_input = document.getElementById('tag-input');
    const tag_content = tag_input.value.trim();
    if(tag_content) {
        if(tagNameExists(tag_content)) {
            tag_input.value = '';
            return;
        }
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
        tag_input.value = '';
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

async function editArticle(category, title) {
    try {
        const response = await fetch(`/dashboard/articles/${category}/${title}`);
        if (!response.ok) {
            throw new Error('Article not found');
        }

        const article = await response.json();

        document.querySelector('input[name="title"]').value = article.title;
        document.querySelector('input[name="category"]').value = article.category;
        document.querySelector('input[name="content"]').value = article.content;

        // Set content in Quill editor
        quill.root.innerHTML = article.content;

        // Clear existing tags before adding new ones
        clearAllTags();

        // Populate tags
        const tagInput = document.querySelector('#tag-input');
        article.tags.forEach(tag => {
            const tagContainer = document.querySelector('.tag-container');
            const newTag = document.createElement('div');
            newTag.className = 'tag';

            const tagText = document.createElement('span');
            tagText.innerText = tag.name;
            newTag.appendChild(tagText);

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-tag';
            removeButton.innerText = 'x';
            removeButton.setAttribute('onclick', 'removeTag(this)');
            newTag.appendChild(removeButton);

            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'tags';
            hiddenInput.value = tag.name;
            newTag.appendChild(hiddenInput);

            tagContainer.insertBefore(newTag, tagInput);
        });

        // Display and set the title image if available
        if (article.title_image) {
            const titleImagePreview = document.querySelector('#title-image-preview');
            titleImagePreview.src = `/uploads/${article.title_image}`;
            titleImagePreview.style.display = 'block';

            // Set the existing image filename in the hidden input
            document.querySelector('#existing-title-image').value = article.title_image;
        } 
        else {
            document.querySelector('#title-image-preview').style.display = 'none';
        }

        // You might want to scroll to the form or make it visible if it's hidden
        document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching article:', error);
    }
}

// Function to open the modal
function openModal() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'block';

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// Function to handle the edit button click
function handleEditButtonClick(category, title) {
    // Open the modal
    openModal();

    // Set up the confirmation button click event
    const confirmEditButton = document.getElementById('edit-link');
    const cancelEditButton = document.getElementById('edit-cancel-link');
    const edit_modal_article_title = document.getElementById('edit-modal-article-title');
    edit_modal_article_title.innerText = toTitleString(title);

    cancelEditButton.onclick = () => {
        // Close the modal
        document.getElementById('edit-modal').style.display = 'none';
    }

    confirmEditButton.onclick = () => {
        // Close the modal
        document.getElementById('edit-modal').style.display = 'none';

        // Call the editArticle function
        editArticle(category, title);
    }
}
