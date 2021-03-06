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

/* jshint browser: true */
/* globals define */


define('verse', ['request', 'response', 'negotiation', 'node', 'user', 'taggroup', 'tag', 'layer'],
    function(request, response, negotiation, node, user, tagGroup, tag, layer) {

        'use strict';
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        var myWebscoket,
            verse,
            onSocketMessage,
            onSocketError,
            onSocketConnect,
            onSocketClose,
            userAuthNone,
            userInfo = {},
            confirmHost,
            userAuthData;

        window.onbeforeunload = function() {
            myWebscoket.onclose = function() {}; // disable onclose handler first
            myWebscoket.close();
        };


        /*
         *  hadler for websocket error event
         */
        onSocketError = function onSocketError(event, config) {
            console.error('Websocket Error: ', event);
        };

        /*
         *  hadler for websocket connect
         * @param event
         * @param config object
         */
        onSocketConnect = function onSocketConnect(event, config) {
            userAuthNone(config);
        };

        /*
         *  hadler for websocket connection close
         * @param event
         * @param config object
         */
        onSocketClose = function onSocketClose(event, config) {
            if (config && config.connectionTerminatedCallback && typeof config.connectionTerminatedCallback === 'function') {
                config.connectionTerminatedCallback(event);
            }
        };

        /*
         * First step of negotiation process
         * Send command user auth with type NONE
         */

        userAuthNone = function userAuthNone(config) {
            var buf = user.auth(config.username, 1, '');
            buf = request.message(buf);
            myWebscoket.send(buf);
        };

        /*
         * Second step of negotiation process
         * Send command user auth with type PASSWORD
         */
        userAuthData = function userAuthData(config) {
            var buf = user.auth(config.username, 2, config.passwd);
            buf = request.message(buf);
            myWebscoket.send(buf);
        };

        /*
         * confirm values send by server to finish the negotitation process
         * @param responseData list of objects
         */

        confirmHost = function confirmHost(hostInfo) {
            var buf = negotiation.url(negotiation.CHANGE_R, myWebscoket.url);
            buf = request.buffer_push(buf, negotiation.token(negotiation.CONFIRM_R, hostInfo[1].VALUE));
            buf = request.buffer_push(buf, negotiation.token(negotiation.CHANGE_R, '^DD31*$cZ6#t'));
            buf = request.buffer_push(buf, negotiation.ded(negotiation.CONFIRM_L, hostInfo[2].VALUE));

            buf = request.message(buf);

            myWebscoket.send(buf);
        };

        /*
         * handler for received message
         * @param message
         * @param config object
         */
        onSocketMessage = function onSocketMessage(message, config) {
            var responseData;

            if (message.data instanceof ArrayBuffer) {
                if (!response.checkHeader(message.data)) {
                    myWebscoket.close();
                    return;
                }

                responseData = response.parse(message.data);

                responseData.NEGO.forEach(function(cmd) {
                    if (cmd.CMD === 'AUTH_PASSWD') {
                        userAuthData(config);
                    } else if (cmd.CMD === 'USER_AUTH_SUCCESS') {
                        confirmHost(responseData.NEGO);
                        userInfo = cmd;
                    } else if (cmd.CMD === 'USER_AUTH_FAILURE') {
                        config.errorCallback(cmd.CMD);
                        myWebscoket.close();
                    } else if ((cmd.CMD === 'CONFIRM_R') && (cmd.FEATURE === 'HOST_URL')) {
                        verse.nodeSubscribe(0);
                        /* pass the user info to callback function */
                        config.connectionAcceptedCallback(userInfo);
                    }
                });

                /* call the callbacks from config */
                if (responseData.NODE.length > 0) {
                    config.nodeCallback(responseData.NODE);
                }

                if (responseData.TAG_GROUP.length > 0) {
                    config.tagGroupCallback(responseData.TAG_GROUP);
                }

                if (responseData.TAG.length > 0) {
                    config.tagCallback(responseData.TAG);
                }
                
                if (responseData.LAYER.length > 0) {
                    config.layerCallback(responseData.LAYER);
                }
            }
        };

        /*
         * public API of Verse Websocket module
         */
        verse = {

            init: function(config) {

                console.info('Connecting to URI:' + config.uri + ' ...');
                try {
                    myWebscoket = new window.WebSocket(config.uri, config.version);
                    myWebscoket.binaryType = 'arraybuffer';

                    myWebscoket.addEventListener('error', function(event){
                        onSocketError(event, config);
                    });

                    myWebscoket.addEventListener('close', function(event){
                        onSocketClose(event, config);
                    });

                    myWebscoket.addEventListener('open', function(evnt) {
                        onSocketConnect(evnt, config);
                    });

                    myWebscoket.addEventListener('message', function(msg) {
                        onSocketMessage(msg, config);
                    });
                } catch (e) {
                    console.error('Sorry, the web socket at "%s" is un-available', config.uri);
                }
            },

            /* Node Commands */

            /*
             * create new node on server
             * @param prio uint8 (priority of command)
             * @param userId uint16
             * @param avatarId uint32
             * @param customType uint16
             */
            nodeCreate: function nodeCreate(prio, userId, avatarId, customType) {
                var buf = node.create(userId, avatarId, customType);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * destroy existing node on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             */
            nodeDestroy: function nodeDestroy(prio, nodeId) {
                var buf = node.destroy(nodeId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * subscribe node on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             */
            nodeSubscribe: function nodeSubscribe(prio, nodeId) {
                var buf = node.subscribe(nodeId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * unsubscribe from node on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             */
            nodeUnSubscribe: function nodeUnSubscribe(prio, nodeId) {
                var buf = node.unsubscribe(nodeId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * link two nodes
             * @param prio uint8 (priority of command)
             * @param parenNodeId uint32
             * @param childNodeId uint32
             */
            nodeLink: function nodeLink(prio, parenNodeId, childNodeId) {
                var buf = node.link(parenNodeId, childNodeId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * change permission of node
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param userId uint16
             * @param permission uint8
             */
            nodePerm: function nodePerm(prio, nodeId, userId, perm) {
                var buf = node.perm(nodeId, userId, perm);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * change umask of new created nodes
             * @param prio uint8 (priority of command)
             * @param permission uint8
             */
            nodeUmask: function nodeUmask(prio, permission) {
                var buf = node.umask(permission);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * change owner of the node
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param userId uint32
             */
            nodeOwner: function nodeOwner(prio, nodeId, userId) {
                var buf = node.owner(nodeId, userId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * lock the node
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param avatarId uint32 - it has to be your avatar ID
             */
            nodeLock: function nodeLock(prio, nodeId, avatarId) {
                var buf = node.lock(nodeId, avatarId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * unlock the node
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param avatarId uint32 - it has to be also your avatar ID
             */
            nodeUnLock: function nodeUnLock(prio, nodeId, avatarId) {
                var buf = node.unlock(nodeId, avatarId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * set new priority of the node
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param priority uint8
             */
            nodePrio: function nodePrio(prio, nodeId, priority) {
                var buf = node.prio(nodeId, priority);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /* Tag Group Commands */

            /*
             * create tag_group on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param customType uint16
             */
            tagGroupCreate: function tagGroupCreate(prio, nodeId, customType) {
                var buf = tagGroup.create(nodeId, customType);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * destroy existing tag_group on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param tagGroupId uint16
             */
            tagGroupDestroy: function tagGroupDestroy(prio, nodeId, tagGroupId) {
                var buf = tagGroup.destroy(nodeId, tagGroupId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * subscribe tag_group on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param tagGroupId uint16
             */
            tagGroupSubscribe: function tagGroupSubscribe(prio, nodeId, tagGroupId) {
                var buf = tagGroup.subscribe(nodeId, tagGroupId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * subscribe tag_group on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param tagGroupId uint16
             */
            tagGroupUnSubscribe: function tagGroupUnSubscribe(prio, nodeId, tagGroupId) {
                var buf = tagGroup.unsubscribe(nodeId, tagGroupId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /* Tag Commands */

            /*
             * create new tag at verse server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param tagGroupId uint16
             * @param dataType string const
             *   ('UINT8', 'UINT16', 'UINT32', 'UINT64', 'RELA16', 'RELA32', 'RELA64', 'STRING8')
             * @param count uint8
             * @param customType uint16
             */
            tagCreate: function tagCreate(prio, nodeId, tagGroupId, dataType, count, customType) {
                var buf = tag.create(nodeId, tagGroupId, dataType, count, customType);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * destroy existing tag at verse server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param tagGroupId uint16
             * @param tagId uint16
             */
            tagDestroy: function tagDestroy(prio, nodeId, tagGroupId, tagId) {
                var buf = tag.destroy(nodeId, tagGroupId, tagId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * set/change value of existing tag at verse server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param tagGroupId uint16
             * @param tagId uint16
             * @param dataType string const
             *   ('UINT8', 'UINT16', 'UINT32', 'UINT64', 'RELA16', 'RELA32', 'RELA64', 'STRING8')
             * @param values array of values (each item of array has to have same type, e.g. int)
             * @note when dataType is 'STRING8', then array of values can contain only one item
             */
            tagSet: function tagSet(prio, nodeId, tagGroupId, tagId, dataType, values) {
                var buf = tag.set(nodeId, tagGroupId, tagId, dataType, values);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /* Layer Commands */

            /*
             * create new layer on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param parentLayerId uint16
             * @param dataType string
             * @param count uint8
             * @param customType uint16
             */
            layerCreate: function layerCreate(prio, nodeId, parentLayerId, dataType, count, customType) {
                var buf = layer.create(nodeId, parentLayerId, dataType, count, customType);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * destroy existing layer on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param layerId uint16
             */
            layerDestroy: function layerDestroy(prio, nodeId, layerId) {
                var buf = layer.destroy(nodeId, layerId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * subscribe layer on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param layerId uint16
             */
            layerSubscribe: function layerSubscribe(prio, nodeId, layerId) {
                var buf = layer.subscribe(nodeId, layerId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * unsubscribe from layer on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param layerId uint16
             */
            layerUnSubscribe: function layerUnSubscribe(prio, nodeId, layerId) {
                var buf = layer.unsubscribe(nodeId, layerId);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * unset item layer on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param layerId uint16
             * @param itemIds array of uint32 (e.g.: [0, 1, 2])
             */
            layerUnSetItems: function layerUnSetItems(prio, nodeId, layerId, itemIds) {
                var buf = layer.unsetItems(nodeId, layerId, itemIds);
                buf = request.message(buf);
                myWebscoket.send(buf);
            },

            /*
             * set items of layer on server
             * @param prio uint8 (priority of command)
             * @param nodeId uint32
             * @param layerId uint16
             * @param dataType string
             * @param items object of arrays (e.g.: {0: [1.0, 0.0], 1: [1.0, -1.0]} )
             */
            layerSetItems: function layerSetItems(prio, nodeId, layerId, dataTypes, items) {
                var buf = layer.setItems(nodeId, layerId, dataTypes, items);
                buf = request.message(buf);
                myWebscoket.send(buf);
            }
        };

        return verse;

    });
