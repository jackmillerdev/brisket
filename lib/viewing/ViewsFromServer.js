"use strict";

var IDENTITY_ATTRIBUTE = "data-view-uid";

var viewElements = {};

var ViewsFromServer = {

    IDENTITY_ATTRIBUTE: IDENTITY_ATTRIBUTE,

    initialize: function() {
        var viewsFromServer = document.querySelectorAll("[" + IDENTITY_ATTRIBUTE + "]");
        var viewFromServer;
        var uid;

        for (var i = 0, len = viewsFromServer.length; i < len; i++) {
            viewFromServer = viewsFromServer[i];
            uid = viewFromServer.getAttribute(IDENTITY_ATTRIBUTE);

            viewElements[uid] = viewFromServer;
        }
    },

    getAndPurge: function(uid) {
        var viewElement = viewElements[uid] || null;

        viewElements[uid] = null;

        return viewElement;
    },

    reset: function() {
        viewElements = {};
    }

};

module.exports = ViewsFromServer;

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
