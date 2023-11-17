let currentOffset = 0;
const postsPerLoad = 3; // Number of posts to load per batch
let posts = []; // Array to hold all posts

window.addEventListener('DOMContentLoaded', (event) => {
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Reverse the entire posts array once and store it
        posts = data.posts.reverse();

        // Load the initial set of posts
        loadPosts();
    })
    .catch(error => {
        console.error("Error fetching data from JSON:", error);
    });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            loadPosts();
        }
    });
});

function loadPosts() {
    const articleList = document.getElementById('articleList');
    const postsToLoad = posts.slice(currentOffset, currentOffset + postsPerLoad);

    postsToLoad.forEach(post => {
        const card = document.createElement('section');
        card.className = 'card';

        const image = document.createElement('img');
        image.src = post.images.length > 0 ? post.images[0] : 'default-placeholder-image.jpg';

        const cardAbout = document.createElement('div');
        cardAbout.className = 'card-about';
        cardAbout.innerHTML = `<p>${post.date}</p><p>${post.author}</p>`;

        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title';
        cardTitle.innerHTML = `<h1><a href="view-blog.html?id=${post.id}">${post.title}</a></h1>`;

        const cardDescription = document.createElement('p');
        cardDescription.className = 'card-description';
        cardDescription.textContent = post.description;

        card.appendChild(image);
        card.appendChild(cardAbout);
        card.appendChild(cardTitle);
        card.appendChild(cardDescription);

        articleList.appendChild(card);
    });

    currentOffset += postsPerLoad;
}
