'use strict';

let _ = require('lodash');
let uuid = require('node-uuid');
let EventEmitter = require('events');
let bluebird = require('bluebird');

class Race extends EventEmitter {

  constructor(config) {
    super();
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
      return;
    }

    var delay = 1000;
    bluebird
      .delay(delay)
      .then(() => {
        this.emit('countdown', { count: 2 });
        return bluebird.delay(delay);
      })
      .then(() => {
        this.emit('countdown', { count: 1 });
        return bluebird.delay(delay);
      })
      .then(() => {
        this.emit('countdown', { count: 0 });
        this._startTime = Date.now();
        this._players = _.map(this._config.players, _.partial(this._newPlayer, this._startTime));
        this._setLeader(this._players[0]);
        this.running = true;
        this.emit('started', this.getPlayers());
      });
  }

  stop() {
    this._players = [];
    this.leader = {};
    this._startTime = Date.now();
    this.running = false;
  }

  addLap(p) {
    var player = this.findPlayerByName(p.name);
    this._updatePlayer(player);
    this._updateLeaderIfNecessary(player);
  }

  getPlayers() {
    var self = this;
    return _.map(self._players, (player) => {
      return _.extend({
        leader: player.name === self.leader.player.name,
        bestLap: self.getBestLap(player)
      }, player);
    });
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
             laps: 0,
             lapData: [],
             lastTime: now,
             color: player.color
    };
  }

  _updatePlayer(player) {
    var newTime = Date.now();
    player.lapData.push(this._createLap(player, newTime));
    player.laps++;
    player.lastTime = newTime;
  }

  _setLeader(player) {
    this.leader = { laps: player.laps, player: player };
  }

  _updateLeaderIfNecessary(player) {
    if (player.laps > this.leader.laps) {
      this._setLeader(player);
    };
  }
}

module.exports = Race;