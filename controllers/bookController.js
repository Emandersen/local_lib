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
  let numBooks, numBookInstances, numAvailableBookInstances, numAuthors, numGenres;

  if (process.env.DB_TYPE === 'mongodb') {
    // MongoDB queries
    [numBooks, numBookInstances, numAvailableBookInstances, numAuthors, numGenres] = await Promise.all([
      Book.countDocuments({}).exec(),
      BookInstance.countDocuments({}).exec(),
      BookInstance.countDocuments({ status: "Available" }).exec(),
      Author.countDocuments({}).exec(),
      Genre.countDocuments({}).exec(),
    ]);
  } else {
    // MySQL queries
    const db = req.app.mySQLdatabase;
    numBooks = (await db.getBooks()).length;
    numBookInstances = (await db.getBookInstances()).length;
    numAvailableBookInstances = (await db.getBookInstances()).filter(bi => bi.status === 'Available').length;
    numAuthors = (await db.getAuthors()).length;
    numGenres = (await db.getGenres()).length;
  }

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
    db_type: process.env.DB_TYPE,
  });
});


// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  let total_books;

  if (process.env.DB_TYPE === 'mongodb') {
    // MongoDB query
    total_books = await Book.find({}, "title author").populate("author").exec();
  } else {
    // MySQL query
    const db = req.app.mySQLdatabase;
    total_books = await db.getBooks();
  }

  res.render("book_list", { title: "Book List", book_list: total_books });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  let book, bookInstances;

  if (process.env.DB_TYPE === 'mongodb') {
    // MongoDB queries
    book = await Book.findById(req.params.id)
      .populate("author")
      .populate("genre")
      .exec();

    bookInstances = await BookInstance.find({ 'book': req.params.id })
      .exec();
  } else {
    // MySQL queries
    const db = req.app.mySQLdatabase;
    book = await db.getBookById(req.params.id);
    bookInstances = await db.getBookInstanceByBookId(req.params.id);
  }

  res.render("book_details", { title: book.title, book: book, book_instances: bookInstances });
});

////////////////
/* Edit books */
////////////////

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  let authors, genres;

  if (process.env.DB_TYPE === 'mongodb') {
    authors = await Author.find().exec();
    genres = await Genre.find().exec();
  } else {
    authors = await req.app.mySQLdatabase.getAuthors();
    console.log(authors)
    genres = await req.app.mySQLdatabase.getGenres();
  }

  res.render("book_form", {
    title: "Create Book",
    authors: authors,
    genres: genres
  });
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
  const book = {
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: req.body.genre
  }

  if (process.env.DB_TYPE === 'mongodb') {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, render the form again with sanitized values/error messages.
      res.render('book_form', {
          title: 'Create Book',
          errors: errors.array(),
          book: book
      });
      return;
    } else {
      // Data from form is valid.
      // Save the new Book object.
      const newBook = new Book(book);
      await newBook.save();
    }
  } else {
    // For MySQL, we don't have a validation result to check.
    // We assume the data from the form is valid.
    // Save the new Book object.
    const newBookId = await req.app.mySQLdatabase.insertBook(book.title, book.author, book.summary, book.isbn);
    // Create genre relations
    for (let genre_id of book.genre) {
      await req.app.mySQLdatabase.createGenreRelation(newBookId, genre_id);
    }
  }
  res.redirect('/catalog/books');
});

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  let book, bookInstances;

  if (process.env.DB_TYPE === 'mongodb') {
    [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({ 'book': req.params.id }).exec(),
    ]);

  } else {
    book = await req.app.mySQLdatabase.getBookById(req.params.id);
    bookInstances = await req.app.mySQLdatabase.getBookInstanceByBookId(req.params.id);
  }

  if (!book) {
    res.redirect('/catalog/books');
  }

  res.render('book_delete', { title: 'Delete Book', book: book, book_instances: bookInstances });
});

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  try {
    let book, bookInstances;

    if (process.env.DB_TYPE === 'mongodb') {
      [book, bookInstances] = await Promise.all([
        Book.findById(req.params.id).exec(),
        BookInstance.find({ 'book': req.params.id }).exec(),
      ]);
    } else {
      book = await req.app.mySQLdatabase.getBookById(req.params.id);
      bookInstances = await req.app.mySQLdatabase.getBookInstanceByBookId(req.params.id);
    }

    if (!book) {
      return res.status(404).send({ message: 'Book not found' });
    }

    // If there are book instances related to the book, don't delete the book
    if (bookInstances.length > 0) {
      res.render('book_delete', { title: 'Delete Book', book: book, book_instances: bookInstances, errorMessage: 'Book has related instances, cannot delete.' });
    } else {
      if (process.env.DB_TYPE === 'mongodb') {
        await Book.deleteOne({ _id: req.params.id });
      } else {
        await req.app.mySQLdatabase.deleteBookById(req.params.id);
      }
      res.redirect('/catalog/books');
    }
  } catch (err) {
    return next(err);
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  try {
    let book, authors, genres;
    if (process.env.DB_TYPE === 'mongodb') {
      book = await Book.findById(req.params.id).populate('author').populate('genre');
      authors = await Author.find();
      genres = await Genre.find();
    } else {
      const db = req.app.mySQLdatabase;
      book = await db.getBookById(req.params.id);
      authors = await db.getAuthors();
      genres = await db.getGenres();
    }
    if (book == null) { // No results.
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('book_form', {
      title: 'Update Book',
      authors: authors,
      genres: genres,
      book: book
    });
  } catch (err) {
    return next(err);
  }
};

// Handle book update on POST.
exports.book_update_post = async (req, res, next) => {
  try {
    let updatedBook;
    if (process.env.DB_TYPE === 'mongodb') {
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
        _id: req.params.id // This is required, or a new ID will be assigned!
      });
      // Data from form is valid. Update the record.
      updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {});
    } else {

      updatedBook = await req.app.mySQLdatabase.updateBookById(req.params.id, req.body.title, req.body.author, req.body.summary, req.body.isbn, req.body.genre);
      for (let genre_id of req.body.genre) {
        await req.app.mySQLdatabase.createGenreRelation(req.params.id, genre_id);
      }
    }
    res.redirect("/catalog/books");
  } catch (err) {
    return next(err);
  }
};