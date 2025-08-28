/* Global constants ========================================================= */

// Utilized to distinguish what each action button does to avoid adding event
// listeners to each and every action button, which can cause performance issues
const REMOVE_DATA_VAL = "remove";
const MARK_READ_DATA_VAL = "mark-read";

// Connect each Book property to the table column they belong to
const PROP_TO_ID = {
    title: "col-title",
    author: "col-author",
    genre: "col-genre",
    pages: "col-pages",
    isRead: "col-read"
};

/* INTERACTIVITY FOR THE USER INTERFACE ===================================== */
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

// Do an initial processing of form data 
form.addEventListener("formdata", (evt) => {
    const formData = evt.formData;
    formData.set("isRead", formData.get("isRead") === "on");
    // Note that .set() forces values to a string
});

/* Enable removing & marking books as read */
// Leverage event bubbling to not add more event listeners than necessary
const tableBody = document.querySelector("tbody");
tableBody.addEventListener("click", (evt) => {
    const target = evt.target;
    if(target.type !== "button") {
        return;
    }
    
    const btn = target;
    const bookElement = tableBody.querySelector(
        `[data-uuid="${btn.getAttribute("data-book-uuid")}"]`
    );
    if (btn.getAttribute("data-action") === REMOVE_DATA_VAL) {
        removeBookFromLibrary(bookElement);
    }
    else if (btn.getAttribute("data-action") === MARK_READ_DATA_VAL) {
        toggleBookIsRead(bookElement);
    } 
    else {
        throw Error();
    }
});

/* INTERNAL PROCESSING ====================================================== */

const library = [];

/**
* 
* @param {String} title 
* @param {String} author 
* @param {String} genre 
* @param {Number} pages 
* @param {Boolean} isRead 
* @param {String} uuid
*/
function Book(title, author, genre, pages, isRead, uuid) {
    if (!new.target) {
        throw Error("You must use the 'new' operator to call the constructor");
    }
    
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.pages = pages;
    this.isRead = isRead;
    this.uuid = uuid;
}

Book.prototype.toggleIsRead = function () {
    this.isRead = !this.isRead;
};

/**
* 
* @param {String} title 
* @param {String} author 
* @param {String} genre 
* @param {String} pages is a number at least 1 in string form
* @param {String} isRead is either "true" or "false" in string form
*/
function addBookToLibrary(title, author, genre, pages, isRead) {
    pages = +pages || "";
    isRead = (isRead === "true");   
    const uuid = window.crypto.randomUUID();
    const book = new Book(title, author, genre, pages, isRead, uuid);
    
    library.push(book);
    displayBooks();
}

/**
* Called every time the library is modified by one of:
* adding a book, removing a book, or updating a book's read status
*/
function displayBooks() {
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.lastChild);
    }
    
    library.forEach(book => {
        const bookElement = createBookElement(book);
        tableBody.appendChild(bookElement);
    });
}

function createBookElement(book) {
    const row = document.createElement("tr");
    
    // Associate the DOM element with corresponding book object to easily
    // remove or modify it
    row.setAttribute("data-uuid", book.uuid);
    
    // Create table cells containing the book's metadata
    const dataToDisplay = Object
        .entries(book)
        .filter(([key, value]) => key !== "uuid");
    const dataCells = dataToDisplay.map(([key, value]) => {
        if(key === "isRead")
            value = value ? "✓" : "×"; 

        const cell = document.createElement("td");
        cell.setAttribute("headers", PROP_TO_ID[key]);
        cell.textContent = value;
        return cell;
    });
    
    // Add buttons to interact with book
    const actionsCell = document.createElement("td");
    const btnsContainer = document.createElement("div");
    const removeBookBtn = createActionButton(REMOVE_DATA_VAL, book.uuid);
    const markReadBtn = createActionButton(MARK_READ_DATA_VAL, book.uuid); 
    btnsContainer.append(removeBookBtn, markReadBtn);
    actionsCell.setAttribute("headers", "col-actions");
    actionsCell.appendChild(btnsContainer);
    
    row.append(...dataCells, actionsCell);
    return row;
}

function createActionButton(action, bookUuid) {
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("data-action", action);
    btn.setAttribute("data-book-uuid", bookUuid);
    btn.textContent = action === REMOVE_DATA_VAL ? "Remove" : "Read";
    return btn;
}

function toggleBookIsRead(bookElement) {
    const workingBook = library.find(isMatchingBook, bookElement);
    workingBook.toggleIsRead();
    displayBooks();
}

function removeBookFromLibrary(bookElement) {
    const workingBookIdx = library.findIndex(isMatchingBook, bookElement);
    library.splice(workingBookIdx, 1);
    displayBooks();
}

function isMatchingBook(book) {
    return book.uuid === this.getAttribute("data-uuid");    
}

/* ========================================================================== */

// Placeholder content to show off the features
addBookToLibrary("foo title", "bar author", "genre", "214", "true");
addBookToLibrary("Foo title bigger", "Bar author bigger", "genre bigger this wraps", "", "false");
addBookToLibrary("foo title", "bar author", "genre", "214", "true");
addBookToLibrary("Foo title bigger", "Bar author bigger", "genre bigger this wraps", "", "false");