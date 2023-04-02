import { onChange } from 'vanillapod/state';

{
    // array of numbers with same values
    console.log('same values:', onChange([1, 2, 3], [1, 2, 3]));
    // array of numbers with added values
    console.log('added value:', onChange([1, 2, 3], [1, 2, 3, 4, 5, 6]));
    // array of numbers with removed values
    console.log('removed values', onChange([1, 2, 3, 4, 5, 6], [1, 2, 3]));
    // array of numbers with updated values
    console.log('updated values', onChange([1, 2, 3], [4, 5, 6]));

    // array of objects with the same values
    console.log(
        'same object',
        onChange(
            [{ value: 1 }, { value: 2 }, { value: 3 }],
            [{ value: 1 }, { value: 2 }, { value: 3 }]
        )
    );
    // array of objects with addition
    console.log(
        'added objects',
        onChange(
            [{ value: 1 }, { value: 2 }, { value: 3 }],
            [
                { value: 1 },
                { value: 2 },
                { value: 3 },
                { value: 4 },
                { value: 5 },
            ]
        )
    );
    // array of objects with removals
    console.log(
        'removed objects',
        onChange(
            [
                { value: 1 },
                { value: 2 },
                { value: 3 },
                { value: 4 },
                { value: 5 },
            ],
            [{ value: 1 }, { value: 2 }, { value: 3 }]
        )
    );
    // array of objects with modifications
    console.log(
        'updated objects',
        onChange(
            [{ value: 1 }, { value: 2 }, { value: 3 }],
            [{ value: 4 }, { value: 5 }, { value: 6 }]
        )
    );
}
