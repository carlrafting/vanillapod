# vanillapod

Lightweight library for building vanilla JavaScript components...

__NOTE: ⚠ vanillapod is not used in production at the moment, and is missing some essential features.__

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Background](#background)
- [Goal: Enhanche Vanilla JavaScript](#goal-enhanche-vanilla-javascript)
- [Getting Started](#getting-started)
  - [Components](#components)
  - [Mounting](#mounting)
  - [Children](#children)
  - [Attributes](#attributes)
  - [Properties](#properties)
  - [Events](#events)
  - [Passing data to child components](#passing-data-to-child-components)
  - [Lifecycle Methods (Hooks)](#lifecycle-methods-hooks)
- [ES5](#es5)
- [Debugging](#debugging)
- [Example App](#example-app)
- [ToDo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
# install with npm
$ npm install vanillapod

# or if you prefer using yarn
$ yarn add vanillapod
```

## Background

Vanillapods main goal is to be a learning experience and to produce something useful, if not for anyone else, at least for me. It's inspired to attempt creating a UI library, by Juha Lindstedts [RE:DOM](https://redom.js.org/) and later on Chris Ferdinandis [Reef.js](https://reefjs.com/). Hopefully it will not be too similair to those libraries (why should it exist otherwise?), but rather use those libraries to learn different approaches to solve common problems. Vanillapod is not used in production as of this time, so if you're looking for something more battle-tested, check out the libraries i mentioned above. 

## Goal: Enhanche Vanilla JavaScript

The goal of vanillapod is to enhance vanilla JavaScript with a component based architecture. Vanillapod provides several helpers to make the interaction with the DOM a bit more pleasant (hopefully).

## Getting Started

You can use vanillapod regardless of using a bundler (Webpack, parcel or rollup), or using ES2015 modules in browsers that support it.

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

```javascript
// script.js

import { elementHelper } from 'vanillapod';

function myComponent() {
    const props = {
        element: 'h1',
        text: 'This is my first vanillapod component!'
    }

    const element = elementHelper(props);

    return {
        element
    };
}
```

The explicit approach gives you more flexibility of what a component can do. The only requirement of a component using the explicit approach is that is should return an object with a `element` property. You can create elements using the `elementHelper` method. 

### Mounting

After you've defined your component it's time to mount it to the DOM, in other words render the html. You can specify a root element you want to mount inside, and pass it to `mount` as the first argument.

```javascript
// script.js 

import { elementHelper, mount } from 'vanillapod';

// myComponent
// ...

const root = document.getElementById('root');

mount(root, myComponent);
```

It's also possible to mount multiple components at the same time.

```javascript
// script.js 

// ...

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

mount(null, container);

// ...
```

### Children

You can specify children of your component by specifying a `children` key in the `props` object that gets passed to `elementHelper` in your component.

```javascript
// script.js

import { elementHelper, mount, setElementChildren } from 'vanillapod';

const heading = () => ({
    element: 'h1',
    text: 'This is my first vanillapod component!'
});

function myComponent() {
    const props = {
        element: 'div',
        children: [
            heading
        ]
    };

    const element = elementHelper(props);

    setElementChildren(element, props);

    return {
        element
    };
}

// mounting
// ...

```

### Attributes

...

### Properties

...

### Events

It's possible to attach event handlers to your component, by defining event handler functions in a `events` key on the `props` object that gets passed to `elementHelper` in your component. The event name is the same as what you'd normally pass to [`element.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

```javascript
// script.js

// imports
// ...

// heading child component
// ...

function myComponent() {
    const props = {
        // ...
        events: {
            click: onClick
        }
    }

    const onClick = (e) => {
        console.log('Click event fired!')
    }

    // ...

    return {
        // ...            
    };
}

// mounting
// ...
```

### Passing data to child components

...

### Lifecycle Methods (Hooks)

...

## ES5 

There is a ES5 bundle available for targeting older browsers that doesn't have support for ES2015 modules. All vanillapod methods are namespaced under `vanillapod`. Here is how you use the ES5 bundle.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vanillapod ES5</title>
</head>
<body>

<div id="root">
    <h1>vanillapod ES5 Example</h1>
</div>

<script src="./node_modules/vanillapod/dist/vanillapod.es5.min.js"></script>
<script src="script.js"></script>

</body>
</html>
```

```javascript
// script.js

function myComponent() {
    return {
        element: 'div',
        text: 'Hello World'
    };
}

if (window.vanillapod) {
    vanillapod.mount(null, myComponent);
} else {
    console.error('Something went wrong!');
}
```

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
