'use strict';

let _ = require('lodash');
let uuid = require('node-uuid');
let EventEmitter = require('events');
let bluebird = require('bluebird');
let Countdown = require('./Countdown');

class Race extends EventEmitter {

  constructor(config) {
    super();
    this._countdown = new Countdown();
    this._config = config;
    this._players = [];
    this._startTime = Date.now();
    this.running = false;
    this.leader = {};
  }

  getLastLap(p) {
    var player = this.findPlayerByName(p.name);
    return _.last(player.lapData);
  }

  getBestLap(p) {
    var player = this.findPlayerByName(p.name);
    return _.sortByOrder(player.lapData, ['elapsedSec'], ['asc'])[0];
  }

  findPlayerByName(playerName) {
    return _.find(this._players, (player) => { return player.name === playerName; });
  }

  start() {

    if (this.running) {
      return bluebird.resolve({alreadyStarted: true});
    }

    return this._countdown
      .generate(this._config.race.countdown, this)
      .then(() => {
        this._startTime = Date.now();
        this._players = _.map(this._config.players, _.partial(this._newPlayer, this._startTime));
        this._setLeader(this._players[0]);
        this.running = true;
        this.emit('started', this.getPlayers());
        return {alreadyStarted: false};
      })
      .catch(() => {
        return {alreadyStarted: true};
      });
  }

  stop() {
    this._players = [];
    this._startTime = Date.now();
    this.running = false;
  }

  signal(p) {
    var player = this.findPlayerByName(p.name);
    this._updatePlayer(player);
    this._updateLeaderIfNecessary(player);
  }

  getPlayers() {
    var self = this;
    return _.map(self._players, (player) => {
      return _.extend({
        leader: player.name === self.leader.name,
        bestLap: self.getBestLap(player)
      }, player);
    });
  }

  isCountingDown() {
    return this._countdown.countingDown;
  }

  _createLap(player, time) {
    var elapsedMs = time - player.lastTime;
    return {
      elapsedMs: elapsedMs,
      elapsedSec: elapsedMs/1000,
      id: uuid.v4(),
      lap: player.laps
    };
  }

  _newPlayer(now, player) {
    return {
             name: player.name,
             signals: 0,
             laps: 0,
             lapData: [],
             lastTime: now,
             color: player.color
    };
  }

  _updatePlayer(player) {
    player.signals++;
    var newTime = Date.now();
    if (player.signals > 1) {
      player.lapData.push(this._createLap(player, newTime));
      player.laps++;
    }
    player.lastTime = newTime;
  }

  _setLeader(player) {
    this.leader = player;
  }

  _updateLeaderIfNecessary(player) {
    if (player.signals > this.leader.signals) {
      this._setLeader(player);
    };
  }
}

module.exports = Race;