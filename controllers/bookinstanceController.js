const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const dateFormat = require("luxon").DateTime;

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const bookInstance_total = await BookInstance.find().populate("book").exec();
  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: bookInstance_total,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookinstance_detail = await BookInstance.findById(req.params.id).populate("book").exec();
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
  const books = await Book.find({}, "title");

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    books: books,
    selected_book: "",
    errors: [],
    bookinstance: "",
  });
});



// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("Status").escape(),
  body("due back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create a new BookInstance object with sanitized/validated data
    const bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
    });

    if (!errors.isEmpty()) {
        // If there are errors, render the form again with sanitized values/error messages.
        const books = await Book.find({}, 'title');
        res.render('bookinstance_form', {
            title: 'Create BookInstance',
            books: books,
            selected_book: bookinstance.book,
            errors: errors.array(),
            bookinstance: bookinstance
        });
        return;
    }
    else {
        // Data from form is valid.
        // Save the new BookInstance object.
        await bookinstance.save();
        res.redirect(bookinstance.url);
    }
  }),
];




// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
});
