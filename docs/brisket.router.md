Brisket Router vs Backbone.Router
===============================

Brisket.Router are a little different from a standard Backbone.Router. The differences between the two are the key to making Brisket apps work the same on the client and the server.

## Documentation Index

* [Returning a View](#returning-a-view)
* [Handling Errors](#handling-errors)
* [Specifying a Layout](#specifying-a-layout)
* [Communicating With the Layout](#communicating-with-the-layout)
* [Set/Update Page Title and Meta Tags](#setupdate-page-title-and-meta-tags)
* [Executing Code When Routes Begin/End](#executing-code-when-routes-beginend)
* [Closing a Router](#closing-a-router)

### Returning a View
One of the biggest differences between a Backbone.Router and a Brisket Router is that Brisket Router route handlers return Views. In a typical Backbone app, you would run code to modify the DOM right in the route handlers. In a Brisket app, route handlers should not modify the DOM. Instead they should return a View that should represent the route. Here is an example:

```js
var Book = Brisket.Model.extend({
  urlRoot: "/api/book"
});

var BookView = Brisket.View.extend();

var BookRouter = Brisket.Router.extend({

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    var book = new Book({ id: id });

    return book.fetch()
      .then(function() {
        return new BookView({ model: book });
      });
  }

});

// The "book" route tells Brisket that it wants to display the BookView.
```

### Handling Errors
When there is an error in a Brisket route handler preparing a View, Brisket will fall back to the Router's errorViewMapping. Thrown code errors will show the 500 ErrorView. The Router's errorViewMapping can be set in your [custom RouterBrewery](brisket.routerbrewery.md#creating-your-own-routerbrewery) and also directly in the Router.

```js
var ErrorView = Brisket.View.extend();

var ErrorViewMapping = Brisket.ErrorViewMapping.create({
  500: ErrorView
});

var BookRouter = Brisket.Router.extend({

  errorViewMapping: ErrorViewMapping,

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    var book = new Book({ id: id });

    return book.fetch()
      .then(function() {
        throw new Error("There is some problem");

        return new BookView({ model: book });
      });
  }

});

// The "book" route throws an error so Brisket displays ErrorView.
```

Brisket also handles error responses from the API while fetching data:

```js
var BadRequestView = Brisket.View.extend();
var ErrorView = Brisket.View.extend();

var ErrorViewMapping = Brisket.ErrorViewMapping.create({
  400: BadRequestView,
  500: ErrorView
});

var BookRouter = Brisket.Router.extend({

  errorViewMapping: ErrorViewMapping,

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    var book = new Book({ id: id });

    return book.fetch() // API returns 400 response code
      .then(function() {
        return new BookView({ model: book });
      });
  }

});

// The "book" route got a 400 response from the API so Brisket displays BadRequestView.
```

Your route handler can also explicitly tell Brisket that you want to display an error view:

```js
var BadRequestView = Brisket.View.extend();
var ErrorView = Brisket.View.extend();

var ErrorViewMapping = Brisket.ErrorViewMapping.create({
  400: BadRequestView,
  500: ErrorView
});

var BookRouter = Brisket.Router.extend({

  errorViewMapping: ErrorViewMapping,

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    return this.renderError(400);
  }

});

// The "book" route explicitly requested the 400 error view so Brisket displays BadRequestView.
```

### Specifying a Layout
You can specify the Layout for your Router by setting the layout property:

```js
var BookLayout = Brisket.Layout.extend();

var BookRouter = Brisket.Router.extend({

  layout: BookLayout,

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    return new BookView();
  }

});

```

BookView will be rendered in the BookLayout.

### Communicating With the Layout
There are some situations where you what to tell the page's Layout to do something when a route handler executes. An example use case is wanting to highlight the current section in your layout's main navigation when you go to a route. Brisket exposes the route's `layout` to it's route handler. The layout is the first parameter after the params generated from the url:

```js
var BookLayout = Brisket.Layout.extend();

var BookRouter = Brisket.Router.extend({

  layout: BookLayout,

  routes: {
    "books/:id": "book"
  },

  book: function(id, layout) {
    layout.doSomething();

    return new BookView();
  }

});
```

When the "book" route renders BookView, it will tell the BookLayout to `doSomething`.

**Note:** If you modify the layout in a route handler, be sure to implement your Layout's [`backToNormal`](brisket.layout.md#getting-back-to-normal) that will return your layout to the default state between routes.


### Set/Update Page Title and Meta Tags
You may want to set or update the page title and page meta tags when the route handler executes. Using `.withTitle()` and `.withMetatags()`, you can pass a new page title and meta tags to the view returned by the route handler:

```js
var Metatags = Brisket.Layout.Metatags;
var BookRouter = Brisket.Router.extend({

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    return new BookView()
      .withTitle("Nice Books!")
      .withMetatags(new Metatags({
        "description": "These are some great books.",
        "og:image": "sample-books.jpg",
        "canonical": "the-canonical-link"
      }));
  }

});
```
**Note:** By default, `withMetatags` only updates the meta tags for the initial page load from server. To enable meta tags update on client, set the attribute `updateMetatagsOnClientRender` of your `Layout` to `true`:
```js
var Layout = Brisket.Layout.extend({

    ...,

    updateMetatagsOnClientRender: true,

    ...

});
```

### Executing Code When Routes Begin/End
You may want to run some code when route handlers fire e.g. make a loading spinny appear and disappear. To set that up, set the `onRouteStart` and `onRouteComplete` properties of your Router. These callbacks will be passed the `layout`:

```js
var BookRouter = Brisket.Router.extend({

  onRouteStart: function(layout) {
    layout.doSomething();
  },

  onRouteComplete: function(layout) {
    layout.doSomethingElse();
  },

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    return new BookView();
  }

});
```

**Note:** `onRouteStart` and `onRouteComplete` only execute in the browser.

### Closing a Router
In some cases your route handlers may need to be cleaned up e.g. if you bind to a global event. Use `onClose` to cleanup the route handlers in your router. **Note:** `onClose` will be fired on the client AND the server.


```js
var MyAppsEventBus = require("/path/to/my/apps/eventbus");
var doSomething = function() {};

var BookRouter = Brisket.Router.extend({

  routes: {
    "books/:id": "book"
  },

  book: function(id) {
    MyAppsEventBus.on("some-event", doSomething);

    return new BookView();
  },

  onClose: function() {
    MyAppsEventBus.off("some-event", doSomething);
  }

});
```
