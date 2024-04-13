let checkbox = document.querySelector("input");
let checkState = false;
let body = document.querySelector("body");

async function hasPerms() {
  return browser.permissions.contains({
    origins: ["https://*.nytimes.com/games/strands*", "https://*.nytimes.com/games/connections*"],
  });
}

async function toggle() {
  await browser.permissions.request({
    origins: ["https://*.nytimes.com/games/connections*", "https://*.nytimes.com/games/strands*"],
  });
  if (await hasPerms()) {
    console.log(`attempted to toggle to state: ${!checkState}, ${!checkbox.checked}`);
    let newState = await new Promise((resolve, reject) => {
      browser.runtime.sendMessage({ postState: !checkState }, (response) => {
        resolve(response.postState);
      });
    });
    console.log(`state after attempted toggle: ${newState}`);
    console.log(`attempting to update local state: BEFORE ${checkbox.checked}, ${checkState}`);
    checkbox.checked = newState;
    checkState = newState;
    console.log(`attempting to update local state: AFTER ${checkbox.checked}, ${checkState}`);
  } else {
    console.log("either doesn't have perms or rejected perms?");
  }
  return true;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await hasPerms())) {
    browser.runtime.sendMessage({ postState: false });
    checkbox.checked = false;
    checkState = false;
  }
  browser.runtime.sendMessage({ message: "getState" }, (res) => {
    checkbox.checked = res;
    checkState = res;
  });
});

checkbox.addEventListener("click", toggle);
