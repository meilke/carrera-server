var config;

function initialize(_config_) {
  config = _config_;

  function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
  
  return {
    watch: function (callback) {
      setInterval(function () {
        callback(config.players[randomInt(0, config.players.length - 1)]);
      }, 1000);
    },
    deinitialize: function () {}
  };
}

module.exports = initialize;