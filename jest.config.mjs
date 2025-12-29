// Jest ESM config
export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  testRegex: '.*\\.test\\.mjs$',
  transform: {
    '^.+\\.mjs$': ['babel-jest', { presets: ['@babel/preset-env'] }],
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!jsdom|@exodus|html-encoding-sniffer)/',
  ],
  verbose: true,
};
