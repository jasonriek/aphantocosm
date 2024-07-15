const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const config = require('./config');
const app = express();
const port = config.website.port;

// Models
const article_model = require('./models/articles');

// Routes
const login_router = require('./routes/login');
const articles_router = require('./routes/articles');
const dashboard_router = require('./routes/dashboard');
const tags_router = require('./routes/tags');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/aphantocosm').then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});


// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.set('trust proxy', 1);
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/aphantocosm-sessions' }),
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: null,
        sameSite: false
    }
}));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Set routes
app.use('/', login_router);
app.use('/articles', articles_router);
app.use('/dashboard', dashboard_router);
app.use('/tags', tags_router);


// MAIN PAGE
// Route to get all post IDs and render the index page
app.get('/', async (req, res) => {
    let context = {};


    try {
        // Fetch all article IDs from the posts collection
        const articles = await article_model.find({}).exec();
        context.articles = articles;
        console.log('articles', articles);
        // Render the index page with the article IDs
        res.render('index', context);

    } 
    catch (err) {
        console.error('Error fetching post IDs:', err);
        res.status(500).send('Internal server error');
    }
});


app.listen(port, () => {
    console.log(`Aphantocosm website is running at http://localhost:${port}`);
});
