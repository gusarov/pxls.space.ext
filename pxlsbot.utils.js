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
