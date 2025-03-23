// widget/babel.config.js
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions', 'not dead', '> 0.5%']
          }
        }
      ]
    ]
  };