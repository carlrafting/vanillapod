# vanillapod

Lightweight library for building vanilla JavaScript components...

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Goal: Enhanche Vanilla JavaScript](#goal-enhanche-vanilla-javascript)
- [Getting Started](#getting-started)
  - [Components](#components)
  - [Mounting](#mounting)
  - [Children](#children)
  - [Events](#events)
- [ES5](#es5)
- [Mounting](#mounting-1)
- [Debugging](#debugging)
- [Example App](#example-app)
- [ToDo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
$ npm install vanillapod

# or if you prefer using yarn
$ yarn add vanillapod
```

## Goal: Enhanche Vanilla JavaScript

Whenever we write Vanilla JavaSript, it might look something like this:

```javascript

    // create required elements
    const container = document.createElement('div');
    const displayTimer = document.createElement('div');
    const heading = document.createElement('h1');
    const startButton = document.createElement('button');
    const stopButton = document.createElement('button');

    // hooks/lifecycle events
    const containerHooks = {
        before() {
            console.log('before mount');
        }
        mount() {
            console.log('on mount');
        }
        unmount() {
            console.log('on unmount');
        }
    };

    // set attributes on elements
    container.classList.add('container', 'flow');
    startButton.classList.add('button', 'button--start');
    stopButton.classList.add('button', 'button--stop');
    displayTimer.classList.add('display-timer');

    // set text for heading
    heading.appendChild(document.createTextNode(config.containerHeading));

    // set text for buttons
    startButton.appendChild(document.createTextNode(config.startButtonText));
    stopButton.appendChild(document.createTextNode(config.stopButtonText));

    // set initial output for timer
    displayTimer.appendChild(document.createTextNode(config.timerOutput));

    // append heading and buttons to container
    container.appendChild(heading);
    container.appendChild(displayTimer);
    container.appendChild(startButton);
    container.appendChild(stopButton);

    // element DOM events
    container.addEventListener('click', ({ target }) => {
        if (target.classList.contains('button--stop')) {
            console.log('You clicked the stop button!');
        } else {
            console.log('You clicked on something else...');
        }
    }, false)

    // execute hooks
    containerHooks.before();

    // mount container to DOM
    document.body.appendChild(container);

```

Notice that we are doing alot of things repeatedly: creating elements, adding classes and attributes, creating text nodes, attaching child elements etc... The benefit is we are grouping things together by task.

The goal is to go through each of these steps for you. You just have to write regular old Vanilla JavaScript. It might look something like this:

```javascript

    import heading from './heading.js';
    import displayTimer from './displayTimer.js';
    import startButton from './startButton.js';
    import stopButton from './stopButton.js';

    export default function container() {
        const children = [
            heading,
            displayTimer,
            startButton,
            stopButton
        ];

        const attrs = () => ({
            classList: ['container', 'flow'],
            data: {
                hello: 'world'
            }
        });

        const onClick = ({ target }) => {
            if (
                target.classList.contains(
                    stopButton().classList[1]
                )
            ) {
                console.log('You clicked the stop button!');
            } else {
                console.log('You clicked on something else...');
            }
        };

        return {
            element: 'div'
            attributes: attrs,
            events: { click: onClick },
            children
        };
    }

```

Isn't this much better? We encapsulate all the code that has to do with the container, inside a `function` called container. All children are stored inside an array on a property called `children` which belongs to the object we return whenever `container()` is called.

You might have noticed we are setting classList inside an arrow function called `attrs`, this is just a conveniant way if you are setting many attributes at once. You could just as well write it this way:

```javascript

    // ...

    return {
        element: 'div',
        classList: ['container', 'flow'],
        attributes: ['data-hello', 'world'],
        events: { click: onClick },
        children
    };

    // ...

```

If we take a look at the `onClick` arrow function, we see that we're doing event delegation like we usually would in regular Vanilla JavaScript.

One nice benefit of importing our other components (children), is that we have access to their attributes! This enables us to do event delegation without going through the hassle to specify the classes or attributes we might want to check, all over again.

## Getting Started

### Components

You can use vanillapod regardless of using a bundler (Webpack, parcel or rollup), or using ES2015 modules in browsers that support it. The first step to get started is defining your component.

```javascript
    // script.js

    function myComponent() {
        return {
            element: 'h1',
            text: 'This is my first vanillapod component!'
        };
    }
```

### Mounting

After you've defined your component it's time to mount it to the DOM, in other words render the html. You can specify a root element you want to mount inside, and pass it to `mount` as the first argument.

```javascript
    // script.js 

    // import with a bundler
    import { mount } from 'vanillapod';

    // import without bundler
    import { mount } from './node_modules/vanillapod/dist/vanillapod.js';

    // ...

    const root = document.getElementById('root');

    mount(root, myComponent);
```

### Children

You can specify children of your component by specifying a `children` key in the object that gets returned by your component.

```javascript
    // script.js

    // imports
    // ...

     function myComponent() {
        const heading = () => ({
            element: 'h1',
            text: 'This is my first vanillapod component!'
        });

        return {
            element: 'div',
            children: [
                heading
            ]
        };
    }

    // mounting
    // ...

```

### Events

It's possible to attach event handlers to your component, by defining event handler functions in a `events` key on the object that gets returned from your component.

```javascript
    // script.js

    // imports
    // ...

    function myComponent() {
        // heading child component
        // ...
        
        const onClick = (e) => {
            console.log('Click event fired!')
        }

        return {
            // element & children props
            // ...
            events: {
                click: onClick
            }
        };
    }

    // mounting
    // ...
```

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
## Mounting

When you've defined your component, you have to mount it to an element in the DOM to render it in the browser.

```javascript

    import { mount } from 'vanillapod';
    import container from 'path/to/container.js';

    const root = document.getElementById('root');

    mount(root, container);

    // if you don't specify a root element as a first argument to mount(),
    // the component will mount to the body element automatically
    mount(null, container);

    // you can specify multiple components to mount simultaneously
    mount(
        root,
        container,
        anotherComponent,
        thirdComponent
    );

```

## Debugging

If anything is not going as expected, you can always turn on debugging. vanillapod.js will then output what it's doing along the way. To turn on debugging, do the following:

```javascript

    // yourscript.js

    import { debug } from 'vanillapod';

    debug(true);

    // to read debug value, just call debug().

    debug() // returns true

```

## Example App

You can check out an example of how to build a [ToDo app with vanillapod here](https://github.com/carlrafting/vanillapod-example).
    

## ToDo

- [ ] lifecycle events/hooks
- [x] complete name variable in doRegister function (function removed)
- [ ] make it possible to unmount component
- [ ] message/pubsub component
- [ ] make it nicer to check value of classList from another component. `stopButton().classList[1]` is not so nice...
- [x] only output `console.log` if debug is true
- [x] refactor createElement.js if necessary...
- [x] write tests!
- [x] make it possible to attach multiple elements at once... ie: 

    ```javascript
    mount(root, [
        element1,
        element2,
        element3
    ]);
    ```

- [x] only throw errors when debug is true
- [ ] showcase how to set properties
- [ ] how can we make use of regular DOM methods?
