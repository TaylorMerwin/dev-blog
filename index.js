document.addEventListener("DOMContentLoaded", () => {
    fetchLatestBlogPost();
});

function fetchLatestBlogPost() {
    // fetch the latest blog post from data.json
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        //updateFirstCard(data);
        const pElement = document.getElementsByClassName('card-title');
        pElement.textContent = "test";
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    })
}

/*
function updateFirstCard(post) {
    const card = document.querySelector(".card"); // Select the first card
    if (!card || !post) return;

    card.querySelector(".card-image img").src = post.image || "default-image-path.jpg"; // Use a default image path if no image is present
    card.querySelector(".card-about p:nth-child(1)").innerText = post.date;
    card.querySelector(".card-about p:nth-child(2)").innerText = post.author;
    card.querySelector(".card-title h1 a").innerText = post.title;
    card.querySelector(".card-title h1 a").href = `view-blog.html?id=${post.id}`; // If you have an ID system for your blog posts
    card.querySelector(".card-description").innerText = post.description; // Assuming the post has a description
}*/

