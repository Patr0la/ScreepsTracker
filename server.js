'use strict';
var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var fs = require("fs");

var uri = "mongodb+srv://server_0:1Wuj5IoQvZFCUNeY@maincluster-8n1cy.mongodb.net/maindb?retryWrites=true";

const dbName = 'maindb';

var db, cl;

MongoClient.connect(uri, {
	useNewUrlParser: true
}, function(err, client) {
	if (err)
		throw (err);

	console.log("Connected successfully to server");

	cl = client;

	db = client.db(dbName);

	setInterval(function() {
		try {
			LOOP();
			ddsadsa
		} catch (e) {
			fs.appendFile("./errors.txt", e + "\n" + e.stack, function(err) {
				if (err) {
					return console.log(err);
				}

				console.log("ERROR: " + e);
			});
		}
	}, 10000);

});

const https = require("https");
const zlib = require("zlib");

const url = "https://screeps.com/api/user/memory?_token=cbc61243-a00d-42e2-9619-42e5e52fddcf&shard=shard1";

function LOOP() {
	console.log("looping...");
	https.get(url, res => {
		res.setEncoding("utf8");
		let body = "";
		res.on("data", data => {
			body += data;
		});
		res.on("end", () => {
			body = JSON.parse(body);
			const buffer = Buffer.from(body.data.split(':')[1], 'base64');
			zlib.unzip(buffer, (err, buffer) => {
				if (!err) {
					ProcesData(buffer.toString());
				} else {
					console.log(err);
					db.close();
					process.exit();
				}
			});
		});
	});
}

function ProcesData(input) {
	let data = JSON.parse(input);
	SaveData(data);
}
let c = 0;

function SaveData(data) {
	for (let r in data.stats.rooms) {
		if (data.stats.rooms.hasOwnProperty(r)) {
			delete data.stats.rooms[r].sources;
		}
	}
	let toSave = {
		time: Date.now(),
		tick: data.stats.tick,
		cpu: data.stats.cpu,
		gcl: data.stats.gcl,
		market: data.stats.market,
		rooms: data.stats.rooms
	};

	const collection = db.collection('rooms');

	var totalResources = {};

	for (let r in toSave.rooms) {
		if (toSave.rooms.hasOwnProperty(r)) {
			let s = toSave.rooms[r].storage.resources;
			collection.insert({
				time: toSave.time,
				tick: toSave.tick,
				room: r.toString(),
				storage: s
			});
			for (let res in s) {
				if (s.hasOwnProperty(res)) {
					if (totalResources[res]) totalResources[res] += s[res];
					else totalResources[res] = 0 + s[res];
				}
			}
		}
	}

	const collectionGlobal = db.collection('global');
	collectionGlobal.insert({
		time: toSave.time,
		tick: toSave.tick,
		cpu: toSave.cpu,
		gcl: toSave.gcl,
		market: toSave.market,
		totalResources: totalResources
	});

	console.log("loopSuccessful");
}

function f(x) {
	if (x) return x;
	return 0;
}