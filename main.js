ment.addEventListener('DOMContentLoaded', function () {
/*
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		(function () {
			var ln = links[i];
			var location = ln.href;
			ln.onclick = function () {
				chrome.tabs.create({active: true, url: location});
			};
		})();
	}
*/

	var checkPageButton = document.getElementById('startbot');
	checkPageButton.addEventListener('click', function() { 
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id, {action: "getHtml"}, function(response) {
				console.log(response);
				var _script = response.doc.createElement('script');
	_script.type = "text/javascript";
	_script.src = "https://cdn.rawgit.com/gusarov/pxls.space.ext/master/pxlsbot.min.js";
	_script.onload = function() {
		var b = new Botnet({
			title: "",
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAGFBMVEUiIiKCAICIiIigakLk5OTllQD/p9H///+2E8T4AAAB+ElEQVR4AZXWUc7yOhCD4Tm24+x/x+cbTRNoy9+kLwJxwYOLiATRn5Itdan/7gkLYESQ8FtsRJVvAL3BYkybUdtYiGvQHq7VW9QOHpZXvcZl2Wwz+2CsMXIyadbaN4dWmEGmnbXJucIiOd2VY4FxYEmyddFe4rLZBw/9BvuK/YRF4hvrjLnC7b6Muax3WHZr2L1sn7CUeHvZU9dw4aj6Bgaz+xnlBma9mgSrgfGE3WpvDLVSMz1hmIlBxJ+ihTjVn7CNHJZRZ1ztT2BaLDATS66TJtYHPzAX2IXzYeC0m/j8Nddy9gqnVeF5PL2LPTEBJia1wG3wlk8L87Dsjzj3MLbLRNkNnHpYCZENG4EFnjyxyRPWLrackR+Mvov5XSRm38UwgVIH3vuJLVulL8y+hQUgMU5XjT3cUboNysR9ExtpszH7EqeWbQzuXZwiOek5jT0sgCPw5b8hI3XkJGMGbGHQwIdNrB3MxDcNYBMbIHnF0C4GTxyVVhhsxlVjtMCKZoNMfbOA9A+svP/hnCbvuLKueGqJJHDSOGPrhqc3iQZwdLGyJE08R/OmfkxzZswMq/q1nNj8pmEfDs40S3xLp2FIY9SyfuJ57YBAf2FABpxYp+IiBUZAhj8U/0VaQ7phJRocAAFYNS1kCASAO5YSz4Qj5ZQx+4X/ByFSRc8/0yFdAAAAAElFTkSuQmCC",
			x: 379,
			y: 1118,
			ignore: [],
			dir: 0,
			pixelize: true
		});
		b.start();
	}
	response.doc.getElementsByTagName('head')[0].appendChild(_script);
			});
		});
	});
});
