// Initialize Quill
const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            ['bold', 'italic', 'underline'],        // custom font formatting
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'header': [1, 2, 3, 4, 5, 6] }],     // custom font formatting
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'align': [] }],                      // text align options
            ['link', 'image', 'video'],                       // image insertion
            ['clean']
          ],
        imageResize: {} // Enable image resizing
    }
});

// Add an event listener to update the hidden input when the editor content changes
quill.on('text-change', function() {
    document.getElementById('hidden-editor-input').value = quill.root.innerHTML;
});
