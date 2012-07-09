// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
//"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'nodeshooter';

// Port where we'll run the websocket server
var server_port= 8080;

var longstack = require('long-stack-traces');

// using express to create the server and socket.io for connections
var express = require('express');
var app_game = express.createServer();
// DMT - Figure out what this controller is for
var app_controller = express.createServer();
app_controller.configure(function(){
	app_controller.use(express.bodyParser());
});
var socket_io = require('socket.io').listen(app_game);
var fs = require('fs');
// DMT TODO: Add other server util objects here.

/**
 * Global variables
 */
// list of currently connected clients (users)
var clients = [];

var CANVAS_WIDTH = 512;
var CANVAS_HEIGHT = 512;

/**
 * Server game loop, should be ticked @ 30fps
 */
function ServerGameLoop() {
	// randomly add enemies
	if(Math.random() < 0.1 && enemies.length < 20) {
		enemies[curEnemyID] = Enemy(curEnemyID++);
	}
	
	// clear clientEnemies
	clientEnemies.length = 0;
	// Update server's enemies array
	enemies.forEach(function(enemy, index) {
		enemy.update();
		// push a simple x,y client enemy instance
		clientEnemies.push({x:enemy.x,y:enemy.y});
	});
	enemies = enemies.filter(function(enemy) {
		return enemy.active;
	});
	
	// send enemies array to all clients
	clients.forEach(function(client) {
		client.send(JSON.stringify({type:'enemy', data:clientEnemies}));
	});
}

/**
 * WebSocket server
 */
var wsServer = new WebSocketServer({
	server:app
});

var currentID = 15000;
// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('connection', function(ws) {
	console.log((new Date()) + ' Connection from origin ' + ws.origin + '.');

	// accept connection - you should check 'request.origin' to make sure that
	// client is connecting from your website
	// (http://en.wikipedia.org/wiki/Same_origin_policy)
	var connection = ws;//request.accept(null, request.origin); 
	var userID = currentID++;

	console.log((new Date()) + ' Connection accepted.');
	
	// broadcast connection to all connected clients (before adding this connection to clients list)
	var json = JSON.stringify({ type:'userID', data: userID  });
	clients.forEach(function(client, userIDkey) {
		client.send(json);
		//console.log('Sending ' + json + ' to ' + client);
		// tell current connection about others
		connection.send(JSON.stringify({type:'userID',data:userIDkey}));
	});
	
	clients[userID] = connection;

	// user sent some message
	connection.on('message', function(message, flags) {
		if (!flags.binary) { // accept only text
			//console.log((new Date()) + ' Received Message from ' + userID + ': ' + message);
			var json = JSON.parse(message);
			if(json.type === 'playerUpdate') {
				console.log("playerUpdate: " + json.data);
				// re-broadcast to other clients
				clients.forEach(function(client, userIDkey){
					if(userIDkey !== userID) {
						// add userID so other clients know who to update
						// TODO: Make local clients know their own userID?
						json.data.userID = userID;
						client.send(JSON.stringify({type:'playerUpdate', data:json.data}));
					}
				});
			}
		}
	});

	// user disconnected
	connection.on('close', function(connection) {
		if (userID !== false) {
			console.log((new Date()) + " Peer " + connection + " disconnected.");
			// remove user from the list of connected clients
			delete clients[userID];
			
			clients.forEach(function(client) {
				client.send(JSON.stringify({type:'disconnect', data: userID}));
			});
//			// push back user's color to be reused by another user
//			colors.push(userColor);
		}
	});
});

app.listen(webSocketsServerPort);

var FPS = 30;
setInterval(function() {
	ServerGameLoop();
}, 1000/FPS);

