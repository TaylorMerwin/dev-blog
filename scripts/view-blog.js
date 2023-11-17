// Get the article ID from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

// Fetch the article data from the data.json file using the ID
fetch('/data.json')
  .then(response => response.json())
  .then(data => {
    const article = data.posts.find(post => post.id == articleId);

    // Replace the page's details with the article data
    const titleElement = document.querySelector('.article-title');
    const dateElement = document.querySelector('.article-date');
    const authorElement = document.querySelector('.article-author');
    const imageElement = document.querySelector('.article-img');
    const contentElement = document.querySelector('.article-body');

    titleElement.textContent = article.title;
    dateElement.textContent = article.date;
    authorElement.textContent = article.author;
    imageElement.src = article.images[0];
    contentElement.innerHTML = article.content; // Use innerHTML to render HTML content
  })
  .catch(error => {
    console.error("Error fetching data from JSON:", error);
  });