const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const pam = require('authenticate-pam');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { check, validationResult } = require('express-validator');
const post = require('./models/post');
const config = require('./config');

const app = express();
const port = config.website.port;

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

app.get('/login', (req, res) => {
    const context = {
        errors: null //[{ msg: null }]; // Replace this with your actual error handling logic
    }
    res.render('login', context);
});

app.get('/post/:id', (req, res) => {
    const postId = req.params.id;
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    const comments = db.prepare('SELECT * FROM comments WHERE post_id = ?').all(postId);
    res.render('post', { post, comments });
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

app.get('/dashboard', (req, res) => {
    const context = {
        user: req.session.user,
        access_level: req.session.access_level
    };
    console.log(context);
    if (req.session.user) {
        res.render('dashboard', context);
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Aphantocosm - The Hidden World', theme: 'UFO' });
});

app.post('/post', [
    check('title').notEmpty().withMessage('Title cannot be empty'),
    check('content').notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    console.log('session:', req.session);
    const userId = req.session.user;
    let sanitizedContent = content;
    let cover_image = null;
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
            title,
            content: sanitizedContent,
            user_id: userId,
            cover_image,
            created_at: currentDate
        });

        await newPost.save();
        res.redirect('/');
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ errors: [{ msg: 'Internal server error' }] });
    }
});

app.listen(port, () => {
    console.log(`Aphantocosm website is running at http://localhost:${port}`);
});
