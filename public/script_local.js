document.getElementById('send-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value;
    const responseContainer = document.getElementById('response-container');
    clearPreviousResponses(responseContainer);

    const eventSource = new EventSource(`/streamChatCompletion?input=${encodeURIComponent(userInput)}`);
    
    handleEventSourceMessages(eventSource, responseContainer);

    handleEventSourceError(eventSource);

    window.onbeforeunload = () => eventSource.close();
});

function clearPreviousResponses(container) {
    container.innerHTML = ''; 
}

function handleEventSourceMessages(eventSource, container) {
    let accumulatedMessage = ''; 

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        accumulatedMessage += data.response; 

        // Check if the current part ends with a punctuation mark that should finalize the sentence
        if (data.response.endsWith('.') || data.response.endsWith('!') || data.response.endsWith('?')) {
            appendMessageToContainer(container, accumulatedMessage);
            accumulatedMessage = ''; // Reset the accumulated message
        }
    };
}

function appendMessageToContainer(container, message) {
    const p = document.createElement('p');
    p.textContent = message;
    container.appendChild(p);
    container.scrollTop = container.scrollHeight; // Auto-scroll to the bottom of the container
}

function handleEventSourceError(eventSource) {
    eventSource.onerror = () => {
        displayErrorMessage();
        eventSource.close();
    };
}

function displayErrorMessage() {
    console.error('EventSource failed. Please try again later.');
}
