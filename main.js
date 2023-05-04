const VType = {
    NONE: 0,
    CAR: 1,
    TRAM: 2,
    CONVOY: 3
}

const PedestrianType = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
    HOVER: 3, // For the preview while placing a pedestrian
    letter: ['', 'l', 'r', 'h']
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

// placing is an object with the elements that have to be added to the setup direction object.
// For example: {vehicle: VType.car}
let placing = undefined;
let placingSpecial = {type: undefined, dir: 0};


class MenuItem {
    constructor(placeObject, type, plural) {
        this.placeObject = placeObject;
        this.type = type;
        this.plural = (plural == undefined ? false : plural);
    }
}

const classNames = ["", "car", "bike", "tram", "convoy"];
const menuItemElements = $("#menu").children();
for(let i = 0; i < menuItemElements.length; i++) {
    menuItemElements[i].addEventListener("click", menuClick);
}

let hitboxes = [];
let corners = [];
for(let i = 0; i < 4; i++) {
    hitboxes[i] = $("#hitbox" + i);

    hitboxes[i].contextmenu(function(e) {
        e.preventDefault();
        hitboxClick(e);
    });

    hitboxes[i].hover(function() {hitboxHover(i, true)}, function() {hitboxHover(i, false)});
    hitboxes[i].click(hitboxClick);
}
let currentHover = undefined;

$(document).keyup(function(e) {
    if (e.key === "Escape") {
        placing = undefined;
        placingSpecial.type = undefined;
        menuTarget.classList.remove("selected");
        render(currentSetup);
        $("#messageLeft").addClass("hide");
        $("#messageRight").addClass("hide");
   }
});

let currentSetup = [{vehicle: VType.CAR, texture: "red car", arrow: 1}, {}, {}, {}];
let newSetup = [{}, {}, {}, {}];

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

    if(direction.arrow != undefined) {
        let dirLetter = ['', 'l', 's', 'r'][dirDif(index, direction.arrow)];
        let el = $('#arrow' + index);
        el.removeClass("hide");
        el.attr("src", "img/arrow" + dirLetter + ".svg");
    }
    else $("#arrow" + index).addClass("hide");

    if(direction.extra != undefined) {
        let el = $('#extra' + index);
        el.removeClass("hide");
        el.attr("src", "img/" + extraFileName[direction.extra]);
    }
    else $("#extra" + index).addClass("hide");

    if(direction.pedestrian != undefined) {
        let el = $('#pedestrian' + index);
        el.removeClass("hide");
        el.attr("src", "img/pedestrian" + PedestrianType.letter[direction.pedestrian] + ".svg")
    }
    else $("#pedestrian" + index).addClass("hide");
    
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


const menuItems = {
    car:        new MenuItem({vehicle: VType.CAR, texture: "red car"}, "vehicle"),
    bike:       new MenuItem({vehicle: VType.CAR, texture: "blue car"}, "vehicle"),
    tram:       new MenuItem({vehicle: VType.TRAM, texture: "green car"}, "vehicle"),
    convoy:     new MenuItem({vehicle: VType.CONVOY}, "vehicle"),
    pedestrian: new MenuItem({pedestrian: PedestrianType.HOVER}, "pedestrian"),
    passage:    new MenuItem({passage: true}, "passageway"),
    sharks:     new MenuItem({extra: ExtraType.SHARKS}, "addition", true),
}
let menuTarget = undefined;
function menuClick(item) {
    // Make sure only one menu item is highlighted
    if(menuTarget != undefined) menuTarget.classList.remove("selected");

    menuTarget = item.target;
    if(menuTarget.tagName == "IMG") menuTarget = menuTarget.parentElement;
    let itemId = menuTarget.id.substr(4);

    // Highlight the menu item
    menuTarget.classList.add("selected");
    placing = menuItems[itemId].placeObject;

    // Show placing messages
    console.log(menuTarget);
    if(menuItems[itemId].plural) 
        $("#messageLeft").removeClass("hide").text("Placing " + menuTarget.innerText);
    else 
        $("#messageLeft").removeClass("hide").text("Placing a " + menuTarget.innerText);
    $("#messageRight").removeClass("hide").html(
        "Press escape to stop<br>"
        + "Right click to remove a"
        // Gotta have that correct English
        + ("aeoui".includes(menuItems[itemId].type.charAt(0)) ? "n " : " ")
        + menuItems[itemId].type
    );
}

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
    if(placingSpecial.type == "arrow" && direction && placingSpecial.dir != index) { // Check if we're placing a special
        newSetup[placingSpecial.dir].arrow = index;
        renderDir(newSetup[placingSpecial.dir], placingSpecial.dir);
    }
    else if(placingSpecial.type == "pedestrian") {
        const clickedIndex = +(placingSpecial.dir);
        const dif = dirDif(index, clickedIndex);

        if(direction) {
            if(dif == 0) newSetup[clickedIndex].pedestrian = PedestrianType.RIGHT;
            else if (dif == 3) newSetup[clickedIndex].pedestrian = PedestrianType.LEFT;
        }
        else {
            newSetup[clickedIndex].pedestrian = PedestrianType.HOVER;
        }
        renderDir(newSetup[clickedIndex], clickedIndex);

    }
    else if(placing != undefined && placingSpecial.type == undefined) {
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

        if(placingSpecial.type != undefined) {
            if(event.type == "contextmenu") {
                renderDir(currentSetup[placingSpecial.dir], placingSpecial.dir);
                placingSpecial = undefined;
                placing = undefined;
                return;
            }
            if(placingSpecial.type == "pedestrian" && dirDif(placingSpecial.dir, index) > 1) return;
            // The clicked index is not necessarily the index the arrow is currently pointing at.
            implementNewSetup(placingSpecial.dir);            
            placingSpecial.type = undefined;
        }
        else if(event.type == "contextmenu") {
            for(let obj of Object.entries(placing)) {
                currentSetup[index][obj[0]] = undefined;
                newSetup[index][obj[0]] = undefined;
                // Remove arrow if it's a vehicle
                if(obj[0] == "vehicle") {
                    currentSetup[index].arrow = undefined;
                    newSetup[index].arrow = undefined;
                }
            }
            renderDir(currentSetup[index], index);
        }
        else if(placing.pedestrian != undefined) {
            newSetup[index].pedestrian = PedestrianType.RIGHT;
            renderDir(newSetup[index], index);
            placingSpecial.type = "pedestrian";
            placingSpecial.dir = index;
        }
        else if(placing.vehicle != undefined) {
            placingSpecial.type = "arrow";
            placingSpecial.dir = index;
        }
        else {
            implementNewSetup(index);
        }
    }
}
