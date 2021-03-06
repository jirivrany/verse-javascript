# verse-javascript

[![Build Status](https://travis-ci.org/verse/verse-javascript.png?branch=master)](https://travis-ci.org/verse/verse-javascript)
[![Code Climate](https://codeclimate.com/github/verse/verse-javascript/badges/gpa.svg)](https://codeclimate.com/github/verse/verse-javascript)
[![Test Coverage](https://codeclimate.com/github/verse/verse-javascript/badges/coverage.svg)](https://codeclimate.com/github/verse/verse-javascript)

Websocket support for Verse protocol. Keep in mind that this project is still **Work in progress**!

## Verse

Verse 2.0 is network protocol for real-time sharing of 3D data. It is successor of old Verse protocol developed at KTH. Verse 2.0 is still in alpha version.

## Usage

```bash
bower install verse
```

Verse Websocket module is provided in two versions. You can use it as [AMD](http://requirejs.org/docs/whyamd.html) for [RequireJs](http://requirejs.org/) or as a standalone library.

Minified versions of both modules can be found in the `./build` directory.

See examples in the `./example` directory. Choose standalone or amd *version* and then rename *version*.config.js
to `config.js`. Add you config values and open *version*.html file in your browser. Check console, do something nice...

## Requirements

* RequireJS http://requirejs.org/

If you want to use the unlinked sources, and run the Grunt task you will need also:

* Node.js v0.10+ http://nodejs.org
* Bower http://bower.io

## Build

```bash
git clone git@github.com:verse/verse-javascript.git 
cd verse-javascript
npm install
bower install
```

## License

The source code of Verse Javascript library is licensed under MIT license. This library could be used for implementation of Web based Verse client. For details look at file LICENSE.
