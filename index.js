window.addEventListener('DOMContentLoaded', (event) => {
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const pElementImage = document.getElementById('imageID1');
        const pElementDate = document.getElementById('dateID1');
        const pElementAuthor = document.getElementById('authorID1');
        const pElementTitle = document.getElementById('titleID1');
        const pElementDescription = document.getElementById('descriptionID1');

        pElementImage.src = data.posts[0].images[0];
        pElementDate.textContent = data.posts[0].date;
        pElementAuthor.textContent = data.posts[0].author;  
        pElementTitle.textContent = data.posts[0].title;
        pElementDescription.textContent = data.posts[0].description;
    })
    .catch(error => {
        console.error("Error fetching data from JSON:", error);
    });
});


