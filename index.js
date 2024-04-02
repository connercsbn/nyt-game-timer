async function hasPerms() {
  return browser.permissions.contains(
    {
      origins: [
        "https://*.nytimes.com/games/strands*",
        "https://*.nytimes.com/games/connections*"
      ]
    }
  )
}

async function toggle() {
  await browser.permissions.request({
    origins: [
      "https://*.nytimes.com/games/connections*"
    ]
  })
  if (await hasPerms()) {
    browser.runtime.sendMessage({ state: !checkState }, (res) => {
      console.log(res)
      checkbox.checked = res;
      checkState = res;
    })
  }
}

let checkbox = document.querySelector('input');
let checkState = false;
let body = document.querySelector('body');

document.addEventListener('DOMContentLoaded', async () => {
  if (!await hasPerms()) {
    browser.runtime.sendMessage({ state: false })
    checkbox.checked = false;
    checkState = false;
  }
  browser.runtime.sendMessage({ message: "getState" }, (res) => {
    checkbox.checked = res;
    checkState = res;
  });
})

checkbox.addEventListener('click', toggle);











