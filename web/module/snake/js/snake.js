/**
 * author: sunquan 2017/3/9.
 *
 * 本文件用js语言实现一个贪吃蛇类；
 */
function Snake(para) {
  // 在新建蛇时可以修改的参数
  this.gameSpeed = para.gameSpeed; //游戏开场时的速度
  this.gameOver = para.gameOver;
  // 初始化的参数
  this.snakeBody = [];  // 蛇的身体
  this.eggNum = 0;      // 蛋的个数
  this.headerTr = 0;    // 蛇头的横坐标
  this.headertd = 0;    // 蛇头的纵坐标
  this.tds = [];        // 装整个棋盘的方块
  this.block = '';      // 染了色的方块
  this.timer = '';      // 初始一个计时器
  this.preDirection;    // 第一个蛇头的方向
  this.timeBegin = 0;   // 游戏计时变量
  this.timeWatch = '';  // 统计游戏持续时间
  this.direction = 'down';
  this.begin = false; // 游戏是否开始
}

// 蛇的转向
Snake.prototype.turn = function () {
  var that = this;
  that.direction = arguments[0];
  // 如果是第一次按按钮，开始游戏即时
  if(!that.begin && that.direction){
    that.updateTime(true);
    that.begin = true;
  }

  // 限制回退操作
  if ((that.preDirection === "left" && that.direction === "right") || (that.preDirection === "right" && that.direction === "left")) {
    return;
  } else if ((that.preDirection === "up" && that.direction === "down") || (that.preDirection === "down" && that.direction === "up")) {
    return;
  }
  that.preDirection = that.direction;

  if (that.direction === "left") {
    this.headertd -= 1;
  } else if (that.direction === "right") {
    this.headertd += 1;
  } else if (that.direction === "up") {
    this.headerTr -= 1;
  } else if (that.direction === "down") {
    this.headerTr += 1;
  }

  if (this.headertd > 29 || this.headerTr > 29 || this.headertd < 0 || this.headerTr < 0) {   //判断点击了方向键后，下一个移动的方块，是否碰到墙壁
    if (that.timer) {
      window.clearInterval(that.timer);
      that.timer = null;
      this.updateTime(false);
      that.gameOver({
        score: that.eggNum,
        time: that.timeBegin + 's',
        overReason: window.parent.i18next.t('game.snake.result.title.wall'),
      });
    } else {
      return null;
    }
  } else if (this.biteMyself()) {
    clearInterval(that.timer);
    this.updateTime(false);
    window.clearInterval(that.timer);
    that.gameOver({
      score: that.eggNum,
      time: that.timeBegin + 's',
      overReason: window.parent.i18next.t('game.snake.result.title.yourself'),
    });
  } else {                          //点击了方向键后，下一个移动的方块，不咬自己也不碰墙的逻辑处理
    if (this.snakeBody[this.snakeBody.length - 1] === this.block) {      //点击了方向键后，下一个移动的方块，刚好是蛋
      this.createEgg();
      this.snakeBody[0].style.backgroundColor = "black";
    } else {                                                            //点击了方向键后，下一个移动的方块，不是蛋
      this.snakeBody[0].style.backgroundColor = "rgb(88, 104, 88)";     //蛇身体那个数组的第一个元素恢复成棋盘的背景颜色，
      this.snakeBody[0].style.border = "3px solid rgb(88, 104, 88)";
      // 如果吃了蛇蛋后，清除最后一个蛇蛋的样式
      this.snakeBody[0].style.borderRadius = "0px";
      this.snakeBody[0].style.boxShadow = '0px 0px 0px 3px rgb(103,120,104) inset';
      this.snakeBody.shift();                                           //删除蛇身数组第一个元素
    }

    //给蛇身数组添加对应方向上的下一个方块。配合上面删除数组第一个元素并恢复背景色的操作，表现出一种往前挪到的动画
    this.snakeBody.push(this.tds[this.headerTr][this.headertd]);
    this.snakeBody[this.snakeBody.length - 1].style.backgroundColor = "black";
    this.snakeBody[this.snakeBody.length - 1].style.border = "3px solid black";
  }
};

/**
 * 随机的给一个方块上色
 * color:方块的背景色，和边框颜色
 */
Snake.prototype.createRandomBlock = function (color,init) {
  var horizon, vertical;

  // 初始化时随机渲染一个黑色块作为蛇身
  if (color === 'black') {
    horizon = init ? 15 : parseInt(Math.random() * 30);
    vertical = init ? 15 : parseInt(Math.random() * 30);
    this.block = this.tds[horizon][vertical];
    this.block.style.backgroundColor = color;
    this.block.style.border = "3px solid " + color;
  } else {//之后会持续创建白块作为蛋
    do {
      horizon = init ? 20 : parseInt(Math.random() * 30);
      vertical = init ? 15 : parseInt(Math.random() * 30);
      this.block = this.tds[horizon][vertical];
      this.block.style.backgroundColor = color;
      this.block.style.border = "3px solid " + color;
      this.block.style.boxShadow = "none";
      this.block.style.borderRadius = "10px";
    } while (this.snakeBody.indexOf(this.block) !== -1);   // 如果随机生成的蛋刚好在蛇身里，重新生成；
  }
  return {horizon: horizon, vertical: vertical};
}

/**
 * 创建一个新的蛋，并刷新游戏成绩，提高游戏速度
 */
Snake.prototype.createEgg = function (init) {
  if(init){
    this.createRandomBlock('white',init);
  }else{
    this.createRandomBlock('white');
  }
  // 更新得分
  document.getElementsByClassName("score")[1].innerHTML = this.eggNum;
  this.eggNum += 1; // 已吃鸡蛋计数

  if (this.gameSpeed < 150) {
    this.gameSpeed = this.gameSpeed - 2;
  }
  this.beginGame();
}

// 判断蛇是否咬到自己
Snake.prototype.biteMyself = function () {
  for (var b = 0, snakelength = this.snakeBody.length - 1; b < snakelength; b++) {
    if (this.snakeBody[snakelength] === this.snakeBody[b]) {
      return true;
    }
  }
  return false;
}

// 画棋盘，即地图
Snake.prototype.drawChessBoard = function () {
  /*画棋盘 把所有td装到一个二维数组里*/
  var chessboard = document.getElementById('chessboard');
  for (var i = 0; i < 30; i++) {
    // 插入一个行元素，appendChild还返回插入的节点
    var thistr = chessboard.appendChild(document.createElement('tr')); //
    var thistds = [];
    // 给行元素插入30个列元素
    for (var k = 0; k < 30; k++) {
      thistds[k] = thistr.appendChild(document.createElement('td'));
    }
    // 这样，数组tds的每一个值，又都是一个数组。通过两层下标就可以准确的取到对应的td块
    this.tds[i] = thistds;
  }
}

// 监听上下左右四个按键
Snake.prototype.listenKeyDown = function () {
  var that = this;
  window.addEventListener("keydown", function (e) {
    if (e.keyCode === 40) {
      that.turn("down");
    } else if (e.keyCode === 37) {
      that.turn("left");
    } else if (e.keyCode === 39) {
      that.turn("right");
    } else if (e.keyCode === 38) {
      that.turn("up");
    }
  });
};

// 游戏计时
Snake.prototype.updateTime = function (close) {
  var that = this;//给游戏更新持续时间;
  if (close) {
    that.timeWatch = window.setInterval(function () {
      that.timeBegin += 1;
      document.getElementsByClassName('time')[0].innerHTML = that.timeBegin;
    }, 1000);
  } else {
    window.clearInterval(that.timeWatch);
    that.timeWatch = 0;
  }
}

// 游戏开场的上下动画
Snake.prototype.upDownAnimation = function (callback) {
  var that = this,
    trNum = -1,
    tdNum = 30

  // 上下动画
  var upDownInter = window.setInterval(function () {
    trNum += 1;
    tdNum -= 1;

    if (trNum < 30) {
      for (var i = 0; i < 29; i = i + 2) {
        that.tds[trNum][i].style.backgroundColor = 'black';
        that.tds[trNum][i].style.border = '3px solid black';
      }

      for (var t = 29; t > -1; t = t - 2) {
        that.tds[tdNum][t].style.backgroundColor = 'black';
        that.tds[tdNum][t].style.border = '3px solid black';
      }
    } else {
      window.clearInterval(upDownInter);
      that.leftRightAnimation(callback);
    }
  }, 50);
}

// 游戏开场的左右动画
Snake.prototype.leftRightAnimation = function (callback) {
  var that = this,
    leftRightTdStart = -1,
    leftRightTdEnd = 30;

  // 左右动画
  var leftRightInter = window.setInterval(function () {
    leftRightTdStart += 1;
    leftRightTdEnd -= 1;

    if (leftRightTdStart < 30) {
      for (var i = 0; i < 29; i = i + 2) {
        that.tds[i][leftRightTdStart].style.backgroundColor = 'rgb(88, 104, 88)';
        that.tds[i][leftRightTdStart].style.border = '3px solid rgb(88, 104, 88)';
      }

      for (var t = 29; t > -1; t = t - 2) {
        that.tds[t][leftRightTdEnd].style.backgroundColor = 'rgb(88, 104, 88)';
        that.tds[t][leftRightTdEnd].style.border = '3px solid rgb(88, 104, 88)';
      }
    } else {
      window.clearInterval(leftRightInter);
      callback();
    }
  }, 50);
}

Snake.prototype.beginGame = function () {
  var that = this;
  if (that.timer) {
    clearInterval(that.timer);
    that.timer = null;
  }
  that.timer = window.setInterval(function () {
    that.turn(that.direction);  //如果不按方向键，程序会定时循环调用turn方法，并传入目前的方向。玩家看到的就是不操作键盘时，蛇一直朝着一个方向向前游
  }, that.gameSpeed);
}


