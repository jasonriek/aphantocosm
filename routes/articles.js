const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const utils = require('../service/utils');
const path = require('path');
const multer = require('multer');
router.use(body_parser.json());

// Models
const article_model = require('../models/articles');
const tag_model = require('../models/tags');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 50 * 1024 * 1024, // Increase the field size limit to 10MB
        fileSize: 50 * 1024 * 1024   // Increase the file size limit to 10MB
    }
});

// Route to get an article by category and its title.
router.get('/articles/:category/:title', async (req, res) => {
    let context = {};
    const category = req.params.category.toLowerCase();
    const title = utils.toURLString(req.params.title);
    

    try {
        // Fetch the article by ID
        //const article = await article.findById(article_id).exec();
        const article = await article_model.findOne({category: category, title: title});
        context.article = article;


        const tags = await tag_model.find({ tag_id: { $in: article.tags } }).select('name');
        article.tags = tags;

        if (!article) {
            return res.status(404).send('Article not found');
        }
        
        console.log("article here:", article);

        article.title = utils.toTitleString(title);
        // Render the article
        res.render('article', context);
    } catch (err) {
        console.error('Error fetching article:', err);
        res.status(500).send('Internal server error');
    }
});

router.post('/article', upload.single('title-image'), [
    check('title').notEmpty().withMessage('Title cannot be empty'),
    check('content').notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log('test', req.body);
    const title = utils.toURLString(req.body.title);
    const content = req.body.content;
    const category = req.body.category;

    // Adjusting to correctly parse tags
    const tagArray = Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? [req.body.tags] : []);
    const tagDocs = await Promise.all(tagArray.map(async (tag) => {
        let tagDoc = await tag_model.findOne({ name: tag });
        if (!tagDoc) {
            tagDoc = new tag_model({ name: tag });
            await tagDoc.save();
        }
        return tagDoc.tag_id;
    }));

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
            sanitizedContent = sanitizedContent.replace(matches[index], `src="/uploads/${image}"`);
        });
        // Your processing logic for embedded images here
        console.log('images:', images);
    }

    // Check if the user is allowed to create a post
    const access_level = req.session.access_level;
    if (access_level !== 1) {
        return res.status(403).json({ errors: [{ msg: 'Permission denied' }] });
    }

    // Continue with the post creation logic
    const currentDate = new Date().toISOString(); // Get the current date and time in ISO format

    try {
        const newArticle = new article_model({
            title: title,
            category: category,
            content: sanitizedContent,
            user_id: userId,
            title_image: title_image,
            tags: tagDocs,
            created_at: currentDate
        });

        await newArticle.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ errors: [{ msg: 'Internal server error' }] });
    }
});

module.exports = router;