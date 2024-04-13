let timer;
let game;
let started = false;
startDate = new Date();

document.addEventListener("click", (e) => {
  if (e.target.innerText === "Play" && !started) {
    started = true;
    game.start();
    return;
  }
  if (e.target.type === "submit") {
    game.updateGameInfo();
    return;
  }
});
document.addEventListener("mouseup", () => {
  if (game.title === "Strands") game.updateGameInfo();
});

function getGame() {
  let name = document.title.split(":")[0].toLowerCase();
  switch (name) {
    case "connections":
      return new ConnectionsGame();
    case "strands":
      return new StrandsGame();
  }
}

class Game {
  constructor() {
    this.centiseconds = undefined;
    this.gameInfo = undefined;
    this.finished = undefined;
    this._displaying = undefined;
  }
  updateTimer() {
    let seconds = Math.floor(this.centiseconds / 10);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let formattedTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds % 60) + "." + (this.centiseconds % 10);
    timer.innerText = formattedTime;
  }
}

class ConnectionsGame extends Game {
  constructor() {
    super();
    this.intervalID = undefined;
    this.title = "Connections";
  }
  /**
   * @param {boolean} state
   */
  set displaying(state) {
    this._displaying = state;
    if (!state) {
      this.deinit();
    }
  }
  init() {
    let header = document.querySelector("#portal-game-header").querySelector("h1");
    header.style.display = "flex";
    header.style.columnGap = "16px";
    header.style.alignItems = "center";
    timer = header.querySelector("#portal-game-date").cloneNode(true);
    header.appendChild(timer);
    timer.innerText = "";
    this.updateGameInfo();
    let tempLocal = localStorage.getItem("connectionsTimer");
    if (tempLocal == undefined || tempLocal == "undefined") tempLocal = "{}";
    this.timerInfo = JSON.parse(tempLocal);
    this.timerInfo[this.gameInfo.dayOfTest] ??= 0;
    this.centiseconds = this.timerInfo[this.gameInfo.dayOfTest];
  }
  start() {
    if (!this._displaying) return;
    this.intervalID = setInterval(() => {
      this.tick();
    }, 100);
    timer.style.display = "block";
  }
  deinit() {
    timer.style.display = "none";
    clearInterval(this.intervalID);
    localStorage.removeItem("connectionsTimer", JSON.stringify(this.timerInfo));
  }
  updateGameInfo() {
    this.gameInfo = JSON.parse(localStorage.getItem("nyt-connections-beta"));
    this.finished = this.gameInfo.groupsFound.length >= 3;
  }
  tick() {
    this.timerInfo[this.gameInfo.dayOfTest] = this.centiseconds++;
    if (this.timerInfo[this.gameInfo.dayOfTest] % 10 === 0) localStorage.setItem("connectionsTimer", JSON.stringify(this.timerInfo));
    this.updateTimer();
    if (this.finished) {
      clearInterval(this.intervalID);
      localStorage.setItem("connectionsTimer", JSON.stringify(this.timerInfo));
    }
  }
}

class StrandsGame extends Game {
  constructor() {
    super();
    let header = document.querySelector("#app").querySelectorAll("section");
    if (header.length === 0) this.fails = true;
    this.title = "Strands";
  }
  init() {
    let header = document.querySelector("#app").querySelectorAll("section")[0];
    timer = header.querySelector("h2").cloneNode();
    header.appendChild(timer);
    timer.innerText = "";
    this.updateGameInfo();
    let tempLocal = localStorage.getItem("strandsTimer") ?? "{}";
    this.timerInfo = JSON.parse(tempLocal);
    this.timerInfo[this.gameInfo.puzzleID] ??= 0;
    this.centiseconds = this.timerInfo[this.gameInfo.puzzleID];
  }
  /**
   * @param {boolean} state
   */
  set displaying(state) {
    this._displaying = state;
    if (!state) {
      this.deinit();
    }
  }
  start() {
    if (!this._displaying) return;
    this.intervalID = setInterval(() => {
      this.tick();
    }, 100);
    timer.style.display = "block";
  }
  updateGameInfo() {
    this.gameInfo = JSON.parse(localStorage.getItem("nyt-strands-beta"));
    this.finished = game.gameInfo.layout.every((char) => char.themed || char.spangramed);
  }
  tick() {
    this.timerInfo[this.gameInfo.puzzleID] = this.centiseconds++;
    if (this.timerInfo[this.gameInfo.puzzleID] % 10 === 0) localStorage.setItem("strandsTimer", JSON.stringify(this.timerInfo));
    this.updateTimer();
    if (this.finished) {
      clearInterval(this.intervalID);
      localStorage.setItem("strandsTimer", JSON.stringify(this.timerInfo));
    }
  }
}

function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

function updateDisplaying(state) {
  if (!game) return;
  game.displaying = state;
}

async function initGame(tries = 1) {
  return new Promise((res, rej) => {
    let game = getGame();
    if (game && !game.fails) {
      return res(game);
    }
    if (tries < 50)
      return new Promise((res, rej) => {
        setTimeout(
          () =>
            initGame(tries + 1)
              .then(res)
              .catch(rej),
          100
        );
      });
    rej("already tried 50 times");
  });
}

let loopInterval = 0;
let tryNum = 0;
function loop() {
  tryNum++;
  game = getGame();
  if (game && !game.fails) {
    clearInterval(loopInterval);
    main();
  }
}

function main() {
  if (!game) return console.error("couldn't init the damn game");
  game.init();
  chrome.runtime.onMessage.addListener((message) => {
    game.displaying = message.postState;
  });
  chrome.runtime.sendMessage({ message: "getState" }, (res) => {
    game.displaying = res;
  });
}

loopInterval = setInterval(loop, 100);
