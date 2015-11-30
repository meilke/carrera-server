var exec = require('child_process').execSync,
  Gpio = require('onoff').Gpio,
  led,
  photo,
  config;

function initialize(_config_) {
  config = _config_;
  led = new Gpio(config.ledPin.bcm, 'out');
  photo = new Gpio(config.photoPin.bcm, 'in', 'both');
  exec('gpio mode ' + config.photoPin.wpi + ' up');
  led.writeSync(0);

  return {
    watchForSwitch: watchForSwitch,
    deinitialize: deinitialize
  };  
}

function watchForSwitch(callback) {
  photo.watch(function (err, value) {
    if (callback && value) {
      callback();
    }
  });
}

function deinitialize() {
  led.writeSync(1);
  led.unexport();
  photo.unexport();
  exec('gpio mode ' + config.photoPin.wpi + ' down');
}

module.exports = initialize;
