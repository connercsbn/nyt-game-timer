let timer;
let game;
let started = false;

document.addEventListener('click', (e) => {
  if (started) return;
  if (e.target.innerText === "Play") {
    started = true;
    start()
    return;
  }
  if (e.target.type === "submit") {
    game.updateGameInfo();
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
    this.seconds = undefined;
    this.gameInfo = undefined;
    this.timer = undefined;
    this.finished = undefined;
  }
  updateTimer() {
    let hours = Math.floor(this.seconds / 3600); // 1 hour = 3600000 milliseconds
    let minutes = Math.floor(this.seconds / 60); // 1 minute = 60000 milliseconds
    let formattedTime = pad(hours) + ":" + pad(minutes) + ":" + pad(this.seconds % 60);
    timer.innerText = formattedTime;
  }
}

class ConnectionsGame extends Game {
  constructor() {
    super();
    this.intervalID = undefined;
  }
  init() {
    let header = document.querySelector('#portal-game-header').querySelector('h1');
    header.style.display = "flex"; header.style.columnGap = "16px"; header.style.alignItems = "center";
    timer = header.querySelector('#portal-game-date').cloneNode(true);
    header.appendChild(timer);
    timer.innerText = "";
    this.updateGameInfo();
    this.timerInfo = JSON.parse(localStorage.getItem('connectionsTimer') || "{}");
    this.timerInfo[this.gameInfo.dayOfTest] ??= 0;
    this.seconds = this.timerInfo[this.gameInfo.dayOfTest];
    this.intervalID = setInterval(() => {
      this.tick();
    }, 1000)
  }
  updateGameInfo() {
    this.gameInfo = JSON.parse(localStorage.getItem('nyt-connections-beta'));
    this.finished = this.gameInfo.groupsFound.length === 4;
  }
  tick() {
    this.timerInfo[this.gameInfo.dayOfTest] = this.seconds++;
    localStorage.setItem('connectionsTimer', JSON.stringify(this.timerInfo))
    this.updateTimer();
    if (this.finished) clearInterval(this.intervalID);
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

function start() {
  console.log("clicked on the button. starting timer.")
  startDate = new Date();
  game = getGame();
  game.init();
};


