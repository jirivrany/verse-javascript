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

/* globals define */

define(['command', 'Int64'], function(command, Int64) {
    'use strict';

    var commands, get_routines, data_types, data_type_len, op_codes, layer, set_routines,
        getLayerCreateCommons, getLayerSetUint8, getLayerSetUint16,
        getLayerSetUint32, getLayerSetUint64, getLayerSetFloat16, getLayerSetFloat32, getLayerSetFloat64,
        getLayerCmdCommons, getLayerSubUnsub, sendLayerSubUnsub;

    /*
     * common function for layer Create and Destroy commands
     */
    getLayerCreateCommons = function getLayerCreateCommons(opCode, receivedView, bufferPosition) {
        return {
            CMD: commands[opCode],
            SHARE: receivedView.getUint8(bufferPosition + 2),
            NODE_ID: receivedView.getUint32(bufferPosition + 3, false),
            PARENT_LAYER_ID: receivedView.getUint16(bufferPosition + 7, false),
            LAYER_ID: receivedView.getUint16(bufferPosition + 9, false)
        };
    };


    /*
     * common parsing function for most of layer commands
     */
    getLayerCmdCommons = function getLayerCmdCommons(opCode, receivedView, bufferPosition) {
        return {
            CMD: commands[opCode],
            SHARE: receivedView.getUint8(bufferPosition + 2),
            NODE_ID: receivedView.getUint32(bufferPosition + 3, false),
            LAYER_ID: receivedView.getUint16(bufferPosition + 7, false),
            ITEM_ID: receivedView.getUint32(bufferPosition + 9, false)
        };
    };


    /*
     * common function for all SetUint8 opCodes
     * @param opCode int from interval 133 - 136
     */
    getLayerSetUint8 = function getLayerSetUint8(opCode, receivedView, bufferPosition) {

        var result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];
        result.VALUES[0] = receivedView.getUint8(bufferPosition + 13);

        /* istanbul ignore else */
        if (opCode > 133) {
            result.VALUES[1] = receivedView.getUint8(bufferPosition + 14);
        }

        /* istanbul ignore else */
        if (opCode > 134) {
            result.VALUES[2] = receivedView.getUint8(bufferPosition + 15);
        }

        /* istanbul ignore else */
        if (opCode > 135) {
            result.VALUES[3] = receivedView.getUint8(bufferPosition + 16);
        }

        return result;
    };

    /*
     * common function for all SetUint16 opCodes
     * @param opCode int from interval 137 - 140
     */
    getLayerSetUint16 = function getLayerSetUint16(opCode, receivedView, bufferPosition) {
        var result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];
        result.VALUES[0] = receivedView.getUint16(bufferPosition + 13, false);

        /* istanbul ignore else */
        if (opCode > 137) {
            result.VALUES[1] = receivedView.getUint16(bufferPosition + 15, false);
        }

        /* istanbul ignore else */
        if (opCode > 138) { 
            result.VALUES[2] = receivedView.getUint16(bufferPosition + 17, false);
        }

        /* istanbul ignore else */
        if (opCode > 139) {
            result.VALUES[3] = receivedView.getUint16(bufferPosition + 19, false);
        }

        return result;
    };

    /*
     * common function for all SetUint32 opCodes
     * @param opCode int from interval 141 - 144
     */
    getLayerSetUint32 = function getLayerSetUint32(opCode, receivedView, bufferPosition) {
        var result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];
        result.VALUES[0] = receivedView.getUint32(bufferPosition + 13, false);

        /* istanbul ignore else */
        if (opCode > 141) {
            result.VALUES[1] = receivedView.getUint32(bufferPosition + 17, false);
        }

        /* istanbul ignore else */
        if (opCode > 142) {
            result.VALUES[2] = receivedView.getUint32(bufferPosition + 21, false);
        }

        /* istanbul ignore else */
        if (opCode > 143) {
            result.VALUES[3] = receivedView.getUint32(bufferPosition + 25, false);
        }

        return result;
    };

    /*
     * common function for all SetUint64 opCodes
     * WARNING > conversion by valueOf fails if the number is bigger than 2^53
     * @param opCode int from interval 145 - 148
     *
     */
    getLayerSetUint64 = function getLayerSetUint64(opCode, receivedView, bufferPosition) {
        var result, hi, lo, bigNumber;

        result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];

        lo = receivedView.getUint32(bufferPosition + 13, false);
        hi = receivedView.getUint32(bufferPosition + 17, false);
        bigNumber = new Int64(hi, lo);
        result.VALUES[0] = bigNumber.valueOf();

        /* istanbul ignore else */
        if (opCode > 145) {
            lo = receivedView.getUint32(bufferPosition + 21, false);
            hi = receivedView.getUint32(bufferPosition + 25, false);
            bigNumber = new Int64(hi, lo);
            result.VALUES[1] = bigNumber.valueOf();
        }

        /* istanbul ignore else */
        if (opCode > 146) {
            lo = receivedView.getUint32(bufferPosition + 29, false);
            hi = receivedView.getUint32(bufferPosition + 33, false);
            bigNumber = new Int64(hi, lo);
            result.VALUES[2] = bigNumber.valueOf();
        }

        /* istanbul ignore else */
        if (opCode > 147) {
            lo = receivedView.getUint32(bufferPosition + 37, false);
            hi = receivedView.getUint32(bufferPosition + 41, false);
            bigNumber = new Int64(hi, lo);
            result.VALUES[3] = bigNumber.valueOf();
        }

        return result;
    };

    /*
     * common function for all SetReal16 opCodes
     * @param opCode int from interval 149 - 152
     */
    /* istanbul ignore next */
    getLayerSetFloat16 = function getLayerSetFloat16(opCode, receivedView, bufferPosition) {
        var result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];
        result.VALUES[0] = '@TODO - data type Real16 not supported';

        return result;
    };

    /*
     * common function for all SetReal32 opCodes
     * @param opCode int from interval 153 - 156
     */
    getLayerSetFloat32 = function getLayerSetFloat32(opCode, receivedView, bufferPosition) {
        var result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];
        result.VALUES[0] = receivedView.getFloat32(bufferPosition + 13, false);

        /* istanbul ignore else */
        if (opCode > 153) {
            result.VALUES[1] = receivedView.getFloat32(bufferPosition + 17, false);
        }

        /* istanbul ignore else */
        if (opCode > 154) {
            result.VALUES[2] = receivedView.getFloat32(bufferPosition + 21, false);
        }

        /* istanbul ignore else */
        if (opCode > 155) {
            result.VALUES[3] = receivedView.getFloat32(bufferPosition + 25, false);
        }

        return result;
    };

    /*
     * common function for all SetReal64 opCodes
     * @param opCode int from interval 157 - 160
     */
    getLayerSetFloat64 = function getLayerSetFloat64(opCode, receivedView, bufferPosition) {
        var result = getLayerCmdCommons(opCode, receivedView, bufferPosition);

        result.VALUES = [];
        result.VALUES[0] = receivedView.getFloat64(bufferPosition + 13, false);

        /* istanbul ignore else */
        if (opCode > 157) {
            result.VALUES[1] = receivedView.getFloat64(bufferPosition + 21, false);
        }

        /* istanbul ignore else */
        if (opCode > 158) {
            result.VALUES[2] = receivedView.getFloat64(bufferPosition + 29, false);
        }

        /* istanbul ignore else */
        if (opCode > 159) {
            result.VALUES[3] = receivedView.getFloat64(bufferPosition + 37, false);
        }

        return result;
    };

    /*
     * common function for Subscribe and UnSubscribe commands
     * @param opCode int from interval 130 - 131
     */
    getLayerSubUnsub = function getLayerSubUnsub(opCode, receivedView, bufferPosition) {
        var result;
        result = getLayerCmdCommons(opCode, receivedView, bufferPosition);
        result.VERSION = result.ITEM_ID;
        delete result.ITEM_ID;
        result.CRC32 = receivedView.getUint32(bufferPosition + 13);
        return result;
    };

    /*
     * Layer subscibe and unsubscribe commands for server
     */
    sendLayerSubUnsub = function sendLayerSubUnsub(opCode, nodeId, layerId) {
        var cmd, view;
        cmd = command.template(17, opCode);
        view = new DataView(cmd);
        view.setUint8(3, 0); //share
        view.setUint32(3, nodeId, false);
        view.setUint16(7, layerId, false);
        view.setUint32(9, 0, false); //Version
        view.setUint32(13, 0, false); //CRC32
        return cmd;
    };


    // Command codes = OpCodes
    commands = {
        128: 'LAYER_CREATE',
        129: 'LAYER_DESTROY',
        130: 'LAYER_SUBSCRIBE',
        131: 'LAYER_UNSUBSCRIBE',
        132: 'LAYER_UNSET',
        133: 'LAYER_SET_UINT8',
        134: 'LAYER_SET_UINT8',
        135: 'LAYER_SET_UINT8',
        136: 'LAYER_SET_UINT8',
        137: 'LAYER_SET_UINT16',
        138: 'LAYER_SET_UINT16',
        139: 'LAYER_SET_UINT16',
        140: 'LAYER_SET_UINT16',
        141: 'LAYER_SET_UINT32',
        142: 'LAYER_SET_UINT32',
        143: 'LAYER_SET_UINT32',
        144: 'LAYER_SET_UINT32',
        145: 'LAYER_SET_UINT64',
        146: 'LAYER_SET_UINT64',
        147: 'LAYER_SET_UINT64',
        148: 'LAYER_SET_UINT64',
        149: 'LAYER_SET_REAL16',
        150: 'LAYER_SET_REAL16',
        151: 'LAYER_SET_REAL16',
        152: 'LAYER_SET_REAL16',
        153: 'LAYER_SET_REAL32',
        154: 'LAYER_SET_REAL32',
        155: 'LAYER_SET_REAL32',
        156: 'LAYER_SET_REAL32',
        157: 'LAYER_SET_REAL64',
        158: 'LAYER_SET_REAL64',
        159: 'LAYER_SET_REAL64',
        160: 'LAYER_SET_REAL64',
        161: 'LAYER_UNSET_DATA'
    };

    /*
     * get_routines - parsing functions for tag commands from server
     */
    get_routines = {
        128: function getLayerCreate(opCode, receivedView, bufferPosition) {
            var result;
            result = getLayerCreateCommons(opCode, receivedView, bufferPosition);
            result.DATA_TYPE = receivedView.getUint8(bufferPosition + 11);
            result.COUNT = receivedView.getUint8(bufferPosition + 12);
            result.CUSTOM_TYPE = receivedView.getUint16(bufferPosition + 13, false);
            return result;
        },
        129: function getLayerDestroy(opCode, receivedView, bufferPosition) {
            return {
                CMD: commands[opCode],
                SHARE: receivedView.getUint8(bufferPosition + 2),
                NODE_ID: receivedView.getUint32(bufferPosition + 3, false),
                LAYER_ID: receivedView.getUint16(bufferPosition + 7, false)
            };
        },
        130: getLayerSubUnsub,
        131: getLayerSubUnsub,
        132: getLayerCmdCommons,
        133: getLayerSetUint8,
        134: getLayerSetUint8,
        135: getLayerSetUint8,
        136: getLayerSetUint8,
        137: getLayerSetUint16,
        138: getLayerSetUint16,
        139: getLayerSetUint16,
        140: getLayerSetUint16,
        141: getLayerSetUint32,
        142: getLayerSetUint32,
        143: getLayerSetUint32,
        144: getLayerSetUint32,
        145: getLayerSetUint64,
        146: getLayerSetUint64,
        147: getLayerSetUint64,
        148: getLayerSetUint64,
        149: getLayerSetFloat16,
        150: getLayerSetFloat16,
        151: getLayerSetFloat16,
        152: getLayerSetFloat16,
        153: getLayerSetFloat32,
        154: getLayerSetFloat32,
        155: getLayerSetFloat32,
        156: getLayerSetFloat32,
        157: getLayerSetFloat64,
        158: getLayerSetFloat64,
        159: getLayerSetFloat64,
        160: getLayerSetFloat64
    };

    /*
     * allowed names of tag data types
     */
    data_types = {
        'UINT8': 1,
        'UINT16': 2,
        'UINT32': 3,
        'UINT64': 4,
        'REAL16': 5,
        'REAL32': 6,
        'REAL64': 7
    };

    /*
     * data types length in memory
     */
    data_type_len = {
        'UINT8': 1,
        'UINT16': 2,
        'UINT32': 4,
        'UINT64': 8,
        'REAL16': 2,
        'REAL32': 4,
        'REAL64': 8
    };

    /*
     * basic OpCodes (with one value) for data types
     */
    op_codes = {
        'UINT8': 133,
        'UINT16': 137,
        'UINT32': 141,
        'UINT64': 145,
        'REAL16': 149,
        'REAL32': 153,
        'REAL64': 157
    };

    /*
     * routines for setting values of layer items
     */
    set_routines = {
        'UINT8': function setItemsUint8(view, buf_pos, values) {
            var size = 0;
            for (var i = 0; i < values.length; i++) {
                view.setUint8(buf_pos + i, values[i]);
                size += 1;
            }
            return size;
        },
        'UINT16': function setItemsUint16(view, buf_pos, values) {
            var size = 0;
            for (var i = 0; i < values.length; i++) {
                view.setUint16(buf_pos + 2 * i, values[i]);
                size += 2;
            }
            return size;
        },
        'UINT32': function setItemsUint32(view, buf_pos, values) {
            var size = 0;
            for (var i = 0; i < values.length; i++) {
                view.setUint32(buf_pos + 4 * i, values[i]);
                size += 4;
            }
            return size;
        },
        'UINT64': function setItemsUint64(view, buf_pos, values) {
            var size = 0;
            for (var i = 0; i < values.length; i++) {
                // Javascript supports only 32-bit integers
                view.setUint32(buf_pos + 4 + 8 * i, values[i]);
                size += 8;
            }
            return size;
        },
        'REAL16': null,
        'REAL32': function setItemsReal32(view, buf_pos, values) {
            var size = 0;
            for (var i = 0; i < values.length; i++) {
                view.setFloat32(buf_pos + 4 * i, values[i]);
                size += 4;
            }
            return size;
        },
        'REAL64': function setItemsReal64(view, buf_pos, values) {
            var size = 0;
            for (var i = 0; i < values.length; i++) {
                view.setFloat64(buf_pos + 8 * i, values[i]);
                size += 8;
            }
            return size;
        }
    };

    layer = {

        /*
         * create new layer at verse server
         * @param nodeId uint32
         * @param parentLayerId uint16
         * @param dataType uint8
         * @param count uint8
          @param customType uint16
         */
        create: function(nodeId, parentLayerId, dataType, count, customType) {
            var cmd, view;
            cmd = command.template(15, 128);
            view = new DataView(cmd);
            view.setUint8(3, 0); //share
            view.setUint32(3, nodeId);
            if ( parentLayerId === null ) {
                view.setUint16(7, -1);
            } else {
                view.setUint16(7, parentLayerId);
            }
            view.setUint16(9, 65535);   // Layer ID will be set by server
            if ( data_types.hasOwnProperty(dataType) ) {
                view.setUint8(11, data_types[dataType]);
            } else {
                return null;
            }
            view.setUint8(12, count);
            view.setUint16(13, customType);
            return cmd;
        },

        /*
         * destroy existing layer at verse server
         * @param nodeId uint32
         * @param layerId uint16
         */
        destroy: function(nodeId, layerId) {
            var cmd, view;
            cmd = command.template(9, 129);
            view = new DataView(cmd);
            view.setUint8(3, 0); //share
            view.setUint32(3, nodeId);
            view.setUint16(7, layerId);
            return cmd;
        },

        /*
         * subscribe layer commad OpCode 130
         * @param nodeId uint32
         * @param layerId uint16
         */
        subscribe: function(nodeId, layerId) {
            return sendLayerSubUnsub(130, nodeId, layerId);
        },

        /*
         * unsubscribe layer commad OpCode 131
         * @param nodeId uint32
         * @param layerId uint16
         */
        unsubscribe: function(nodeId, layerId) {
            return sendLayerSubUnsub(131, nodeId, layerId);
        },

        /*
         * unset value of item layer at verse server
         * @param nodeId uint32
         * @param layerId uint16
         * @param itemIds array of uint32
         */
        unsetItems: function(nodeId, layerId, itemIds) {
            var cmd, view, cmd_len;
            cmd = command.template(9 + 4 * itemIds.length, 132);
            view = new DataView(cmd);
            view.setUint8(2, 6); //share
            view.setUint32(3, nodeId);
            view.setUint16(7, layerId);
            for (var i = 0; i < itemIds.length; i++) {
                view.setUint32(9 + 4 * i, itemIds[i]);
            }
            return cmd;
        },

        /*
         * set values of layer item at verse server
         * @param nodeId uint32
         * @param layerId uint16
         * @param dataType string
         * @param items object containing arrays of items
         */
        setItems: function(nodeId, layerId, dataType, items) {
            var cmd, view, cmd_len;
            var val_count = 0, key, buf_pos;
            // Compute number of items
            for (key in items) {
                if (items.hasOwnProperty(key)) {
                    val_count++;
                }
            }
            // Try to compute length of the command first
            if ( data_types.hasOwnProperty(dataType) ) {
                cmd_len = 9 + val_count * (4 + items[key].length * data_type_len[dataType]);
            } else {
                return null;
            }
            cmd = command.template(cmd_len, op_codes[dataType] + items[key].length - 1);
            view = new DataView(cmd);
            view.setUint8(2, 6); // nodeId and layerId will be shared
            view.setUint32(3, nodeId);
            view.setUint16(7, layerId);
            // Set values of items
            buf_pos = 9;
            for (key in items) {
                // Set item ID first
                view.setUint32(buf_pos, key);
                buf_pos += 4;
                // Then set values of item
                buf_pos += set_routines[dataType](view, buf_pos, items[key]);
            }
            return cmd;
        },

        /*
         * parse received buffer for layer command VALUES
         */
        getLayerValues: function getLayerValues(opCode, receivedView, bufferPosition, length) {
            var result = get_routines[opCode](opCode, receivedView, bufferPosition, length);
            return result;
        }

    };

    return layer;

});
