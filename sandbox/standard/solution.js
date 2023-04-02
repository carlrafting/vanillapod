let count = 0;
const h1 = document.createElement('h1');
const button = document.createElement('button');
button.textContent = 'Count!';

function effect() {
    h1.textContent = count;
}

effect();

button.onclick = () => count++ && effect();

document.body.querySelector('#app').append(h1, button);
