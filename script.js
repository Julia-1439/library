/* INTERACTIVITY FOR THE USER INTERFACE ===================================== */
/* Add evt listeners: open the book submission form */
const formDialog = document.querySelector("dialog");
const openFormBtn = document.querySelector("#open-form");
openFormBtn.addEventListener("click", () => {
    formDialog.showModal();
});

/* Add evt listeners to the book submission form */
const form = document.querySelector("form");
form.addEventListener("submit", (evt) => {
    const submitterBtn = evt.submitter;
    const handler = submitterBtn.id;

    if (!handler) {
        alert("An unknown error occured. Please try again.");
    }

    // Prevent the form submission since we are processing only on client-side
    evt.preventDefault();
    const formData = new FormData(form);

    switch (handler) {
        case "confirm-add-book": 
            addBookToLibrary(
                formData.get("title"),
                formData.get("author"),
                formData.get("genre"),
                formData.get("pages"),
                formData.get("isRead")
            );
            break;
        case "cancel-add-book":
            processCancellation();
            break;
    }

    form.reset()
    formDialog.close();
});

// Do an initial processing of form data 
form.addEventListener("formdata", (evt) => {
    const formData = evt.formData;
    formData.set("isRead", formData.get("isRead") === "on");
    // Note that .set() forces values to a string
});

// Clear the inputs & close the modal
function processCancellation() {

}

/* Add evt listeners to the book table to remove & mark as read books */
// Leverage event bubbling to not add an insane amount of event listeners
const tableBody = document.querySelector("tbody");
tableBody.addEventListener("click", (evt) => {
    const target = evt.target;
    if(target.type !== "button") {
        return;
    }

    const btn = target;
    const bookElement = btn.parentNode.parentNode;
    if (btn.classList.contains("remove-book")) {
        removeBookFromLibrary(bookElement);
    }
    // The else case is the button being a mark-as-read w/ "read-book" class
    else {
        toggleIsRead(bookElement);
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
    pages = +pages;
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
    })
}


// (note) ordering of the properties as they were defined is retained 
function createBookElement(book) {
    const row = document.createElement("tr");

    const bookMetadata = Object.entries(book); // (note)
    bookMetadata.forEach(([key, value]) => {
        if (key === "uuid") {
            // Associate the DOM element with corresponding book object to easily
            // remove or modify it
            row.setAttribute("data-uuid", value);
            return;
        }
        const cell = document.createElement("td");
        cell.textContent = value;
        cell.setAttribute("data-property-name", key);
        row.appendChild(cell);
    });

    // Add buttons to interact with book
    const removeBookBtn = document.createElement("button");
    removeBookBtn.setAttribute("type", "button");
    removeBookBtn.classList.add("remove-book");
    removeBookBtn.textContent = "Remove";
    const markReadBtn = document.createElement("button");
    markReadBtn.setAttribute("type", "button");
    removeBookBtn.classList.add("read-book");
    markReadBtn.textContent = "Read";
    const btnCell = document.createElement("td");
    btnCell.appendChild(removeBookBtn);
    btnCell.appendChild(markReadBtn);
    row.appendChild(btnCell);

    return row;
}

function toggleIsRead(bookElement) {
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