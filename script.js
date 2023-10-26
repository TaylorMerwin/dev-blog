window.addEventListener('DOMContentLoaded', (event) => {
    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Target the element with the ID "testText"
        const pElement = document.getElementById('testText');

        // Check if there are any messages and set the text content to the last message
        if (data.messages && data.messages.length > 0) {
            pElement.textContent = data.messages[0];
        }
    })
    .catch(error => {
        console.error("Error fetching data from JSON:", error);
    });
    
    
    // Event listener for the button click
    document.getElementById('testButton').addEventListener('click', () => {
        const newData = { message: 'TestDataOne' };

        fetch('/updateData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
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
