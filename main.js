const vType = {
    CAR: 0,
    BIKE: 1,
    TRAM: 2,
    CONVOY: 3
}

const pedestrianType = {
    NONE: 0,
    RIGHT: 1,
    LEFT: -1
}

let example = [
    {   // Right road
        vehicle: {
            type: vType.CAR,
            direction: 2
            // Car coming from the right road, heading straight.
        },
        pedestrian: pedestrianType.RIGHT // Pedestrian coming from the right
    },
    {
        vehicle: {
            type: vType.BIKE,
            direction: 2
        }
        // No pedestrians
    },
    { 
        vehicle: {
            type: vType.CAR,
            direction: 1
        }
    },
    {}
];
// This should become:

//       |     |
//       | B   |
//   --- + |   + ---
//       <---^-- C1
//    C2 ----|        
//   --- +     + ---
//       |     | 
//       |     | 
// Order is B, C1, C2 btw
