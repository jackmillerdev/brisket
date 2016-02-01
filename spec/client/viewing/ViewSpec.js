"use strict";

var View = require("lib/viewing/View");
var Backbone = require("lib/application/Backbone");

describe("View", function() {

    it("is an extension of Backbone.View", function() {
        expect(View.prototype instanceof Backbone.View).toBe(true);
    });

    it("exposes delegateEvents from Backbone.View", function() {
        expect(View.prototype.delegateEvents).toBe(Backbone.View.prototype.delegateEvents);
    });

    it("exposes undelegateEvents from Backbone.View", function() {
        expect(View.prototype.undelegateEvents).toBe(Backbone.View.prototype.undelegateEvents);
    });

});

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
