let timer;
let game;
let started = false;
startDate = new Date();


chrome.runtime.sendMessage({ message: "getState" }, (res) => {
  game.displaying = res;
});

document.addEventListener('click', (e) => {
  if (e.target.type === "submit") {
    game.updateGameInfo();
    return;
  }
  if (started) return;
  if (e.target.innerText === "Play") {
    started = true;
    game.start()
    return;
  }
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
    chrome.runtime.onMessage.addListener(updateDisplaying);
  }
  updateTimer() {
    let seconds = Math.floor(this.centiseconds / 10);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let formattedTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds % 60) + "." + this.centiseconds % 10;
    timer.innerText = formattedTime;
  }
}

class ConnectionsGame extends Game {
  constructor() {
    super();
    this.intervalID = undefined;
  }
  set displaying(state) {
    this._displaying = state;
    if (!state) {
      this.deinit();
    }
  }
  init() {
    let header = document.querySelector('#portal-game-header').querySelector('h1');
    header.style.display = "flex"; header.style.columnGap = "16px"; header.style.alignItems = "center";
    timer = header.querySelector('#portal-game-date').cloneNode(true);
    header.appendChild(timer);
    timer.innerText = "";
    this.updateGameInfo();
    let tempLocal = localStorage.getItem('connectionsTimer');
    if (tempLocal == undefined || tempLocal == "undefined") tempLocal = "{}"
    this.timerInfo = JSON.parse(tempLocal);
    this.timerInfo[this.gameInfo.dayOfTest] ??= 0;
    this.centiseconds = this.timerInfo[this.gameInfo.dayOfTest];
  }
  start() {
    if (!this._displaying) return
    this.intervalID = setInterval(() => {
      this.tick();
    }, 100)
    timer.style.display = "block";
  }
  deinit() {
    timer.style.display = "none";
    clearInterval(this.intervalID);
    localStorage.removeItem('connectionsTimer', JSON.stringify(this.timerInfo))
  }
  updateGameInfo() {
    this.gameInfo = JSON.parse(localStorage.getItem('nyt-connections-beta'));
    this.finished = this.gameInfo.groupsFound.length >= 3;
  }
  tick() {
    this.timerInfo[this.gameInfo.dayOfTest] = this.centiseconds++;
    if (this.timerInfo[this.gameInfo.dayOfTest] % 10 === 0) localStorage.setItem('connectionsTimer', JSON.stringify(this.timerInfo))
    this.updateTimer();
    if (this.finished) {
      clearInterval(this.intervalID);
      localStorage.setItem('connectionsTimer', JSON.stringify(this.timerInfo))
    }
  }
}

class StrandsGame extends Game {
  constructor() {
    super();
  }
  init() {
    let header = document.querySelector('#app').querySelectorAll('section')[0];
    timer = header.querySelector('h2').cloneNode();
    header.appendChild(timer);
    timer.innerHTML = "";
  }
}

function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}


function updateDisplaying(state) {
  if (!game) return
  game.displaying = state;
}


game = getGame();
if (game) game.init();
