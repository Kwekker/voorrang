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

$("#intersection").on("contextmenu", function(e) {
    e.preventDefault(); // This will prevent the default right-click context menu from appearing
    hitboxClick(e);
});

const classNames = ["", "car", "bike", "tram", "convoy"];
const menuItems = $("#menu").children();
for(let i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener("click", menuClick);
}

let hitboxes = [];
for(let i = 0; i < 4; i++) {
    hitboxes[i] = $("#hitbox" + i);
    hitboxes[i].hover(function() {hitboxHover(i, true)}, function() {hitboxHover(i, false)});
    hitboxes[i].click(hitboxClick);
}
let currentHover = undefined;

// moving is an object with a key/value pair. For example: {vehicle: VType.car}
let moving = undefined;

let currentSetup = [
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

render(currentSetup);


function render(setup) {
    for(let i = 0; i < 4; i++) {        
        renderDir(setup[i], i);
    }
}

function renderDir(direction, index) {
    if(direction.vehicle != undefined) {
        let el = $("#vehicle" + index);
        el.removeClass();
        el.addClass(direction.texture);
    }
    else $("#vehicle" + index).addClass("hide");

    if(direction.dir != undefined) {
        let dirLetter = ['', 'l', 's', 'r'][dirDif(index, direction.dir)];
        let el = $('#arrow' + index);
        el.removeClass();
        el.attr("src", "img/" + dirLetter + "arrow.png");
    }
    else $("#arrow" + index).addClass("hide");

    if(direction.sharks) {
        let el = $('#sharks' + index);
        el.removeClass("hide");
        el.attr("src", "img/sharkteeth.png");
    }
    else $("#sharks" + index).addClass("hide");
}

function dirDif(a, b) {
    let dif = (a - b) % 4;
    while(dif < 0) dif += 4;
    return dif;
}

const menuToKeyValuePair = {
    car: {vehicle: VType.CAR, texture: "red car"},
    bike: {vehicle: VType.CAR, texture: "blue car"},
    sharks: {sharks: true}
};
function menuClick(item) {
    let itemId = item.target.id.substr(4);
    if(itemId == "") itemId = item.target.parentElement.id.substr(4);
    console.log(itemId);
    moving = menuToKeyValuePair[itemId];
}

$(document).keyup(function(e) {
    if (e.key === "Escape") {
        moving = undefined;
        restoreOldSetup(currentHover);
   }
});


function hitboxHover(index, direction) {
    // Set the currentHover variable
    if(direction) currentHover = index;
    else if(currentHover == index) currentHover = undefined;
    
    // Handle placement
    if(moving != undefined) {
        if(direction) {
            backupSetup(index);
            for(let obj of Object.entries(moving)) {
                currentSetup[index][obj[0]] = obj[1];
            }
            renderDir(currentSetup[index], index);
        }
        else {
            restoreOldSetup(index);
        }
    }
}

let oldSetup = [];
function backupSetup(index) {
    oldSetup[index] = $.extend(true,{},currentSetup[index]);
}

function restoreOldSetup(index) {
    currentSetup[index] = $.extend(true,{},oldSetup[index]);
    renderDir(currentSetup[index], index);
}

function hitboxClick(event) {
    if(moving != undefined) {
        let index = event.target.id.substr(6);

        if(event.type == "contextmenu") {
            for(let obj of Object.entries(moving)) {
                currentSetup[index][obj[0]] = undefined;
                oldSetup[index][obj[0]] = undefined;
                // Remove arrow if it's a vehicle
                if(obj[0] == "vehicle") {
                    currentSetup[index].dir = undefined;
                    oldSetup[index].dir = undefined;
                }
            }
            renderDir(currentSetup[index], index);
        }
        else backupSetup(index);
    }
}