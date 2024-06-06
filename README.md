# Local Library

Local Library is a web application that provides an online catalog for a small local library, where users can browse available books and manage their accounts. It is written for a university assignment and the requirements are based on a Mozilla MDN web docs tutorial along with a few extra requirements:

## Extra Requirements

This is an assignment given in an AAU Course, and as part of the assignement a few extra requirements to the application was made.
As part of the assignment, the project needs to be extended with the following features:

### Add photo for authors

- Store the image file in a folder accessible by your web server. To store the image file, create a new folder named "images" in your project directory and place the image files in there. The path to the image file might look like this: "/images/author1.jpg".
- Update your database to include a column for the image path for each author record. Add a column named "image_path" to the author table to store the image path.
- Modify the author view in your Express.js application to display the image.
- Add a frontend input element for file upload to the author form and handle the file upload in your controller.
- Save the uploaded image to the appropriate folder and update the image path in the database.

### Add a search bar on the website

- Create a search bar element in a .pug file.
- Add an event listener to the search bar element using the `addEventListener()` method in JavaScript.
- Get the value of the search bar in the event listener and store it in a variable.
- Filter the list of books/authors based on the search term. Use a filter function to remove any books/authors that don't match the search term.
- Perform the filtering in the backend.
- Display the filtered list of books/authors by creating a new array that contains only the books/authors that match the search term. Use this array to update the .pug on the page, showing only the matching books/authors.

### Integrate an SQL-based database in the system

- The tutorial uses the MongoDB database to store the information. This task is about adding also an SQL-based database that contains similar information as the MongoDB one (but not necessarily the same entries).
- By default, the website should use MongoDB.
- Add a radio button on the front page of the website with two options: MongoDB / SQL.
- The user can select the desired DB and the website should refresh whenever a radio button is selected.

## Features

- Browse books and authors
- Check the status of books (available, reserved, etc.)

## Installation

1. Clone the repository:
    ```
    git clone https://github.com/yourusername/local_lib.git
    ```
2. Navigate to the project directory:
    ```
    cd local_lib
    ```
3. Install the dependencies:
    The project has the following dependencies:

    - `chalk`: ^5.3.0
    - `cookie-parser`: ~1.4.4
    - `debug`: ~2.6.9
    - `express`: ~4.16.1
    - `express-async-handler`: ^1.2.0
    - `express-validator`: ^7.0.1
    - `http-errors`: ~1.6.3
    - `jade`: ~1.11.0
    - `luxon`: ^3.4.4
    - `mongoose`: ^8.2.1
    - `morgan`: ~1.9.1
    - `multer`: ^1.4.5-lts.1
    - `mysql2`: ^3.10.0

    You can install these dependencies by running the following command in your terminal:

    ```bash
    npm install
    ```

4. Set up the `.env` file:
    Create a new file named `.env` in the root of your project directory and add the following lines:

    ```
    PORT=3000
    MONGODB_USER=<MongoDB username>
    MONGODB_PASS=<MongoDB password>
    MONGODB_COLLECTION=<MongoDB Collection>
    MYSQL_LOCALHOST=<MySQL host>
    MYSQL_USER=<MySQL username>
    MYSQL_PASS=<MySQL password>
    MYSQL_DATABASE_NAME=<MySQL database name>
    ```

    Replace `Your_database_username`, `Your_database_password` and `Your_database_collection` with your MongoDB username, password and database collection, respectively.

5. Start the server:
    ```
    npm start
    ```

## Usage

Open your web browser and navigate to `http://localhost:3000` to start using the Local Library application.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Link to Github repo
https://github.com/Emandersen/local_lib
