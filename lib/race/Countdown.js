'use strict';

let bluebird = require('bluebird');

class Countdown {

  contructor() {
    this.countingDown = false;
  }

  generate(options, emitter) {
    
    if (this.countingDown) {
      return bluebird.reject();
    }

    this.countingDown = true;
    var delay = options.delay;
    var promise = bluebird.resolve();
    for (var i = options.counts; i > 0; i--) {
      promise = this._emitAndAddDelay(promise, i, delay, emitter);
    }

    return promise
      .then(() => { this.countingDown = false; });
  }

  _emitAndAddDelay(promise, i, delay, emitter) {
    return promise.then(() => {
      emitter.emit('countdown', { count: i });
      return bluebird.delay(delay);
    });
  }

}

module.exports = Countdown;