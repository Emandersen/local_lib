const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require("multer");




const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only files with image mime types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  if (process.env.DB_TYPE === 'mongodb') {
    var authors = await Author.find();
  } else {
    var authors = await req.app.mySQLdatabase.getAuthorsFormatted();
  }

  res.render("author_list", { title: "Author List", authors: authors });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  if (process.env.DB_TYPE === 'mongodb') {
    var author = await Author.findById(req.params.id);
    var author_books = await Book.find({ author: req.params.id });
  } else {
    var author = await req.app.mySQLdatabase.getAuthorByIdFormatted(req.params.id);
    var author_books = await req.app.mySQLdatabase.getBookByAuthorId(req.params.id);
  }
  
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


exports.author_create_post = asyncHandler(async (req, res, next) => {
  upload.single('author_image')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (process.env.DB_TYPE === 'mongodb') {
      // Create an Author object with data from the request body.
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        author_image: req.file ? '/uploads/' + req.file.filename : "" 
      });

      // Save author.
      await author.save();
    } else {
      // Insert a new author into the MySQL database.
      const result = await req.app.mySQLdatabase.insertAuthor(
        req.body.first_name,
        req.body.family_name,
        req.body.date_of_birth,
        req.body.date_of_death,
        req.file ? '/uploads/' + req.file.filename : ""
      );
    }
  });
  res.redirect('/catalog/authors');
});


// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  try {
    let author;
    let allBooksByAuthor;

    if (process.env.DB_TYPE === 'mongodb') {
      // Get details of author and all their books (in parallel)
      [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ 'author': req.params.id }, 'title summary').exec(),
      ]);
    } else {
      author = await req.app.mySQLdatabase.getAuthorById(req.params.id);
      allBooksByAuthor = await req.app.mySQLdatabase.getBookByAuthorId(req.params.id);
    }

    if (author == null) { // No results.
      return res.redirect('/catalog/authors');
    }
    // Success.
    res.render('author_delete', { title: 'Delete Author', author: author, author_books: allBooksByAuthor } );
  } catch (err) {
    return next(err);
  }
});

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    let author;
    let allBooksByAuthor;

    if (process.env.DB_TYPE === 'mongodb') {
      // Get details of author and all their books (in parallel)
      [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ 'author': req.params.id }, 'title summary').exec(),
      ]);
    } else {
      author = await req.app.mySQLdatabase.getAuthorById(req.params.id);
      allBooksByAuthor = await req.app.mySQLdatabase.getBookByAuthorId(req.params.id);
    }

    if (!author || !allBooksByAuthor) {
      return res.status(404).send({ message: 'Author or Books not found' });
    }

    // If the author exists and there are no books by the author, delete the author
    if (allBooksByAuthor.length === 0) {
      if (process.env.DB_TYPE === 'mongodb') {
        await Author.deleteOne({ _id: req.params.id });
      } else {
        await req.app.mySQLdatabase.deleteAuthorById(req.params.id);
      }
      res.redirect('/catalog/authors');
    } else {
      // If the author has books, render the 'author delete' template
      res.render('author_delete', { title: 'Delete Author', author: author, author_books: allBooksByAuthor } );
    }
  } catch (err) {
    return next(err);
  }
};

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  let author;
  if (process.env.DB_TYPE === 'mongodb') {
    author = await Author.findById(req.params.id).exec();
    // Format dates
    if (author.date_of_birth) author.date_of_birth = author.date_of_birth.toISOString().split('T')[0];
    if (author.date_of_death) author.date_of_death = author.date_of_death.toISOString().split('T')[0];
  } else {
    const result = await req.app.mySQLdatabase.getAuthorById(req.params.id);
    if (result && result.length > 0) {
      author = result[0];
      // Format dates
      if (author.date_of_birth) author.date_of_birth = new Date(author.date_of_birth).toISOString().split('T')[0];
      if (author.date_of_death) author.date_of_death = new Date(author.date_of_death).toISOString().split('T')[0];
    }
  }
  if (author == null) { // No results.
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }
  // Success.
  res.render('author_form', { title: 'Update Author', author: author });
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  upload.single('author_image')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    let updatedAuthor;
    if (process.env.DB_TYPE === 'mongodb') {
      // Create a Author object with data and old id.
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id,
        author_image: req.file ? '/uploads/' + req.file.filename : "" 
      });

      // Data from form is valid. Update the record.
      updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
    } else {
      // Update the record.
      updatedAuthor = await req.app.mySQLdatabase.updateAuthorById(
        req.params.id,
        req.body.first_name,
        req.body.family_name,
        req.body.date_of_birth,
        req.body.date_of_death,
        req.file ? '/uploads/' + req.file.filename : ""
      );
    }
    if (updatedAuthor == null) { // No results.
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    // Successful - redirect to author detail page.
    res.redirect("/catalog/authors");
  });
});


