/* ========================================================================== */
/* Global constants */
/* ========================================================================== */

// Used to connect each table cell to the column they belong to. 
// This enables easier styling of certain columns. 
const HTML_COL_ID = {
    title: "col-title",
    author: "col-author",
    genre: "col-genre",
    pages: "col-pages",
    isRead: "col-read"
};

/* ========================================================================== */
/* Interactivity for the User Interface */
/* ========================================================================== */

/* Enable user to open the dialog to add a book */
const dialog = document.querySelector("dialog");
const addABookBtn = document.querySelector("#add-a-book");
addABookBtn.addEventListener("click", () => {
    dialog.showModal();
});

/* Enable processing the form data once it is submitted or cancelled */
const form = document.querySelector("form");
form.addEventListener("submit", (evt) => {
    const submitterBtn = evt.submitter;
    const handler = submitterBtn.id;
    
    if (!handler) {
        throw Error("An unknown error occured. Please try again.");
    }
    
    if (handler === "confirm-add-book") {
        const formData = new FormData(form);
        addBookToLibrary(
            formData.get("title"),
            formData.get("author"),
            formData.get("genre"),
            formData.get("pages"),
            formData.get("isRead")
        );
    } 

    form.reset()
});

/* Do an initial processing of form data */ 
form.addEventListener("formdata", (evt) => {
    const formData = evt.formData;
    formData.set("isRead", formData.get("isRead") === "on");
    // Note that .set() forces values to a string
});

/* Enable removing & marking books as read */
const tableBody = document.querySelector("tbody");
tableBody.addEventListener("click", (evt) => {
    // Leverage event delegation to not add more event listeners than necessary
    const target = evt.target;
    if(target.type !== "button") {
        return;
    }
    
    const btn = target;
    const bookElement = tableBody.querySelector(
        `[data-uuid="${btn.getAttribute("data-book-uuid")}"]`
    );
    if (btn.getAttribute("data-action") === "remove") {
        removeBookFromLibrary(bookElement);
    }
    else if (btn.getAttribute("data-action") === "mark-read") {
        toggleBookIsRead(bookElement);
    } 
    else {
        throw Error();
    }
});

/* ========================================================================== */
/* Internal logic (separate from Display logic) */
/* ========================================================================== */

const library = [];

/**
* 
* @param {String} title 
* @param {String} author 
* @param {String} genre 
* @param {Number} pages 
* @param {Boolean} isRead 
*/
class Book {
    #title;
    #author;
    #genre;
    #pages;
    #isRead;
    #uuid = window.crypto.randomUUID(); // to reference book updating or removal

    // All properties are read-only except isRead, which can be modified by 
    // calling toggleIsRead()
    constructor(title, author, genre, pages, isRead) {
        this.#title = title; 
        this.#author = author;  
        this.#genre = genre; 
        this.#pages = pages; 
        this.#isRead = isRead; 
    }

    get title() { return this.#title; }
    get author() { return this.#author; }
    get genre() { return this.#genre; }
    get pages() { return this.#pages; }
    get isRead() { return this.#isRead; }
    get uuid() { return this.#uuid; }
    
    toggleIsRead() {
        this.#isRead = !this.isRead;
    }

    /**
     * Returns an array of this book's private elements on which 
     * createBookElement() will iterate. 
     * Private elements are nonaccessible and nonenumerable, thus this getter.
     */
    get dataToDisplay() {
        return Object.entries({
            "title": this.title,
            "author": this.author,
            "genre": this.genre,
            "pages": this.pages,
            "isRead": this.isRead,
        });
    }
}

/**
* Creates a new Book object and adds it to the library. Called each time a 
* the "Add a Book" form is submitted by the user.
* @param {String} title 
* @param {String} author 
* @param {String} genre 
* @param {String} pages is a number at least 1 in string form
* @param {String} isRead is either "true" or "false" in string form
*/
function addBookToLibrary(title, author, genre, pages, isRead) {
    pages = +pages || "";
    isRead = (isRead === "true");   
    const book = new Book(title, author, genre, pages, isRead);
    
    library.push(book);
    displayBooks();
}

/* ========================================================================== */
/* Display logic */
/* ========================================================================== */

/**
* Called every time the library is modified by one of: adding a book, removing 
* a book, or updating a book's read status. 
* Operates by removing all current books, then readding them to surface the
* updated information. 
*/
function displayBooks() {
    // An alternative is to set innerHTML to empty string
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.lastChild);
    }
    
    library.forEach(book => {
        const bookElement = createBookElement(book);
        tableBody.appendChild(bookElement);
    });
}

/**
 * Utilized by `displayBooks()` to display books to the user
 * @param {Book} book 
 * @returns HTML <tr> containing `book`'s data
 */
function createBookElement(book) {
    const row = document.createElement("tr");
    
    // Associate the DOM element with corresponding book object to easily
    // remove or modify it
    row.setAttribute("data-uuid", book.uuid);
    
    // Create table cells containing the book's metadata
    const dataToDisplay = book.dataToDisplay;
    const dataCells = dataToDisplay.map(([key, value]) => {
        const cell = document.createElement("td");
        cell.setAttribute("headers", HTML_COL_ID[key]);
        if(key === "isRead")
            value = value ? "✓" : "×"; 
        cell.textContent = value;
        return cell;
    });
    
    // Add buttons to interact with book
    const actionsCell = document.createElement("td");
    const btnsContainer = document.createElement("div");
    const removeBookBtn = createActionButton("remove", book.uuid);
    const markReadBtn = createActionButton("mark-read", book.uuid); 
    btnsContainer.append(removeBookBtn, markReadBtn);
    actionsCell.setAttribute("headers", "col-actions");
    actionsCell.appendChild(btnsContainer);
    
    row.append(...dataCells, actionsCell);
    return row;
}

/**
 * Helper function to create "remove" or "mark as read" buttons. Utilized each
 * time `createBookElement()` is called. 
 * @param {String} action one of "remove" or "read" 
 * @param {String} bookUuid 
 * @returns HTML <button>
 */
function createActionButton(action, bookUuid) {
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("data-action", action);
    btn.setAttribute("data-book-uuid", bookUuid);
    btn.textContent = (action === "remove") ? "Remove" : "Read";
    return btn;
}

/* ========================================================================== */
/* Book table's event handlers */
/* ========================================================================== */

/**
 * Click event handler for `bookElement`'s "remove" button
 * @param {<tr>} bookElement 
 */
function toggleBookIsRead(bookElement) {
    const workingBook = library.find(isMatchingBook, bookElement);
    workingBook.toggleIsRead();
    displayBooks();
}

/**
 * Click event handler for `bookElement`'s "mark as read" button
 * @param {<tr>} bookElement 
 */
function removeBookFromLibrary(bookElement) {
    const workingBookIdx = library.findIndex(isMatchingBook, bookElement);
    library.splice(workingBookIdx, 1);
    displayBooks();
}

/**
 * Helper function to identify the row `book` belongs to, to remove or update 
 * the display. 
 * @param {Book} book 
 * @returns Boolean whether the row has the same uuid as `book` 
 */
function isMatchingBook(book) {
    return book.uuid === this.getAttribute("data-uuid");    
}

/* ========================================================================== */
/* Placeholder content to show off the features */
/* ========================================================================== */

addBookToLibrary("foo title", "bar author", "genre", "214", "true");
addBookToLibrary("Foo title bigger", "Bar author bigger", "genre bigger this wraps", "", "false");
addBookToLibrary("foo title", "bar author", "genre", "214", "true");
addBookToLibrary("Foo title bigger", "Bar author bigger", "genre bigger this wraps", "", "false");