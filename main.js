const VType = {
    NONE: 0,
    CAR: 1,
    TRAM: 2,
    CONVOY: 3
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

let hitboxes = [];
for(let i = 0; i < 4; i++) {
    hitboxes[i] = $("#hitbox" + i);
    hitboxes[i].hover(function() {hitboxHover(i, true)}, function() {hitboxHover(i, false)});
}

let movingType = 0;
let movingItem = undefined;

let current = [
    {
        vehicle: VType.CAR,
        texture: "red car",
        dir: 1,
        sharks: true
    },
    {
        vehicle: VType.CAR,
        texture: "blue car",
        dir: 0
    },
    {},
    {
        vehicle: VType.CAR,
        texture: "green car",
        dir: 1
    }
];


function render(setup) {
    for(let i = 0; i < 4; i++) {        
        if(setup[i].vehicle != undefined) {
            let el = $("#vehicle" + i);
            el.removeClass();
            el.addClass(setup[i].texture);
        }
        else $("#vehicle" + i).addClass("hide");

        if(setup[i].dir != undefined) {
            let dirLetter = ['', 'l', 's', 'r'][dirDif(i, setup[i].dir)];
            let el = $('#arrow' + i);
            el.removeClass();
            el.attr("src", "img/" + dirLetter + "arrow.png");
        }
        else $("#arrow" + i).addClass("hide");

        if(setup[i].sharks) {
            let el = $('#sharks' + i);
            el.removeClass("hide");
            el.attr("src", "img/sharkteeth.png");
        }
        else $("#sharks" + i).addClass("hide");
    }
}

function dirDif(a, b) {
    let dif = (a - b) % 4;
    while(dif < 0) dif += 4;
    return dif;
}

function menuClick(item) {
    console.log(item.target.innerText);
}

function hitboxHover(index, direction) {
    console.log(index, direction);
}