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

    // Function to get the current cursor position in a contenteditable div
    const getCursorPosition = () => {
        let range;
        let sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(userInput);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return preCaretRange.toString().length;
        }
        return 0;
    };

    // Function to set the cursor position in a contenteditable div
    const setCursorPosition = (pos) => {
        let range = document.createRange();
        let sel = window.getSelection();
        range.setStart(userInput.childNodes[0] || userInput, pos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    };

    // Function to handle Enter key press event
    const handleEnterKey = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default Enter behavior

            if (isMobile) {
                // Mobile devices: Enter key is for line break
                userInput.innerHTML += '<br/>'; // Add a newline
                adjustTextareaHeight(); // Adjust height after adding newline
            } else {
                // Desktop devices: Enter key sends the message
                if (event.shiftKey) {
                    userInput.innerHTML += '<br/>'; // Add a newline
                    adjustTextareaHeight(); // Adjust height after adding newline
                } else {
                    sendMessage(); // Send the message
                }
            }
        }
    };

    // Function to send the message
    const sendMessage = async () => {
        const prompt = userInput.innerHTML.trim();
        if (prompt) {
            // Append user message to messagesDiv
            messagesDiv.innerHTML += `<div class="message user-message">${prompt}</div>`;
            userInput.innerHTML = ''; // Clear the input field
            // Reset textarea height to auto before fetching response
            userInput.style.height = 'auto';

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

            // Adjust textarea height after message send
            adjustTextareaHeight();
        }
    };

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // Event listener for the Enter key in the textarea
    userInput.addEventListener('keydown', handleEnterKey);

    // Event listener for input changes to adjust textarea height
    userInput.addEventListener('input', () => {
        adjustTextareaHeight();
    });

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

    // Additional focus event listener to handle iOS auto-input issue
    userInput.addEventListener('focusin', () => {
        adjustTextareaHeight();
    });

    // Initial adjustment of textarea height
    adjustTextareaHeight();
});
