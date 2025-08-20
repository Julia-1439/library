/* Event listeners for the user interface =================================== */
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

    switch (handler) {
        case "confirm-add-book": 
            processBook();
            break;
        case "cancel-add-book":
            processCancellation();
            break;
    }
    // Prevent the form submission since we are processing only on client-side
    evt.preventDefault();
});

// Send the user-input book information to be processed, clear input, close modal
function processBook() {
    const formInputs = document.querySelectorAll("input");
    formInputs.forEach(userInput => {
        console.log(userInput.value); // placeholder for processing
        userInput.value = "";
    });
    formDialog.close();
}

// Clear the inputs & close the modal
function processCancellation() {
    const formInputs = document.querySelectorAll("input");
    formInputs.forEach(userInput => {
        userInput.value = "";
    });
    formDialog.close();
}

