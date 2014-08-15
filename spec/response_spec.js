/*
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2014 Jiri Vrany, Jiri Hnidek
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

"use strict";

/* globals define, ArrayBuffer */

define(["response"], function(response, negotiation) {

    describe("Response", function() {
        var mock_buff, view, mes_len, i, data_str, result;


        describe("parse int message with auth success", function() {
            beforeEach(function() {
                mock_buff = new ArrayBuffer(8);
                view = new DataView(mock_buff);
                /* message length */
                view.setUint16(2, 8);
                /* command usr_auth_fail */
                view.setUint8(4, 8);
                /* command length */
                view.setUint8(5, 3);
                /* command method */
                view.setUint8(6, 2);
            });

            it("creates a mock buffer object", function() {
                expect(mock_buff).toBeDefined();
            });

            it("first value in result array should be command auth password for password mock message", function() {
                result = response.parse(mock_buff);

                expect(result[0]).toEqual({
                    CMD: "auth_passwd"
                });
            });

        });


        describe("got change_r with token from server", function() {
            beforeEach(function() {
                var message_type = 4,
                    feature_type = 4;

                data_str = "^DD31*$cZ6#t";

                mes_len = 4 + 3 + 1 + data_str.length;
                mock_buff = new ArrayBuffer(mes_len);
                view = new DataView(mock_buff);

                /* Verse header starts with version */
                /* First 4 bits are reserved for version of protocol */
                view.setUint8(0, 1 << 4);
                /* The length of the message */
                view.setUint16(2, mes_len);
                /*  message type  */
                view.setUint8(4, message_type);
                /* second byte - message length */
                view.setUint8(5, mes_len - 4);
                /* third byte - feature type */
                view.setUint8(6, feature_type);
                /* fourth byte - length of packed string */
                view.setUint8(7, data_str.length);

                //console.info(data_str);
                /* Pack the data_str */
                for (i = 0; i < data_str.length; i++) {
                    //console.info(data_str[i]);

                    view.setUint8(8 + i, data_str.charCodeAt(i));
                }

            });

            it("command should be parsed out as CHANGE_R", function() {
                result = response.parse(mock_buff);

                expect(result[0]).toEqual({
                    CMD: "CHANGE_R",
                    FEATURE: "TOKEN",
                    VALUE: data_str
                });
            });
        });


        describe("got confirm_r  CCID from server", function() {
            beforeEach(function() {
                var message_type = 6,
                    feature_type = 2;

                mes_len = 4 + 3 + 1;
                mock_buff = new ArrayBuffer(mes_len);
                view = new DataView(mock_buff);

                /* First 4 bits are reserved for version of protocol */
                view.setUint8(0, 1 << 4);
                view.setUint16(2, mes_len);
                view.setUint8(4, message_type);
                view.setUint8(5, mes_len - 4);
                view.setUint8(6, feature_type);
                view.setUint8(7, 18);   

            });

            it("command should be parsed out as CONFIRM_R, CCID, 18 object", function() {
                result = response.parse(mock_buff);

                expect(result[0]).toEqual({
                    CMD: "CONFIRM_R",
                    FEATURE: "CCID",
                    VALUE: 18
                });
            });
        });

    });
});
