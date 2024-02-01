declare const EasyMDE: any;

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form") as HTMLFormElement | null;
    const contentTextarea = document.getElementById("content") as HTMLTextAreaElement | null;
    
    // Explicitly declare easyMDE as type 'any'
    let easyMDE: any;
    
    if (contentTextarea) {
        const easyMDE = new EasyMDE({ element: contentTextarea });
    }

    const imageInput = document.getElementById('imageInput') as HTMLInputElement | null;
    const imagePreview = document.getElementById('imagePreview') as HTMLImageElement | null;

    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', (event) => {
            const input = event.target as HTMLInputElement;
            const files = input.files;
            if (files && files.length > 0) {
                const reader = new FileReader();
                reader.onload = () => {
                    imagePreview.src = reader.result as string;
                    imagePreview.style.display = 'block'; // Display the preview
                };
                reader.readAsDataURL(files[0]);
            }
        });
    }

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            if (easyMDE) {
                formData.append('content', easyMDE.value());
            }

            fetch('/newPost/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                window.location.href = '/'; // Redirect to the home page
            })
            .catch(error => {
                console.error("Error creating post:", error);
            });
        });
    } else {
        console.error("Form element not found");
    }
});
