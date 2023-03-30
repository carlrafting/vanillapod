# vanillapod

Lightweight library for building vanilla JavaScript components...

__NOTE: ℹ️ vanillapod is somewhat feature-complete. At the moment it suits prototypes or projects of smaller sizes.__

## Install

```bash
# install with npm
$ npm install vanillapod

# or if you prefer using yarn
$ yarn add vanillapod
```

## Background

Vanillapods main goal is to be a learning experience and to produce something useful, if not for anyone else, at least for me. It's inspired to attempt creating a UI library, by Juha Lindstedts [RE:DOM](https://redom.js.org/) and later on Chris Ferdinandis [Reef.js](https://reefjs.com/). Hopefully it will not be too similair to those libraries (why should it exist otherwise?), but rather use those libraries to learn different approaches to solve common problems. Vanillapod is not used in production as of this time, so if you're looking for something more battle-tested, check out the libraries i mentioned above. 

## Enhanche Vanilla JavaScript

The purpose of vanillapod is to enhance vanilla JavaScript with a component based architecture, similair to a lot of other (bigger) libraries (like Svelte, Solid or React). Vanillapod provides several helpers to make the interaction with the DOM less cumbersome, while still maintaining access to the underlying DOM APIs.

## How does vanillapod work?

...

## Getting Started

You can use vanillapod regardless of using a bundler (Webpack, parcel, rollup or vite), or using ES2015 modules in browsers that support it.

To import vanillapod methods without a bundler, you need to point to the script file inside the `dist` directory.

```js
// import without bundler

import { mount } from './node_modules/vanillapod/dist/vanillapod.js';
```

### Implicit Components

The first step to get started is defining your component.

```javascript
// script.js

function myComponent() {
    return {
        element: 'h1',
        text: 'This is my first vanillapod component!'
    };
}
```

The implicit approach of defining components is useful in the beginning of development of a component.

### Explicit Components

While this works perfectly fine for rendering something to the screen. it's not very flexible. That's why vanillapod provides a helper for rendering elements inside a component.

Here are the methods available for working with explicit components:

- [setElementEventHandlers](./src/events.js)
- [setElementAttributes](./src/attributes.js)
- [setElementProperties](./src/properties.js)
- [setElementTextContent](./src/text.js)
- [createElement](./src/element.js#L92)
- [createDocumentFragment](./src/fragment.js)

```javascript
// script.js

import { createElement } from 'vanillapod';

function myComponent() {
    const element = createElement('h1', {
        text: 'This is my first vanillapod component!'
    });

    return {
        element
    };
}
```

The explicit approach gives you more flexibility of what a component can do. The only requirement of a component using the explicit approach is that is should return an object with a `element` property. You can create elements using the `createElement` method. 

### createElement

createElement is the method for creating all of the different DOM elements. It expects a `element` string value and returns all the props that vanillpod expects from components. There are several aliases for createElement, to make the experience of using createElement as smooth as possible.

These are the three different alias methods for createElement:

- [`h`](./src/element.js#L126)
- [`e`](./src/element.js#L127)
- [`html`](./src/element.js#L128)

### Mounting

After you've defined your component it's time to mount it to the DOM, in other words render the html. You can specify a root element you want to mount inside, and pass it to `mount` as the first argument.

```javascript
// script.js 

import { createElement, mount } from 'vanillapod';

function myComponent() {
    return {
        element: createElement('h1', {
            text: 'This is my first vanillapod component!'
        });
    };
}

const root = document.getElementById('root');

mount(root, myComponent);
```

It's also possible to mount multiple components at the same time.

```javascript
// script.js 

import { createElement, mount } from 'vanillapod';

function myComponent() {
    const element = createElement('h1', {
        text: 'This is my first vanillapod component!'
    });

    return {
        element
    };
}

function anotherComponent() {
    return {
        element: 'div',
        classList: ['another-component'],
        text: 'this is a second component'
    };
}

function thirdComponent() {
    return {
        element: 'div',
        classList: ['third-component'],
        text: 'this is a third component'
    };
}

// ...

// you can specify multiple components to mount simultaneously
mount(
    root,
    myComponent,
    anotherComponent,
    thirdComponent
);

```

You can pass null as the first argument to mount inside the documents `body` element.

```javascript
// ...

mount(
    null,
    myComponent,
    anotherComponent,
    thirdComponent
);

// ...
```

It's possible to pass props/data to components when mounting.

```javascript
import { mount } from 'vanillapod';

function Header({ text }) {
    return {
        element: 'header',
        text,
    };
}

mount(
    document.body,
    [
        Header, 
        { text: 'Hello World!' }
    ]
);
```

It's not necessary to mount a functional component, you can mount objects directly instead.

```js
import { mount } from 'vanillapod';

mount(
    document.querySelector('#app'),
    { element: 'h1', text: 'This is not a functional component!' },
    { element: 'p', text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Natus quaerat magnam ratione consequuntur, tempora ipsa sapiente reiciendis eligendi maiores cum blanditiis odit architecto dolorem exercitationem facere. Tempore pariatur magni nemo.' }
);

```

It's possible to mount not just elements, but any kind of node.

```js
import { render, comment, fragment, text } from 'vanillapod';


render(
    () => [
        comment("I'm a comment"),
        fragment(), // just an empty fragment
        text("I'm just a simple text node"),
    ]
    document.querySelector('#app'),
);

```

### Unmounting

```js
import { mount, unmount } from 'vanillapod';

const component = { el: 'h1', text: 'Unmount me right now!' };

mount(
    document.querySelector('#app'),
    component
);

setTimeout(() => unmount(
    root,
    component
), 5000);

```

...

### Children

You can specify children of your component by specifying a `children` array key in the component properties.

```javascript
// script.js

import { mount } from 'vanillapod';

const heading = () => ({
    element: 'h1',
    text: 'This is my first vanillapod component!'
});

function myComponent() {
    return {
        element: 'div',
        children: [
            heading
        ]
    };
}

mount(null, myComponent);

```

### Attributes

```js

// ...

function myComponent() {
    return {
        // ...
        attributes: {
            hidden: ''
        },
        // ...
    };
}
```

Use `setElementAttributes` for explicit components.

### Properties

```js

// ...

function myComponent() {
    return {
        // ...
        properties: {
            id: 'myComponent'
        },
        // ...
    };
}
```

Use `setElementProperties` for explicit components.

### Events

It's possible to attach event handlers to your component, by defining event handler functions in a `events` key on the `props` object that gets passed to `createElement` in your component. The event name is the same as what you'd normally pass to [`element.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

```javascript
// script.js

// ...

function myComponent() {
    const onClick = (e) => {
        console.log('Click event fired!')
    }

    return {
        // ...
        events: {
            click: onClick
        },
        // ...
    };
}

// ...
```

### Passing data to child components

```js
import { mount, createDocumentFragment } from 'vanillapod/vanillapod';

function List({ tasks }) {
    return {
        element: 'ul',
        children: tasks.map(item => () => ({
            element: 'li',
            text: item
        }))
    };
}

function Header({ text }) {
    return {
        element: 'header',
        text,
    };
}

function App() {
    const tasks = [
        'first',
        'second',
        'third'
    ];

    const children = [
        [
            Header,
            { text: 'hello world!' }
        ],
        [
            List,
            { tasks }
        ]
    ];

    const [ el ] = createDocumentFragment();

    return {
        el,
        children
    };
}

mount(
    document.querySelector('#app'), 
    App
);

```

### Lifecycle Methods (Hooks)

```js
function myComponent() {
    // ...

    return {
        // ...
        hooks: {
            before() {
                console.log('myComponent before mount hook');
            },
            mount() {
                console.log('myComponent on mount hook');
            }
        },
        // ...
    };
}
```

Use `registerHooks` method for explicit component approach.

## Potential Pitfalls

There are a few things that might create unexpected results...

### Events on document fragments

Since document fragments do not behave like a usual element (doesn't render any element in the DOM), events attached to it will not work. You can work around this by attaching events on another element or on the window object.

```js
import { mount } from 'vanillapod';

function Fragment() {
    const [el] = createDocumentFragment();

    window.addEventListener('click', () => console.log('clicked!'));

    return {
        el
    };
}

mount(null, Fragment);
```

### Hooks for state changes, Events for DOM changes

...

## Targeting Legacy Browsers (ES5) 

If your project requires support for legacy browsers, the recommended way to support them is to use a bundler for transpiling your codebase _and_ vanillpod, or other dependencys, that are taking advantage of ES6 features like ES Modules, to something that can run in a environment that has support for ES5 features. Vite and Parcel are the two recommended bundlers, since they're the most easy-to-use and easier to configure.

### Parcel

...

### Vite

...

## Debugging

If anything is not going as expected, you can always turn on debugging. vanillapod.js will then output what it's doing along the way. To turn on debugging, do the following:

```javascript
// yourscript.js

import { debug } from 'vanillapod';

debug(true);

// to read debug value, call debug().

debug() // returns true

```

## Example App

You can check out an example of how to build a [ToDo app with vanillapod here](https://github.com/carlrafting/vanillapod-example).

## ToDo

- [x] lifecycle events/hooks
- [x] complete name variable in doRegister function (function removed)
- [ ] make it possible to unmount component
- [ ] message/pubsub component
- [ ] make it nicer to check value of classList from another component. `stopButton().classList[1]` is not so nice...
- [x] only output `console.log` if debug is true
- [x] refactor createElement.js if necessary...
- [x] write some initial tests!
- [x] make it possible to attach multiple elements at once... ie: 

    ```javascript
    mount(root, [
        element1,
        element2,
        element3
    ]);
    ```

- [x] only throw errors when debug is true
- [x] showcase how to set properties
- [ ] make it possible to debug components visually with debug method?
- [ ] router component would be nice!
- [x] write documentation for implicit vs explicit approach
