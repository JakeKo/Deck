# Deck [![Build Status](https://travis-ci.org/JakeKo/Deck.svg?branch=master)](https://travis-ci.org/JakeKo/Deck)
Deck is an open-source, well-armed, safe-to-swallow, and fluoride-free application for editing and presenting slide decks.

# Public Access
Deck is currently deployed and available for alpha testing [here](https://jakeko.github.io/Deck/). Feel free to leave feedback [here](https://github.com/JakeKo/Deck/issues/new/choose). The feedback link is also available on the alpha site.

# Technology Stack
The application makes heavy use of [Vue.js](https://vuejs.org/), a hip, modern component-based JS framework (much like React or Angular). Vue is used in conjunction with [Typescript](https://www.typescriptlang.org/) and few helpful plugins to encourage object-oriented component design. For testing Vue components, the project uses [MochaJS](https://mochajs.org/). Finally, to transpile, bundle, and minify all of the project assets, Deck uses [Webpack](https://webpack.js.org/).

# Runbook
As an NPM project, the process for building and running the code locally is quite easy. Simply run the following commands.
```
npm install
npm run serve
```
This will install the relevant NPM packages and spin up a local web server with Webpack. Once the server is running, navigate to [localhost](http://localhost:8080).

# Testing
The Travis CI build system runs the unit tests each time. To test locally, run the following command.
```
npm test
```
This assumes all the NPM packages have been installed.