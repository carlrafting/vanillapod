let count = 0;
const h1 = document.createElement('h1');
const button = document.createElement('button');

button.textContent = 'Count!';
h1.textContent = count;

button.onclick = () => count++;

document.body.querySelector('#app').append(h1, button);
