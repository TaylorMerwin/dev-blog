document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const titleInput = document.getElementById("title");
    const authorInput = document.getElementById("author");
    const contentTextarea = document.getElementById("content");
    const easyMDE = new EasyMDE({ element: contentTextarea });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        formData.append('content', easyMDE.value()); // append markdown editor content
        formData.append('date', new Date().toISOString().split('T')[0]); // append the date again

        fetch('/updateData', {
            method: 'POST',
            body: formData
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