const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse POST requests
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

app.post('/updateData', (req, res) => {
    const newPost = req.body;
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        
        let jsonData = JSON.parse(data);
        jsonData.posts.push(newPost);
        
        fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).send('Post Added Successfully');
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
