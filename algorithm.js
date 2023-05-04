// All directions here are relative to the vehicle which is being evaluated at that time.


// Using an object as an enum again
const RDir = {
    NONE: 0,
    RIGHT: 1,
    STRAIGHT: 2,
    LEFT: 3,
}

// The list of booleans in these arrays refer to the directions an opposing vehicle could travel in,
// relative to the vehicle that is being evaluated. In this order:
// [Right, In front, Left]

// This is an array of arrays of arrays of booleans.
// collisions[dir the vehicle being evaluated is going][dir of an opposing side][dir the vehicle on that side is going in]
// Returns true when the opposing vehicle will cross paths with the vehicle being evaluated, otherwise returns false.
// All references to 'dir' are the directions of the roads relative to the vehicle in question.

// [false, false, true] would mean the vehicle from this direction only poses a problem
// when it is traveling to the left, relative to the vehicle being evaluated.

const collisions = [
    [], // We don't do turning around
    [   // Going right
        [   // Traffic coming from the right
            false, false, false
        ],
        [   // Traffic coming from in front
            false, false, true // Only a problem when it's going left
        ],
        [   // Traffic coming from the left
            false, true, false // Only when it's going straight
        ]
    ],
    [   // Going straight
        [   // Traffic coming from the right
            true, true, true
        ],
        [   // Traffic coming from in front
            false, false, true
        ],
        [   // Traffic coming from the left
            false, true, true
        ]
    ],
    [   // Going left
        [   // Traffic coming from the right
            true, true, false
        ],
        [   // Traffic coming from in front
            true, true, true
        ],
        [   // Traffic coming from the left
            false, true, true
        ]
    ],
]