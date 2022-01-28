const express = require('express');
const app = express();

app.get('/getData', (req, res) => {
    res.json({
        "status": "success",
        "statusCode": 200
    })
});

app.listen(3000, (req, res) => {
    console.log('Node Server is running on port 3000');
});