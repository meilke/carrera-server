'use strict';

let bluebird = require('bluebird');

class Countdown {

  generate(options, emitter) {
    var delay = options.delay;
    var promise = bluebird.resolve();
    for (var i = options.counts; i > 0; i--) {
      promise = this._emitAndAddDelay(promise, i, delay, emitter);
    }

    return promise;
  }

  _emitAndAddDelay(promise, i, delay, emitter) {
    return promise.then(() => {
      emitter.emit('countdown', { count: i });
      return bluebird.delay(delay);
    });
  }

}

module.exports = Countdown;