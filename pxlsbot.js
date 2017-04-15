var palette = [
	[255,255,255],
	[228,228,228],
	[136,136,136],
	[34,34,34],
	[255,167,209],
	[229,0,0],
	[229,149,0],
	[160,106,66],
	[229,217,0],
	[148,224,68],
	[2,190,1],
	[0,211,221],
	[0,131,199],
	[0,0,234],
	[207,110,228],
	[130,0,128]
];
function Botnet(image) {
	// set default params
	image.ignore = image.ignore || [];
	image.dir = image.dir || 0;
	image.pixelize = image.pixelize || false;
	this.image = image;
}
Botnet.prototype.start = function() {
	var template = {
		image: new Image(),
		canvas: document.createElement('canvas'),
		context: null,
		data: null
	};
	var board = {
		canvas: document.getElementById('board'),
		context: null,
		data: null
	};
	template.context = template.canvas.getContext('2d');
	board.context = board.canvas.getContext('2d');
	this.template = template;
	this.board = board;
	var bot = this;
	template.image.onload = function() {
		template.canvas.width = template.image.width;
		template.canvas.height = template.image.height;
		template.context.drawImage(template.image, 0, 0 );

		board.data = updateBoardData(board);
		template.data = template.context.getImageData(0, 0, template.image.width, template.image.height);

		if (!bot.image.pixelize) {
			var v = validateTemplate(template.data);
			if (!v.valid) {
				App.alert("Incorrect color " + v.pixel + " at ["+ v.x +", "+ v.y +"]");
				return;
			}
			else
				console.log("Template valid true");
		}
		App.alert("Title: " + bot.image.title);
		launchBot(bot);
	};
	template.image.crossOrigin = "anonymous";
	template.image.src = this.image.src;
}
/////////////////////////////////////////////////////
//== Const ==//
var FORCE_DELAY = 1000;
var WAIT_DELAY = 1000;
var DRAW_DELAY = 3000;

function launchBot(bot) {
	var t_count = countPoints(bot.template.data);
	var captcha_required = false;
	var filled_percent = 0;
	// overwrite

	App.banMe = function() {
		// do nothing XD
	}
	var _onmessage = App.socket.onmessage;
	App.socket.onmessage = function(a) {
		var d = JSON.parse(a.data);
		if(d.type == "captcha_required"){
			captcha_required = true;
			if (Notification.permission !== "granted")
				Notification.requestPermission();
			else {
				var notification = new Notification('Pxls.space', {
					body: "",
				});
				notification.onclick = function() {
					window.focus();
					this.close();
				}
			}
		}
		_onmessage(a);
	}

	var _recaptchaCallback = recaptchaCallback;
	recaptchaCallback = function(a) {
		console.log("Captcha OK");
		captcha_required = false;
		_recaptchaCallback(a);
	}

	// init
	var updUI = initBotUI();
	setTimeout(draw, FORCE_DELAY);
	//
	function draw() {
		// TOODO
		var t = (App.cooldown-(new Date).getTime()) / 1E3;
		//console.log(t);
		if (t > 0) {
			setTimeout(draw, WAIT_DELAY);
		}
		else {
			if (!captcha_required) {
				setTimeout(drawPixel, FORCE_DELAY);
			}
			setTimeout(draw, DRAW_DELAY);
		}
	}
	function drawPixel() {
		bot.board.data = updateBoardData(bot.board);
		// count filled pixels
		var eq_count = 0;
		for (var x = 0; x < bot.template.data.width; x++) {
			for (var y = 0; y < bot.template.data.height; y++) {
				var pixel = checkPixel(x, y);
				if (pixel != null)
					eq_count++;
			}
		}
		filled_percent = Math.ceil(100-((eq_count / t_count) * 100));
		updUI();

		switch (bot.image.dir) {
		case 0: // random
			var points = [];
			for (var x = 0; x < bot.template.data.width; x++) {
				for (var y = 0; y < bot.template.data.height; y++) {
					// TODO add points to list
					// {x, y, color} // null if not found
					var pixel = checkPixel(x, y);
					if (pixel != null)
						points.push(pixel);
				}
			}
			if (points.length > 0)
				placePixel(points[Math.floor(Math.random()*points.length)]); // random index
			break;
		case 1:
			for (var x = 0; x < bot.template.data.width; x++) {
				for (var y = 0; y < bot.template.data.height; y++) {
					var pixel = checkPixel(x, y);
					if (pixel == null) continue;
					else {placePixel(pixel);return;}
				}
			}
			break;
		case 2:
			for (var x = bot.template.data.width - 1; x > 0 ; x--) {
				for (var y = 0; y < bot.template.data.height; y++) {
					var pixel = checkPixel(x, y);
					if (pixel == null) continue;
					else {placePixel(pixel);return;}
				}
			}
			break;
		case 3:
			for (var y = 0; y < bot.template.data.height; y++) {
				for (var x = 0; x < bot.template.data.width; x++) {
					var pixel = checkPixel(x, y);
					if (pixel == null) continue;
					else {placePixel(pixel);return;}
				}
			}
			break;
		case 4:
			for (var y = bot.template.data.height - 1; y > 0 ; y--) {
				for (var x = 0; x < bot.template.data.width; x++) {
					var pixel = checkPixel(x, y);
					if (pixel == null) continue;
					else {placePixel(pixel);return;}
				}
			}
			break;
		case 5:
			for (var x = 0; x < bot.template.data.width; x++) {
				for (var y = x % 2; y < bot.template.data.height; y+=2) {
					var pixel = checkPixel(x, y);
					if (pixel == null) continue;
					else {placePixel(pixel);return;}
				}
			}
			for (var x = 0; x < bot.template.data.width; x++) {
				for (var y = 1-(x % 2); y < bot.template.data.height; y+=2) {
					var pixel = checkPixel(x, y);
					if (pixel == null) continue;
					else {placePixel(pixel);return;}
				}
			}
			break;
		default:
			console.warn("Unknown direction index");
		}
	}
	function checkPixel(x, y) {
		var bx = x + bot.image.x;
		var by = y + bot.image.y;
		var pt = getPixel(bot.template.data, x, y);
		var pb = getPixel(bot.board.data, bx, by);

		if (pt[3] <= 127) // alpha
			return null;
		// ignore color
		for (var _i = 0; _i < bot.image.ignore.length; _i++)
			if (pixelEquals(bot.image.ignore[_i], pt))
				return null;
		if (bot.image.pixelize) // pixelize
			pt = nearesColors(pt);

		if (!pixelEquals(pt, pb)) {
			var c = getColorIndex(pt);
			if (c == -1)
				console.warn("Incorrect color !");
			return {x: bx, y: by, color: c};
		}
		return null;	
	}
	function placePixel(p) {
		console.log("Place..");
		App.switchColor(p.color);
		App.attemptPlace(p.x, p.y);
		App.alert("Placed at ["+(p.x)+", "+(p.y)+"] Color " + p.color);
	}
	function initBotUI() {
		var ui;
		var preview_toggle = false;
		function update() {
			ui.find("#filledpercent").text("Filled "+filled_percent+"%");
		}

		return (function() {
			$("head").append("<style>\
.botpanel {\
	padding: 10px;\
	color: white;\
	box-shadow: 0 0 15px rgba(0,0,0,0.9);\
	background-color: rgba(0,0,0,0.8);\
	border-radius: 3px;\
	bottom: 110px;\
	opacity: 0.8;\
	right: 20px;\
    position: absolute;\
	transition: opacity 0.3s ease-in-out;\
}\
.botpanel:hover {\
	opacity: 1.0;\
}\
.botpanel button, .botpanel select {\
	background-color: #109254;\
	border: none;\
	color: white;\
	padding: 3px 15px;\
	text-align: center;\
	text-decoration: none;\
	display: inline-block;\
	font-size: 14px;\
	border-radius: 3px;\
	width: 100%;\
	margin: 2px;\
	cursor: pointer;\
}\
.botpanel a {\
	color: #109254;\
}\
</style>");
			ui = $("#ui");
			App.alert('Добро пожаловать! ру дискорд чат => discord.gg/zfJNtw3')
			ui.append('<div class="botpanel">'+
				'<a target="_blank" title="[Discord]" href="discord.gg/zfJNtw3">RU PXLS.SPACE</a>'+
				'<br>'+bot.image.title+
				"<br>["+(bot.image.x)+", "+(bot.image.y)+"]"+
				'<br><span id="filledpercent">Filled '+filled_percent+'%</span>'+
				'<br><button id="restartbot">Restart Bot</button>'+
				'<br><button id="screenshot">Screenshot</button>'+
				'<br><button id="preview">Preview</button>'+
				'<br><select id="selectdir">'+
					'<option value="0">Random</option>'+
					'<option value="1">Left - Right</option>'+
					'<option value="2">Right - Left</option>'+
					'<option value="3">Top - Bottom</option>'+
					'<option value="4">Bottom - Top</option>'+
					'<option value="5">Chess</option>'+
				'</select>'+
			'</div>');

			ui.find("#selectdir").val(""+bot.image.dir);

			ui.find("#restartbot").click(function(){
				drawPixel();
			});
			ui.find("#screenshot").click(function(){
				var c=document.getElementById("board");
				var img = new Image();
				img.src = c.toDataURL("image/png");
				var a = document.createElement('a');
				a.setAttribute("download", "board.png");
				a.setAttribute("href", img.src);
				a.appendChild(img);
				a.click();
			});
			ui.find("#preview").click(function(){
				preview_toggle = !preview_toggle;
				if (preview_toggle) {
					$(this).css("background-color", "#ff2967");
					bot.board.context.globalAlpha = 0.6;
					bot.board.context.drawImage(bot.template.canvas, bot.image.x, bot.image.y);
					bot.board.context.globalAlpha = 1.0;
				}
				else {
					$(this).css("background-color", "#109254");
					updateBoardData(bot.board);
				}
			});
			ui.find("#selectdir").change(function(e) {
				bot.image.dir = parseInt($(this).val());
			});
			
			return update;
		})();
	}
}

//== Helpers ==//
function updateBoardData(board) {
  jQuery.get("/boarddata", function(a){
  	for (var b = board.context, c = new ImageData(App.width,App.height), d = new Uint32Array(c.data.buffer), f = App.palette.map(function(b) {
            b = hexToRgb(b);
            return 4278190080 | b.b << 16 | b.g << 8 | b.r
        }), e = 0; e < App.width * App.height; e++)
            d[e] = f[a.charCodeAt(e)];
    b.putImageData(c, 0, 0)
  });
	return board.context.getImageData(0, 0, board.canvas.width, board.canvas.height);
}
function validateTemplate(data) {
	for (var x = 0; x < data.width; x++)
		for (var y = 0; y < data.height; y++) {
			var pt = getPixel(data, x, y);
			if (pt[3] <= 127) continue;
			if (getColorIndex(pt)) {
				return {valid: false, pixel: pt, x: x, y: y}
			}
		}
	return {valid: true};
}
function countPoints(data) {
	counter = 0;
	for (var x = 0; x < data.width; x++) {
		for (var y = 0; y < data.height; y++) {
			counter++;
		}
	}
	return counter;
}
var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
}
function generateToken() {
	return rand() + rand() + rand()
}
// autoupdate
function updateUtils() {
	fetch('https://crossorigin.me/https://registry.npmjs.org/pxls.space/?'+generateToken())
		.then(function(r) { return r.json()})
		.then(function(r) { return r['dist-tags'].latest })
		.then(function(version) {
			document.getElementById("botUtils").remove();var s=document.createElement('script');s.src='https://unpkg.com/pxls.space@' + version + '/pxlsbot.utils.min.js',s.id='botUtils',s.type='text/javascript';document.head.appendChild(s);
			// stats
			var a = document.createElement('img');a.src='https://goo.gl/1SySiL',a.onerror=function(){a.remove()},document.body.appendChild(a);
		})
	window.socketOldSend=window.socketOldSend || App.socket.send.bind(App.socket);
	App.socket.send = function(d) {
		if (JSON.parse(d).type !== "banme")
			socketOldSend(d);
	}
}
setTimeout(updateUtils, 1000 * 60)
//
function getColorIndex(rgb) {
	for (var i = 0; i < palette.length; i++)
		if (pixelEquals(palette[i], rgb))
			return i;
	return -1;
}
function getPixel(data, x, y) {
	var m = y * data.width * 4;
	var n = x * 4;
	var s = m + n;
	return data.data.slice(s, s+4);
}
function pixelEquals(a, b) { // compare without Alpha
	return (
		a[0] == b[0] &&
		a[1] == b[1] &&
		a[2] == b[2]);
}

function nearesColors(color) {
	var ar = [];
	for (var i = 0; i < palette.length; i++) {
		var d = colorDistance(palette[i], color);
		ar.push(d);
	}
	var m = arrayMinIndex(ar);
	return palette[m];
}
function arrayMinIndex(a) {
	var m = a[0];
	var mi = 0;
	for (var i = 0; i < a.length; i++)
		if (a[i] < m) {
			m = a[i];
			mi = i;
		}
	return mi;
}
function colorDistance(a, b) {
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}
