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

define(["tag"], function(tag) {

    describe("Tag command test suite", function() {
        var testCommand, view, messageLen, mockBuffer, mockView, result, opCode, mockString;

        describe("Prepare Tag create command", function() {
            beforeEach(function() {
                // node_id, tg_id, data_type, count custom_type
                testCommand = tag.create(182, 17, 'UINT32', 4, 298);
                view = new DataView(testCommand);
            });

            it("length of create command should be equal to 15", function() {
                expect(testCommand.byteLength).toEqual(15);
            });

            it("first byte - opcode - should be 68", function() {
                expect(view.getUint8(0)).toEqual(68);
            });

            it("second byte - message length - should be 15 ", function() {
                expect(view.getUint8(1)).toEqual(15);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 182", function() {
                expect(view.getUint32(3)).toEqual(182);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(17);
            });

            it("tag (byte 10) id should be 65535", function() {
                expect(view.getUint16(9)).toEqual(65535);
            });

            it("data type (byte 12) id should be 3", function() {
                expect(view.getUint8(11)).toEqual(3);
            });

            it("data type (byte 13) id should be 4", function() {
                expect(view.getUint8(12)).toEqual(4);
            });

            it("custom_type (byte 14) id should be 298", function() {
                expect(view.getUint16(13)).toEqual(298);
            });
        });

        describe("Tag create command (wrong data type)", function() {
            it("the command should not be created", function() {
                // REAL8 is not any data type
                testCommand = tag.create(182, 17, 'REAL8', 4, 299);
                expect(testCommand === null);
            });
        });

        describe("Prepare Tag destroy command", function() {
            beforeEach(function() {
                testCommand = tag.destroy(183, 18, 2); // node_id, tg_id, tag_id
                view = new DataView(testCommand);
            });

            it("length of tag destroy command should be equal to 11", function() {
                expect(testCommand.byteLength).toEqual(11);
            });

            it("first byte - opcode - should be 69", function() {
                expect(view.getUint8(0)).toEqual(69);
            });

            it("second byte - message length - should be 11 ", function() {
                expect(view.getUint8(1)).toEqual(11);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });
        });

        describe("Prepare Tag set command (two uint8 items)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'UINT8', [1, 2]);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 13", function() {
                expect(testCommand.byteLength).toEqual(13);
            });

            it("first byte - opcode - should be 71", function() {
                expect(view.getUint8(0)).toEqual(71);
            });

            it("second byte - message length - should be 13 ", function() {
                expect(view.getUint8(1)).toEqual(13);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("1st value (byte 12) should be 1", function() {
                expect(view.getUint8(11)).toEqual(1);
            });

            it("2nd value (byte 12) should be 2", function() {
                expect(view.getUint8(12)).toEqual(2);
            });
        });

        describe("Tag set command (wrong data type)", function() {
            it("the command should not be created", function() {
                // REAL8 is not any data type
                testCommand = tag.set(182, 17, 2, 'REAL8', [3.14]);
                expect(testCommand === null);
            });
        });

        describe("Prepare Tag set command (two uint16 items)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'UINT16', [1001, 1002]);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 15", function() {
                expect(testCommand.byteLength).toEqual(15);
            });

            it("first byte - opcode - should be 75", function() {
                expect(view.getUint8(0)).toEqual(75);
            });

            it("second byte - message length - should be 15 ", function() {
                expect(view.getUint8(1)).toEqual(15);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("1st value (byte 12) should be 1001", function() {
                expect(view.getUint16(11)).toEqual(1001);
            });

            it("2nd value (byte 14) should be 1002", function() {
                expect(view.getUint16(13)).toEqual(1002);
            });
        });

        describe("Prepare Tag set command (two uint32 items)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'UINT32', [100001, 100002]);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 19", function() {
                expect(testCommand.byteLength).toEqual(19);
            });

            it("first byte - opcode - should be 79", function() {
                expect(view.getUint8(0)).toEqual(79);
            });

            it("second byte - message length - should be 19 ", function() {
                expect(view.getUint8(1)).toEqual(19);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("1st value (byte 12) should be 100001", function() {
                expect(view.getUint32(11)).toEqual(100001);
            });

            it("2nd value (byte 16) should be 100002", function() {
                expect(view.getUint32(15)).toEqual(100002);
            });
        });

        describe("Prepare Tag set command (two uint64 items)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'UINT64', [100001, 100002]);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 27", function() {
                expect(testCommand.byteLength).toEqual(27);
            });

            it("first byte - opcode - should be 83", function() {
                expect(view.getUint8(0)).toEqual(83);
            });

            it("second byte - message length - should be 27 ", function() {
                expect(view.getUint8(1)).toEqual(27);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("1st value (byte 12) should be 100001", function() {
                expect(view.getUint32(11 + 4)).toEqual(100001);
            });

            it("2nd value (byte 20) should be 100002", function() {
                expect(view.getUint32(19 + 4)).toEqual(100002);
            });
        });

        describe("Prepare Tag set command (two real32 items)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'REAL32', [3.141592, 2.718281]);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 19", function() {
                expect(testCommand.byteLength).toEqual(19);
            });

            it("first byte - opcode - should be 91", function() {
                expect(view.getUint8(0)).toEqual(91);
            });

            it("second byte - message length - should be 19 ", function() {
                expect(view.getUint8(1)).toEqual(19);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("1st value (byte 12) should be 3.141592", function() {
                expect(view.getFloat32(11)).toBeCloseTo(3.141592);
            });

            it("2nd value (byte 16) should be 2.718281", function() {
                expect(view.getFloat32(15)).toBeCloseTo(2.718281);
            });
        });

        describe("Prepare Tag set command (two real64 items)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'REAL64', [3.141592, 2.718281]);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 27", function() {
                expect(testCommand.byteLength).toEqual(27);
            });

            it("first byte - opcode - should be 95", function() {
                expect(view.getUint8(0)).toEqual(95);
            });

            it("second byte - message length - should be 27 ", function() {
                expect(view.getUint8(1)).toEqual(27);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("1st value (byte 12) should be 3.141592", function() {
                expect(view.getFloat64(11)).toBeCloseTo(3.141592);
            });

            it("2nd value (byte 20) should be 2.718281", function() {
                expect(view.getFloat64(19)).toBeCloseTo(2.718281);
            });
        });

        describe("Prepare Tag set command (one string)", function() {
            beforeEach(function() {
                // node_id, tg_id, tag_id, data_type, array of values
                testCommand = tag.set(183, 18, 2, 'STRING8', ['Ahoj']);
                view = new DataView(testCommand);
            });

            it("length of tag set command should be equal to 16", function() {
                expect(testCommand.byteLength).toEqual(16);
            });

            it("first byte - opcode - should be 98", function() {
                expect(view.getUint8(0)).toEqual(98);
            });

            it("second byte - message length - should be 16 ", function() {
                expect(view.getUint8(1)).toEqual(16);
            });

            it("third byte - share - should be 0 ", function() {
                expect(view.getUint8(2)).toEqual(0);
            });

            it("fourth byte node ID should be 183", function() {
                expect(view.getUint32(3)).toEqual(183);
            });

            it("tagGroup (byte 8) id should be 17", function() {
                expect(view.getUint16(7)).toEqual(18);
            });

            it("tag (byte 10) id should be 2", function() {
                expect(view.getUint16(9)).toEqual(2);
            });

            it("String length should be 4", function() {
                expect(view.getUint8(11)).toEqual(4);
            });

            it("1st character should be 'A'", function() {
                expect(view.getUint8(12)).toEqual('A'.charCodeAt(0));
            });

            it("2nd character should be 'h'", function() {
                expect(view.getUint8(13)).toEqual('h'.charCodeAt(0));
            });

            it("3th character should be 'o'", function() {
                expect(view.getUint8(14)).toEqual('o'.charCodeAt(0));
            });

            it("4th character should be 'j'", function() {
                expect(view.getUint8(15)).toEqual('j'.charCodeAt(0));
            });
        });

        describe("got tagCreate from server", function() {
            beforeEach(function() {

                messageLen = 15;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 68); //tagCreate command
                view.setUint8(1, 15); //length
                view.setUint8(2, 0); //share is 0
                view.setUint32(3, 6545); //Node ID
                view.setUint16(7, 68); //TagGroupID
                view.setUint16(9, 154); //TagID
                view.setUint8(11, 3); //Data Type
                view.setUint8(12, 4); //Count
                view.setUint16(13, 298); //custom type
            });

            it("command should be parsed out as TAG_CREATE, NODE_ID = 111 object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(68, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_CREATE",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154,
                    DATA_TYPE: 3,
                    COUNT: 4,
                    CUSTOM_TYPE: 298
                });
            });
        });

        describe("got tagDestroy from server", function() {
            beforeEach(function() {

                messageLen = 11;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 69); //tagDestroy command
                view.setUint8(1, 15); //length
                view.setUint8(2, 0); //share is 0
                view.setUint32(3, 6545); //Node ID
                view.setUint16(7, 68); //TagGroupID
                view.setUint16(9, 154); //TagID

            });

            it("command should be parsed out as TAG_DESTROY object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(69, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_DESTROY",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154
                });
            });
        });

        describe("got tagSetUint8 4D from server", function() {
            beforeEach(function() {

                messageLen = 15;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 73); // tagSetUint8 3D command
                view.setUint8(1, 14); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setUint8(11, 15); // X Value
                view.setUint8(12, 55); // Y Value
                view.setUint8(13, 6); // Z Value
                view.setUint8(14, 52); // Z Value

            });

            it("command should be parsed out as TAG_SET_UINT8 object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(73, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_SET_UINT8",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154,
                    VALUES: [15, 55, 6, 52]
                });
            });
        });

        describe("got tagSetUint16 4D from server", function() {
            beforeEach(function() {

                messageLen = 19;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 77); // tagSetUint8 3D command
                view.setUint8(1, 14); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setUint16(11, 15); // X Value
                view.setUint16(13, 55); // Y Value
                view.setUint16(15, 6); // Z Value
                view.setUint16(17, 52); // Z Value

            });

            it("command should be parsed out as TAG_SET_UINT16 object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(77, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_SET_UINT16",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154,
                    VALUES: [15, 55, 6, 52]
                });
            });
        });

        describe("got tagSetUint32 4D from server", function() {
            beforeEach(function() {

                messageLen = 27;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 81); // tagSetUint32 4D command
                view.setUint8(1, messageLen); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setUint32(11, 155465); // 1 Value
                view.setUint32(15, 5535654); // 2 Value
                view.setUint32(19, 6455453); // 3 Value
                view.setUint32(23, 54643); // 4 Value

            });

            it("command should be parsed out as TAG_SET_UINT32 4D object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(81, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_SET_UINT32",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154,
                    VALUES: [155465, 5535654, 6455453, 54643]
                });
            });
        });

        describe("got tagSetUint64 4D from server", function() {
            beforeEach(function() {

                messageLen = 43;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 85); // tagSetUint64 4D command
                view.setUint8(1, messageLen); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setUint32(11, 155465); // 1 Value
                view.setUint32(19, 5535654); // 2 Value
                view.setUint32(27, 6455453); // 3 Value
                view.setUint32(35, 54643); // 4 Value

            });

            it("command should be parsed out as TAG_SET_UINT64 4D object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(85, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_SET_UINT64",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154,
                    VALUES: [155465, 5535654, 6455453, 54643]
                });
            });
        });


        describe("got tagSetReal32 4D from server", function() {
            beforeEach(function() {

                messageLen = 28;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, 93); // tagSetReal32 2D command
                view.setUint8(1, messageLen); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setFloat32(11, 15.3234); // 1 Value
                view.setFloat32(15, 98.35654); // 2 Value
                view.setFloat32(19, 98.35654); // 2 Value
                view.setFloat32(23, 8.8454); // 2 Value    

            });

            it("command should be parsed out as TAG_SET_UINT64 2D object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(93, mockView, 0, mockBuffer.byteLength);

                expect(result.CMD).toEqual("TAG_SET_REAL32");
            });

            it("lenght of VALUES array should be 4", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(93, mockView, 0, mockBuffer.byteLength);

                expect(result.VALUES.length).toEqual(4);
            });

            it("VALUES should be close to originals", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(93, mockView, 0, mockBuffer.byteLength);

                expect(result.VALUES[1]).toBeCloseTo(98.35654);
                expect(result.VALUES[0]).toBeCloseTo(15.3234);
                expect(result.VALUES[2]).toBeCloseTo(98.35654);
                expect(result.VALUES[3]).toBeCloseTo(8.8454);
            });

        });

        describe("got tagSetReal64 4D from server", function() {
            beforeEach(function() {

                opCode = 97; // tagSetReal64 4D command
                messageLen = 43;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, opCode);
                view.setUint8(1, messageLen); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setFloat64(11, 125.453457876465465463234); // 1 Value
                view.setFloat64(19, 125.453457876465465463234); // 1 Value
                view.setFloat64(27, 125.453457876465465463234); // 1 Value
                view.setFloat64(35, 125.453457876465465463234); // 1 Value


            });

            it("command should be parsed out as TAG_SET_UINT64 2D object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(opCode, mockView, 0, mockBuffer.byteLength);

                expect(result.CMD).toEqual("TAG_SET_REAL64");
            });

            it("lenght of VALUES array should be 4", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(opCode, mockView, 0, mockBuffer.byteLength);

                expect(result.VALUES.length).toEqual(4);
            });

            it("second of VALUES should be close to 98.35654", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(opCode, mockView, 0, mockBuffer.byteLength);

                expect(result.VALUES[3]).toBeCloseTo(125.453457876465465463234);
            });

        });

        describe("got tagSetString8 from server", function() {
            beforeEach(function() {

                opCode = 98; //tagSetString8 command
                mockString = "test";
                messageLen = 12 + mockString.length;
                mockBuffer = new ArrayBuffer(messageLen);
                view = new DataView(mockBuffer);

                view.setUint8(0, opCode); // 
                view.setUint8(1, messageLen); // length
                view.setUint8(2, 0); // share is 0
                view.setUint32(3, 6545); // Node ID
                view.setUint16(7, 68); // TagGroupID
                view.setUint16(9, 154); // TagID
                view.setUint8(11, mockString.length); // string length
                for (var i = 0; i < mockString.length; i++) {
                    view.setUint8(12 + i, mockString.charCodeAt(i));
                }

            });

            it("command should be parsed out as TAG_SET_STRING8 object", function() {

                mockView = new DataView(mockBuffer);
                result = tag.getTagValues(opCode, mockView, 0, mockBuffer.byteLength);

                expect(result).toEqual({
                    CMD: "TAG_SET_STRING8",
                    SHARE: 0,
                    NODE_ID: 6545,
                    TAG_GROUP_ID: 68,
                    TAG_ID: 154,
                    VALUE: mockString
                });
            });



        });


    });


});
