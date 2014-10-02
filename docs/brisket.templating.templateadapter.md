Brisket.Templating.TemplateAdapter
================================
Brisket.Templating.TemplateAdapter is the base class for all TemplateAdapters that Brisket uses to render templates. Brisket will only accept TemplateAdapters that extend from Brisket.Templating.TemplateAdapter.


## Implementing Your Own TemplateAdapter
While Brisket ships with two TemplateAdapters - ([Brisket.Templating.StringTemplateAdapter](brisket.templating.stringtemplateadapter.md) and [Brisket.Templating.compiledHoganTemplateAdapter](brisket.templating.compiledhogantemplateadapter.md)) - you might want to build your own template adapter.

To build your own TemplateAdapter, build an object that extends from Brisket.Templating.TemplateAdapter and implement the method `templateToHTML`. `templateToHTML` will be passed three parameters - `templateId`, `data`, and `partials` and is expected to return a string.

`templateId` is a View's template field. `data` is the data that the View sends to its template (read [here](brisket.view.md#exposing-data-to-a-template) for more details on what is passed). `partials` is the partials field of a View - this is where you could specify the partials that the View's template will use.

You can use all or none of the parameters that are passed to templateToHTML, but you MUST implement templateToHTML.

Below is a TemplateAdapter that always returns "hello world";

```js
var HelloWorldTemplateAdapter = Brisket.Templating.TemplateAdapter.extend({

    templateToHTML: function(templateId, data, partials) {
        return 'hello world';
    }

});
```

Here is the implementation of the StringTemplateAdapter that ships with Brisket:

```js
var StringTemplateAdapter = Brisket.Templating.TemplateAdapter.extend({

    templateToHTML: function(templateId, data, partials) {
        return templateId;
    }

});
```

The StringTemplateAdapter uses the `templateId` but it ignores `data` and `partials`.

Below is the implementation of the compiledHoganTemplateAdapter. It uses all three parameters:

```js
var CompiledHoganTemplateAdapter = TemplateAdapter.extend({

    templateToHTML: function(templateId, data, partials) {
        var template = this.compiledTemplates[templateId];

        if (!template) {
            throw new Error("Could not find template: " + templateId);
        }

        var resolvedPartials = resolvePartials(partials, this.compiledTemplates);

        return template.render(data, resolvedPartials);
    }

});

function resolvePartials(partials, compiledTemplates) {
    var resolvedPartials = {};

    for (var partialName in partials) {
        if (partials.hasOwnProperty(partialName)) {
            var partialPath = partials[partialName];
            resolvedPartials[partialName] = compiledTemplates[partialPath];
        }
    }

    return resolvedPartials;
}

var compiledHoganTemplateAdapter = function(compiledTemplates) {
    if (typeof compiledTemplates != "object") {
        throw new Error(
            "You must pass compiled templates to create a " +
            "CompiledHoganTemplateAdapter."
        );
    }

    return CompiledHoganTemplateAdapter.extend({
        compiledTemplates: compiledTemplates
    });
};
```
