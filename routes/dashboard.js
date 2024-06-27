const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
const utils = require('../service/utils');
router.use(body_parser.json());

const category = require('../models/categories'); // Assuming you have a Category model
const profiles = require('../models/profiles');
const article_model = require('../models/articles');
const tag_model = require('../models/tags');
const special_tag_model = require('../models/special_tags');
const authMiddleware = require('../middleware/auth'); // Path to your middleware


router.get('/', authMiddleware, async (req, res) => {
    let user = req.session.user;
    const context = {
        user: user,
        access_level: req.session.access_level
    };
    try {
        const categories = await category.find({}).select('name').exec();
        const profile = await profiles.findOne({'user': user}).exec();
        const tags = await tag_model.find({}).select('name').exec();
        const articles = await article_model.find({user_id: user}).exec();

        context.categories = categories;
        context.profile = profile;
        context.tags = tags;
        context.articles = articles;
        context.toTitleString = utils.toTitleString;
            
        res.render('dashboard', context);
    } 
    catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).send('Internal server error');
    }
});

router.get('/articles', authMiddleware, async (req, res) => {
    const articles = await article_model.find({user_id: user}).exec();
    res.json(articles);
});

router.get('/articles/:category/:title', authMiddleware, async (req, res) => {
    let context = {};
    const category = req.params.category.toLowerCase();
    const title = utils.toURLString(req.params.title);
    
    try {
        const article = await article_model.findOne({category: category, title: title});
        
        if (!article) {
            return res.status(404).send('Article not found');
        }

        const tags = await tag_model.find({ tag_id: { $in: article.tags } }).select('name');
        article.tags = tags;

        article.title = utils.toTitleString(title);
        
        // Send the article data as JSON
        res.json(article);
    } catch (err) {
        console.error('Error fetching article:', err);
        res.status(500).send('Internal server error');
    }
});

router.get('/special_tag/:tag', authMiddleware, async (req, res) => {
    let special_tag = null;
    try {
        
        const user_tag = req.params.tag.trim().toLowerCase();
        const special_tags = await special_tag_model.findOne({ tags: user_tag});
        if(special_tags) {
            special_tag = special_tags.name;
        }
    }
    catch(error) {
        console.log('error:', error);
    }
    res.json({special_tag: special_tag});
});

router.post('/special_tag', authMiddleware, async (req, res) => {
    let special_tag = null;
    try {
        const user_tag = req.body.tag.trim().toLowerCase();
        const special_tags = await special_tag_model.findOne({ tags: user_tag });
        if (special_tags) {
            special_tag = special_tags.name;
        }
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ special_tag: special_tag });
});


module.exports = router;