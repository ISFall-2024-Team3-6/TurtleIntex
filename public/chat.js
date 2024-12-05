document.addEventListener("DOMContentLoaded", function() {
    const chatIcon = document.getElementById("chatIcon");
    const chatBox = document.getElementById("chatBox");
    const chatContent = document.getElementById("chatContent");
    const userInputField = document.getElementById("userInput");

    // Show the chat box when the icon is clicked
    chatIcon.addEventListener("click", function() {
        if (chatBox.style.display === "none" || chatBox.style.display === "") {
            chatBox.style.display = "block"; // Show the chat box
        } else {
            chatBox.style.display = "none"; // Hide the chat box
        }
    });

    // Handle form submission
    const chatForm = document.getElementById("chatForm");
    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const userInput = userInputField.value.trim(); // Get the user input and trim extra spaces
        if (userInput) { // Check if the input is not empty
            console.log("User input:", userInput);
            
            // Display the user's message in the chat content
            chatContent.innerHTML += `<div><strong>You:</strong> ${userInput}</div><br>`;

            // Send the input to your server for OpenAI processing
            fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: userInput }), // Send the question to the server
            })
            .then(response => response.json())
            .then(data => {
                console.log("Turtle Crew response:", data.response); // Debugging log
                // Display the Turtle Crew's response in the chat box
                chatContent.innerHTML += `<div><strong>Turtle Crew:</strong> ${data.response}</div><br>`;
                
                // Scroll to the bottom of the chat content to show the latest messages
                chatContent.scrollTop = chatContent.scrollHeight;
            })
            .catch(error => {
                console.error("Error:", error);
                chatContent.innerHTML += `<div><strong>Turtle Crew:</strong> Oops! Something went wrong. Please try again later.</div><br>`;
            });

            // Clear the input field after submitting
            userInputField.value = "";
        } else {
            alert("Please enter a question.");
        }
    });
});