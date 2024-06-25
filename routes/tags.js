const express = require('express');
const utils = require('../service/utils');
const router = express.Router();

// Models
const article_model = require('../models/articles');
const tag_model = require('../models/tags');

router.get('/articles', async (req, res) => {
    let context = {};
    try {
        const tagNames = req.query.tags ? req.query.tags.split(',') : [];
        const tags = await tag_model.find({ name: { $in: tagNames } });
        const tagIds = tags.map(tag => tag.tag_id);
        const articles = await article_model.find({ tags: { $in: tagIds } });

        if (!articles.length) {
            return res.status(404).send('No articles found for these tags');
        }
        context.toTitleString = utils.toTitleString;

        context.articles = articles
        res.render('articles_by_tag', context);
    } 
    catch (err) {
        console.error('Error fetching articles by tags:', err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;