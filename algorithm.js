// All directions here are relative to the vehicle which is being evaluated at that time.


// Using an object as an enum again
const RDir = {
    NONE: 0,
    RIGHT: 1,
    STRAIGHT: 2,
    LEFT: 3,
}

const Level = {
    exit: 0,
    extra: 1,
    normal: 2, 
    priority: 3
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
            false, true, true
        ],
        [   // Traffic coming from the left
            false, true, true
        ]
    ],
]



function priority(first, firstIsPedestrian, second, secondIsPedestrian) {
    let relativeDir = dirDif(second.from, first.from);
    if(collisions[first.arrow][relativeDir][second.arrow] == false) return "none";
    
    first.level = getLevel(first);
    second.level = getLevel(second);


    let useLevels = true;

    // Extras like unhardened roads are special, because they are relative.
    // If you're coming from an unhardened road, you have to let the people to your left and right go first,
    // But there are no special rules regarding traffic coming from the road opposite to you.
    if (
        (first.level == Level.extra) != (second.level == Level.extra) 
        && Math.abs(dirDif(first.index, second.index)) == 2
    )
        useLevels = false;

}

// The algorithm uses a level system/
// A vehicle's level is based on the situation, not the vehicle.
// Levels always have priority over the other rules (priority to the right, straight on same road goes first, etc.)
// There is one exception to that rule (because of course there is), which has to do with convoys.
// You can NEVER start driving in between a convoy,
// and you can only cross one when you are on a priority road, which is directly crossing the convoy.
function getLevel(dir) {
    if(dir.extra == ExtraType.EXIT) return 0;
    if(dir.extra > ExtraType.EXIT) return 1;
    if(dir.priority >= 0) return 3;
    return 2;
}


function dirDif(a, b) {
    let dif = (a - b) % 4;
    while(dif < 0) dif += 4;
    return dif;
}
