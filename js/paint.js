$(document).ready(function () {
	var canvas = document.getElementById('imageView');
	var context = canvas.getContext("2d");
	var drawing = false;
	var startx = 0;
	var starty = 0;

	var imgArr = [];
	var undoArr = [];
	var tool = 'pen';
	var nextColor = '#000000';
	var nextPenSize = 1;

	MakeLinePreview();

	$('#colorpicker').colpick({
		layout:'hex',
		submit:0,
		colorScheme:'dark',
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			nextColor = '#' + hex;
			document.getElementById('colorpicker').style.backgroundColor = nextColor;
			MakeLinePreview();

		}
	}).keyup(function(){
		$(this).colpickSetColor(this.value);
	});

	$('#strokesize').click(function(){
		nextPenSize = this.value;
		MakeLinePreview();
	});

	function MakeLinePreview(){
		var canvas = document.getElementById('line-preview');
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = nextColor;
		context.lineWidth = nextPenSize;
		context.beginPath();
     	context.moveTo(0, 20);
		context.lineTo(200, 20);
	    context.stroke();
	}

	function Cordinates(x, y) {
		this.x = x;
		this.y = y;
	}

	function Shape(color) {
		this.x = 0;
		this.y = 0;
		this.color = nextColor;
		this.lineWidth = nextPenSize;
	}

	function Pen(x, y, cordinates) {
		this.x = x;
		this.y = y;
		this.cordinates = cordinates;
		this.draw = function (context) {
			SetStyle(context,this);
			//context.strokeStyle = this.color;
			// context.lineWidth = this.lineWidth;
			context.beginPath();
			for (var i = this.cordinates.length - 1; i >= 0; i--) {
				context.lineTo(this.cordinates[i].x, this.cordinates[i].y);
				context.stroke();
			};
			
		}
	}

	function Line(sX, sY, eX, eY){
		this.x = sX;
		this.y = sY;
		this.endX = eX;
		this.endY = eY;
		this.draw = function(context){
			SetStyle(context,this);
			context.beginPath();
     		context.moveTo(sX, sY);
			context.lineTo(eX, eY);
	      	context.stroke();
		}
	}

	function Circle (radius) {
		this.radius = radius;
		this.draw = function(context){
			SetStyle(context,this);
			context.beginPath();
			context.arc(this.x, this.y, radius, 0, 2 * Math.PI);
			context.stroke();
		}
	}

	function Rect (x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.draw = function (context) {
			SetStyle(context,this);
			context.strokeRect(this.x, this.y, width, height);
		}
	}

	function Text (text, font, font_size) {
		this.text = text;
		this.font = font;
		this.font_size = font_size;
		this.draw = function () {
			context.fillStyle = this.color;
			context.font = this.font;
			context.fillText(text, this.x, this.y);
		}
	}

	Pen.prototype = new Shape();
	Line.prototype = new Shape();
	Circle.prototype = new Shape();
	Rect.prototype = new Shape();
	Text.prototype = new Shape();

	function DrawAll() {
		for (var i = imgArr.length - 1; i >= 0; i--) {
			imgArr[i].draw(context);
		};
	}

	function SetStyle(shape, style) {
		if (shape === context && style) {
			shape.strokeStyle = style.color;
			shape.lineWidth = style.lineWidth;
		} else if (shape === context){
			shape.strokeStyle = nextColor;
			shape.lineWidth = nextPenSize;
		} else {
			shape.color = nextColor;
			shape.lineWidth = nextPenSize;
		}
	};

	var pen;
	var currentInputBox;
	$('#imageView').mousedown(function(e){
		drawing = true;
		// DrawAll();
		startx = e.pageX - this.offsetLeft;
		starty = e.pageY - this.offsetTop;
		SetStyle(context);
		if (tool === 'pen') {
			var arr = [];
			pen = new Pen(startx, starty, arr);
			context.beginPath();
	     	context.moveTo(startx, starty);
	    } else if (tool === 'circle'){
	    	// context.beginPath();
		} else if (tool === 'text') {
			if(currentInputBox){
				currentInputBox.remove();
			}
			currentInputBox = $("<input placeholder=\"Enter your text\" />");
			currentInputBox.css("position", "fixed");
		    currentInputBox.css("left", e.originalEvent.pageX);
		    currentInputBox.css("top", e.originalEvent.pageY - 20);
		    
		    $("#text-spawner").append(currentInputBox);
		    $("#text-spawner").mouseover(function(){
		    	currentInputBox.focus();
		    });

		    $("#text-spawner").keypress(function(event){
		    	if(event.which === 13) {
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
					var text = new Text(input_text, font_style + font_size + font_family, font_size);
					text.x = startx;
					text.y = starty;
					text.color = nextColor;
					imgArr.push(text);
					text.draw();
					drawing = false;
		    	}
		    });
		}
	});

	$('#imageView').mousemove(function(e) {
		if (drawing === true) {
			var x = e.pageX - this.offsetLeft;
			var y = e.pageY - this.offsetTop;
			if (tool === 'pen'){
				context.lineTo(x, y);
				context.stroke();
				pen.cordinates.push(new Cordinates(x,y));
			} else {
				clearCanvas();
				DrawAll();
				context.strokeStyle = nextColor;
				context.lineWidth = nextPenSize;

				if (tool === 'line'){
					context.beginPath();
		     		context.moveTo(startx, starty);
					context.lineTo(x, y);
			      	context.stroke();
			    } else if (tool === 'circle') {
			    	// Todo
			    	context.beginPath();
			    	var centerX = Math.max(startx, x) - Math.abs(startx - x)/2;
					var centerY = Math.max(starty, y) - Math.abs(starty - y)/2;
					var radius = Math.sqrt(Math.pow(startx - x, 2) + Math.pow(starty - y, 2));
			    	context.arc(startx, starty, radius, 0, 2 * Math.PI);
			    	context.stroke();
		      	} else if (tool === 'rect') {
		      		var _x = Math.min(x, startx),
						_y = Math.min(y, starty),
						_w = Math.abs(x - startx),
						_h = Math.abs(y - starty);
					if (!_w || !_h) {
						return;
					}
					context.strokeRect(_x, _y, _w, _h);
		      	} else if (tool === 'text') {
		      		currentInputBox.focus();
		      	}
		    }
      	}
	});

	$('#imageView').mouseup(function(e) {
		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;

		if (tool === 'pen') {
			
			SetStyle(pen);
			imgArr.push(pen);
			pen = undefined;
		} else if (tool === 'line') {
			var line = new Line(startx, starty, x, y);
			SetStyle(line);
			// console.log(line);
			imgArr.push(line);
		} else if (tool === 'circle') {
			var radius = Math.sqrt(Math.pow(startx - x, 2) + Math.pow(starty - y, 2));
			var circle = new Circle(radius);
			circle.x = startx;
			circle.y = starty;
			SetStyle(circle);
			imgArr.push(circle);
		} else if (tool === 'rect') {
	      	var rect = new Rect(Math.min(x, startx), Math.min(y, starty), Math.abs(x - startx), Math.abs(y - starty));
	      	SetStyle(rect);
	      	// console.log(rect);
	      	imgArr.push(rect);
	    }

		drawing = false;
	});

	$('input[name^=optradio]').click(function(e) {
		tool = this.dataset.tool;
		console.log("Switched to: " + tool);
		if (tool === 'text') {
			var tools = document.getElementsByClassName('text_tools');
			for (var i = tools.length - 1; i >= 0; i--) {
				tools[i].style.display = 'block';
			};
		} else {
			var tools = document.getElementsByClassName('text_tools');
			for (var i = tools.length - 1; i >= 0; i--) {
				tools[i].style.display = 'none';
			};
		}
	});

	$('#undo').click(function() {
		if (isCanvasBlank(canvas)){
			clearCanvas();
			DrawAll();
		} else if ( imgArr.length > 0 ) {
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

	$("#save_img").click(function(){
		var stringifiedArray = JSON.stringify(imgArr);
		var title = "prufa_mynd"
		var param = { "user": "arnarka13", // You should use your own username!
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
				// The save was successful...
				console.log("save was successful");
			},
			error: function (xhr, err) {
				// Something went wrong...
				console.log("Something went wrong...");
			}
		})
	});

	$("#clearCanvas").click(function(){
		clearCanvas();
		// imgArr = [];
	});

	function clearCanvas(){
		// console.log("clearRect");
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function isCanvasBlank(canvas) {
	    var blank = document.createElement('canvas');
	    blank.width = canvas.width;
	    blank.height = canvas.height;

	    return canvas.toDataURL() == blank.toDataURL();
	}

});