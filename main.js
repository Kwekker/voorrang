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

const ExtraType = {
    NONE: 0,
    SHARKS: 1,
    STOP: 2,
    UNHARDENED: 3,
}
const extraFileName = ["", "sharks.svg", "stop.svg", "unhardened.svg"];

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

// placing is an object with a key/value pair. For example: {vehicle: VType.car}
let placing = undefined;
let placingDir = undefined;

let currentSetup = [
    {
        vehicle: VType.CAR,
        texture: "red car",
        dir: 1,
        extra: ExtraType.SHARKS,
        passage: true
    },
    {
        vehicle: VType.CAR,
        texture: "blue car",
        dir: 0
    },
    {
        passage: true
    },
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
        el.attr("src", "img/" + dirLetter + "arrow.svg");
    }
    else $("#arrow" + index).addClass("hide");

    if(direction.extra != undefined) {
        let el = $('#extra' + index);
        el.removeClass("hide");
        el.attr("src", "img/" + extraFileName[direction.extra]);
    }
    else $("#extra" + index).addClass("hide");

    if(direction.passage) {
        $('#passage' + index).removeClass("hide");
    }
    else $("#passage" + index).addClass("hide");

}

function dirDif(a, b) {
    let dif = (a - b) % 4;
    while(dif < 0) dif += 4;
    return dif;
}

const menuToKeyValuePair = {
    car: {vehicle: VType.CAR, texture: "red car"},
    bike: {vehicle: VType.CAR, texture: "blue car"},
    tram: {vehicle: VType.TRAM, texture: "green car"},
    sharks: {extra: ExtraType.SHARKS}
};
let menuTarget = undefined;
function menuClick(item) {
    if(menuTarget != undefined) menuTarget.classList.remove("selected");

    menuTarget = item.target;
    if(menuTarget.tagName == "IMG") menuTarget = menuTarget.parentElement;
    let itemId = menuTarget.id.substr(4);

    menuTarget.classList.add("selected");

    placing = menuToKeyValuePair[itemId];
}

$(document).keyup(function(e) {
    if (e.key === "Escape") {
        placing = undefined;
        menuTarget.classList.remove("selected");
        restoreOldSetup(currentHover);
   }
});


function hitboxHover(index, direction) {
    // Set the currentHover variable
    if(direction) currentHover = index;
    else if(currentHover == index) currentHover = undefined;
    
    // Handle placement
    if(placingDir) { // Check if we're placing a direction arrow
        if(!direction || placingDir == index) return;
        currentSetup[placingDir].dir = index;
        renderDir(currentSetup[placingDir], placingDir);
    }
    else if(placing != undefined && placingDir == undefined) {
        if(direction) {
            backupSetup(index);
            for(let obj of Object.entries(placing)) {
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
    if(placing != undefined) {
        let index = event.target.id.substr(6);

        if(placingDir != undefined) {
            placingDir = undefined;
        }
        else if(event.type == "contextmenu") {
            for(let obj of Object.entries(placing)) {
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
        else if(placing.vehicle != undefined) {
            backupSetup(index);
            placingDir = index;
        }
        else backupSetup(index);
    }
}