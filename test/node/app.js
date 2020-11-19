"use strict"

const session = require("../../scripts/aws-get-session");
const WebSocket = require('ws');
const readline = require('readline');
const ssm = require("../../ssm.js");

const termOptions = {
	rows: 34,
	cols: 197
};

(async () => {
	const token = process.argv[2];
	const streamUrl = process.argv[3];

	readline.emitKeypressEvents(process.stdin);
	if (process.stdin.isTTY)
		process.stdin.setRawMode(true);
	process.stdin.on('keypress', (str, key) => {
		if (connection.readyState === connection.OPEN) {
			ssm.sendText(connection, str);
		}
	});

	const WebSocket = require('ws')
	const connection = new WebSocket(streamUrl)

	connection.onopen = () => {
		ssm.init(connection, {
			token: token,
			termOptions: termOptions
		})
	}

	connection.onerror = (error) => {
		console.log(`WebSocket error: ${error}`)
	}

	connection.onmessage = (event) => {
		var agentMessage = ssm.decode(event.data);
		ssm.sendACK(connection, agentMessage);
		if (agentMessage.payloadType === 1){
			process.stdout.write(agentMessage.payload);
		} else if (agentMessage.payloadType === 17){
			ssm.sendInitMessage(connection, termOptions);
		}
	}

	connection.onclose = () => {
		console.log("websocket closed")
		process.exit(0);
	}
})();
