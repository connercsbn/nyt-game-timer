async function requestPerms() {
  await browser.permissions.request({
    origins: ["https://*.nytimes.com/games/connections*", "https://*.nytimes.com/games/strands*"],
  });
}
function updateFrontEnd(state) {
  console.log("updating frontend with: ", state);
  browser.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    browser.tabs.sendMessage(tab.id, state);
  });
}
async function getState() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["state"], (res) => {
      console.log(`attempting to get state from storage... receieved ${res.state}`, res);
      resolve(res.state);
    });
  });
}
async function setState(state) {
  return new Promise((resolve) => {
    console.log(`attempting to set state in backend to ${state} (1/2)`);
    chrome.storage.sync.set({ state }, () => {
      console.log(`state set to: ${state}`);
      // updateFrontEnd(state);
      console.log(`resolving. 2/2. should be returning ${state}`);
      resolve(state);
    });
  });
}

chrome.runtime.onInstalled.addListener(requestPerms);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "getState") {
    console.log("getState was called.");
    getState().then((res) => {
      console.log("getState response is", res);
      sendResponse(res);
    });
  } else if (message?.postState != undefined) {
    console.log("setting new state in backend");
    setState(message.postState).then((res) => sendResponse({ postState: res }));
  } else {
    console.log("unknown message: ", { message });
  }
  return true;
});
