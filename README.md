# Deck [![Build Status](https://travis-ci.org/JakeKo/Deck.svg?branch=master)](https://travis-ci.org/JakeKo/Deck)
Deck is an open-source, well-armed, safe-to-swallow, and fluoride-free application for editing and presenting slide decks.

# Runbook
As an NPM project, the process for building and running the code is quite easy. Simply run the following commands.
```
npm install
npm run serve
```
This will install the relevant NPM packages and spin up a local web server with Webpack. Once the server is running, navigate to [localhost:8080](http://localhost:8080).

# Testing
The Travis CI build system runs the unit tests each time. To test locally, run the following command.
```
npm test
```
This assumes all the NPM packages have been installed.