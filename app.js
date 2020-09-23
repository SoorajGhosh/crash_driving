/*

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


//===============RECTANGLE=================
var drawRect = function(x,y,w,h,col){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height =h;
	this.color = col;
	this.draw = function(image){
		ctx = canvas.context;
		ctx.fillStyle = col;
		if (image){
			ctx.drawImage(image, x, y, w, h);
		}else{
			ctx.fillRect(x, y, w, h);
		}
		ctx.restore();
	};
};


//===============ROAD===================

var rectangles = (function(canvas){
	var roadObj = function(){
		var roadColor, roadWidth, roadHeight, roadPos;
		roadColor = 'rgb(43,42,42)';
		roadWidth = canvas.canvasWidth/4;
		roadHeight = canvas.canvasHeight;
		roadPos = [roadWidth*1.5,0];
		roadRect = new drawRect(roadPos[0], roadPos[1], roadWidth,roadHeight, roadColor);
		roadRect.draw(image=false);
		return {
			roadColor,
			roadWidth,
			roadHeight,
			roadPos,
			rect:roadRect
		}
	};


	var stripObj = function(posY){
		var stripColor, stripWidth, stripHeight, stripPos, stripRect;
		stripColor = 'rgb(225, 232, 242)';
		stripWidth = canvas.canvasWidth/52;
		stripHeight = canvas.canvasHeight/4;
		stripPos = [stripWidth*25.5,posY];
		stripRect = new drawRect(stripPos[0], stripPos[1], stripWidth,stripHeight, stripColor);
		stripRect.draw();
		
		return {
			stripColor,
			stripWidth,
			stripHeight,
			stripPos,
			stripRect
		}
	};


	var barrierObj = function(posX,posY){
		var barrierColor, barrierWidth, barrierHeight, barrierPos, barrierRect;
		barrierColor = 'rgb(110, 50, 21)';
		barrierWidth = canvas.canvasWidth/75;
		barrierHeight = canvas.canvasHeight/8;
		barrierPos = [posX,posY];
		barrierRect = new drawRect(barrierPos[0], barrierPos[1], barrierWidth, barrierHeight, barrierColor);
		barrierRect.draw();
		
		return {
			barrierColor,
			barrierWidth,
			barrierHeight,
			barrierPos,
			barrierRect
		}
	};
	

	var carObj = function(carImg, posX, posY){
		var carColor, carWidth, carHeight, carPos,img;
		carColor = 'rgb(235, 64, 52)';
		carWidth = canvas.canvasWidth/16;
		carHeight = canvas.canvasHeight/4;
		carPos = [posX,posY];
		carRect = new drawRect(carPos[0], carPos[1], carWidth,carHeight, carColor);
		carImg.style.height=carHeight;
		carImg.style.width=carWidth;
		carRect.draw(image=carImg);
		
		return {
			carColor,
			carWidth,
			carHeight,
			carPos,
			carImg,
			rect:carRect
		}
	};



	return {
		roadObj,
		stripObj,
		carObj,
		barrierObj
	}
	
})(canvas);






//===============PLAYER CAR=============
//===============ENEMY CARS=============
//===============SCORE==================








//===============CONTROLLER=============

var controller = (function(){
	var roadSpeed = 3;
	var playerSpeed = roadSpeed+2;
	var enemyCarSpeed = roadSpeed-2;

	var road = new rectangles.roadObj();

	var barrier = rectangles.barrierObj(90,100);

	var stripPosY1=0;
	var strip1 = new rectangles.stripObj(stripPosY1);

	var stripPosY2=stripPosY1+strip1.stripHeight + 50;
	var strip2 = rectangles.stripObj(stripPosY2);
	
	var stripPosY3=stripPosY2 + strip1.stripHeight + 50;
	var strip3 = rectangles.stripObj(stripPosY3);

	var playerCarPosX = (canvas.canvasWidth/16)*7.5;
	var playerCarPosY = (canvas.canvasHeight-(canvas.canvasHeight/4)*1.2)
	var playerCarImg = document.getElementById('player-car-image');
	var playerCar = new rectangles.carObj(playerCarImg,playerCarPosX,playerCarPosY);

	var enemyCars;
		


	
	// STRIP MOVEMENT
	var stripMove = function(strip, speed){
			if (strip.stripPos[1]>=canvas.canvasHeight){
				strip = new rectangles.stripObj(0);
			} else if ((strip.stripPos[1]+strip.stripHeight)>canvas.canvasHeight){
				var newPosY = (strip.stripPos[1]-canvas.canvasHeight);
				var newStrip = new rectangles.stripObj(newPosY);
				var speedUp = strip.stripPos[1]+=speed;
				strio = new rectangles.stripObj(speedUp);
			} else {
				var speedUp = strip.stripPos[1]+=speed;
				strip = new rectangles.stripObj(speedUp);
			}
			return strip;
	};

	function getRndInteger(min, max) {
		return Math.floor(Math.random() * (max - min) ) + min;
	}

	function enemyCarMove(carsArray,speed){
		for (var i=0; i<carsArray.length; i++){
			var car, carPosX, carPosY,preCar;
			car = carsArray[i];
			carPosY = car.carPos[1];
			carPosX = car.carPos[0];
			if (carPosY > canvas.canvasHeight){
				if (i===0){
					preCar = carsArray[carsArray.length-1];
				} else {
					preCar = carsArray[i-1];
				}
				carPosY = preCar.carPos[1] - (preCar.carHeight*getRndInteger(3,6));	
				carPosX = getRndInteger(road.roadPos[0], (road.roadPos[0]+road.roadWidth-playerCar.carWidth));
			} else {
				carPosY = car.carPos[1]+speed;
				carPosX = car.carPos[0];
			};
			newCar = new rectangles.carObj(car.carImg,carPosX,carPosY);
			carsArray[i]=newCar;
		}
		return carsArray;
	}
	

	//ENEMY CAR POSITIONS
	var spawnEnemyCars = function(number){
		var roadBoundariesX = [road.roadPos[0], road.roadPos[0]+road.roadWidth];
		var roadBoundariesY = [road.roadPos[1], road.roadPos[1]+road.roadHeight];
		var enemyCarImg = document.getElementById('enemy-car-image');
		var enemyCarsArray = [];
		
		
		for (var i=0; i<number; i++) {
			var carPosX = getRndInteger(road.roadPos[0], (road.roadPos[0]+road.roadWidth-playerCar.carWidth));
			if (i==0){
				var carPosY = road.roadPos[1]-playerCar.carHeight;
			} else {
				var preEnemyCar = enemyCarsArray[i-1];
				var carPosY = preEnemyCar.carPos[1]-(preEnemyCar.carHeight*getRndInteger(3,6));
				
			}
		
			var car = new rectangles.carObj(enemyCarImg,carPosX ,carPosY);
			enemyCarsArray.push(car);
		};
		return enemyCarsArray;
	}



	// CAR MOVEMENT
	
	window.addEventListener('keydown',function(event){
		if (event.key==="ArrowLeft"){
			playerCarPosX -= playerSpeed;
		} else if (event.key==="ArrowRight"){
			playerCarPosX += playerSpeed;
		} else if (event.key==="ArrowUp"){
			playerCarPosY -= playerSpeed;
		} else if (event.key==="ArrowDown"){
			playerCarPosY += playerSpeed;
		}else if (event.key==="Escape"){
			roadSpeed = 0;
		}else if (event.key==="Enter"){
			roadSpeed = 3;
		}
	});


	function playerCarCrash(carPosX, carPosY){
		roadBoundariesX = [road.roadPos[0], road.roadPos[0]+road.roadWidth];
		roadBoundariesY = [road.roadPos[1], road.roadPos[1]+road.roadHeight];
		carBoundariesX = [carPosX, carPosX+playerCar.carWidth];
		carBoundariesY = [carPosY, carPosY+playerCar.carHeight];
		if (carBoundariesX[0]<roadBoundariesX[0] || carBoundariesX[1]>roadBoundariesX[1] || carBoundariesY[0]<roadBoundariesY[0] || carBoundariesY[1]>roadBoundariesY[1] ){
			return true;
		} else {
			return false;
		}
	};



	function crashTest(arr, fn, pCar){
		var crashed = false
		for (var i=0; i<arr.length; i++){
			if (fn(arr[i],pCar)){
				crashed=true;
				break;
			}
		}
		return crashed;
	}

	function crashObj(crashObj,playerCar){
		crashObjX = [crashObj.rect.x, crashObj.rect.x+crashObj.rect.width];
		crashObjY = [crashObj.rect.y, crashObj.rect.y+crashObj.rect.height];
		playerCarX = [playerCar.rect.x, playerCar.rect.x+playerCar.rect.width];
		playerCarY = [playerCar.rect.y, playerCar.rect.y+playerCar.rect.height];

		// Road Crash
		if (crashObj.roadPos){
			if (playerCarX[0]<crashObjX[0] || playerCarX[1]>crashObjX[1] || playerCarY[0]<crashObjY[0] || playerCarY[1]>crashObjY[1] ){
				return true;
			} else {
				return false;
			}
		//Car Crash
		} else if (crashObj.carPos){
			if (( (crashObjY[1]>=playerCarY[0] && playerCarY[0]>=crashObjY[0]) ||
				( (crashObjY[0]<=playerCarY[1] && playerCarY[1]<=crashObjY[1]))) && 
				( (crashObjX[1]>=playerCarX[0] && playerCarX[0]>=crashObjX[0]) || 
					(crashObjX[0]<=playerCarX[1] && playerCarX[1]<=crashObjX[1]) )) {
				return true;
			} else {
				return false;
			}
		}

	};

	function animate(){
		playerSpeed = (roadSpeed===0) ? 0 : roadSpeed+2;
		enemyCarSpeed = (roadSpeed===0) ? 0 : roadSpeed-2;
		canvas.context.clearRect(0, 0, canvas.canvasWidth, canvas.canvasHeight);
		road = new rectangles.roadObj();
		barrier = rectangles.barrierObj(road.roadPos[0]-barrier.barrierWidth,0);
		strip1 = stripMove(strip1,roadSpeed);
		strip2 = stripMove(strip2,roadSpeed);
		strip3 = stripMove(strip3,roadSpeed);
		enemyCars = enemyCarMove(enemyCars, enemyCarSpeed);
		crashableObjs = enemyCars.slice().concat([road]);
		var crashed = crashTest(crashableObjs,crashObj,playerCar);
		if (crashed) {
			console.log('Your Car Crashed !');
			playerCar = new rectangles.carObj(playerCarImg,playerCarPosX,playerCarPosY);
		} else {
			playerCar = new rectangles.carObj(playerCarImg,playerCarPosX,playerCarPosY);
			window.requestAnimationFrame(animate);
		}	
	};

	return {
		init:function(){
			console.log('Game Started.');
			enemyCars = spawnEnemyCars(3);
			window.requestAnimationFrame(animate);
		},
		canvas,
		playerCar,
		road
	}
})();


// controller.init();

// console.log(controller.playerCar);
// console.log(rectangles)



*/












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
	this.draw = function(scr=0,psd=false){
		ctx = canvas.context;
		ctx.fillStyle = this.color;
		if (this.image){
			ctx.drawImage(this.image, this.xPos, this.yPos, this.width, this.height);
		} else if (this.text && psd){
			ctx.font = '50px Arial';
			ctx.textBaseline = "top";
			ctx.textAlign = 'center';
			ctx.fillText(this.text,this.xPos, this.yPos);
		} else if (this.text){
			ctx.font = '20px Arial';
			ctx.textBaseline = "top";
			ctx.textAlign = 'left';
			ctx.fillText(this.text+scr,this.xPos, this.yPos);
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
				pausedText.draw(0,true);
			}
		}
		
		if (roadCrash() || enemyCarCrash(enemyCarArr.arr)){		// check if crashded and show the game over text
			console.log('Crashed');
			pausedMenu.draw();
			gameOverText.draw(0,true);	
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


