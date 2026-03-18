const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Helper function to append a message to the chat box
function appendMessage(role, text, id = null) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${role}-message`);
  messageDiv.textContent = text;

  if (id) {
    messageDiv.id = id;
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
  return messageDiv;
}

// Form submit event handler
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // 1. Add the user's message to the chat box
  appendMessage('user', text);

  // Clear input
  userInput.value = '';

  // 2. Show a temporary "Thinking..." bot message
  const thinkingId = `thinking-${Date.now()}`;
  const thinkingMessage = appendMessage('bot', 'Thinking...', thinkingId);

  try {
    // 3. Send the user's message as a POST request to /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: [
          { role: 'user', text }
        ]
      })
    });

    const data = await response.json();

    // 4. Replace "Thinking..." message
    const answer = data.result || data.response;
    if (response.ok && answer) {
      thinkingMessage.textContent = answer;
    } else {
      // Handle API level error but with successful HTTP request
      throw new Error(data.error || 'Failed to get response from server.');
    }
  } catch (error) {
    console.error('Chat error:', error);
    // 5. If an error occurs or no result is received
    thinkingMessage.textContent = `Error: ${error.message}`;
    thinkingMessage.style.color = 'red'; // Optional error styling
  }
});
