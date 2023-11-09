
// Get the article ID from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

// Fetch the article data from the data.json file using the ID
fetch('/data.json')
  .then(response => response.json())
  .then(data => {
    const article = data.articles.find(article => article.id === articleId);

    // Replace the page's details with the article data
    const titleElement = document.querySelector('h1');
    const contentElement = document.querySelector('p');
    titleElement.textContent = article.title;
    contentElement.textContent = article.content;

    // Update the page's title with the article title
    document.title = article.title;
  });
