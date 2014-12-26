"use strict";

var AjaxCallsForCurrentRequest = require("./AjaxCallsForCurrentRequest");

var INITIAL_REQUEST_ID = 1;

var ServerRenderer = {

    render: function(layout, view, onRender, environmentConfig, clientAppRequirePath, serverRequest) {
        var title = view.getTitle ? view.getTitle() : null;
        var metatags = view.getMetatags ? view.getMetatags() : null;
        var appRoot = environmentConfig ? environmentConfig.appRoot : "";

        layout.setTitle(title);

        layout.setMetaTags(metatags);

        layout.setEnvironmentConfig(environmentConfig);

        if (typeof onRender == "function") {
            layout.setExtraRenderInstructions(function(layout) {
                onRender(layout);
            });
        }

        layout.render();

        if (view.setUid) {
            view.setUid(layout.generateChildUid(INITIAL_REQUEST_ID));
        }

        layout.setContent(view);

        var clientAppStartScript = makeClientAppStartScript(
            clientAppRequirePath,
            stringifyData(environmentConfig),
            escapeClosingSlashes(stringifyData(getBootstrappedDataForRequest()))
        );

        injectScriptAtBottomOfBodyOf(layout, clientAppStartScript);

        var htmlWithBaseTagAndStartScript = insertBaseTag(layout.asHtml(), appRoot, serverRequest);

        layout.close();

        return htmlWithBaseTagAndStartScript;
    }

};

function getBootstrappedDataForRequest() {
    return AjaxCallsForCurrentRequest.all();
}

function stringifyData(data) {
    return JSON.stringify(data || {});
}

function escapeClosingSlashes(string) {
    return string.replace(/<\/script/g, "<\\/script");
}

function injectScriptAtBottomOfBodyOf(layout, script) {
    var body = layout.$body().get(0);

    if (!body) {
        return;
    }

    body.innerHTML += script;
}

function makeClientAppStartScript(clientAppRequirePath, environmentConfig, bootstrappedData) {
    return "<script type=\"text/javascript\">\n" +
        "var ClientApp = require('" + clientAppRequirePath + "');\n" +
        "var clientApp = new ClientApp();\n" +
        "clientApp.start({\n" +
        "environmentConfig: " + environmentConfig + ",\n" +
        "bootstrappedData: " + bootstrappedData + "\n" +
        "});\n" +
        "</script>";
}

function baseTagFrom(appRoot, serverRequest) {
    var host = serverRequest.host;
    var hostAndPath = appRoot ? host + appRoot : host;

    return "<base href='" + serverRequest.protocol + "://" + hostAndPath + "/'>";
}

function insertBaseTag(html, appRoot, serverRequest) {
    var existingBaseTag = /<base[^>]*>/;
    var brisketBaseTag = baseTagFrom(appRoot, serverRequest);

    var htmlWithoutExistingBaseTag = html.replace(existingBaseTag, "");
    var htmlWithBrisketBaseTag = htmlWithoutExistingBaseTag.replace(/<head[^>]*>/, "<head>\n" + brisketBaseTag);

    return htmlWithBrisketBaseTag;
}

module.exports = ServerRenderer;

// ----------------------------------------------------------------------------
// Copyright (C) 2014 Bloomberg Finance L.P.
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
