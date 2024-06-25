const express = require('express');
const body_parser = require('body-parser');
const router = express.Router();
router.use(body_parser.json());

const category = require('../models/categories'); // Assuming you have a Category model
const profiles = require('../models/profiles');
const tag_model = require('../models/tags');

router.get('/dashboard', async (req, res) => {
    let user = req.session.user;
    const context = {
        user: user,
        access_level: req.session.access_level
    };
    if (req.session.user) {
        try {
            const categories = await category.find({}).select('name').exec();
            const profile = await profiles.findOne({'user': user}).exec();
            const tags = await tag_model.find({}).select('name').exec();
            context.categories = categories;
            context.profile = profile;
            context.tags = tags;
            
            res.render('dashboard', context);
        } catch (err) {
            console.error('Error fetching categories:', err);
            res.status(500).send('Internal server error');
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;