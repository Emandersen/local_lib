const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const book = require("../models/book");


// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  let bookInstance_total;
  
  if (process.env.DB_TYPE === 'mongodb') {
    bookInstance_total = await BookInstance.find().populate("book").exec();
  } else {
    bookInstance_total = await req.app.mySQLdatabase.getBookInstances();
  }

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: bookInstance_total,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  let bookinstance_detail;

  if (process.env.DB_TYPE === 'mongodb') {
    bookinstance_detail = await BookInstance.findById(req.params.id).populate("book").exec();
  } else {
    bookinstance_detail = await req.app.mySQLdatabase.getBookInstanceById(req.params.id);
  }

  if (bookinstance_detail == null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Copy: " + bookinstance_detail.book.title,
    bookinstance: bookinstance_detail,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const books = process.env.DB_TYPE === 'mongodb' ? await Book.find({}, "title") : await req.app.mySQLdatabase.getBooks();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    books: books
  });
});



exports.bookinstance_create_post = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      const books = process.env.DB_TYPE === 'mongodb' 
        ? await Book.find({}, 'title') 
        : await req.app.mySQLdatabase.getBooks();
      

      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: books,
        selected_book: bookinstance.book._id,
        errors: errors.array(),
        bookinstance: bookinstance
      });
    } else {
      // Data from form is valid.
      if (process.env.DB_TYPE === 'mongodb') {
        await bookinstance.save();
      } else {
        await req.app.mySQLdatabase.insertBookInstance(req.body.book, bookinstance.imprint, bookinstance.status, bookinstance.due_back);
      }
    }
  } catch (err) {
    return next(err);
  }
  res.redirect("/catalog/bookinstances");
};





// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  try {
    const bookInstance = process.env.DB_TYPE === 'mongodb' 
      ? await BookInstance.findById(req.params.id).exec() 
      : (await req.app.mySQLdatabase.getBookInstanceById(req.params.id));
    console.log(bookInstance);

    res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance: bookInstance });
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  try {
    const bookInstance = process.env.DB_TYPE === 'mongodb' 
      ? await BookInstance.findById(req.params.id).exec() 
      : (await req.app.mySQLdatabase.getBookInstanceById(req.params.id));

    if (!bookInstance) {
      return res.status(404).send({ message: 'BookInstance not found' });
    }

    if (process.env.DB_TYPE === 'mongodb') {
      await BookInstance.deleteOne({ _id: req.params.id });
    } else {
      await req.app.mySQLdatabase.deleteBookInstanceById(req.params.id);
    }

    res.redirect('/catalog/bookinstances');
  } catch (err) {
    return next(err);
  }
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  try {
    
    const bookinstance = process.env.DB_TYPE === 'mongodb' ? 
      await BookInstance.findById(req.params.id).populate('book') : 
      await req.app.mySQLdatabase.getBookInstanceById(req.params.id);
    

    const books = process.env.DB_TYPE === 'mongodb' ? 
      await Book.find() : 
      await req.app.mySQLdatabase.getBooks();
    
    console.log(books);

  
    // Success.
    res.render('bookinstance_form', { title: 'Update BookInstance', book_list: books, selected_book: bookinstance.book._id, bookinstance: bookinstance });
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance update on POST.
exports.bookinstance_update_post = async (req, res, next) => {
  try {
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id 
    });

    // Data from form is valid. Update the record.
    if (process.env.DB_TYPE === 'mongodb') {
      await BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {});
    }
    else {
      await req.app.mySQLdatabase.updateBookInstanceById(req.params.id, req.body.book, req.body.imprint, req.body.status, req.body.due_back);
    }
    
    
  } catch (err) {
    return next(err);
  }
  res.redirect("/catalog/bookinstances");
};
