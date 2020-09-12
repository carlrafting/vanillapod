// A helper one can use to create elements within components
//
// Example:
// 
// import elementHelper from 'path/to/elementHelper.js';
//
// export default function foobar() {
//     function attrs() {
//         return {
//             classList: ['foo', 'bar'],
//             data: {
//                 foo: 'bar',
//                 hello: ['world', 'hello']
//             },
//             attributes: {
//                 value: 'foo'
//             }
//         }
//     };

//     return elementHelper(
//         'div',
//         'hello there',
//         attrs,
//         {
//             click(e) { console.log(target) }
//         },
//         [ bar ]
//     );
// }
//
export default function elementHelper(
    element='',
    text='',
    attributes=function(){},
    events={},
    children=[]
) {
    return {
        element,
        text,
        ...attributes(),
        events,
        children
    };
}