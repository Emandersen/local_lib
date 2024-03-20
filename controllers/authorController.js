const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const authors = await Author.find();
  res.render("author_list", { title: "Author List", authors: authors });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();
  const author_books = await Book.find({ 'author': req.params.id }).exec();

  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: author_books
  });
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", {
    title: "Create Author",
  });
});

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name").trim().isLength({ min: 1 }).escape(),
  body("family_name").trim().isLength({ min: 1 }).escape(),
  body("date_of_birth").trim().isLength({ min: 1 }).escape(),
  body("date_of_death").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author"
      });
      return;
    } else {
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });

      try {
        await author.save();
        res.redirect(author.url);
      } catch (err) {
        return next(err);
      }
    }
  }),
]

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const authors = await Author.find().exec();

  res.render("author_delete", {
    title: "Delete Author",
    authors: authors
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });a
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});


// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});
