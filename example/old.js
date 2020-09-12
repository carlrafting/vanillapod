// create required elements
const container = document.createElement('div');
const displayTimer = document.createElement('div');
const heading = document.createElement('h1');
const startButton = document.createElement('button');
const stopButton = document.createElement('button');

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

// mount container to DOM
document.body.appendChild(container);