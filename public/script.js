document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('user-input').value;
    const responseContainer = document.getElementById('response-container');
    clearPreviousResponses(responseContainer);

    const eventSourceUrl = `/streamChatCompletion?input=${encodeURIComponent(input)}`;
    const eventSource = new EventSource(eventSourceUrl);
    
    handleEventSourceMessages(eventSource, responseContainer);

    handleEventSourceError(eventSource);

    window.onbeforeunload = () => eventSource.close();
});

export function clearPreviousResponses(container) {
    container.innerHTML = ''; 
}

export function handleEventSourceMessages(eventSource, container) {
    let accumulatedMessage = ''; 

    eventSource.onmessage = (event) => {
        const part = JSON.parse(event.data);
        accumulatedMessage += part; 

        if (part.endsWith('.') || part.endsWith('!') || part.endsWith('?')) {
            appendMessageToContainer(container, accumulatedMessage);
            accumulatedMessage = ''; 
        }
    };
}

export function appendMessageToContainer(container, message) {
    const p = document.createElement('p');
    p.textContent = message;
    container.appendChild(p);
    container.scrollTop = container.scrollHeight; 
}

export function handleEventSourceError(eventSource) {
    eventSource.onerror = () => {
        displayErrorMessage();
        eventSource.close();
    };
}

export function displayErrorMessage() {
    console.error('EventSource failed. Please try again later.');
}

