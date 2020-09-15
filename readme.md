# vanillapod.js

Component-Enhanced Vanilla JavaSript

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Goal: Enhanche Vanilla JavaScript](#goal-enhanche-vanilla-javascript)
- [Debugging](#debugging)
- [ToDo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
    import element from 'vanillapod/elementHelper.js';

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

## Debugging

If anything is not going as expected, you can always turn on debugging. vanillapod.js will then output what it's doing along the way. To turn on debugging, do the following:

```javascript

    // yourscript.js

    import { debug } from 'vanillapod';

    debug(true);

    // to read debug value, just call debug().

    debug() // returns true

```
    

## ToDo

- [ ] lifecycle events/hooks
- [x] complete name variable in doRegister function (function removed)
- [ ] make it possible to unmount component
- [ ] message/pubsub component
- [ ] make it nicer to check value of classList from another component. `stopButton().classList[1]` is not so nice...
- [x] only output `console.log` if debug is true
- [x] refactor createElement.js if necessary...
- [ ] write tests!
- [ ] make it possible to attach multiple elements at once... ie: 

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
