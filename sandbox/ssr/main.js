const node = (name, attrs) => (content) => {};

function resolveRuntime(log = false) {
    try {
        if (process) {
            if (log) console.log(process);
            return process.release.name === 'node' ? 'node' : undefined;
        }
        /* eslint-disable */
        if (Deno) {
            if (log) console.log(Deno);
            return 'deno';
        }
        if (Bun) {
            if (log) console.log(Bun);
            return 'bun';
        }
        /* eslint-enable */
    } catch (error) {
        if (log) {
            console.error(error);
        }
        // couldn't resolve runtime, do nothing
    }
}

console.log('runtime:', resolveRuntime());

const doctype = '<!doctype html>';
const html = ['<html>', '</html>'];
const head = ['<head>', '</head>'];
const meta = '<meta>';
const title = ['<title>', '</title>'];
const body = ['<body>', '</body>'];

function render(string) {
    return [
        doctype,
        html[0],
        head[0],
        meta,
        title[0],
        title[1],
        head[1],
        body[0],
        string,
        body[1],
        html[1],
    ].join('\n');
}

const page = render('<h1>Hello World!</h1>');
console.log(page);
