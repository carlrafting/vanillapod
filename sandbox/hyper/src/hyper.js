const NAME = 'xhr';
const VALUE = 'vanillapod-hyper';

export function createMetaElement() {
    const meta = document.createElement('meta');
    meta.name = NAME;
    meta.content = VALUE;
}

export function ensureMetaElementExists() {
    return document.querySelector('head > meta[name=xhr]');
}
