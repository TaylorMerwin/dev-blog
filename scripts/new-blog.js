document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const titleInput = document.getElementById("title");
    const authorInput = document.getElementById("author");
    const descriptionInput = document.getElementById("description");
    const contentTextarea = document.getElementById("content");
    const easyMDE = new EasyMDE({ element: contentTextarea });
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    let cropper;

    imageInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                imagePreview.src = reader.result;
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(imagePreview, {
                    // Cropper.js options
                    aspectRatio: 16 / 9,
                    viewMode: 1,
                });
            };
            reader.readAsDataURL(files[0]);
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    
        const formData = new FormData(form);
        formData.append('content', easyMDE.value());
        formData.append('date', new Date().toISOString().split('T')[0]);
    
        if (cropper) {
            cropper.getCroppedCanvas().toBlob((blob) => {
                formData.append('croppedImage', blob);
    
                submitFormData(formData);
            });
        } else {
            submitFormData(formData);
        }
    });
    
    function submitFormData(formData) {
        fetch('/updateData', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            window.location.href = 'index.html'
        })
        .catch(error => {
            console.error("Error updating data:", error);
        });
    }
});
