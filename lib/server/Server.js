"use strict";

var express = require("express");
var ServerApp = require("./ServerApp");
var ServerResponseWorkflow = require("./ServerResponseWorkflow");
var DomainLocalStorage = require("./DomainLocalStorage");
var Cookies = require("../cookies/Cookies");
var ForwardClientRequest = require("./ForwardClientRequest");
var Deprecated = require("../util/Deprecated");

var Server = {

    create: function(requestedConfig) {
        var config = requestedConfig || {};
        var clientAppRequirePath = config.clientAppRequirePath;
        var apis = config.apis || {};
        var apiHost = config.apiHost;
        var environmentConfig = config.environmentConfig || {};
        var serverConfig = config.serverConfig || {};
        var onRouteHandled = config.onRouteHandled;
        var ServerAppToUse = config.ServerApp || ServerApp;
        var appRoot = environmentConfig.appRoot;
        var debug = config.debug === true;

        Deprecated.message(
            "Brisket.Model and Brisket.Collection are deprecated and will be " +
            "removed completely at the next major release. " +
            "Use standard Backbone.Model and Backbone.Collection instead",
            "https://github.com/bloomberg/brisket/blob/master/docs/modeling.md"
        );

        if (apiHost) {
            Deprecated.message(
                "Brisket.createServer({ apiHost: 'path/to/api' }) is deprecated and " +
                "will be removed completely at the next major release. . Please use apis config",
                "https://github.com/bloomberg/brisket/blob/master/docs/brisket.createserver.md#apis"
            );
        }

        if (apiHost && !apis["api"]) {
            apis["api"] = {
                host: apiHost
            };
        }

        verifyAppRoot(appRoot);
        verifyClientAppRequirePath(clientAppRequirePath);
        verifyApis(apis);
        verifyServerApp(ServerAppToUse);
        verifyClientAppUrl(environmentConfig);

        var brisketEngine = express();
        var serverApp = new ServerAppToUse();

        Deprecated.message(
            "Brisket.RouterBrewery and Brisket.Controller are deprecated and will be " +
            "removed completely at the next major release. " +
            "Use Brisket.Router instead",
            "https://github.com/bloomberg/brisket/blob/master/docs/brisket.router.md"
        );

        serverConfig.apis = apis;

        serverApp.start({
            environmentConfig: environmentConfig,
            serverConfig: serverConfig
        });

        if (debug) {
            environmentConfig.debug = true;
        }

        brisketEngine.use(DomainLocalStorage.middleware);

        Object.keys(apis).forEach(function(apiAlias) {
            var apiConfig = apis[apiAlias];
            brisketEngine.use("/" + apiAlias, ForwardClientRequest.toApi(apiConfig));
        });

        brisketEngine.get(
            "*",
            sendResponseFromServerApp(
                serverApp,
                environmentConfig,
                clientAppRequirePath,
                onRouteHandled
            )
        );

        return brisketEngine;
    },

    sendResponseFromServerApp: sendResponseFromServerApp

};

function sendResponseFromServerApp(serverApp, environmentConfig, clientAppRequirePath, onRouteHandled) {
    return function(expressRequest, expressResponse, next) {
        var fragment = expressRequest.path.slice(1);

        Cookies.letClientKnowIfAvailable(environmentConfig, expressRequest);

        var handledRoute = serverApp.dispatch(
            fragment,
            expressRequest,
            environmentConfig,
            clientAppRequirePath
        );

        if (!handledRoute) {
            next();
            return;
        }

        if (typeof onRouteHandled === "function") {
            onRouteHandled({
                request: expressRequest,
                route: handledRoute.handler.rawRoute
            });
        }

        ServerResponseWorkflow.sendResponseFor(
            handledRoute.content,
            expressResponse,
            next
        );
    };
}

function verifyAppRoot(appRoot) {
    if (appRoot && /\/$/.test(appRoot)) {
        throw new Error(
            "You must omit trailing slash when providing an appRoot"
        );
    }

    if (appRoot && !/^\//.test(appRoot)) {
        throw new Error(
            "You must include leading slash when providing an appRoot"
        );
    }
}

function verifyClientAppRequirePath(clientAppRequirePath) {
    if (typeof clientAppRequirePath !== "string") {
        throw new Error(
            "You must specify the require path to your ClientApp - clientAppRequirePath"
        );
    }
}

function verifyApis(apis) {
    Object.keys(apis).forEach(function(apiAlias) {
        var apiConfig = apis[apiAlias];

        if (!apiConfig || typeof apiConfig.host !== "string") {
            throw new Error("The host for " + apiAlias + " in apis config must be a string.");
        }
    });
}

function verifyServerApp(ServerAppToUse) {
    if (typeof ServerAppToUse != "function" || isNotASubclassOfServerApp(ServerAppToUse)) {
        throw new Error(
            "Brisket can only start a ServerApp. Please pass in a Brisket.ServerApp."
        );
    }
}

function verifyClientAppUrl(environmentConfig) {
    if (typeof environmentConfig.clientAppUrl !== "string") {
        throw new Error(
            "Brisket requires the url of the Client Application javascript to be passed in environmentConfig.clientAppUrl."
        );
    }
}

function isNotASubclassOfServerApp(ServerAppToUse) {
    return ServerAppToUse !== ServerApp &&
        !(ServerAppToUse.prototype instanceof ServerApp);
}

module.exports = Server;

// ----------------------------------------------------------------------------
// Copyright (C) 2016 Bloomberg Finance L.P.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------- END-OF-FILE ----------------------------------
