document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const titleInput = document.getElementById("title");
    const authorInput = document.getElementById("author");
    const contentTextarea = document.getElementById("content");
    const easyMDE = new EasyMDE({ element: contentTextarea });
    // TODO: Image

    form.addEventListener("submit", (event) => {
        event.preventDefault();  // Prevents the default form submission
        
        const newPost = {
            title: titleInput.value,
            author: authorInput.value,
            date: new Date().toISOString().split('T')[0],  // Gets current date in YYYY-MM-DD format
            content: easyMDE.value(), // Gets the markdown content from the editor
            // TODO: Image
        };
        
        fetch('/updateData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error updating data:", error);
        });
    });
});
