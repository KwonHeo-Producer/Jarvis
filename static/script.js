document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const chatContainer = document.getElementById('chat-container');
    const logoContainer = document.querySelector('.logo-container');
    let isFirstMessageSent = false;
    // Detect if the device is mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    // Function to adjust the height of the textarea
    const adjustTextareaHeight = () => {
        userInput.style.height = 'auto'; // Reset the height to allow shrinking if necessary
        userInput.style.height = `${userInput.scrollHeight}px`; // Set height based on scroll height
    };
    // Function to send the message
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (prompt) {
            // Append user message to messagesDiv
            messagesDiv.innerHTML += `<div class="message user-message">${prompt}</div>`;
            userInput.value = ''; // Clear the input field
            try {
                // Fetch the response from the server
                const response = await fetch('/process_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt })
                });
                // Get the response as text (HTML)
                const text = await response.text();

                 // Append the server's response to messagesDiv
                 messagesDiv.innerHTML += `<div class="message assistant-message">${text}</div>`;

                 // Apply syntax highlighting
                 document.querySelectorAll('pre code').forEach((block) => {
                     hljs.highlightBlock(block);
                 });
             } catch (error) {
                 console.error('Error:', error);
                 messagesDiv.innerHTML += `<div class="message assistant-message">An error occurred. Please try again.</div>`;
            }
            // Scroll to the bottom of the messagesDiv
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            // Display chat container and hide logo if it's the first message
            if (!isFirstMessageSent) {
                logoContainer.style.display = 'none';
                chatContainer.style.display = 'flex';
                messagesDiv.classList.add('expanded'); // Expand the message box
                isFirstMessageSent = true;
            }
        }
    };
    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);
    // Event listener for the Enter key in the textarea
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (isMobile) {
                // Mobile devices: Enter key is for line break
                event.preventDefault(); // Prevent default Enter behavior
                userInput.value += '\n'; // Add a newline
                adjustTextareaHeight(); // Adjust height after adding newline
            } else {
                // Desktop devices: Enter key sends the message
                if (event.shiftKey) {
                    event.preventDefault(); // Prevent default Enter behavior
                    userInput.value += '\n'; // Add a newline
                    adjustTextareaHeight(); // Adjust height after adding newline
                } else {
                    event.preventDefault(); // Prevent default Enter behavior
                    sendMessage(); // Send the message
                }
            }
        }
    });
    // Event listener for input changes to adjust textarea height
    userInput.addEventListener('input', adjustTextareaHeight);
    // Handle window resize events
    window.addEventListener('resize', () => {
        if (document.activeElement === userInput) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom on resize if input is focused
        }
    });
    // Ensure messagesDiv scrolls to bottom on input focus
    userInput.addEventListener('focus', () => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
    // Initial adjustment of textarea height
    adjustTextareaHeight();
});
