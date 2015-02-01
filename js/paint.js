$(document).ready(function () {

	// Global varible
	var g = {
		drawing: false,
		moving: false,
		startx: 0,
		starty: 0,
		imgArr: [],
		undoArr: [],
		tool: "pen",
		currObject: null,
		nextColor: "#000000",
		nextPenSize: 1
	};
	var canvas = document.getElementById('imageView');
	var context = canvas.getContext("2d");
	MakeLinePreview();

	// Changing color
	$('#colorpicker').colpick({
		layout:'hex',
		submit:0,
		colorScheme:'dark',
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			g.nextColor = '#' + hex;
			document.getElementById('colorpicker').style.backgroundColor = g.nextColor;
			MakeLinePreview();
			$("#text-spawner").find("input").css("color", g.nextColor);

		}
	}).keyup(function(){
		$(this).colpickSetColor(this.value);
	});

	// Changing line width
	$('#strokesize').click(function(){
		g.nextPenSize = this.value;
		MakeLinePreview();
	});

	function MakeLinePreview(){
		var canvas = document.getElementById('line-preview');
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = g.nextColor;
		context.lineWidth = g.nextPenSize;
		context.beginPath();
     	context.moveTo(0, 20);
		context.lineTo(200, 20);
	    context.stroke();
	}

	function Cordinates(x, y) {
		this.x = x;
		this.y = y;
	}

	function Pen(x, y, cordinates, color, lineWidth) {
		this.x = x;
		this.y = y;
		this.cordinates = cordinates;
		this.lineWidth = lineWidth;
		this.color = color;
		this.draw = function (context) {
			SetStyle(context,this);
			context.beginPath();
			for (var i = this.cordinates.length - 1; i >= 0; i--) {
				context.lineTo(this.cordinates[i].x, this.cordinates[i].y);
				context.stroke();
			};	
		}
		this.contains = function (findX, findY) {
			// Todo
			return false;
		}
	}

	function Eraser (x, y, cordinates) {
		this.x = x;
		this.y = y;
		this.cordinates = cordinates;
		this.draw = function (context) {
			context.lineWidth = this.lineWidth;
			context.strokeStyle = "#ffffff";
			context.beginPath();
			for (var i = this.cordinates.length - 1; i >= 0; i--) {
				context.lineTo(this.cordinates[i].x, this.cordinates[i].y);
				context.stroke();
			};	
		}
		this.contains = function (findX, findY) {
			// Todo
			return false;
		}
	}

	function Line(sX, sY, eX, eY, color, lineWidth) {
		this.x = sX;
		this.y = sY;
		this.endX = eX;
		this.endY = eY;
		this.color = color;
		this.lineWidth = lineWidth;
		this.draw = function( context ){
			SetStyle(context,this);
			context.beginPath();
     		context.moveTo(this.x, this.y);
			context.lineTo(this.endX, this.endY);
	      	context.stroke();
		}
		this.contains = function (findX, findY){
			if(Math.abs(findX - this.x) < 10 && Math.abs(findY - this.y) < 10) {
				return true;
			}
			return false;
		}
	}

	function Circle (x, y, radius, color, lineWidth) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.lineWidth = lineWidth;
		this.draw = function ( context ){
			SetStyle(context,this);
			context.beginPath();
			context.arc(this.x, this.y, radius, 0, 2 * Math.PI);
			context.stroke();
		}
		this.contains = function(findX, findY) {
			if (Math.abs(findX - this.x) < 10 && Math.abs(findY - this.y) < 10){
				return true;
			}
			return false;
		}
	}

	function Rect (x, y, width, height, color, lineWidth) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.lineWidth = lineWidth;
		this.draw = function (context) {
			SetStyle(context, this);
			context.strokeRect(this.x, this.y, width, height);
		}
		this.contains = function (findX, findY) {
			var lowY = this.y - this.lineWidth;
			var highY = this.y + parseInt(this.lineWidth);
			var lowX = this.x - this.lineWidth;
			var highX = this.x + parseInt(this.lineWidth);

			if ((((this.x + this.width >= findX) && (this.x <= findX)) 
					 && ((lowY <= findY && findY <= highY) 									
					   || (lowY + this.height <= findY && findY <= highY + this.height))) // horizantal line
				|| ((this.y + this.height >= findY && this.y <= findY) 
					&& ((lowX <= findX && findX <= highX) 
						|| (lowX + this.width <= findX && findX <= highX + this.width))) // vertical line 
				){
				return true;
			}
			return false;
		}
	}

	function Text (x, y, text, font, font_size, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.text = text;
		this.font = font;
		this.font_size = font_size;
		this.draw = function () {
			context.fillStyle = this.color;
			context.font = this.font;
			context.fillText(this.text, this.x, this.y);
		}
		this.contains = function (findX, findY) {
			var text_hight = this.y - context.measureText('M').width;
			var text_width = context.measureText(this.text).width + this.x;
			if ((this.x <= findX && findX <= text_width) && (this.y > findY && findY > text_hight)) {
				console.log(this);
				return true;
			}
			return false;
		}
	}

	function DrawAll() {
		for (var i = g.imgArr.length - 1; i >= 0; i--) {
			g.imgArr[i].draw(context);
		};
	}

	function SetStyle(shape, style) {
		if (shape === context && style) {
			shape.strokeStyle = style.color;
			shape.lineWidth = style.lineWidth;
		} else if (shape === context){
			shape.strokeStyle = g.nextColor;
			shape.lineWidth = g.nextPenSize;
		} else {
			shape.color = g.nextColor;
			shape.lineWidth = g.nextPenSize;
		}
	};

	var currentInputBox;
	var movingOpject;

	$('#imageView').mousedown(function(e){
		g.drawing = true;
		g.startx = e.pageX - this.offsetLeft;
		g.starty = e.pageY - this.offsetTop;
		SetStyle(context);

		if (g.tool === 'pen') {
			var arr = [];
			g.currObject = new Pen(g.startx, g.starty, arr, g.nextColor, g.nextPenSize);
			context.beginPath();
	     	context.moveTo(g.startx, g.starty);
	    } else if (g.tool === 'eraser') {
	    	var arr = [];
	    	g.currObject = new Eraser(g.startx, g.starty, arr);
	    	context.strokeStyle = "#ffffff";
	    	context.beginPath();
	     	context.moveTo(g.startx, g.starty);
	    } else if (g.tool === 'text') {
			g.currObject = null;
			if(currentInputBox){
				currentInputBox.remove();
			}
			currentInputBox = $("<input id=\"text_box\" placeholder=\"Enter your text\" />");
			currentInputBox.css("position", "fixed");
			currentInputBox.css("color", g.nextColor);
		    currentInputBox.css("left", e.originalEvent.pageX);
		    currentInputBox.css("top", e.originalEvent.pageY - 20);
		    $("#text-spawner").append(currentInputBox);
		    $("#text-spawner").mouseover(function(){
		    	currentInputBox.focus();
		    });
		    $("#text_box").focus();
		    $("#text-spawner").keypress(function(event){
		    	if(event.which === 13 && g.currObject === null) {
		    		var input_text = currentInputBox.val();
		    		currentInputBox.remove();
					var font_size = document.getElementById('font_size').value + "px ";
					var font_family = document.getElementById('font_family').value;
					var font_style = "";

					if ($("#bold_font").hasClass("active") && $("#italic_font").hasClass("active")) {
						font_style = "italic bold ";
					} else if ($("#bold_font").hasClass("active")) {
						font_style = "bold ";
					} else if ($("#italic_font").hasClass("active")){
						font_style = "italic ";
					}

					g.currObject = new Text(g.startx, g.starty, input_text, font_style + font_size + font_family, font_size, g.nextColor);
					console.log(g.currObject);
					g.imgArr.push(g.currObject);
					g.currObject.draw();
					g.drawing = false;
		    	}
		    });
		} else if (g.tool === 'move'){
			for (var i = 0; i < g.imgArr.length; ++i) {
				if (g.imgArr[i].contains(g.startx, g.starty)){
					movingOpject = g.imgArr[i];
					g.imgArr.splice(i, 1);
					g.imgArr.push(movingOpject);
					g.moving = true;
				}
			}
		}
	});

	$('#imageView').mousemove(function(e) {
		if (g.drawing === true || g.moving === true) {
			var x = e.pageX - this.offsetLeft;
			var y = e.pageY - this.offsetTop;
			if (g.tool === 'pen' || g.tool === 'eraser'){
				context.lineTo(x, y);
				context.stroke();
				g.currObject.cordinates.push(new Cordinates(x,y));
			} else {
				clearCanvas();
				DrawAll();
				SetStyle(context);
				//context.strokeStyle = g.nextColor;
				//context.lineWidth = g.nextPenSize;

				if (g.tool === 'line'){
					context.beginPath();
		     		context.moveTo(g.startx, g.starty);
					context.lineTo(x, y);
			      	context.stroke();
			    } else if (g.tool === 'circle') {
			    	context.beginPath();
					var radius = Math.sqrt(Math.pow(g.startx - x, 2) + Math.pow(g.starty - y, 2));
			    	context.arc(g.startx, g.starty, radius, 0, 2 * Math.PI);
			    	context.stroke();
		      	} else if (g.tool === 'rect') {
		      		var _x = Math.min(x, g.startx),
						_y = Math.min(y, g.starty),
						_w = Math.abs(x - g.startx),
						_h = Math.abs(y - g.starty);
					if (!_w || !_h) {
						return;
					}
					context.strokeRect(_x, _y, _w, _h);
		      	} else if (g.tool === 'text') {
		      		currentInputBox.focus();
		      	} else if (g.tool === 'move' && movingOpject) {
		      		if (movingOpject.constructor === Line) {
		      			var deltaX = movingOpject.x - x;
		      			var deltaY = movingOpject.y - y;
		      			movingOpject.x = Math.abs(movingOpject.x - deltaX);
		      			movingOpject.y = Math.abs(movingOpject.y - deltaY);
		      			movingOpject.endX = Math.abs(movingOpject.endX - deltaX);
		      			movingOpject.endY = Math.abs(movingOpject.endY - deltaY);
		      		} else {
		      			movingOpject.x =  x;
		      			movingOpject.y =  y;
		      		}
		      		movingOpject.draw(context);
		      	}
		    }
      	}
	});

	$('#imageView').mouseup(function(e) {
		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;
		var radius = 0;
		if (g.tool === 'pen') {
			console.log(g.currObject);
			g.imgArr.push(g.currObject);
		} else if (g.tool === 'eraser') {
			g.currObject.lineWidth = g.nextPenSize;
			g.imgArr.push(g.currObject);
		} else if (g.tool === 'line') {
			g.currObject = new Line(g.startx, g.starty, x, y, g.nextColor, g.nextPenSize);
			SetStyle(g.currObject);
			g.imgArr.push(g.currObject);
		} else if (g.tool === 'circle') {
			radius = Math.sqrt(Math.pow(g.startx - x, 2) + Math.pow(g.starty - y, 2));
			g.currObject = new Circle(g.startx, g.starty, radius, g.nextColor, g.nextPenSize);
			g.imgArr.push(g.currObject);
		} else if (g.tool === 'rect') {
	      	g.currObject = new Rect(Math.min(x, g.startx), Math.min(y, g.starty), Math.abs(x - g.startx), Math.abs(y - g.starty), g.nextColor, g.nextPenSize);
	      	g.imgArr.push(g.currObject);
	    } else if (g.tool === 'move') {
	    	movingOpject = null;
	    }
	    g.currObject = null;
		g.drawing = false;	
		g.moving = false;
	});

	$('input[name^=optradio]').click(function(e) {
		g.tool = this.dataset.tool;
		var tools = document.getElementsByClassName('text_tools');
		for (var i = tools.length - 1; i >= 0; i--) {
			if (g.tool === 'text') {
				tools[i].style.display = 'block';
			} else {
				tools[i].style.display = 'none';
			}
		}
	});

	$('#undo').click(function() {
		if ( g.imgArr.length > 0 ) {
			g.undoArr.push(g.imgArr[g.imgArr.length - 1]);
			g.imgArr.pop();
			clearCanvas();
			DrawAll();	
		}
	});

	$('#redo').click(function() {
		if ( g.undoArr.length > 0 ) {
			clearCanvas();
			g.imgArr.push(g.undoArr[g.undoArr.length - 1]);
			g.undoArr.pop();
			DrawAll();
		}
	});

	$("#save_img").click(function(){
		var stringifiedArray = JSON.stringify(g.imgArr);
		var title = "prufa_mynd"
		var param = { "user": "arnarka13",
			"name": title,
			"content": stringifiedArray,
			"template": true
		};

		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			url: "http://whiteboard.apphb.com/Home/Save",
			data: param,
			dataType: "jsonp",
			crossDomain: true,
			success: function (data) {
				console.log("save was successful");
				console.log(data);
			},
			error: function (xhr, err) {
				console.log("Something went wrong...");
			}
		})
	});
	$("#load-img").click(function(){
		console.log("heess");
		var title = "getlist";
		var param = { "user": "arnarka13",
			"name": title,
			"template": true
		};

		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			url: "http://whiteboard.apphb.com/Home/GetList",
			data: param,
			dataType: "jsonp",
			crossDomain: false,
			success: function (data) {
				console.log("load was successful");
				console.log(data);
				for (var i = data.length - 1; i >= 0; i--) {
					console.log(data[i]);
					context.drawImage(data[i].WhiteboardContents, 0, 0);
				};
			},
			error: function (xhr, err) {
				console.log("Something went wrong...");
			}
		})
	});

	$("#clearCanvas").click(function(){
		clearCanvas();
		g.imgArr = [];
	});

	function clearCanvas(){
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
});