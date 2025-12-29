export default {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  transform: {
    '^.+\\.(js|mjs)$': 'babel-jest',
  },
  verbose: true,
};
