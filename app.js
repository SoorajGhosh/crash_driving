//===============CANVAS=================

var canvas = (function(){
	var w, h, myCanvas;
	w = window.innerWidth;
	h = window.innerHeight;
	myCanvas = document.getElementById('myCanvas');
	myCanvas.width = w;
	myCanvas.height = h;
	ctx = myCanvas.getContext('2d')
	ctx.fillStyle='white';
	ctx.save();
	return {
		canvasPlane : myCanvas,
		context : ctx,
		canvasWidth: myCanvas.width,
		canvasHeight: myCanvas.height
	}
})();





//================RECTANGLE=================

var rectangle = function(xPos, yPos, width, height, color, image=false, text=false){
	this.xPos = xPos;
	this.yPos = yPos;
	this.width = width;
	this.height =height;
	this.color = color;
	this.image = image;
	this.text = text;
	this.draw = function(scr=0,psd=false,stopped=false){
		ctx = canvas.context;
		ctx.fillStyle = this.color;
		if (this.image){
			ctx.drawImage(this.image, this.xPos, this.yPos, this.width, this.height);
		} else if (this.text && (psd || stopped)){
			ctx.font = '50px Arial';
			ctx.textBaseline = "top";
			ctx.textAlign = 'center';
			ctx.fillText(this.text,this.xPos, this.yPos);
			ctx.font = '30px Arial';
			ctx.fillText('R (Restart)',this.xPos-10, this.yPos+170);
			if (psd){
				ctx.fillText('Esc (Unpause)',this.xPos-10, this.yPos+100);
			} else if (stopped) {
				ctx.font = '40px Arial';
				ctx.fillText('Score: '+scr, this.xPos-10, this.yPos+100);
			}			
		} else if (this.text){
			ctx.font = '20px Arial';
			ctx.textBaseline = "top";
			ctx.textAlign = 'left';
			ctx.fillText(this.text+scr,this.xPos, this.yPos);
			ctx.font = '18px Arial';
			ctx.fillText('Esc (Pause)',canvas.canvasWidth-110, this.yPos);
		} else {
			ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
		}
		ctx.restore();
	};
};




function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}



// ============================OBJECT ARRAY (for Multiple spawns and movements of same object)===================================

var objArr = function(obj, number=1, separation=0, positionObj, insidePosObj=false, randomMove=false){
	this.obj = obj;
	this.number = number;
	this.separation = separation;
	this.positionObj = positionObj;
	this.insidePosObj = insidePosObj;
	this.randomMove = randomMove;
	this.arr = []
}


// =====================Movement of Array Object======================

objArr.prototype.arrMove = function(speed) {
	if (this.arr.length===0){			// if new array objects are to be created
		for (var i=0; i<this.number; i++){
			this.obj.xPos = this.getPos(i)[0];
			this.obj.yPos = this.getPos(i)[1];
			newObj = new rectangle(this.obj.xPos, this.obj.yPos, this.obj.width, this.obj.height, this.obj.color, this.obj.image);
			this.arr.push(newObj);
		}
	} else {
		for (var i=0; i<this.arr.length; i++){
			var curArrObj = this.arr[i];
			if (curArrObj.yPos >= canvas.canvasHeight){
				var newPos = this.getPos(i,true);
				curArrObj.yPos = newPos[1];
				curArrObj.xPos = newPos[0];
			} else {
				curArrObj.yPos += speed;
			}
			curArrObj.draw();
		}
	}
};


// ===============Obtaining random x and y positions of objects=====================

objArr.prototype.getPos = function(curItemIdx,repeat=false){
	var posX,randPosXOutsideArr;
	if (this.randomMove){						// Randomly spawned objects
		// for X position
		if (this.insidePosObj){
			posX = getRndInteger(this.positionObj.xPos,(this.positionObj.xPos+this.positionObj.width)-this.obj.width);
		} else {
			randPosXOutsideArr = [getRndInteger(0,this.positionObj.xPos-this.obj.width),												//left of road
								getRndInteger((this.positionObj.xPos+this.positionObj.width),canvas.canvasWidth-this.obj.width)];		//right of road
			posX = randPosXOutsideArr[Math.round(Math.random())];
		}	
		// for Y position
		if (repeat){
			if (curItemIdx===0){
				posY = this.arr[this.arr.length-1].yPos-this.arr[curItemIdx].height-getRndInteger(this.obj.height, this.obj.height+this.separation);
			} else {
				posY = this.arr[curItemIdx-1].yPos-this.arr[curItemIdx].height-getRndInteger(this.obj.height, this.obj.height+this.separation);
			}
		} else if (curItemIdx===0){
			posY = this.obj.yPos;
		} else {
			posY = this.arr[curItemIdx-1].yPos-(this.arr[curItemIdx-1].height)-getRndInteger(this.obj.height, this.obj.height+this.separation);
		}

	} else {									// Organised spawned objects
		posX = this.obj.xPos;
		if (repeat){
			var curObj = this.arr.pop();
			this.arr.unshift(curObj);
			posY = this.arr[1].yPos-(curObj.height)-this.separation;
		}else if (curItemIdx===0){
			posY = this.obj.yPos;
		} else {
			posY = this.arr[curItemIdx-1].yPos+this.arr[curItemIdx-1].height+this.separation;
		}
	}
	
	return [posX,posY]
}





// ==================Main Function to animate=========================

var main = (function(){
	var roadSpeed=4, enemyCarSpeed=0, playerSpeed=0, score=0, paused=false, stopped=false;
	var road, barrierLeft, barrierLeftArr, barrierRight, barrierRightArr, playerCar, enemyCar, enemyCarArr, tree, treeArr, strip, stripArr, scoreText, pausedMenu, pausedText, gameOverText

	function setVariables(){
		road = new rectangle(xPos=(canvas.canvasWidth/4)*1.5, yPos=0, 
					width=canvas.canvasWidth/4, height=canvas.canvasHeight, 
					color='rgb(43,42,42)');
	
		barrierLeft = new rectangle(xPos=(canvas.canvasWidth/4)*1.5-(canvas.canvasWidth/75), yPos=0, 
								width=canvas.canvasWidth/75, height=canvas.canvasHeight/8, 
								color='rgb(110, 50, 21)');
		barrierLeftArr = new objArr(barrierLeft,(canvas.canvasHeight/barrierLeft.height)+1,5,road,true);

		barrierRight = new rectangle(xPos=(canvas.canvasWidth/4)*1.5+(canvas.canvasWidth/4), yPos=0, 
								width=canvas.canvasWidth/75, height=canvas.canvasHeight/8, 
								color='rgb(110, 50, 21)');
		barrierRightArr = new objArr(barrierRight,(canvas.canvasHeight/barrierRight.height)+1,5,road,false);
		
		playerCar = new rectangle(xPos=(canvas.canvasWidth/20)*9.5, yPos=(canvas.canvasHeight-(canvas.canvasHeight/5)*1.2), 
								width=canvas.canvasWidth/20, height=canvas.canvasHeight/5,
								color='rgb(235, 64, 52)', image=document.getElementById('player-car-image')
							);
		
		enemyCar = new rectangle(xPos=(canvas.canvasWidth/20)*9.5, yPos=10, 
								width=canvas.canvasWidth/20, height=canvas.canvasHeight/5,
								color='rgb(64, 235, 52)', image=document.getElementById('enemy-car-image')
							);
		enemyCarArr = new objArr(enemyCar,3,150,road,true,true);

		tree = new rectangle(xPos=(canvas.canvasWidth/16), yPos=10, 
								width=canvas.canvasHeight/4, height=canvas.canvasHeight/4,
								color='rgb(64, 235, 52)', image=document.getElementById('tree-image')
							);
		treeArr = new objArr(tree,5,5,road,false,true);

		strip = new rectangle(xPos=(canvas.canvasWidth/52)*25.5, yPos=0, 
							width=canvas.canvasWidth/52, height=canvas.canvasHeight/4,
							color='rgb(225, 232, 242)'
						);
		stripArr = new objArr(strip, (canvas.canvasHeight/strip.height)+1, 20,road,true);

		scoreText = new rectangle(xPos=10, yPos=10, 
							width=150, height=50,
							color='rgb(0,0,0)', false, 'SCORE: '
						);
		pausedMenu = new rectangle(xPos=(canvas.canvasWidth/2)*0.5, yPos=(canvas.canvasHeight/2)*0.5, 
						width=canvas.canvasWidth/2, height=canvas.canvasHeight/2, 
						color='rgba(0,0,0, 0.7)');							//102, 108, 196,

		pausedText = new rectangle(xPos=(canvas.canvasWidth/20)*10, yPos=(canvas.canvasHeight/3), 
							width=canvas.canvasWidth/20, height=canvas.canvasHeight/3,
							color='rgb(245, 5, 49)', false, 'Paused'
						);
		
		gameOverText = new rectangle(xPos=(canvas.canvasWidth/20)*10, yPos=(canvas.canvasHeight/3), 
							width=canvas.canvasWidth/20, height=canvas.canvasHeight/3,
							color='rgb(245, 5, 49)', false, 'Game Over !'
						);
	}
	
	
	// Player Car Movements 
	window.addEventListener('keydown',function(event){
		if (event.key==="ArrowLeft"){			// Left
			playerCar.xPos -= playerSpeed;
		} else if (event.key==="ArrowRight"){	// Right
			playerCar.xPos += playerSpeed;
		} else if (event.key==="ArrowUp"){		// Top
			playerCar.yPos -= playerSpeed;
		} else if (event.key==="ArrowDown"){	// Down
			playerCar.yPos += playerSpeed;
		}else if (event.key==="Escape"){		// Pause or Play
			if (!stopped){
				if (paused){
					roadSpeed = 4;
					paused=false;
				} else {
					roadSpeed=0;
					paused=true;
				}
			}	
		}else if (event.key==="r" && (paused || stopped)){			// Play Again
			console.log('r pressed');
			setVariables();
			if (paused){
				roadSpeed = 4;
				paused=false;
				score=0;
			}
			if (stopped){
				roadSpeed = 4;
				stopped=false;
				score=0;
			}
		}
	});

	
	// Road Crash Test
	function roadCrash(){
		var playerCarBoundary, roadBoundary;
		playerCarBoundary = [playerCar.xPos, playerCar.xPos+playerCar.width, playerCar.yPos, playerCar.yPos+playerCar.height];
		roadBoundary = [road.xPos, road.xPos+road.width, road.yPos, road.yPos+road.height]
		if (playerCarBoundary[0]<roadBoundary[0] || playerCarBoundary[1]>roadBoundary[1] || playerCarBoundary[2]<roadBoundary[2] || playerCarBoundary[3]>roadBoundary[3]){
			return true;
		} else {
			return false;
		}
	}

	// Enemy Car Crash Test
	function enemyCarCrash(enemyCars){
		var playerCarBoundary, enemyCarObj, enemyCarBoundary;
		playerCarBoundary = [playerCar.xPos, playerCar.xPos+playerCar.width, playerCar.yPos, playerCar.yPos+playerCar.height];
		for (var i=0; i<enemyCars.length; i++) {
			enemyCarObj = enemyCars[i];
			enemyCarObjBoundary = [enemyCarObj.xPos, enemyCarObj.xPos+enemyCarObj.width, enemyCarObj.yPos, enemyCarObj.yPos+enemyCarObj.height];
			if (( (enemyCarObjBoundary[3]>=playerCarBoundary[2] && playerCarBoundary[2]>=enemyCarObjBoundary[2]) ||			// To check the crash of enemy car and player car
				( (enemyCarObjBoundary[2]<=playerCarBoundary[3] && playerCarBoundary[3]<=enemyCarObjBoundary[3]))) && 
				( (enemyCarObjBoundary[1]>=playerCarBoundary[0] && playerCarBoundary[0]>=enemyCarObjBoundary[0]) || 
					(enemyCarObjBoundary[0]<=playerCarBoundary[1] && playerCarBoundary[1]<=enemyCarObjBoundary[1]) )) {
				return true;
			} else if (playerCarBoundary[3]<enemyCarObjBoundary[2] && playerCarBoundary[3]>enemyCarObjBoundary[2]-2) {		// To check if an enemy car has passed and increase the score
				score+=1;
			}
		}
	}

	function animate(){
		playerSpeed = (roadSpeed===0) ? 0 : roadSpeed+2;
		enemyCarSpeed = (roadSpeed===0) ? 0 : roadSpeed-2;
		canvas.context.clearRect(0, 0, canvas.canvasWidth, canvas.canvasHeight);
		road.draw();
		treeMove = treeArr.arrMove(roadSpeed);
		stripMove = stripArr.arrMove(roadSpeed);
		barrierLeftMove = barrierLeftArr.arrMove(roadSpeed);
		barrierRightMove = barrierRightArr.arrMove(roadSpeed);
		enemyCarMove = enemyCarArr.arrMove(enemyCarSpeed);
		scoreText.draw(score);
		playerCar.draw();
		
		if (paused){											// Check If Paused
			if (!stopped){
				pausedMenu.draw();
				pausedText.draw(score,true);
			}
		}
		
		if (roadCrash() || enemyCarCrash(enemyCarArr.arr)){		// check if crashded and show the game over text
			console.log('Crashed');
			pausedMenu.draw();
			gameOverText.draw(score,false,true);	
			stopped = true;
			roadSpeed = 0;
		} 
		window.requestAnimationFrame(animate);
	};


	return {
		init: function(){
			console.log('New Game Started..!');
			setVariables();
			window.requestAnimationFrame(animate);
		}

	}
	
})();


