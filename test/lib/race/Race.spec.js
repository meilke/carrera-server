'use strict';

let Race = require('../../../lib/race/Race');
let _ = require('lodash');
let bluebird = require('bluebird');

describe('Race', () => {

  function simulateRace() {
    return race
      .start(configuredPlayers)
      .then(_.partial(bluebird.delay, 10))
      .then(_.bind(race.signal, race, configuredPlayers[1]))
      .then(_.partial(bluebird.delay, 10))
      .then(_.bind(race.signal, race, configuredPlayers[0]))
      .then(_.partial(bluebird.delay, 200))
      .then(_.bind(race.signal, race, configuredPlayers[0]))
      .then(_.partial(bluebird.delay, 100))
      .then(_.bind(race.signal, race, configuredPlayers[1]))
      .then(_.partial(bluebird.delay, 100))
      .then(_.bind(race.signal, race, configuredPlayers[1]));
  }

  var race,
    configuredPlayers = [
      { name: 'first', color: 'red' },
      { name: 'second', color: 'red' }
    ];

  beforeEach(() => {
    race = new Race({
      race: {
        countdown: {
          counts: 3,
          delay: 1
        }
      },
      players: configuredPlayers,
      signal: {
        ignoreUnderMs: 50
      }
    });
  });

  it('can be started', (done) => {
    race
      .start(configuredPlayers)
      .then(() => {
        expect(race.running).toEqual(true);
        done();
      });
  });

  it('cannot be started twice', (done) => {
    race
      .start(configuredPlayers)
      .then((result) => {
        expect(result.alreadyStarted).toEqual(false);
        return race.start(configuredPlayers);
      })
      .then((result) => {
        expect(result.alreadyStarted).toEqual(true);
        done();
      });
  });

  it('starts with a countdown', (done) => {
    var countdowns = [];
    race.on('countdown', (countdown) => {
      countdowns.push(countdown);
    });
    race
      .start(configuredPlayers)
      .then(() => {
        expect(countdowns.length).toEqual(3);
        done();
      });
  });

  it('does not allow start during countdown', (done) => {
    var countdowns = [];
    race.on('countdown', (countdown) => {
      countdowns.push(countdown);
    });
    bluebird
      .all([race.start(configuredPlayers), race.start(configuredPlayers), race.start(configuredPlayers), race.start(configuredPlayers)])
      .then(() => {
        expect(countdowns.length).toEqual(3);
        done();
      });
  });

  it('generates a started event with the initial player data', (done) => {
    var resultingPlayers = {};
    race.on('started', (players) => {
      resultingPlayers = players;
    });
    race
      .start(configuredPlayers)
      .then(() => {
        expect(resultingPlayers.length).toEqual(2);
        expect(resultingPlayers[1].name).toEqual('second');
        expect(resultingPlayers[1].laps).toEqual(0);
        expect(resultingPlayers[1].lapData.length).toEqual(0);
        done();
      });
  });

  it('accumulates laps', (done) => {
    simulateRace()
      .then(() => {
        var players = race.getPlayers();
        expect(players[0].laps).toEqual(1);
        expect(players[1].laps).toEqual(2);
        done();
      });
  });

  it('ignores laps too short', (done) => {
    race
      .start(configuredPlayers)
      .then(_.partial(bluebird.delay, 10))
      .then(_.bind(race.signal, race, configuredPlayers[0]))
      .then(_.partial(bluebird.delay, 30))
      .then(_.bind(race.signal, race, configuredPlayers[0]))
      .then(_.partial(bluebird.delay, 100))
      .then(_.bind(race.signal, race, configuredPlayers[0]))
      .then(_.partial(bluebird.delay, 100))
      .then(_.bind(race.signal, race, configuredPlayers[0]))
      .then(() => {
        var players = race.getPlayers();
        expect(players[0].laps).toEqual(2);
        expect(players[0].lapData[0].elapsedMs).toBeGreaterThan(120);
        expect(players[0].lapData[1].elapsedMs).toBeLessThan(120);
        done();
      });
  });

  it('sets the first player as the leader before the race', (done) => {
    race
      .start(configuredPlayers)
      .then(() => {
        var players = race.getPlayers();
        expect(players[0].leader).toEqual(true);
        expect(players[1].leader).toEqual(false);
        done();
      });
  });

  it('sets a leader during the race', (done) => {
    simulateRace()
      .then(() => {
        var players = race.getPlayers();
        expect(players[0].leader).toEqual(false);
        expect(players[1].leader).toEqual(true);
        done();
      });
  });

});