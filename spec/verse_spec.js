/*
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2014 Jiri Vrany, Jiri Hnidek
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

'use strict';

/* globals define, window */

define(['verse'], function(verse) {

    describe('Spy Test', function() {
        var config;

        describe('first try', function() {
            beforeEach(function() {
                config = {
                    uri: 'ws://verse.local:23456',
                    version: 'v1.verse.tul.cz',
                    username: 'user',
                    passwd: 'paswd'
                };

                // Spy on init function of verse object
                spyOn(verse, 'init');

                // Spy on atempt of connecting to server using WebSocket
                spyOn(window, 'WebSocket').and.returnValue(function() {
                    return {
                        onmessage: null
                    };
                });

                verse.init(config);
            });

            it("Tracks that the verse.init was called", function() {
                expect(verse.init).toHaveBeenCalledWith(config);
            });

        });

    });

});
