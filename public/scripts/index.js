document.addEventListener("DOMContentLoaded", function() {
	const noteEditForms = document.querySelectorAll(".note-block-form");

	noteEditForms.forEach(form => {
		form.addEventListener('click', function(e) {
			e.stopPropagation();
		});
	});
});

document.querySelector("#book-page").addEventListener("click", function() {
	resetAllNotes();
});

function selectNote(event, element) {
	event.stopPropagation();
	const notes = document.querySelectorAll(".note-block");

	notes.forEach((note) => {
		const id = note.querySelector("#note-id").value;
		const buttonContainer = note.querySelector(`#default-buttons-container-${id}`);

		if (note === element) {
			element.classList.toggle("note-block-active");
			buttonContainer.classList.add("visible");

		} else if (note !== element) {
			note.classList.remove("note-block-active");
			buttonContainer.classList.remove("visible");
		}
	});
}

function closeNote(element) {
	console.log(element);
}

function deleteNote(e, note_element) {
	e.stopPropagation();

	const id = e.target.value;

	if (confirm("Are you sure you want to delete?") === false)
		return;

	fetch(`/delete/note/${id}`, {
		method: "POST",
	})
		.then((response) => {
			if (response.ok) location.reload();
		})
		.catch((error) => console.error("Error", error));
}

function editNote(e, btn) {
	e.stopPropagation();

	let id = btn.value;

	let noteContent = document.getElementById(`note-content-${id}`);
	let formContainer = document.getElementById(`note-edit-form-${id}`);
	let textarea = document.getElementById(`note-edit-text-${id}`);

	let defaultButtonsContainer = document.getElementById(`default-buttons-container-${id}`);
	let editButtonsContainer = document.getElementById(`edit-buttons-container-${id}`);

	noteContent.style.display = "none";
	formContainer.style.display = "block";

	editButtonsContainer.classList.add("visible");
	textarea.focus();
	// Set the cursor position to the end of the text
	textarea.selectionStart = textarea.value.length;

	// Set the height of the textarea
	if (textarea.scrollHeight > 115) 
		textarea.style.height = textarea.scrollHeight + "px";
	else 
		textarea.style.height =  "115px";

}

function confirmEdit(e, btn) {
	e.stopPropagation();

	if (confirm("Are you sure you want to edit this note?") === false)
		return;


	const id = e.target.value;
	const originalNote = document.getElementById(`note-content-${id}`).textContent;
	const editedNote = document.getElementById(`note-edit-text-${id}`).value;

	if (originalNote.trim() === editedNote.trim())
		return cancelEdit(e, btn);

	document.getElementById(`note-edit-form-${id}`).submit();
}

function cancelEdit(e, btn) {
	e.stopPropagation();

	const id = e.target.value;

	let noteContent = document.getElementById(`note-content-${id}`);
	let formContainer = document.getElementById(`note-edit-form-${id}`);
	let textarea = formContainer.querySelector("textarea");
	let defaultButtonsContainer = document.getElementById(`default-buttons-container-${id}`);
	let editButtonsContainer = document.getElementById(`edit-buttons-container-${id}`);

	noteContent.style.display = "block";
	formContainer.style.display = "none";

	defaultButtonsContainer.style.display = "flex";
	editButtonsContainer.classList.remove("visible");
}

function resetAllNotes() {
	const notes = document.querySelectorAll(".note-block");

	notes.forEach((note) => {
		const id = note.querySelector("#note-id").value;
		const noteDefaultBtnContainer = note.querySelector(`#default-buttons-container-${id}`);
		const noteEditBtnContainer = note.querySelector(`#edit-buttons-container-${id}`);

		const noteContent = note.querySelector(`#note-content-${id}`);
		const noteForm = note.querySelector(`#note-edit-form-${id}`);

		note.classList.remove("note-block-active");
		noteDefaultBtnContainer.classList.remove("visible");
		noteEditBtnContainer.classList.remove("visible")

		noteContent.style.display = "block";
		noteForm.style.display = "none";
	});
}


