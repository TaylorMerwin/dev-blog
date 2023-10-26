const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse POST requests
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

app.post('/updateData', (req, res) => {
    const newData = req.body;

    // Read the existing content of data.json
    fs.readFile('data.json', 'utf8', (readErr, data) => {
        if (readErr) {
            console.error(readErr);
            return res.status(500).send('Internal Server Error');
        }

        // Parse the read data to convert it to an object
        let currentData = JSON.parse(data);

        // Check if the messages array exists; if not, create it
        if (!currentData.messages) {
            currentData.messages = [];
        }

        // Add/append the new message to the messages array
        currentData.messages.push(newData.message);

        // Write the modified object back to data.json
        fs.writeFile('data.json', JSON.stringify(currentData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).send('Data Updated Successfully');
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
