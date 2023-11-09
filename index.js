window.addEventListener('DOMContentLoaded', (event) => {
    fetch('data.json')
    .then(response => response.json())
        .then(data => {
            const latestPost = data.posts.reduce((prev, current) => (prev.id > current.id) ? prev : current);
            const pElementImage = document.getElementById('imageID1');
            const pElementDate = document.getElementById('dateID1');
            const pElementAuthor = document.getElementById('authorID1');
            const pElementTitle = document.getElementById('titleID1');
            const pElementDescription = document.getElementById('descriptionID1');

            pElementImage.src = latestPost.images[0];
            pElementDate.textContent = latestPost.date;
            pElementAuthor.textContent = latestPost.author;
            pElementTitle.textContent = latestPost.title;
            pElementDescription.textContent = latestPost.content;

            const secondPost = data.posts.filter(post => post.id == latestPost.id-1);
            const pElementImage2 = document.getElementById('imageID2');
            const pElementDate2 = document.getElementById('dateID2');
            const pElementAuthor2 = document.getElementById('authorID2');
            const pElementTitle2 = document.getElementById('titleID2');
            const pElementDescription2 = document.getElementById('descriptionID2');

            pElementImage2.src = secondPost[0].images[0];
            pElementDate2.textContent = secondPost[0].date;
            pElementAuthor2.textContent = secondPost[0].author;
            pElementTitle2.textContent = secondPost[0].title;
            pElementDescription2.textContent = secondPost[0].content;

            const thirdPost = data.posts.filter(post => post.id == secondPost[0].id-1);
            const pElementImage3 = document.getElementById('imageID3');
            const pElementDate3 = document.getElementById('dateID3');
            const pElementAuthor3 = document.getElementById('authorID3');
            const pElementTitle3 = document.getElementById('titleID3');
            const pElementDescription3 = document.getElementById('descriptionID3');

            pElementImage3.src = thirdPost[0].images[0];
            pElementDate3.textContent = thirdPost[0].date;
            pElementAuthor3.textContent = thirdPost[0].author;
            pElementTitle3.textContent = thirdPost[0].title;
            pElementDescription3.textContent = thirdPost[0].content;
        })
        .catch(error => {
            console.error("Error fetching data from JSON:", error);
        });
});


