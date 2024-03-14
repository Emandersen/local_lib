const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator")
//////////////////
/* Display books*/
//////////////////

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});


// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const total_books = await Book.find({}, "title author").populate("author").exec();
  res.render("book_list", { title: "Book List", book_list: total_books });

});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate("author")
    .populate("genre")
    .exec();

  const bookInstances = await BookInstance.find({ 'book': req.params.id })
    .exec();

  res.render("book_details", { title: book.title, book: book, book_instances: bookInstances });
});

////////////////
/* Edit books */
////////////////

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const authors = await Author.find().exec();
  const genres = await Genre.find().exec();

  res.render("book_form", {
    title: "Create Book",
    authors: authors,
    genres: genres
  });
});

// Handle book create on POST.
exports.book_create_post = [
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("author").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("genre", "Genre must not be empty.").trim().isLength({ min: 1 }).escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    })

    if (!errors.isEmpty()) {
      // If there are errors, render the form again with sanitized values/error messages.
      res.render('book_form', {
          title: 'Create Book',
          errors: errors.array(),
          book: book
      });
      return;
      }
      else {
          // Data from form is valid.
          // Save the new Book object.
          await book.save();
          res.redirect(book.url);
    }
  }),
]

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
