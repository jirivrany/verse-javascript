/*
 * Verse Websocket Asynchronous Module
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

/*globals ArrayBuffer, define*/

define(function() {
    'use strict';

    var negotiation, sendStringMessage, sendIntMessage;

    /**
     * Abstract string message array buffer
     * @param messageType int
     * @param payload string
     * @param featureType int
     **/
    sendStringMessage = function(messageType, payload, featureType) {
        var buf, view, messageLen, i;

        messageLen = 3 + 1 + payload.length;
        buf = new ArrayBuffer(messageLen);
        view = new DataView(buf);
        /* first byte - message type */
        view.setUint8(0, messageType);
        /* second byte - message length */
        view.setUint8(1, messageLen);
        /* third byte - feature type */
        view.setUint8(2, featureType);
        /* fourth byte - length of packed string */
        view.setUint8(3, payload.length);

        //console.info(payload);
        /* Pack the payload */
        for (i = 0; i < payload.length; i++) {
            //console.info(payload[i]);

            view.setUint8(4 + i, payload.charCodeAt(i));
        }

        return buf;
    };

    /**
     * Abstract int message array buffer
     * @param messageType int
     * @param payload int
     * @param featureType int
     **/

    sendIntMessage = function(messageType, payload, featureType) {
        var buf, view;

        buf = new ArrayBuffer(4);
        view = new DataView(buf);
        /* first byte - message type */
        view.setUint8(0, messageType);
        /* second byte - message length */
        view.setUint8(1, 4);
        /* third byte - feature type */
        view.setUint8(2, featureType);
        /* fourth byte - id */
        view.setUint8(3, payload);

        return buf;
    };

    /*
     * Parses received ArrayBuffer, find correct feature name and value
     * @param feature - int feature number
     * @param  receivedView - DataView for received buffer
     * @param bufferPosition - int current reading posititon
     * @param lenght - lenght of command
     */
    var parseFeature = function parseFeature(feature, receivedView, bufferPosition, length) {
        var value,
            stringFeatures = {
                3: 'HOST_URL',
                4: 'TOKEN',
                5: 'DED',
                9: 'CLIENT_NAME',
                10: 'CLIENT_VERSION'
            },
            intFeatures = {
                1: 'FCID',
                2: 'CCID',
                6: 'RWIN',
                8: 'COMMAND_COMPRESSION'
            };


        /* istanbul ignore else  */    
        if (feature in stringFeatures) {
            value = parseStringValue(receivedView, length, bufferPosition);
            return {
                FEATURE: stringFeatures[feature],
                VALUE: value
            };
        }

        /* istanbul ignore else  */
        if (feature in intFeatures) {
            return {
                FEATURE: intFeatures[feature],
                VALUE: receivedView.getUint8(7)
            };
        }
    };

    /*
     * Parses received ArrayBuffer returns stored string value
     * @param  receivedDataView - DataView for received buffer
     * @param bufferPosition - int current reading posititon
     * @param lenght - lenght of command
     */

    var parseStringValue = function parseStringValue(receivedDataView, length, bufferPosition) {
        var i, result = '';
        for (i = 0; i <= length - 4; i++) {
            result += String.fromCharCode(receivedDataView.getUint8(bufferPosition + 2 + i));
        }
        return result.slice(1);
    };

    /*
     * negotiation module
     */

    negotiation = {

        /* message types */
        CHANGE_L: 3,
        CHANGE_R: 4,
        CONFIRM_L: 5,
        CONFIRM_R: 6,

        getFeatureValues: function getFeatureValues(feature, receivedView, bufferPosition, length) {
            return parseFeature(feature, receivedView, bufferPosition, length);
        },

        /*
         * Flow Control ID (FCID)
         * feature type 1
         * @param type : int message type
         * @param id : fcid Value range: 0 - 255
         */
        fcid: function(type, id) {
            return sendIntMessage(type, id, 1);
        },

        /*
         * Congestion Control ID (CCID)
         * feature type 2
         * @param type : int message type
         * @param id : fcid Value range: 0 - 255
         */
        ccid: function(type, id) {
            return sendIntMessage(type, id, 2);
        },

        /*
         * URL of host defined in RFC 1738
         * feature type 3
         * @param type : int message type
         * @param nurl : string
         */
        url: function(type, nurl) {
            return sendStringMessage(type, nurl, 3);
        },

        /*
         * Token
         * feature type 4
         * @param type : int message type
         * @param tokenString : string
         */
        token: function(type, tokenString) {
            return sendStringMessage(type, tokenString, 4);
        },


        /*
         * Data Exchange Definition (DED)
         * feature type 5
         * @param type : int message type
         * @param dedString : string
         */
        ded: function(type, dedString) {
            return sendStringMessage(type, dedString, 5);
        },

        /*
         * Scale factor of RWIN used in Flow Control
         * feature type 6
         * @param type : int message type
         * @param id : rwin Value range: 0 - 255
         */
        rwin: function(type, value) {
            return sendIntMessage(type, value, 6);
        },

        /*
         * Frames per Seconds
         * feature type 7
         * @param type : int message type
         * @param fps: float Value range: Float min - Float max
         */

        fps: function(messageType, value) {
            var buf, view;

            buf = new ArrayBuffer(7);
            view = new DataView(buf);
            /* first byte - message type */
            view.setUint8(0, messageType);
            /* second byte - message length */
            view.setUint8(1, 7);
            /* third byte - feature type */
            view.setUint8(2, 7);
            /* fourth byte - value */
            view.setFloat32(3, value);

            return buf;
        },

        /*
         * Command Compression
         * feature type 8
         * @param type : int message type
         * @param id : compress Value range: 0 - 255
         */
        compression: function(type, value) {
            return sendIntMessage(type, value, 8);
        }



    };

    return negotiation;

});
