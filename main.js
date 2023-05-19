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
    // ExtraType.EXIT is an "uitrit", which means you have to let EVERYONE go first.
    // It overrules all the other 'extra' types, so I'm adding it to this category,
    // because you'll never see any of these ones at the same time.
    // (Ok you might see an unhardened road with a stop sign but that doesn't do anything to the rules.)
    EXIT: 1,
    SHARKS: 2,
    STOP: 3,
    UNHARDENED: 4,
}
const extraFileName = ["", "exit.svg", "sharks.svg", "stop.svg", "unhardened.svg"];

// placing is an object with the elements that have to be added to the setup direction object.
// For example: {vehicle: VType.car}
let placing = undefined;
let placingSpecial = {type: undefined, dir: 0};

let currentSetup = [{vehicle: VType.CAR, texture: "red car", arrow: 1}, {}, {}, {}];
let newSetup = [{from: 0}, {from: 1}, {from: 2}, {from: 3}];

// For remembering the previous message when placing a special item (like arrows).
let prevMessage = "";


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
        stopPlacing();
   }
});

render(currentSetup);
function render(setup) {
    for(let i = 0; i < 4; i++) {        
        renderDir(setup[i], i);
    }
    renderPriority(setup);
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
    
    if(direction.crosswalk) {
        $('#crosswalk' + index).removeClass("hide");
    }
    else $("#crosswalk" + index).addClass("hide");

    if(direction.priority != undefined) {
        $("#prioritysign" + index).removeClass("hide");
    }
    else $("#prioritysign" + index).addClass("hide");
}

function renderPriority(setup) {
    // This is necessary because I don't use any sort of global storage thing when storing the setup.
    // Everything is stored per road, so the program has to find which roads have priority and which ones don't
    // before drawing the priority road.
    let priority = false;
    for(let i in setup) {
        if(setup[i].priority != undefined) {
            priority = [i, setup[i].priority];
            break;
        }
    }
    
    // This function automatically changes the lines back if priority[0] is undefined
    changeLines(priority[0], priority[1]);
    // Add and remove the shark teeth from roads that don't have priority
    for(let i = 0; i < 4; i++) {
        // Gotta love short circuiting
        if(priority == false || priority[0] == priority[1] || i == priority[0] || i == priority[1]) $("#sharks" + i).addClass("hide");
        else $("#sharks" + i).removeClass("hide");
    }
}

const menuItems = {
    car:        new MenuItem({vehicle: VType.CAR, texture: "red car"}, "vehicle"),
    bike:       new MenuItem({vehicle: VType.CAR, texture: "blue car"}, "vehicle"),
    tram:       new MenuItem({vehicle: VType.TRAM, texture: "green car"}, "vehicle"),
    convoy:     new MenuItem({vehicle: VType.CONVOY}, "vehicle"),
    pedestrian: new MenuItem({pedestrian: PedestrianType.HOVER}, "pedestrian"),
    crosswalk:    new MenuItem({crosswalk: true}, "crosswalk"),
    sharks:     new MenuItem({extra: ExtraType.SHARKS}, "addition", true),
    priority:   new MenuItem({priority: 0}, "priority road", false),
}
let menuTarget = undefined;
function menuClick(item) {
    // Make sure only one menu item is highlighted
    if(menuTarget != undefined) menuTarget.classList.remove("selected");

    menuTarget = item.target;
    while(menuTarget.id == "") menuTarget = menuTarget.parentElement;
    let itemId = menuTarget.id.substr(4);

    // Highlight the menu item
    menuTarget.classList.add("selected");
    placing = menuItems[itemId].placeObject;

    // Show placing messages
    console.log(menuTarget);
    if(menuItems[itemId].plural) 
        $("#messageLeft").removeClass("hide").text("Place " + menuTarget.innerText);
    else 
        $("#messageLeft").removeClass("hide").text("Place a " + menuTarget.innerText);
    $("#messageRight").removeClass("hide").html(
        "Press escape to stop<br>"
        + "Right click to remove a"
        // Gotta have that correct English
        + ("aeoui".includes(menuItems[itemId].type.charAt(0)) ? "n " : " ")
        + menuItems[itemId].type
    );
}

function implementNewSetup() {
    for(index in currentSetup) {
        currentSetup[index] = $.extend(true,{},newSetup[index]);
    }
    render(currentSetup);
}
function currentToNewSetup() {
    for(index in currentSetup) newSetup[index] = $.extend(true,{},currentSetup[index]);
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
    else if(placingSpecial.type == "priority" && index != placingSpecial.dir) {
        if(direction) {
            newSetup[index].priority = placingSpecial.dir;
            newSetup[placingSpecial.dir].priority = index;
        }
        else {
            newSetup[index].priority = currentSetup.priority;
            newSetup[placingSpecial.dir].priority = placingSpecial.dir;
        }
        render(newSetup);
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
        let index = +event.target.id.substr(6);

        if(placingSpecial.type != undefined) {
            if(event.type == "contextmenu") {
                stopPlacing();
                return;
            }
            // The clicked index is not necessarily the index of the object we're placing,
            // so we use placingSpecial.dir instead of index.
            if(placingSpecial.type == "pedestrian" && dirDif(placingSpecial.dir, index) > 1) return;
            else if(placingSpecial.dir == index && placingSpecial.type != "pedestrian") return;
            implementNewSetup();
            
            // Replace the message box on the left with the old message.
            $("#messageLeft").text(prevMessage);        
            placingSpecial.type = undefined;
        }
        else if(event.type == "contextmenu") {
            if(placing.priority != undefined)
                // This is my favorite line in the entire script
                currentSetup[currentSetup[index].priority].priority = undefined;

            for(let obj of Object.entries(placing)) {
                currentSetup[index][obj[0]] = undefined;
                newSetup[index][obj[0]] = undefined;
                // Remove arrow if it's a vehicle
                if(obj[0] == "vehicle") {
                    currentSetup[index].arrow = undefined;
                    newSetup[index].arrow = undefined;
                }
            }
            render(currentSetup);
        }
        else if(placing.pedestrian != undefined) {
            newSetup[index].pedestrian = PedestrianType.RIGHT;
            renderDir(newSetup[index], index);
            placingSpecial.type = "pedestrian";
            placingSpecial.dir = index;
            
            leftMessage("Select the side the pedestrian is coming from");
        }
        else if(placing.vehicle != undefined) {
            placingSpecial.type = "arrow";
            placingSpecial.dir = index;
            
            leftMessage("Place the vehicle's destination");
        }
        else if(placing.priority != undefined) {
            placingSpecial.type = "priority";
            placingSpecial.dir = index;
            $("#priority").addClass("hide");
            // This option also edits roads that are not the clicked road,
            // so the whole setup needs to be copied.

            currentToNewSetup();
            for(i in newSetup) newSetup[i].priority = undefined;
            newSetup[index].priority = index;
            render(newSetup);
            
            leftMessage("Select the end of the priority road");
        }
        else {
            implementNewSetup();
        }
    }
}

function leftMessage(messageText) {
    prevMessage = $("#messageLeft").text();
    $("#messageLeft").text(messageText);
    $("#messageLeft").addClass("flashgreen");
    setTimeout(function() {$("#messageLeft").removeClass("flashgreen")}, 1000);
}

function stopPlacing() {
    placing = undefined;
    placingSpecial.type = undefined;
    menuTarget.classList.remove("selected");
    render(currentSetup);
    $("#messageLeft").addClass("hide");
    $("#messageRight").addClass("hide");
}

function changeLines(dir0, dir1) {
    let pLines = $("#priority");
    if(dir1 == undefined) {
        $("#straightlines").removeClass("hide");
        pLines.addClass("hide");
        return;
    }
    let dif = dirDif(dir0, dir1);

    $("#straightlines").addClass("hide");
    pLines.removeClass();
    console.log(dir0, dir1);
    switch(dif) {
        case 1:
            pLines.addClass("deflect dir" + dir1);
            break;
        case 2:
            pLines.addClass("straight dir" + dir1);
            break;
        case 3:
            pLines.addClass("deflect dir" + dir0);
    }
}