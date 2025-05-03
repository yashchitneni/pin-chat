chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "pin") {
    console.log("Content: Received pin message with text:", message.text);
    pinText(message.text);
  }
});

let currentUrl = null;

function pinText(text) {
  const url = window.location.href;
  console.log("Content: Pinning text for URL:", url);

  const pinnedItem = {
    text: text,
    timestamp: Date.now()
  };

  chrome.storage.local.get([url], (result) => {
    let pinnedItems = result[url] || [];
    pinnedItems.push(pinnedItem);
    console.log("Content: Updated pinned items:", pinnedItems);
    chrome.storage.local.set({ [url]: pinnedItems }, () => {
      console.log("Content: Pinned items saved for URL:", url);
      updateSidebar();
      const sidebar = document.getElementById('chat-pin-sidebar');
      if (sidebar && sidebar.style.display === 'none') {
        sidebar.style.display = 'block';
        const toggleButton = document.getElementById('chat-pin-toggle');
        if (toggleButton) {
          toggleButton.textContent = 'Close Canvas';
        }
      }
    });
  });
}

function getConversationName() {
  let title = document.title || 'Untitled Chat';
  
  // Remove platform-specific suffixes and URLs
  if (window.location.href.includes('chatgpt.com')) {
    title = title.replace(/ - ChatGPT$/i, '').trim();
  } else if (window.location.href.includes('grok.com')) {
    title = title.replace(/ - Grok$/i, '').trim();
    // Remove the URL part if present (e.g., " - https://grok.com/chat/...")
    const urlIndex = title.indexOf(' - https://');
    if (urlIndex !== -1) {
      title = title.substring(0, urlIndex).trim();
    }
  }
  
  // If title is empty or generic, use a fallback
  if (!title || title.toLowerCase() === 'chatgpt' || title.toLowerCase() === 'grok') {
    const chatId = window.location.href.split('/').pop();
    title = `Chat ${chatId.substring(0, 8)}`;
  }
  
  return title;
}

function updateSidebar() {
  const url = window.location.href;
  console.log("Content: Updating sidebar for URL:", url);
  
  // If the URL has changed, clear the sidebar
  if (currentUrl !== url) {
    console.log("Content: URL changed, clearing sidebar. Previous URL:", currentUrl, "New URL:", url);
    currentUrl = url;
    const sidebar = document.getElementById('chat-pin-sidebar');
    if (sidebar) {
      const content = document.getElementById('chat-pin-content');
      content.innerHTML = '';
      // Update the header with the new conversation name
      const header = document.getElementById('chat-pin-header');
      if (header) {
        const conversationName = getConversationName();
        header.textContent = `Pinned for ${conversationName}`;
      }
    }
  }
  
  chrome.storage.local.get([url], (result) => {
    const pinnedItems = result[url] || [];
    console.log("Content: Retrieved pinned items for URL:", url, pinnedItems);
    let sidebar = document.getElementById('chat-pin-sidebar');
    if (!sidebar) {
      console.log("Content: Sidebar not found, creating new sidebar");
      createSidebar();
      sidebar = document.getElementById('chat-pin-sidebar');
    }
    const content = document.getElementById('chat-pin-content');
    content.innerHTML = '';
    pinnedItems.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.textContent = item.text;
      itemDiv.style.marginBottom = '12px';
      itemDiv.style.color = '#d0d0d0';
      itemDiv.style.fontSize = '14px';
      itemDiv.style.lineHeight = '1.5';
      itemDiv.style.padding = '8px';
      itemDiv.style.borderRadius = '6px';
      itemDiv.style.transition = 'background-color 0.2s';
      itemDiv.addEventListener('mouseover', () => {
        itemDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      });
      itemDiv.addEventListener('mouseout', () => {
        itemDiv.style.backgroundColor = 'transparent';
      });

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.style.marginLeft = '10px';
      removeButton.style.backgroundColor = '#444';
      removeButton.style.color = '#fff';
      removeButton.style.border = 'none';
      removeButton.style.padding = '4px 8px';
      removeButton.style.borderRadius = '4px';
      removeButton.style.cursor = 'pointer';
      removeButton.style.fontSize = '12px';
      removeButton.style.transition = 'background-color 0.2s';
      removeButton.addEventListener('mouseover', () => {
        removeButton.style.backgroundColor = '#666';
      });
      removeButton.addEventListener('mouseout', () => {
        removeButton.style.backgroundColor = '#444';
      });
      removeButton.dataset.index = index;
      itemDiv.appendChild(removeButton);
      content.appendChild(itemDiv);
    });
    const removeButtons = document.querySelectorAll('button');
    removeButtons.forEach(button => {
      button.addEventListener('click', handleRemoveClick);
    });
    console.log("Content: Sidebar updated with items:", pinnedItems);
  });
}

function createSidebar() {
  console.log("Content: Creating sidebar");
  const sidebar = document.createElement('div');
  sidebar.id = 'chat-pin-sidebar';
  sidebar.style.position = 'fixed';
  sidebar.style.top = '0';
  sidebar.style.right = '0';
  sidebar.style.width = '340px';
  sidebar.style.height = '100%';
  sidebar.style.background = 'rgba(18, 18, 18, 0.96)';
  sidebar.style.backdropFilter = 'blur(10px)';
  sidebar.style.borderLeft = '1px solid rgba(255, 255, 255, 0.08)';
  sidebar.style.overflowY = 'auto';
  sidebar.style.zIndex = '10000';
  sidebar.style.borderRadius = '0 0 0 16px';
  sidebar.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  sidebar.style.display = 'none';
  
  const header = document.createElement('div');
  header.id = 'chat-pin-header';
  header.style.padding = '16px 20px';
  header.style.background = 'linear-gradient(145deg, rgba(40, 40, 40, 0.96), rgba(30, 30, 30, 0.96))';
  header.style.fontWeight = '600';
  header.style.color = '#ffffff';
  header.style.fontSize = '16px';
  header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
  const conversationName = getConversationName();
  header.textContent = `Pinned for ${conversationName}`;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.float = 'right';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.color = '#ffffff';
  closeButton.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  closeButton.style.padding = '4px 12px';
  closeButton.style.borderRadius = '6px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '12px';
  closeButton.style.transition = 'background-color 0.2s';
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = 'transparent';
  });
  header.appendChild(closeButton);
  
  const content = document.createElement('div');
  content.id = 'chat-pin-content';
  content.style.padding = '20px';
  
  sidebar.appendChild(header);
  sidebar.appendChild(content);
  
  const targetElement = document.querySelector('body > div[class*="relative"][class*="flex"][class*="h-full"]') || document.body;
  try {
    targetElement.appendChild(sidebar);
    console.log("Content: Sidebar appended to:", targetElement.tagName, targetElement.className);
    setupMutationObserver(targetElement, sidebar, 'sidebar');
  } catch (error) {
    console.error("Content: Failed to append sidebar:", error.message);
  }
  
  closeButton.addEventListener('click', handleCloseClick);
}

function createToggleButton() {
  console.log("Content: Creating toggle button");
  const toggleButton = document.createElement('button');
  toggleButton.id = 'chat-pin-toggle';
  toggleButton.textContent = 'Open Canvas';
  toggleButton.style.position = 'fixed';
  toggleButton.style.bottom = '60px';
  toggleButton.style.right = '20px';
  toggleButton.style.zIndex = '10001';
  toggleButton.style.backgroundColor = '#3a3a3a';
  toggleButton.style.color = '#e0e0e0';
  toggleButton.style.border = 'none';
  toggleButton.style.padding = '10px 15px';
  toggleButton.style.borderRadius = '6px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.transition = 'background-color 0.2s';
  toggleButton.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  toggleButton.style.fontSize = '14px';
  toggleButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  
  const targetElement = document.querySelector('body > div[class*="relative"][class*="flex"][class*="h-full"]') || document.body;
  try {
    targetElement.appendChild(toggleButton);
    console.log("Content: Toggle button appended to:", targetElement.tagName, targetElement.className);
    setupMutationObserver(targetElement, toggleButton, 'toggle button');
  } catch (error) {
    console.error("Content: Failed to append toggle button:", error.message);
  }
  
  toggleButton.addEventListener('click', handleToggleClick);
  toggleButton.addEventListener('mouseover', handleMouseOver);
  toggleButton.addEventListener('mouseout', handleMouseOut);
}

function setupMutationObserver(targetElement, element, elementType) {
  const observer = new MutationObserver((mutations) => {
    if (!targetElement.contains(element)) {
      console.log(`Content: ${elementType} removed from DOM, re-appending`);
      try {
        targetElement.appendChild(element);
        console.log(`Content: ${elementType} re-appended to:`, targetElement.tagName, targetElement.className);
      } catch (error) {
        console.error(`Content: Failed to re-append ${elementType}:`, error.message);
      }
    }
  });
  observer.observe(targetElement, { childList: true, subtree: true });
}

function handleToggleClick() {
  updateSidebar(); // Ensure sidebar is updated before showing
  const sidebar = document.getElementById('chat-pin-sidebar');
  if (!sidebar) {
    createSidebar();
    updateSidebar();
  }
  const currentSidebar = document.getElementById('chat-pin-sidebar');
  const toggleButton = document.getElementById('chat-pin-toggle');
  if (currentSidebar.style.display === 'none') {
    currentSidebar.style.display = 'block';
    toggleButton.textContent = 'Close Canvas';
  } else {
    currentSidebar.style.display = 'none';
    toggleButton.textContent = 'Open Canvas';
  }
}

function handleMouseOver(event) {
  event.target.style.backgroundColor = '#4a4a4a';
}

function handleMouseOut(event) {
  event.target.style.backgroundColor = '#3a3a3a';
}

function handleCloseClick() {
  const sidebar = document.getElementById('chat-pin-sidebar');
  sidebar.style.display = 'none';
  const toggleButton = document.getElementById('chat-pin-toggle');
  if (toggleButton) {
    toggleButton.textContent = 'Open Canvas';
  }
}

function handleRemoveClick(event) {
  const index = event.target.dataset.index;
  removePinned(index);
}

function removePinned(index) {
  console.log("Content: Removing pinned item at index:", index);
  const url = window.location.href;
  chrome.storage.local.get([url], (result) => {
    let pinnedItems = result[url] || [];
    pinnedItems.splice(index, 1);
    console.log("Content: Pinned items after removal:", pinnedItems);
    chrome.storage.local.set({ [url]: pinnedItems }, () => {
      updateSidebar();
    });
  });
}

function initializeExtension() {
  console.log("Content: Starting extension initialization");
  
  let attempts = 0;
  const maxAttempts = 20;
  const interval = setInterval(() => {
    attempts++;
    console.log(`Content: Attempt ${attempts} to initialize toggle button`);
    
    const targetElement = document.querySelector('body > div[class*="relative"][class*="flex"][class*="h-full"]') || document.body;
    if (targetElement) {
      console.log("Content: Target element found:", targetElement.tagName, targetElement.className);
      if (!document.getElementById('chat-pin-toggle')) {
        createToggleButton();
      }
      clearInterval(interval);
    } else if (attempts >= maxAttempts) {
      console.log("Content: Max attempts reached, falling back to document.body");
      if (!document.getElementById('chat-pin-toggle')) {
        createToggleButton();
      }
      clearInterval(interval);
    }
  }, 500);
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log("Content: Document ready, attempting to initialize toggle button immediately");
    const targetElement = document.querySelector('body > div[class*="relative"][class*="flex"][class*="h-full"]') || document.body;
    if (targetElement && !document.getElementById('chat-pin-toggle')) {
      createToggleButton();
      clearInterval(interval);
    }
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      console.log("Content: DOMContentLoaded, attempting to initialize toggle button");
      const targetElement = document.querySelector('body > div[class*="relative"][class*="flex"][class*="h-full"]') || document.body;
      if (targetElement && !document.getElementById('chat-pin-toggle')) {
        createToggleButton();
        clearInterval(interval);
      }
    });
  }

  // Detect URL changes and update sidebar
  window.addEventListener('popstate', () => {
    console.log("Content: URL changed via popstate, updating sidebar");
    updateSidebar();
  });

  // Periodic check for URL changes
  let lastUrl = window.location.href;
  setInterval(() => {
    const newUrl = window.location.href;
    if (lastUrl !== newUrl) {
      console.log("Content: URL changed via periodic check, updating sidebar. Old URL:", lastUrl, "New URL:", newUrl);
      lastUrl = newUrl;
      updateSidebar();
    }
  }, 1000);
}

initializeExtension();