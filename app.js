const express = require('express'),
    app = express();

// Set engine
app.set('view engine', 'ejs');

// Set static files
app.use(express.static('public'));

// Route
app.get('/', (req, res) => {
    res.render('index');
});

// Server config
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));