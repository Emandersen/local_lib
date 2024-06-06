const mysql = require('mysql2');
const { DateTime } = require('luxon');

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  // password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});




module.exports = function () {

  async function sendQuery(query) {
    return new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get methods

  async function getBooks() {
    const books = await sendQuery(`
      SELECT book.*, author.first_name, author.family_name 
      FROM book 
      JOIN author ON book.author_id = author.id
    `);

    books.forEach((book) => {
      book.author = {
        id: book.author_id,
        first_name: book.first_name,
        family_name: book.family_name,
        name: `${book.family_name}, ${book.first_name}`
      };
      book.url = `/catalog/book/${book.id}`;
    });
    return books;
  }

  async function getBookById(id) {
    const bookResult = await sendQuery(`SELECT * FROM book WHERE id = ${id}`);
    const book = bookResult[0];
    if (book) {
      const authorResult = await sendQuery(`SELECT first_name, family_name FROM author WHERE id = ${book.author_id}`);
      const genreResult = await sendQuery(`SELECT genre.name FROM genre LEFT JOIN book_genre ON genre.id = book_genre.genre_id WHERE book_genre.book_id = ${id}`);
      book.author = authorResult[0] ? `${authorResult[0].first_name} ${authorResult[0].family_name}` : 'Unknown';
      book.genres = genreResult.map(genre => genre.name);
    }
    return book;
  }


  async function getBookByTitle(title) {
    return sendQuery(`SELECT * FROM book WHERE title = '${title}'`);
  }

  async function getAuthors() {
    return sendQuery('SELECT * FROM author');
  }

  async function getAuthorsFormatted() {
    return sendQuery('SELECT * FROM author').then((authors) => {
      authors.forEach((author) => {
        author.name = `${author.family_name}, ${author.first_name}`;
        author.date_of_birth_formatted = author.date_of_birth ? DateTime.fromJSDate(author.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
        author.date_of_death_formatted = author.date_of_death ? DateTime.fromJSDate(author.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
        author.url = `/catalog/author/${author.id}`;
      });
      return authors;
    });
  }

  async function getAuthorById(id) {
    return sendQuery(`SELECT * FROM author WHERE id = ${id}`);
  }

  async function getAuthorByIdFormatted(id) {
    return sendQuery(`SELECT * FROM author WHERE id = ${id}`).then((results) => {
      if (results.length > 0) {
        const author = results[0];
        author.name = `${author.family_name}, ${author.first_name}`;
        author.date_of_birth_formatted = author.date_of_birth ? DateTime.fromJSDate(author.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
        author.date_of_death_formatted = author.date_of_death ? DateTime.fromJSDate(author.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
        author.url = `/catalog/author/${author.id}`;
        return author;
      } else {
        throw new Error('Author not found');
      }
    });
  }

  async function getAuthorByName(name) {
    return sendQuery(`SELECT * FROM author WHERE name = '${name}'`);
  }

  async function getGenres() {
    const genres = await sendQuery('SELECT * FROM genre');
    genres.forEach((genre) => {
      genre.url = `/catalog/genre/${genre.id}`;
    });
    return genres;
  }

  async function getGenreById(id) {
    const result = await sendQuery(`SELECT * FROM genre WHERE id = ${id}`);
    if (result.length > 0) {
      const genre = result[0];
      genre.url = `/catalog/genre/${genre.id}`;
      return genre;
    }
    return null;
  }

  async function getGenreByName(name) {
    return sendQuery(`SELECT * FROM genre WHERE name = '${name}'`);
  }

  async function getBookInstances() {
    const bookInstances = await sendQuery('SELECT * FROM bookinstance');
    
    for (let bookInstance of bookInstances) {
      const book = await sendQuery(`SELECT * FROM book WHERE id = ${bookInstance.book_id}`);
      bookInstance.book = book[0];

      // Format the due_back date
      const dueBackDate = new Date(bookInstance.due_back);
      const year = dueBackDate.getFullYear();
      const month = (dueBackDate.getMonth() + 1).toString().padStart(2, '0');
      const day = dueBackDate.getDate().toString().padStart(2, '0');
      bookInstance.due_back_formatted = `${year}-${month}-${day}`;

      // Create URL for the book instance
      bookInstance.url = "bookinstance/" + bookInstance.id;
    }

    return bookInstances;
  }

  async function getBookInstanceById(id) {
    const bookInstance = await sendQuery(`SELECT * FROM bookinstance WHERE id = ${id}`);
    
    if (bookInstance.length > 0) {
      const book = await sendQuery(`SELECT * FROM book WHERE id = ${bookInstance[0].book_id}`);
      bookInstance[0].book = book[0];

      // Format the due_back date
      const dueBackDate = new Date(bookInstance[0].due_back);
      const year = dueBackDate.getFullYear();
      const month = (dueBackDate.getMonth() + 1).toString().padStart(2, '0');
      const day = dueBackDate.getDate().toString().padStart(2, '0');
      bookInstance[0].due_back_formatted = `${year}-${month}-${day}`;

      // Create URL for the book instance
      bookInstance[0].url = "bookinstance/" + bookInstance[0].id;
    }

    return bookInstance[0];
  }

  async function getBookInstanceByBookId(id) {
    return sendQuery(`SELECT * FROM bookinstance WHERE book_id = ${id}`);
  }

  async function getBookInstanceByImprint(imprint) {
    return sendQuery(`SELECT * FROM bookinstance WHERE imprint = '${imprint}'`);
  }

  async function getBookByAuthorId(id) {
    return sendQuery(`SELECT * FROM book WHERE author_id = ${id}`);
  }

  // Delete Methods

  async function deleteBookById(id) {
    return sendQuery(`DELETE FROM book WHERE id = ${id}`);
  }

  async function deleteAuthorById(id) {
    return sendQuery(`DELETE FROM author WHERE id = ${id}`);
  }

  async function deleteGenreById(id) {
    return sendQuery(`DELETE FROM genre WHERE id = ${id}`);
  }

  async function deleteBookInstanceById(id) {
    return sendQuery(`DELETE FROM bookinstance WHERE id = ${id}`);
  }

  // Update Methods

  async function updateBookById(id, title, author_id, summary, isbn, genres) {
    return sendQuery(`UPDATE book SET title = '${title}', author_id = ${author_id}, summary = '${summary}', isbn = '${isbn}', genres = '${genres}' WHERE id = ${id}`);
  }

  async function updateAuthorById(id, first_name, family_name, date_of_birth, date_of_death, author_image) {
    return sendQuery(`UPDATE author SET first_name = '${first_name}', family_name = '${family_name}', date_of_birth = '${date_of_birth}', date_of_death = '${date_of_death}', author_image = '${author_image}' WHERE id = ${id}`);
  }

  async function updateGenreById(id, name) {
    return sendQuery(`UPDATE genre SET name = '${name}' WHERE id = ${id}`);
  }

  async function updateBookInstanceById(id, book_id, imprint, status, due_back) {
    return sendQuery(`UPDATE bookinstance SET book_id = ${book_id}, imprint = '${imprint}', status = '${status}', due_back = '${due_back}' WHERE id = ${id}`);
  }

  // Insert Methods

  async function insertBook(title, author_id, summary, isbn, genres) {
    return sendQuery(`INSERT INTO book (title, author_id, summary, isbn, genres) VALUES ('${title}', ${author_id}, '${summary}', '${isbn}', '${genres}')`);
  }

  async function insertAuthor(first_name, family_name, date_of_birth, date_of_death, author_image) {
    return sendQuery(`INSERT INTO author (first_name, family_name, date_of_birth, date_of_death, author_image) VALUES ('${first_name}', '${family_name}', '${date_of_birth}', '${date_of_death}', '${author_image}')`);
  }

  async function insertGenre(name) {
    return sendQuery(`INSERT INTO genre (name) VALUES ('${name}')`);
  }


  async function insertBookInstance(book_id, imprint, status, due_back) {
    return sendQuery(`INSERT INTO bookinstance (book_id, imprint, status, due_back) VALUES (${book_id}, '${imprint}', '${status}', '${due_back}')`);
  }

  async function createGenreRelation(book_id, genre_id) {
    return sendQuery(`INSERT INTO book_genre (book_id, genre_id) VALUES (${book_id}, ${genre_id})`);
  }

  async function deleteGenreRelation(book_id) {
    return sendQuery(`DELETE FROM book_genre WHERE book_id = ${book_id}`);
  }

  async function getGenreRelation(genre_id) {
    return sendQuery(`SELECT * FROM book_genre WHERE genre_id = ${genre_id}`);
  }




  return {
    sendQuery,
    getBooks,
    getBookById,
    getBookByTitle,
    getAuthors,
    getAuthorById,
    getAuthorByName,
    getAuthorsFormatted,
    getAuthorByIdFormatted,
    getGenres,
    getGenreById,
    getGenreByName,
    getGenreRelation,
    getBookInstances,
    getBookInstanceById,
    getBookInstanceByBookId,
    getBookInstanceByImprint,
    getBookByAuthorId,
    deleteBookById,
    deleteAuthorById,
    deleteGenreById,
    deleteBookInstanceById,
    updateBookById,
    updateAuthorById,
    updateGenreById,
    updateBookInstanceById,
    insertBook,
    insertAuthor,
    insertGenre,
    insertBookInstance,
    createGenreRelation,
    deleteGenreRelation
  };
};






  
