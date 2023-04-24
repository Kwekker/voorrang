const VType = {
    NONE: 0,
    CAR: 1,
    BIKE: 2,
    TRAM: 3,
    CONVOY: 4
}

const PedestrianType = {
    NONE: 0,
    RIGHT: 1,
    LEFT: -1
}

const classNames = ["", "car", "bike", "tram", "convoy"];
const menuItems = $("#menu").children();
for(let i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener("click", menuClick);
}

let current = [
    {
        vehicle: VType.CAR,
        texture: "red",
        dir: 1,
        sharks: true
    },
    {
        vehicle: VType.CAR,
        texture: "blue",
        dir: 0
    },
    {},
    {
        vehicle: VType.CAR,
        texture: "green",
        dir: 1
    }
];


function render(setup) {
    for(let i = 0; i < 4; i++) {
        let dirEl = $("#dir" + i);
        
        $("#dir" + i).empty();
        if(setup[i].vehicle != undefined) {
            let el = $("<div>");

            el.addClass(classNames[setup[i].vehicle]);
            if(setup[i].vehicle == VType.CAR) el.addClass(setup[i].texture);

            dirEl.append(el);
        }

        if(setup[i].dir != undefined) {
            let el = $('<img>');

            let dirLetter = ['', 'l', 's', 'r'][dirDif(i, setup[i].dir)];
            el.attr("src", "img/" + dirLetter + "arrow.png");
            dirEl.append(el);
        }

        if(setup[i].sharks) {
            let el = $('<img>');
            el.attr("src", "img/sharkteeth.png");
            dirEl.append(el);
        }
    }
}

function dirDif(a, b) {
    let dif = (a - b) % 4;
    while(dif < 0) dif += 4;
    return dif;
}

function menuClick(item) {
    console.log("fuck you");
    console.log(item);
}