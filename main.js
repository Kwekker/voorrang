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
    // ExtraType.EXIT is an "uitrit", which means you have to let EVERYONE go first.
    // It overrules all the other 'extra' types, so I'm adding it to this category,
    // because you'll never see any of these ones at the same time.
    // (Ok you might see an unhardened road with a stop sign but that doesn't do anything to the rules.)
    EXIT: 4
}
const extraFileName = ["", "sharks.svg", "stop.svg", "unhardened.svg"];


const classNames = ["", "car", "bike", "tram", "convoy"];
const menuItems = $("#menu").children();
for(let i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener("click", menuClick);
}

let hitboxes = [];
for(let i = 0; i < 4; i++) {
    hitboxes[i] = $("#hitbox" + i);
    console.log(hitboxes[i]);
    hitboxes[i].contextmenu(function(e) {
        e.preventDefault();
        hitboxClick(e);
    });
    hitboxes[i].hover(function() {hitboxHover(i, true)}, function() {hitboxHover(i, false)});
    hitboxes[i].click(hitboxClick);
}
let currentHover = undefined;

// placing is an object with a key/value pair. For example: {vehicle: VType.car}
let placing = undefined;
let placingDir = undefined;

$(document).keyup(function(e) {
    if (e.key === "Escape") {
        placing = undefined;
        placingDir = undefined;
        menuTarget.classList.remove("selected");
        render(currentSetup);
        $("#messageLeft").addClass("hide");
        $("#messageRight").addClass("hide");
   }
});

let currentSetup = [{}, {}, {}, {}];

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


const menuItemType = {
    car: "vehicle",
    bike: "vehicle",
    tram: "vehicle",
    convoy: "vehicle",
    pedestrian: "pedestrian",
    passage: "passageway",
    sharks: "addition",
}
const menuItemIsPlural = {
    sharks: true
};
const menuToKeyValuePair = {
    car: {vehicle: VType.CAR, texture: "red car"},
    bike: {vehicle: VType.CAR, texture: "blue car"},
    tram: {vehicle: VType.TRAM, texture: "green car"},
    sharks: {extra: ExtraType.SHARKS},
    passage: {passage: true},
};
let menuTarget = undefined;
function menuClick(item) {
    // Make sure only one menu item is highlighted
    if(menuTarget != undefined) menuTarget.classList.remove("selected");

    menuTarget = item.target;
    if(menuTarget.tagName == "IMG") menuTarget = menuTarget.parentElement;
    let itemId = menuTarget.id.substr(4);

    // Highlight the menu item
    menuTarget.classList.add("selected");
    placing = menuToKeyValuePair[itemId];

    // Show placing messages
    console.log(menuTarget);
    if(menuItemIsPlural[itemId]) 
        $("#messageLeft").removeClass("hide").text("Placing " + menuTarget.innerText);
    else 
        $("#messageLeft").removeClass("hide").text("Placing a " + menuTarget.innerText);
    $("#messageRight").removeClass("hide").html(
        "Press escape to stop<br>"
        + "Right click to remove a"
        // Gotta have that correct English
        + ("aeoui".includes(menuItemType[itemId].charAt(0)) ? "n " : " ")
        + menuItemType[itemId]
    );
}

let newSetup = [];
function implementNewSetup(index) {
    currentSetup[index] = $.extend(true,{},newSetup[index]);
    renderDir(currentSetup[index], index);
}
function currentToNewSetup(index) {
    newSetup[index] = $.extend(true,{},currentSetup[index]);
}

function hitboxHover(index, direction) {
    // Set the currentHover variable
    if(direction) currentHover = index;
    else if(currentHover == index) currentHover = undefined;
    
    // Handle placement
    if(placingDir != undefined && placingDir != index && direction) { // Check if we're placing a direction arrow
        newSetup[placingDir].dir = index;
        renderDir(newSetup[placingDir], placingDir);
    }
    else if(placing != undefined && placingDir == undefined) {
        if(direction) {
            currentToNewSetup(index);
            for(let obj of Object.entries(placing)) {
                newSetup[index][obj[0]] = obj[1];
            }
            renderDir(newSetup[index], index);
        }
        else {
            renderDir(currentSetup[index], index);
        }
    }
}

function hitboxClick(event) {
    if(placing != undefined) {
        // Get the clicked index
        let index = event.target.id.substr(6);

        if(placingDir != undefined) {
            // The clicked index is not necessarily the index the arrow is currently pointing at.
            implementNewSetup(placingDir);            
            placingDir = undefined;
        }
        else if(event.type == "contextmenu") {
            for(let obj of Object.entries(placing)) {
                currentSetup[index][obj[0]] = undefined;
                newSetup[index][obj[0]] = undefined;
                // Remove arrow if it's a vehicle
                if(obj[0] == "vehicle") {
                    currentSetup[index].dir = undefined;
                    newSetup[index].dir = undefined;
                }
            }
            renderDir(currentSetup[index], index);
        }
        else if(placing.vehicle != undefined) {
            placingDir = index;
        }
        else {
            implementNewSetup(index);
        }
    }
}