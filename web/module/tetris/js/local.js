var Local = function()
{
	var game ; 
	var INERVAL = 500 ;
	var timer = null ;
	var timeCount = 0 ;
	var time = 0 ;
	// bind key event
	var bindKeyEvent = function()
	{
		document.onkeydown = function(e) {
			if(e.keyCode === 38)  // up
			{
				game.rotate();
			} else if(e.keyCode === 39) // right
			{
				game.right();
			} else if(e.keyCode === 40) // down
			{
				game.down();
			} 
			else if(e.keyCode === 37)  // left
			{
				game.left();
			} 
			else if(e.keyCode === 32)  // space
			{
				game.fall();
			} 
		}
		document.getElementById('left').addEventListener('click', () => {game.left();})
		document.getElementById('right').addEventListener('click', () => {game.right();})
		document.getElementById('up').addEventListener('click', () => {game.rotate();})
		document.getElementById('down').addEventListener('click', () => {game.down();})
	}

	var move = function(){
		timeFunc();
		if(!game.down())
		{
			game.fixed();
			var line = game.checkClear();
			if(line)
			{
				game.addSocre(line);
			}
			if(game.checkGameOver())
			{
				game.gameOver(false);
				stop()
			}
			else
			{
				game.preformNext(generateType(),generateDir());
			}
		}
	}

	// 随机生成干扰行
	var generateBottomLine = function(lineNum)
	{
		var lines = [];
		for(var i = 0 ;i < lineNum; i++)
		{
			var line = [];
			for(var j = 0 ; j < 10 ; j++)
			{
				line.push(Math.ceil(Math.random()*2)-1);
			}
			lines.push(line);
		}
		return lines ;
	}
	// timeCount 
	var timeFunc = function()
	{
		timeCount = timeCount + 1 ;
		if(timeCount === 5)
		{
			timeCount = 0 ;
			time = time + 1 ;
			game.setTime(time);
			//  每隔10秒生成从底部生成干扰项
			// if(time % 10 === 0)
			// 	game.addTailLines(generateBottomLine(1));
		}
	}
	// rand for 0 - 6
	var generateType = function()
	{
		return Math.ceil(Math.random()*7)-1 ;
	}
	// rand for 0 - 3
	var generateDir = function()
	{
		return Math.ceil(Math.random()*4)-1 ;
	}
	var start = function(){
		var dom = 
		{
			gameDiv:document.getElementById("local_game"),
			nextDiv:document.getElementById("local_next"),
			timeDiv:document.getElementById("local_time"),
			scoreDiv:document.getElementById("local_score"),
			infoDiv:document.getElementsByClassName("info")[0]
		}	
		game = new Game();
		game.init(dom,generateType(),generateDir());
		bindKeyEvent();
		game.preformNext(generateType(),generateDir());
		timer = setInterval(move,INERVAL);

	}

	var stop = function()
	{
		if(timer)
		{
			clearInterval(timer);
			document.onkeydown = null ;
		}
	}
	// report fun
	this.start = start ;
}