$(function () {
	"use strict";

	// if user is running mozilla then use it's built-in WebSocket
	window.WebSocket = window.WebSocket || window.MozWebSocket;

	// if browser doesn't support WebSocket, just show some notification and exit
	if (!window.WebSocket) {
		content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
									+ 'support WebSockets.'} ));
		input.hide();
		$('span').hide();
		return;
	}

	// open connection
	//var connection = new WebSocket('ws://10.2.11.88:8080');
	var connection = new WebSocket('ws://127.0.0.1:8080');

	connection.onopen = function () {
		Game.wsConnection = this;
		Game.load();
		var FPS = 30;
		setInterval(function() {
				if(!Game.bGameOver) {
					Game.update();
					Game.draw();
				} else {
					Game.GameOver();
				}
					
			}, 1000/FPS);
	};

	connection.onerror = function (error) {
		// just in there were some problems with connection...
		content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
									+ 'connection or the server is down.</p>' } ));
	};

	// most important part - incoming messages
	connection.onmessage = function (message) {
		// try to parse JSON message. Because we know that the server always returns
		// JSON this should work without any problem but we should make sure that
		// the massage is not chunked or otherwise damaged.
		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
			return;
		}

		// double check ns_server.js for what data is sent with what 'type'
		// If we get a 'userID' message type, it's a new player, add em to the Game
		if (json.type === 'userID') {
			Game.addPlayer(json.data);
		} else if(json.type === 'playerUpdate') {
			console.log("Got a playerUpdate with: " + json.data);
			Game.updatePlayer(json.data);
		} else if(json.type === 'disconnect') {
			Game.removePlayer(json.data);
		} else if(json.type === 'enemy') {
			Game.updateEnemies(json.data);
		} else {
			console.log('Hmm..., I\'ve never seen JSON like this: ', json);
		}
	};
	
	connection.onclose = function(message) {
		Game.bGameOver = true;
	};

	/**
	 * This method is optional. If the server wasn't able to respond to the
	 * in 3 seconds then show some error message to notify the user that
	 * something is wrong.
	 */
	setInterval(function() {
		if (connection.readyState !== 1) {
			//status.text('Error');
			Game.drawString('Unable to comminucate with the WebSocket server.', 50, 100);
		}
	}, 3000);
});


