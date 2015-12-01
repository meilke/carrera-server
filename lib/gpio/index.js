var exec = require('child_process').execSync,
  Gpio = require('onoff').Gpio,
  _ = require('lodash'),
  leds,
  photos,
  config;

function initialize(_config_) {
  config = _config_;
  leds = _.map(config.players, newLed);
  photos = _.map(config.players, newPhoto);

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
  photo.photo.watch(function (err, value) {
    if (callback && value) {
      callback(photo.player);
    }
  });
}

function unexport(pin) {
  pin.unexport();
}

function unexportLed(led) {
  led.writeSync(1);
  unexport(led);
}

function unexportPhoto(photo) {
  unexport(photo.photo);
  exec('gpio mode ' + photo.player.photoPin.wpi + ' down');
}

function watchAll(callback) {
  _.each(photos, _.partial(watchSingle, callback));
}

function deinitialize() {
  _.each(leds, unexportLed);
  _.each(photos, unexportPhoto);
}

module.exports = initialize;
