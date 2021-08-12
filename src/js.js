"use strict";

/**
 * DTO object with default game settings that can be changed when the game is initialized.
 * @property {int} rowsCount Number of lines.
 * @property {int} colsCount Number of columns.
 * @property {int} speed Snake speed.
 * @property {int} winLength Snake length for victory.
 */
const settings = {
  rowsCount: 21,
  colsCount: 21,
  speed: 2,
  winFoodCount: 50,
};

/**
 * A game config object containing methods for getting settings and checking these settings.
 * @property {settings} settings Game settings.
 */
const config = {
  settings,

  /**
   * Initializing game settings.
   * @param {Object} userSettings Object with custom game settings.
   */
  init(userSettings) {
    Object.assign(this.settings, userSettings);
  },

  /**
   * @returns {int} Gives the number of lines in the game.
   */
  getRowsCount() {
    return this.settings.rowsCount;
  },

  /**
   * @returns {int} Gives the number of columns in the game.
   */
  getColsCount() {
    return this.settings.colsCount;
  },

  /**
   * @returns {int} Gives the speed of the snake in the game.
   */
  getSpeed() {
    return this.settings.speed;
  },

  /**
   * @returns {int} Gives the speed of the snake in the game.
   */
  getWinFoodCount() {
    return this.settings.winFoodCount;
  },

  /**
   * Checking Game Settings Values.
   * @returns {{isValid: boolean, errors: Array}} Validation result as an object with errors.
   */
  validate() {
    /**
     * DTO with validation results.
     * @property {boolean} isValid true if the settings are valid, otherwise false.
     * @property {string[]} errors an array with all configuration errors.
     */
    const result = {
      isValid: true,
      errors: [],
    };

    if (this.settings.rowsCount < 10 || this.settings.rowsCount > 30) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].');
    }

    if (this.settings.colsCount < 10 || this.settings.colsCount > 30) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение colsCount должно быть в диапазоне [10, 30].');
    }

    if (this.settings.speed < 1 || this.settings.speed > 10) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение speed должно быть в диапазоне [1, 10].');
    }

    if (this.settings.winFoodCount < 5 || this.settings.winFoodCount > 50) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение winLength должно быть в диапазоне [5, 50].');
    }

    return result;
  },
};

/**
 * Map object with methods for displaying and creating a playing field.
 * @property {Object} cells An object containing all the cells of the game.
 * @property {Array} usedCells An array containing all occupied cells of the game.
 */
const map = {
  cells: null,
  usedCells: null,

  /**
   * The method initializes and displays the game map.
   * @param {int} rowsCount Number of lines in the map.
   * @param {int} colsCount Number of columns in the map.
   */
  init(rowsCount, colsCount) {
    const table = document.getElementById('game');
    table.innerHTML = "";

    this.cells = {};
    this.usedCells = [];

    for (let row = 0; row < rowsCount; row++) {
      const tr = document.createElement('tr');
      tr.classList.add('row');
      table.appendChild(tr);
      for (let col = 0; col < colsCount; col++) {
        const td = document.createElement('td');
        td.classList.add('cell');
        this.cells[`x${col.toString()}_y${row.toString()}`] = td;
        tr.appendChild(td);
      }
    }
  },

  /**
   * Displays all objects on the map.
   * @param {{x: int, y: int}[]} snakePointsArray Snake point array.
   * @param {{x: int, y: int}} foodPoint Food point.
   * @see {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach|Array.prototype.forEach()}
   */
  render(snakePointsArray, foodPoint) {
    for (const cell of this.usedCells) {
      cell.className = 'cell';
    }
    this.usedCells = [];

    snakePointsArray.forEach((point, idx) => {
      const snakeCell = this.cells[`x${point.x}_y${point.y}`];
      snakeCell.classList.add(idx === 0 ? 'snakeHead' : 'snakeBody');
      this.usedCells.push(snakeCell);
    });

    const foodCell = this.cells[`x${foodPoint.x}_y${foodPoint.y}`];
    foodCell.classList.add('food');
    this.usedCells.push(foodCell);
  },
};

/**
 * Snake object.
 * @property {{x: int, y: int}[]} body Snake body point array.
 * @property {string} direction The direction the user has directed the snake.
 * @property {string} lastStepDirection The direction where the snake went last time.
 * @property {int} maxX The maximum position of the snake on the map along the X axis.
 * @property {int} maxY The maximum position of the snake on the map along the Y axis.
 */
const snake = {
  body: null,
  direction: null,
  lastStepDirection: null,
  maxX: null,
  maxY: null,

  /**
   * Initializes the snake where it will start from and its direction.
   * @param {{x: int, y: int}[]} startBody The starting position of the snake.
   * @param {string} direction Player's initial direction.
   * @param {int} maxX Maximum snake position on the X-axis.
   * @param {int} maxY Maximum position of the snake along the Y-axis.
   */
  init(startBody, direction, maxX, maxY) {
    this.body = startBody;
    this.direction = direction;
    this.lastStepDirection = direction;
    this.maxX = maxX;
    this.maxY = maxY;
  },

  /**
   * Gives an array with all the snake points.
   * @return {{x: int, y: int}[]};
   */
  getBody() {
    return this.body;
  },

  /**
   * Gives the past direction of the snake.
   */
  getLastStepDirection() {
    return this.lastStepDirection;
  },

  /**
   * Checks if the snake contains the transmitted point.
   * @see {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/some|Array.prototype.some()}
   * @param {{x: int, y: int}} point Point to check.
   * @returns {boolean} true if the snake contains the given point, otherwise false.
   */
  isOnPoint(point) {
    return this.body.some(snakePoint => snakePoint.x === point.x && snakePoint.y === point.y);
  },

  /**
   * Moves the snake one step.
   */
  makeStep() {
    this.lastStepDirection = this.direction;
    this.body.unshift(this.getNextStepHeadPoint());
    this.body.pop();
  },

  /**
   * Adds a copy of the last snake element to the end of the snake body.
   */
  growUp() {
    const lastBodyIdx = this.body.length - 1;
    const lastBodyPoint = this.body[lastBodyIdx];
    const lastBodyPointClone = Object.assign({}, lastBodyPoint);
    this.body.push(lastBodyPointClone);
  },

  /**
   * Gives the point where the snake's head will be if it takes a step.
   * @returns {{x: int, y: int}} The next point where the snake will come after taking a step.
   */
  getNextStepHeadPoint() {
    const firstPoint = this.body[0];
    switch (this.direction) {
      case 'up':
        return {x: firstPoint.x, y: firstPoint.y !== 0 ? firstPoint.y - 1 : this.maxY};
      case 'right':
        return {x: firstPoint.x !== this.maxX ? firstPoint.x + 1 : 0, y: firstPoint.y};
      case 'down':
        return {x: firstPoint.x, y: firstPoint.y !== this.maxY ? firstPoint.y + 1 : 0};
      case 'left':
        return {x: firstPoint.x !== 0 ? firstPoint.x - 1 : this.maxX, y: firstPoint.y};
    }
  },

  /**
   * Sets the direction of the snake.
   * @param {string} direction Snake direction.
   */
  setDirection(direction) {
    this.direction = direction;
  },
};

/**
 * Food object.
 * @property {int} x X coordinate of food.
 * @property {int} y Y coordinate of food.
 */
const food = {
  x: null,
  y: null,

  /**
   * Gives food coordinates.
   * @returns {{x: int, y: int}} Food coordinates.
   */
  getCoordinates() {
    return {
      x: this.x,
      y: this.y,
    }
  },

  /**
   * Sets coordinates for food.
   * @param {{x: int, y: int}} point New point with food coordinates.
   */
  setCoordinates(point) {
    this.x = point.x;
    this.y = point.y;
  },

  /**
   * Determines whether the point on which the food is located corresponds to the point that was transferred.
   * @param {{x: int, y: int}} point Point to check compliance with the food point.
   * @returns {boolean} true if the points match, otherwise false.
   */
  isOnPoint(point) {
    return this.x === point.x && this.y === point.y;
  },
};

/**
 * Game status.
 * @property {string} condition Game status.
 */
const status = {
  condition: null,

  /**
   * Sets the status to "playing".
   */
  setPlaying() {
    this.condition = 'playing';
  },

  /**
   * Sets the status to "stopped".
   */
  setStopped() {
    this.condition = 'stopped';
  },

  /**
   * Sets the status to "finished".
   */
  setFinished() {
    this.condition = 'finished';
  },

  /**
   * Checks if the status is "playing".
   * @returns {boolean} true, if the status is "playing", otherwise false.
   */
  isPlaying() {
    return this.condition === 'playing';
  },

  /**
   * Checks if the status is "stopped".
   * @returns {boolean} true, if the status is "stopped", otherwise false.
   */
  isStopped() {
    return this.condition === 'stopped';
  },
};

/**
 * Counter object. Calculates the user's score.
 * @property {int} count User points.
 * @property {HTMLElement} countEl DOM element for inserting a number representing the user's score.
 */
const score = {
  count: null,
  countEl: null,

  /**
   * Initializes counter.
   */
  init() {
    this.countEl = document.getElementById('score-count');
    this.drop();
  },

  /**
   * Increments the counter.
   */
  increment() {
    this.count++;
    this.render();
  },

  /**
   * Resets counter.
   */
  drop() {
    this.count = 0;
    this.render();
  },

  /**
   * Displays the number of points to the user.
   */
  render() {
    this.countEl.textContent = this.count;
  }
};

/**
 * Game object.
 * @property {settings} settings Game settings.
 * @property {map} map Display object.
 * @property {snake} snake Snake object.
 * @property {food} food Food object.
 * @property {status} status Game status.
 * @property {score} score Game counter.
 * @property {int} tickInterval Номер интервала игры.
 */
const game = {
  config,
  map,
  snake,
  food,
  status,
  score,
  tickInterval: null,

  /**
   * Initializing the game.
   * @param {object} userSettings Game settings that can be changed.
   */
  init(userSettings) {
    this.config.init(userSettings);
    const validation = this.config.validate();
    if (!validation.isValid) {
      for (const err of validation.errors) {
        console.error(err);
      }
      return;
    }
    this.map.init(this.config.getRowsCount(), this.config.getColsCount());
    this.score.init();
    this.setEventHandlers();
    this.reset();
  },

  /**
   * Puts the game to the starting position.
   */
  reset() {
    this.stop();
    this.score.drop();
    this.snake.init(this.getStartSnakeBody(),
      'up',
      this.config.getColsCount() - 1,
      this.config.getRowsCount() - 1);
    this.food.setCoordinates(this.getRandomFreeCoordinates());
    this.render();
  },

  /**
   * Set the game status to "play".
   */
  play() {
    this.status.setPlaying();
    this.tickInterval = setInterval(() => this.tickHandler(), 1000 / this.config.getSpeed());
    this.setPlayButton('Стоп');
  },

  /**
   * Put the game status in "stop".
   */
  stop() {
    this.status.setStopped();
    clearInterval(this.tickInterval);
    this.setPlayButton('Старт');
  },

  /**
   * Put the game status in "finish".
   */
  finish() {
    this.status.setFinished();
    clearInterval(this.tickInterval);
    this.setPlayButton('Игра закончена', true);
  },

  /**
   * Game tick event handler when the snake should move.
   */
  tickHandler() {
    if (!this.canMakeStep()) {
      return this.finish();
    }
    if (this.food.isOnPoint(this.snake.getNextStepHeadPoint())) {
      this.snake.growUp();
      this.score.increment();
      this.food.setCoordinates(this.getRandomFreeCoordinates());
      if (this.isGameWon()) {
        this.finish();
      }
    }
    this.snake.makeStep();
    this.render();
  },

  /**
   * Changing the button with the playButton class.
   * @param {string} textContent Button text.
   * @param {boolean} [isDisabled = false] Should the button be locked.
   */
  setPlayButton(textContent, isDisabled = false) {
    const playButton = document.getElementById('playButton');
    playButton.textContent = textContent;
    isDisabled ? playButton.classList.add('disabled') : playButton.classList.remove('disabled');
  },

  /**
   * Returns the starting position of the snake in the center of the map.
   * @returns {{x: int, y: int}[]} Snake starting point.
   */
  getStartSnakeBody() {
    return [{
      x: Math.floor(this.config.getColsCount() / 2),
      y: Math.floor(this.config.getRowsCount() / 2)
    }];
  },

  /**
   * Puts event handlers.
   */
  setEventHandlers() {
    document
      .getElementById('playButton')
      .addEventListener('click', () => this.playClickHandler());
    document
      .getElementById('newGameButton')
      .addEventListener('click', event => this.newGameClickHandler(event));
    document
      .addEventListener('keydown', event => this.keyDownHandler(event));
  },

  /**
   * Displays everything for the game, map, food and snake.
   */
  render() {
    this.map.render(this.snake.getBody(), this.food.getCoordinates());
  },

  /**
   * Gives a random unoccupied point on the map.
   * @return {{x: int, y: int}} Point with coordinates.
   */
  getRandomFreeCoordinates() {
    const exclude = [this.food.getCoordinates(), ...this.snake.getBody()];
    while (true) {
      const rndPoint = {
        x: Math.floor(Math.random() * this.config.getColsCount()),
        y: Math.floor(Math.random() * this.config.getRowsCount()),
      };
      if (!exclude.some(exPoint => rndPoint.x === exPoint.x && rndPoint.y === exPoint.y)) {
        return rndPoint;
      }
    }
  },

  /**
   * PlayButton button click event handler.
   */
  playClickHandler() {
    if (this.status.isPlaying()) {
      this.stop();
    } else if (this.status.isStopped()) {
      this.play();
    }
  },

  /**
   * The event handler for clicking the "New game" button.
   */
  newGameClickHandler() {
    this.reset();
  },

  /**
   * Keyboard button click event handler.
   * @param {KeyboardEvent} event
   */
  keyDownHandler(event) {
    if (!this.status.isPlaying()) {
      return;
    }
    const direction = this.getDirectionByCode(event.code);
    if (this.canSetDirection(direction)) {
      this.snake.setDirection(direction);
    }
  },

  /**
   * Gives the direction of the snake depending on the transmitted code of the pressed key.
   * @param {string} code Pressed key code.
   * @returns {string} Snake direction.
   */
  getDirectionByCode(code) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        return 'up';
      case 'KeyD':
      case 'ArrowRight':
        return 'right';
      case 'KeyS':
      case 'ArrowDown':
        return 'down';
      case 'KeyA':
      case 'ArrowLeft':
        return 'left';
      default:
        return '';
    }
  },

  /**
   * Determines if the transmitted direction can be assigned to the snake.
   * @param {string} direction Direction we check.
   * @returns {boolean} true if the direction can be assigned to the snake, otherwise false.
   */
  canSetDirection(direction) {
    const lastStepDirection = this.snake.getLastStepDirection();
    return direction === 'up' && lastStepDirection !== 'down' ||
      direction === 'right' && lastStepDirection !== 'left' ||
      direction === 'down' && lastStepDirection !== 'up' ||
      direction === 'left' && lastStepDirection !== 'right';
  },

  /**
   * Check whether there has been a victory judging by the player's points (the length of the snake).
   * @returns {boolean} true, if the player won the game, otherwise false.
   */
  isGameWon() {
    return this.snake.getBody().length > this.config.getWinFoodCount();
  },

  /**
   * Checks if the next step is possible.
   * @returns {boolean} true if the next step of the snake is possible, false if the step cannot be taken.
   */
  canMakeStep() {
    return !this.snake.isOnPoint(this.snake.getNextStepHeadPoint());
  },
};

document.addEventListener('load', () => {
  game.init({speed: 5});
});
