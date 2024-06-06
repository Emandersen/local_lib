const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const book = require("../models/book");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  let genres;
  if (process.env.DB_TYPE === 'mongodb') {
    genres = await Genre.find();
  } else {
    genres = await req.app.mySQLdatabase.getGenres();
  }
  res.render("genre_list", { title: "Genre List", genres: genres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  let genre, genre_books;
  if (process.env.DB_TYPE === 'mongodb') {
    [genre, genre_books] = await Promise.all([ 
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id }),
    ]);
  } else {
    let genreId = req.params.id; 
    let genreBooks = await req.app.mySQLdatabase.getGenreRelation(genreId);
    genre = await req.app.mySQLdatabase.getGenreById(genreId);

    var book_list = await Promise.all(genreBooks.map(book => req.app.mySQLdatabase.getBookById(book.book_id)));
  }
  
  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Details",
    genre: genre,
    genre_books: (genre_books ? genre_books : book_list),
  });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
});

// Handle Genre create on POST.
exports.genre_create_post =  asyncHandler(async (req, res, next) => {
  
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      if (process.env.DB_TYPE === 'mongodb') {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        const genreExists = await Genre.findOne({ name: req.body.name }).exec();
        if (genreExists) {
          // Genre exists, redirect to its detail page.
          res.redirect(genreExists.url);
        } else {
          await genre.save();
          // New genre saved. Redirect to genre detail page.
          res.redirect(genre.url);
        }
      } else {
        const genreExists = await req.app.mySQLdatabase.getGenreByName(req.body.name);
        if (genreExists.length > 0) {
          // Genre exists, redirect to its detail page.
          res.redirect("/catalog/genres");
        } else {
          await req.app.mySQLdatabase.insertGenre(req.body.name);
          // New genre saved. Redirect to genre detail page.
          res.redirect("/catalog/genres");
        }
      }
  }
});

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  let genre;
  let genre_books;

  if (process.env.DB_TYPE === 'mongodb') {
    [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ 'genre': req.params.id }).exec(),
    ]);
  } else {
    genre = await req.app.mySQLdatabase.getGenreById(req.params.id);
    let genreId = req.params.id; 
    let genreBooks = await req.app.mySQLdatabase.getGenreRelation(genreId);
    genre = await req.app.mySQLdatabase.getGenreById(genreId);

    genre_books = await Promise.all(genreBooks.map(book => req.app.mySQLdatabase.getBookById(book.book_id)));
  }

  if (genre == null) { // No results.
    res.redirect('/catalog/genres');
  }

  // Successful, so render.
  res.render('genre_delete', { title: 'Delete Genre', genre: genre, genre_books: genre_books });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  let genre;
  let genre_books;


  if (process.env.DB_TYPE === 'mongodb') {
      [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ 'genre': req.params.id }).exec(),
    ]);
  } else {
    genre = await req.app.mySQLdatabase.getGenreById(req.params.id);

    let genreId = req.params.id; 
    let genreBooks = await req.app.mySQLdatabase.getGenreRelation(genreId);
    genre = await req.app.mySQLdatabase.getGenreById(genreId);

    genre_books = await Promise.all(genreBooks.map(book => req.app.mySQLdatabase.getBookById(book.book_id)));
    
  }

  if (genre == null) { // No results.
    res.redirect('/catalog/genres');
  }

  // Genre has books. Render in same way as for GET route.
  if (genre_books.length > 0) {
    res.render('genre_delete', { title: 'Delete Genre', genre: genre, genre_books: genre_books });
    return;
  } else {
    // Genre has no books. Delete object and redirect to the list of genres.
    if (process.env.DB_TYPE === 'mongodb') {
      await Genre.deleteOne({ _id: req.params.id });
    } else {
      await req.app.mySQLdatabase.deleteGenreById(req.params.id); // Corrected function call
    }
    res.redirect('/catalog/genres');
  }
});

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  try {
    let genre;
    if (process.env.DB_TYPE === 'mongodb') {
      genre = await Genre.findById(req.params.id);
    } else {
      genre = await req.app.mySQLdatabase.getGenreById(req.params.id);
    }

    if (genre == null) { // No results.
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('genre_form', { title: 'Update Genre', genre: genre });
  } catch (err) {
    return next(err);
  }
};

// Handle Genre update on POST.
exports.genre_update_post = async (req, res, next) => {
  try {
    let updatedGenre;
    if (process.env.DB_TYPE === 'mongodb') {
      const genre = new Genre({
        name: req.body.name,
        _id: req.params.id 
      });
      // Data from form is valid. Update the record.
      updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
    } else {
      updatedGenre = await req.app.mySQLdatabase.updateGenreById(req.params.id, req.body.name);
    }
    
  } catch (err) {
    return next(err);
  }
  res.redirect("/catalog/genres");
};