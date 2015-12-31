var exec = require('child_process').execSync,
  Gpio = require('onoff').Gpio,
  _ = require('lodash'),
  leds,
  photos,
  config;

function initialize() {
  return {
    watch: watchAll,
    deinitialize: deinitialize
  };
}

function newLed(player) {
  var led = new Gpio(player.ledPin.bcm, 'out');
  led.writeSync(0);
  return led;
}

function newPhoto(player) {
  exec('gpio mode ' + player.photoPin.wpi + ' up');
  return { player: player, photo: new Gpio(player.photoPin.bcm, 'in', 'both') };
}

function watchSingle(callback, photo) {
  photo.photo.unwatchAll();
  photo.photo.watch(function (err, value) {
    if (callback && value) {
      callback(photo.player);
    }
  });
}

function unwatchSingle(photo) {
  photo.photo.unwatchAll();
}

function unexport(pin) {
  pin.unexport();
}

function unexportLed(led) {
  try {
    led.writeSync(1);
    unexport(led);
  } catch(e) {
    // temporary solution for using player-specific led config and re-using pins
    console.log('Error while de-initializing led!');
    console.log(e);
  }
}

function unexportPhoto(photo) {
  unexport(photo.photo);
  exec('gpio mode ' + photo.player.photoPin.wpi + ' down');
}

function watchAll(_config_, callback) {
  deinitialize();
  config = _config_;
  leds = _.map(config.players, newLed);
  photos = _.map(config.players, newPhoto);
  _.each(photos, _.partial(watchSingle, callback));
}

function deinitialize() {
  _.each(photos, unwatchSingle);
  _.each(leds, unexportLed);
  _.each(photos, unexportPhoto);
}

module.exports = initialize;
