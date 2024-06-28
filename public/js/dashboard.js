function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

const fetchArticles = async (page, scroll_to_bottom=true, searchQuery='') => {
    let limit = 5;
    try {
        const response = await fetch(`/dashboard/articles?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        const articlesContainer = document.getElementById('articles-container');
        articlesContainer.innerHTML = '';
        
        data.articles.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = 'd-flex align-items-center border-bottom py-2';
            articleDiv.innerHTML = `
                <div class="w-100 ms-3">
                    <div class="d-flex justify-content-end">
                    <div class="flex-grow-1">
                        <span><a href="/articles/${article.category}/${article.title}" target="_blank">${toTitleString(article.title)}</a></span>
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm me-2" title="Edit" onclick="handleEditButtonClick('${article.category}', '${article.title}')"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-sm" title="Delete" onclick="handleDeleteButtonClick('${article.category}', '${article.title}')"><i class="fa fa-times"></i></button>
                    </div>
                </div>
            `;
            articlesContainer.appendChild(articleDiv);
        });

        // Update pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = `
            <li class="page-item"><a class="page-link" href="#" id="prev-page">&laquo;</a></li>
        `;

        for (let i = 1; i <= data.totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === page ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                fetchArticles(i, true, searchQuery);
            });
            paginationControls.appendChild(pageItem);
        }

        const nextPageItem = document.createElement('li');
        nextPageItem.className = 'page-item';
        nextPageItem.innerHTML = `<a class="page-link" href="#" id="next-page">&raquo;</a>`;
        nextPageItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (page < data.totalPages) fetchArticles(page + 1, true, searchQuery);
        });
        paginationControls.appendChild(nextPageItem);

        document.getElementById('prev-page').addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) fetchArticles(currentPage - 1, true, searchQuery);
        });

        document.getElementById('prev-page').parentElement.classList.toggle('disabled', page === 1);
        nextPageItem.classList.toggle('disabled', page === data.totalPages);

        currentPage = page;

        // Scroll to bottom after fetching articles
        if(scroll_to_bottom) {
            scrollToBottom();
        }
    } 
    catch (error) {
        console.error('Error fetching articles:', error);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    // Select the spinner element by its ID
    let spinner = document.getElementById("spinner");

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

    document.getElementById('search-article-button').addEventListener('click', () => {
        const searchQuery = document.getElementById('search-article').value;
        fetchArticles(1, true, searchQuery); // Start from the first page for a new search
    });

    document.getElementById('search-article').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default form submission behavior
            const searchQuery = event.target.value;
            fetchArticles(1, true, searchQuery); // Start from the first page for a new search
        }
    });

    // Initial fetch
    fetchArticles(1, false);
});

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
    let tag_content = event.target.value.trim();
    if (event.key === 'Enter' && tag_content !== '') {
        event.preventDefault(); // Prevent the default form submission behavior
        fetch('/dashboard/special_tag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tag: tag_content })
        })
        .then(response => response.json())
        .then(result => {
            if (result.special_tag) {
                tag_content = result.special_tag;

            } 
            else {
                console.log('Special tag not found');
            }
            if(tagNameExists(tag_content)) {
                event.target.value = '';
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
        })
        .catch(error => {
            console.log(`setSpecialTag Error: ${error}`);
            event.target.value = '';
        });
    }
}

function addTagManually(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const tag_input = document.getElementById('tag-input');
    let tag_content = tag_input.value.trim();
    if(tag_content) {
        fetch('/dashboard/special_tag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tag: tag_content })
        })
        .then(response => response.json())
        .then(result => {
            if (result.special_tag) {
                tag_content = result.special_tag;

            } 
            else {
                console.log('Special tag not found');
            }
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
        })
        .catch(error => {
            console.log(`setSpecialTag Error: ${error}`);
            tag_input.value = '';
        });
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

function openDeleteModal() {
    document.getElementById('delete-modal').style.display = 'block';
}

function handleDeleteButtonClick(category, title) {
    // Open the delete modal
    openDeleteModal();

    // Set up the confirmation button click event
    const confirmDeleteButton = document.getElementById('delete-link');
    const cancelDeleteButton = document.getElementById('delete-cancel-link');
    const deleteModalArticleTitle = document.getElementById('delete-modal-article-title');

    let deleteArticleCategory = category;
    let deleteArticleTitle = toTitleString(title);

    deleteModalArticleTitle.innerText = toTitleString(title);

    cancelDeleteButton.onclick = () => {
        // Close the modal
        document.getElementById('delete-modal').style.display = 'none';
    };

    confirmDeleteButton.onclick = () => {
        const articleTitleInput = document.getElementById('delete-confirm-article-title').value;
        if (articleTitleInput !== deleteArticleTitle) {
            alert('Article title does not match. Please enter the correct article title to confirm.');
            return;
        }

        // Close the modal
        document.getElementById('delete-modal').style.display = 'none';

        // Call the deleteArticle function
        deleteArticle(deleteArticleCategory, deleteArticleTitle);
    };
}

async function deleteArticle(category, title) {
    try {
        const response = await fetch(`/dashboard/articles/${category}/${title}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            fetchArticles(currentPage); // Refresh the articles list
        } else {
            console.error('Failed to delete article');
        }
    } catch (error) {
        console.error('Error:', error);
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
