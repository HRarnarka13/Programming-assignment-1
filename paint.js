$(document).ready(function () {
	var canvas = document.getElementById('imageView');
	var context = canvas.getContext("2d");
	var drawing = false;
	var startx = 0;
	var starty = 0;

	var imgArr = [];
	var undoArr = [];

	function Shape(color){
		this.color = color;
	}

	function Line(sX, sY, eX, eY){
		this.startX = sX;
		this.startY = sY;
		this.endX 	= eX;
		this.endY 	= eY;
		this.draw = function(context){
			context.beginPath();
     		context.moveTo(sX, sY);
			context.lineTo(eX, eY);
	      	context.stroke();
		}
	}

	Line.prototype = new Shape();

	function DrawAll() {
		for (var i = imgArr.length - 1; i >= 0; i--) {
			//console.log(imgArr[i]);
			imgArr[i].draw(context);
		};
	}

	$('#imageView').mousedown(function(e){
		drawing = true;
		DrawAll();
		startx = e.pageX - this.offsetLeft;
		starty = e.pageY - this.offsetTop;
	});

	$('#imageView').mousemove(function(e){
		if (drawing === true) {
			var x = e.pageX - this.offsetLeft;
			var y = e.pageY - this.offsetTop;
			
			clearCanvas();
			DrawAll();

			context.beginPath();
     		context.moveTo(startx, starty);
			context.lineTo(x, y);
	      	context.stroke();
      	}
	});

	$('#imageView').mouseup(function(e) {
		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;
		var line = new Line(startx, starty, x, y);
		console.log(line);
		imgArr.push(line);
		DrawAll();
		drawing = false;
	});

	$('#line').click(function(){
		console.log("draw line");
	});

	$('#undo').click(function() {
		if ( imgArr.length > 0 ) {
			undoArr.push(imgArr[imgArr.length - 1]);
			imgArr.pop();
			clearCanvas();
			DrawAll();	
		}
	});

	$('#redo').click(function() {
		if ( undoArr.length > 0 ) {
			clearCanvas();
			imgArr.push(undoArr[undoArr.length - 1]);
			undoArr.pop();
			DrawAll();
		}
	});


	$("#clearCanvas").click(function(){
		clearCanvas();
		imgArr = [];
	});

	function clearCanvas(){
		// console.log("clearRect");
		context.clearRect(0, 0, canvas.width, canvas.height);
	}


});