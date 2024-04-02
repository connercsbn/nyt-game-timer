function updateFrontEnd(state) {
  console.log('updating frontend with: ', state)
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, state);
  });
}
let getState = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['state'], (res) => {
      console.log(res)
      resolve(res.state)
    });
  })
}
let setState = async (state) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ state }, () => {
      console.log(`state set to: ${state}`);
      updateFrontEnd(state)
      resolve(state);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "getState") {
    console.log('getState was called.')
    getState().then((state) => {
      console.log('replying: ', state)
      sendResponse(state)
      updateFrontEnd(state)
    })
    return true;
  }
  if (message.state != undefined) {
    setState(message.state).then((state) => sendResponse(state))
    return true;
  }
});
