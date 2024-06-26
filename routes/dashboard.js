const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
const utils = require('../service/utils');
router.use(body_parser.json());

const category = require('../models/categories'); // Assuming you have a Category model
const profiles = require('../models/profiles');
const article_model = require('../models/articles');
const tag_model = require('../models/tags');

router.get('/', async (req, res) => {
    let user = req.session.user;
    const context = {
        user: user,
        access_level: req.session.access_level
    };
    if (user) {
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
    } 
    else {
        res.redirect('/login');
    }
});

router.get('/articles', async (req, res) => {
    const user = req.session.user;
    if(user) {
        const articles = await article_model.find({user_id: user}).exec();
        res.json(articles);
    }
    else {
        res.json({'error': 'you are unauthorized to view this resource.'});
    }
});

router.get('/articles/:category/:title', async (req, res) => {
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


module.exports = router;