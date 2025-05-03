chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.remove("pinToSidebar", () => {
    // Ignore errors if the item doesn't exist
    if (chrome.runtime.lastError) {
      console.log("No existing pinToSidebar menu to remove:", chrome.runtime.lastError.message);
    }
    
    // Create the context menu item
    chrome.contextMenus.create({
      id: "pinToSidebar",
      title: "Pin to Sidebar",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError.message);
      } else {
        console.log("Context menu created successfully");
      }
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "pinToSidebar") {
    const selectedText = info.selectionText;
    console.log("Background: Sending pin message with text:", selectedText);
    chrome.tabs.sendMessage(tab.id, { action: "pin", text: selectedText });
  }
});