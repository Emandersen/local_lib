var express = require('express');
var router = express.Router();

const Book = require('../models/book');
const Author = require('../models/author');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/catalog');
});

// search route
router.get("/search", async (req, res, next) => {
  try {
    const query = new RegExp(req.query.q, 'i');

    const [books, authors] = await Promise.all([
      Book.find({ title: query }).exec(),
      Author.find({
        $or: [
          { first_name: query },
          { family_name: query }
        ]
      }).exec()
    ]);

    res.render('search_results', { books, authors, query: req.query.q });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
