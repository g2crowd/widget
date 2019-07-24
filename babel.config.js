const presets = [
  [
    '@babel/env',
    {
      targets: {
        browsers: ['last 2 versions', '> 5%', 'ie 9-11'],
      },
      useBuiltIns: 'usage',
      corejs: '2.6'
    },
  ],
];

module.exports = { presets };
