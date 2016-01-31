"use strict";

var Backbone = require("../application/Backbone");
var Errors = require("../errors/Errors");
var noop = require("../util/noop");
var Promise = require("bluebird");

var Router = Backbone.Router.extend({

    layout: null,
    errorViewMapping: null,

    onClose: noop,

    close: function() {

        try {
            this.onClose();
        } catch (e) {
            console.error(
                "Error: There is an error in a Router's onClose callback."
            );

            Errors.notify(e);
        }

    },

    onRouteStart: noop.thatWillBeCalledWith( /* layout, request, response */ ),

    onRouteComplete: noop.thatWillBeCalledWith( /* layout, request, response */ ),

    renderError: function(statusCode) {
        return Promise.reject({
            status: statusCode
        });
    }

});

module.exports = Router;

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
