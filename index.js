const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const pam = require('authenticate-pam');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { check, validationResult } = require('express-validator');

const config = require('./config');

// Models
const post = require('./models/post');
const category = require('./models/categories'); // Assuming you have a Category model

const app = express();
const port = config.website.port;

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

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

// Route to get an article by ID
app.get('/article/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        // Fetch the article by ID
        const article = await post.findById(postId).exec();
        if (!article) {
            return res.status(404).send('Article not found');
        }

        console.log("article:", article);

        // Render the article
        res.render('article', { article: article });
    } catch (err) {
        console.error('Error fetching article:', err);
        res.status(500).send('Internal server error');
    }
});
  
app.get('/login', (req, res) => {
    const context = {
        error: null //[{ msg: null }]; // Replace this with your actual error handling logic
    }
    res.render('login', context);
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    pam.authenticate(username, password, (err) => {
        if (err) {
            console.error(`Authentication failed for user ${username}:`, err);
            res.render('login', { error: 'Invalid username or password' });
        } else {
            req.session.user = username;
            req.session.access_level = 1; // Assign access level based on the username
            res.redirect('/dashboard');
        }
    });
});

app.get('/test', (req, res) => {
    res.render('test');
});

app.get('/dashboard', async (req, res) => {
    const context = {
        user: req.session.user,
        access_level: req.session.access_level
    };
    if (req.session.user) {
        try {
            const categories = await category.find({}).select('name').exec();
            context.categories = categories;
            res.render('dashboard', context);
        } catch (err) {
            console.error('Error fetching categories:', err);
            res.status(500).send('Internal server error');
        }
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
});

// Route to get all post IDs and render the index page
app.get('/', async (req, res) => {
    let context = {};
    try {
        // Fetch all article IDs from the posts collection
        const posts = await post.find({}).select('_id').exec();
        const article_ids = posts.map(post => post._id);
        context.article_ids = article_ids;
        console.log('article IDS', article_ids);
        // Render the index page with the article IDs
        res.render('index', context);

    } catch (err) {
        console.error('Error fetching post IDs:', err);
        res.status(500).send('Internal server error');
    }
});

app.post('/post', upload.single('title-image'), [
    check('title').notEmpty().withMessage('Title cannot be empty'),
    check('content').notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log('test', req.body);
    const title = req.body.title;
    const content = req.body.content;
    const category = req.body.category;

    let title_image = null;
    if (req.file) {
        title_image = req.file.filename;
    }

    console.log('session:', req.session);
    const userId = req.session.user;
    let sanitizedContent = content;
    console.log('user:', userId);

    // Extract and save embedded images (Base64 data)
    const matches = content.match(/src="data:image\/[^;]+;base64[^"]+"/g);
    if (matches) {
        const images = matches.map((match, index) => {
            // Extract Base64 data
            const base64Data = match.replace(/^src="data:image\/[^;]+;base64,/, '');

            // Generate a unique filename
            const filename = `image_${Date.now()}_${index}.png`;
            // Save image to the 'uploads' folder
            fs.writeFileSync(path.join(__dirname, 'public', 'uploads', filename), base64Data, 'base64');

            // Return the filename or path if needed
            return filename;
        });

        // Replace image sources with filenames in the content
        sanitizedContent = content;
        images.forEach((image, index) => {
            if (index === 0) {
                cover_image = image;
                sanitizedContent = sanitizedContent.replace(matches[index], " ");
            } else {
                sanitizedContent = sanitizedContent.replace(matches[index], `src="/uploads/${image}"`);
            }
        });
    }

    // Check if the user is allowed to create a post
    const access_level = req.session.access_level;
    if (access_level !== 1) {
        return res.status(403).json({ errors: [{ msg: 'Permission denied' }] });
    }

    // Continue with the post creation logic
    const currentDate = new Date().toISOString(); // Get the current date and time in ISO format

    try {
        const newPost = new post({
            title: title,
            category: category,
            content: sanitizedContent,
            user_id: userId,
            title_image:  title_image,
            created_at: currentDate
        });

        await newPost.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ errors: [{ msg: 'Internal server error' }] });
    }
});

app.listen(port, () => {
    console.log(`Aphantocosm website is running at http://localhost:${port}`);
});
