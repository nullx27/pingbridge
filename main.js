"use strict";

var config = require('./config.json');

var Hipchatter = require('hipchatter');
var SlackRTM = require('@slack/client').RtmClient;

var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;

var MemoryDataStore = require('@slack/client').MemoryDataStore;

class PingBridge {

    constructor() {
        this.lastHipchatMessage = Date.now().toString();
        this.hipchat = new Hipchatter(config.hipchat.auth_token);
        this.slack = new SlackRTM(config.slack.auth_token, {
            logLevel: 'error',
            dataStore: new MemoryDataStore(),
            autoReconnect: true,
            autoMark: true
        });

        this.hipchatListener();
        this.slackListener();
    }

    hipchatListener() {
        var _this = this;
        for (var room of config.hipchat.rooms) {
            setInterval(() => {
                this.hipchat.history(room, this.handleHipchatHistory.bind(_this));
            }, 5000);
        }

        console.log("Started Hipchat listener");
    }

    slackListener() {
        var _this = this;
        this.slack.start();

        this.slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
            console.log('Connected to Slack.');
        });

        this.slack.on(RTM_EVENTS.MESSAGE, (message) => {

            for (var keyword of config.slack.keywords) {
                if (message.text.includes(keyword)) {
                    _this.forwardToHipchat(_this.slack.dataStore.getUserById(message.user).name, message.text);
                }
            }
        });

        console.log("Started Slack listener");
    }


    handleHipchatHistory(err, history) {
        if (err)
            console.log("An error has occured: " + err);

        for (var message of history.items) {
            var date = Date.parse(message.date);
            if (this.lastHipchatMessage < date.toString()) {
                this.lastHipchatMessage = date.toString();
                for (var keyword of config.hipchat.keywords) {
                    if (message.message.includes(keyword)) {
                        this.forwardToSlack(message.from.name, message.message);
                    }
                }
            }
        }
    }

    forwardToSlack(name, message) {
        var room = this.slack.dataStore.getChannelByName(config.slack.forward_room);
        var msg = config.slack.ping_template.replace('{name}', name).replace('{message}', message);

        this.slack.sendMessage(msg, room.id, () => {
            console.log("Hipchat -> Slack: " + msg);
        });
    }

    forwardToHipchat(name, message) {
        var msg = config.hipchat.ping_template.replace('{name}', name).replace('{message}', message);
        var msg_obj = {
            message: msg,
            color: 'gray',
            token: config.hipchat.room_token,
            notify: true
        };

        this.hipchat.notify(config.hipchat.forward_room, msg_obj, (err) => {
            if (err)
                console.log(err);

            console.log("Slack -> Hipchat: " + msg);
        });
    }
}

new PingBridge();