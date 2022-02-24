const serverUrl = "https://srls43madnoh.usemoralis.com:2053/server";
const appId = "maesHrsIV3j1eWGZG4FNj6wE33cSnvIjEjy9tbd7";
Moralis.start({ serverUrl, appId });

const skinBtn = document.querySelector('#skin-btn')
const startBtn = document.querySelector('#start')
const modal = document.querySelector('#skinsModal')
const closeBtn = document.querySelector("#closeBtn")
const skinContainer = document.querySelector("#skin-container")

closeBtn.addEventListener('click', closeModal)

window.addEventListener('click', outsideClick) 

function outsideClick(e) {
    if(e.target == modal) {
        closeModal()
    }
}

function closeModal() {
    modal.style.display = "none"
    while (skinContainer.firstChild) {
        skinContainer.firstChild.remove()
    }
}

function selectSkin(e) {

    console.log(e.target)
    closeModal()

}

let wallet
let skins = []
let backdrop
let socket

function shortAddress(addr) {
    const first = addr.slice(0, 4)
    const last = addr.slice(-4)
    return `${first}...${last}`
}

async function getENSorAddress(addr) {
    let result
    try {
        result = await Moralis.Web3API.resolve.resolveAddress( { address: addr } )
    } catch (error) {
        return shortAddress(addr)
    }
    return result.name
}
async function connectWallet() {
    let user = await Moralis.authenticate({ signingMessage: "Welcome to Web3 Agario!" })

    const addr = user.get("ethAddress")
    wallet = addr

    const ensOrAddress = await getENSorAddress(wallet)

    this.textContent = ensOrAddress

    skinBtn.style.display = "block"
    startBtn.style.display = "block"

  }

async function fetchNFTs() {
    

    let data = await Moralis.Web3API.account.getNFTs({ chain: "rinkeby" })

    let nfts = []
    data.result.forEach(function(nft) {
        if (!nft.token_uri) return
        let url = fixURL(nft.token_uri)

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const image = document.createElement("img")
                image.src = fixURL(data.image)
                image.addEventListener('click', selectSkin)
                skinContainer.appendChild(image)
        })
    })

    modal.style.display = "block"
}


function fixURL(url) {
    if(url.startsWith("ipfs")) {
        return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)
    } else {
        return url + "?format=json"
    }
}



let connectButton = document.getElementById('connect-btn')

let img = document.getElementById('nft')




let global = {
    // Keys and other mathematical constants
    KEY_ESC: 27,
    KEY_ENTER: 13,
    KEY_CHAT: 13,
    KEY_FIREFOOD: 119,
    KEY_SPLIT: 32,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    borderDraw: true,
    spin: -Math.PI,
    enemySpin: -Math.PI,
    mobile: false,
    foodSides: 10,
    virusSides: 20,

    // Canvas
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    gameWidth: 0,
    gameHeight: 0,
    xoffset: -0,
    yoffset: -0,
    gameStart: false,
    disconnected: false,
    died: false,
    kicked: false,
    continuity: false,
    startPingTime: 0,
    toggleMassState: 0,
    backgroundColor: '#f2fbff',
    lineColor: '#000000',
};

class Canvas {
    constructor(params) {
        this.directionLock = false;
        this.target = global.target;
        this.reenviar = true;
        this.socket = global.socket;
        this.directions = [];
        var self = this;

        this.cv = document.getElementById('cvs');
        this.cv.width = global.screenWidth;
        this.cv.height = global.screenHeight;
        this.cv.addEventListener('mousemove', this.gameInput, false);
        this.cv.addEventListener('mouseout', this.outOfBounds, false);
        this.cv.addEventListener('keypress', this.keyInput, false);
        this.cv.addEventListener('keyup', function(event) {
            self.reenviar = true;
            self.directionUp(event);
        }, false);
        this.cv.addEventListener('keydown', this.directionDown, false);
        this.cv.addEventListener('touchstart', this.touchInput, false);
        this.cv.addEventListener('touchmove', this.touchInput, false);
        this.cv.parent = self;
        global.canvas = this;
    }

    // Function called when a key is pressed, will change direction if arrow key.
    directionDown(event) {
    	var key = event.which || event.keyCode;
        var self = this.parent; // have to do this so we are not using the cv object
    	if (self.directional(key)) {
    		self.directionLock = true;
    		if (self.newDirection(key, self.directions, true)) {
    			self.updateTarget(self.directions);
    			self.socket.emit('0', self.target);
    		}
    	}
    }

    // Function called when a key is lifted, will change direction if arrow key.
    directionUp(event) {
    	var key = event.which || event.keyCode;
    	if (this.directional(key)) { // this == the actual class
    		if (this.newDirection(key, this.directions, false)) {
    			this.updateTarget(this.directions);
    			if (this.directions.length === 0) this.directionLock = false;
    			this.socket.emit('0', this.target);
    		}
    	}
    }

    // Updates the direction array including information about the new direction.
    newDirection(direction, list, isAddition) {
    	var result = false;
    	var found = false;
    	for (var i = 0, len = list.length; i < len; i++) {
    		if (list[i] == direction) {
    			found = true;
    			if (!isAddition) {
    				result = true;
    				// Removes the direction.
    				list.splice(i, 1);
    			}
    			break;
    		}
    	}
    	// Adds the direction.
    	if (isAddition && found === false) {
    		result = true;
    		list.push(direction);
    	}

    	return result;
    }

    // Updates the target according to the directions in the directions array.
    updateTarget(list) {
    	this.target = { x : 0, y: 0 };
    	var directionHorizontal = 0;
    	var directionVertical = 0;
    	for (var i = 0, len = list.length; i < len; i++) {
    		if (directionHorizontal === 0) {
    			if (list[i] == global.KEY_LEFT) directionHorizontal -= Number.MAX_VALUE;
    			else if (list[i] == global.KEY_RIGHT) directionHorizontal += Number.MAX_VALUE;
    		}
    		if (directionVertical === 0) {
    			if (list[i] == global.KEY_UP) directionVertical -= Number.MAX_VALUE;
    			else if (list[i] == global.KEY_DOWN) directionVertical += Number.MAX_VALUE;
    		}
    	}
    	this.target.x += directionHorizontal;
    	this.target.y += directionVertical;
        global.target = this.target;
    }

    directional(key) {
    	return this.horizontal(key) || this.vertical(key);
    }

    horizontal(key) {
    	return key == global.KEY_LEFT || key == global.KEY_RIGHT;
    }

    vertical(key) {
    	return key == global.KEY_DOWN || key == global.KEY_UP;
    }

    // Register when the mouse goes off the canvas.
    outOfBounds() {
        if (!global.continuity) {
            this.parent.target = { x : 0, y: 0 };
            global.target = this.parent.target;
        }
    }

    gameInput(mouse) {
    	if (!this.directionLock) {
    		this.parent.target.x = mouse.clientX - this.width / 2;
    		this.parent.target.y = mouse.clientY - this.height / 2;
            global.target = this.parent.target;
    	}
    }

    touchInput(touch) {
        touch.preventDefault();
        touch.stopPropagation();
    	if (!this.directionLock) {
    		this.parent.target.x = touch.touches[0].clientX - this.width / 2;
    		this.parent.target.y = touch.touches[0].clientY - this.height / 2;
            global.target = this.parent.target;
    	}
    }

    // Chat command callback functions.
    keyInput(event) {
    	var key = event.which || event.keyCode;
    	if (key === global.KEY_FIREFOOD && this.parent.reenviar) {
            this.parent.socket.emit('1');
            this.parent.reenviar = false;
        }
        else if (key === global.KEY_SPLIT && this.parent.reenviar) {
            document.getElementById('split_cell').play();
            this.parent.socket.emit('2');
            this.parent.reenviar = false;
        }
        else if (key === global.KEY_CHAT) {
            document.getElementById('chatInput').focus();
        }
    }
}

var foodConfig = {
    border: 0,
};

var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

var player = {
    id: -1,
    x: global.screenWidth / 2,
    y: global.screenHeight / 2,
    screenWidth: global.screenWidth,
    screenHeight: global.screenHeight,
    target: {x: global.screenWidth / 2, y: global.screenHeight / 2}
};
global.player = player;

var foods = [];
var viruses = [];
var fireFood = [];
var users = [];
var leaderboard = [];
var target = {x: player.x, y: player.y};
global.target = target;

window.canvas = new Canvas();

let c = window.canvas.cv;
let graph = c.getContext('2d');
let skinCanvas
let skinGraph

function setupSocket(socket) {

    // Handle ping.
    socket.on('pongcheck', function () {
        var latency = Date.now() - global.startPingTime;
        debug('Latency: ' + latency + 'ms');
        window.chat.addSystemLine('Ping: ' + latency + 'ms');
    });

    // Handle error.
    socket.on('connect_failed', function () {
        socket.close();
        global.disconnected = true;
    });

    socket.on('disconnect', function () {
        socket.close();
        global.disconnected = true;
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) {

        skinCanvas = document.getElementById('skin')
        console.log(skinCanvas)
        skinGraph = skinCanvas.getContext("2d")

        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screenWidth;
        player.skin = skinCanvas
        player.screenHeight = global.screenHeight;
        player.target = window.canvas.target;
        global.player = player;
        socket.emit('gotit', player);
        global.gameStart = true;

		c.focus();
    });

    socket.on('gameSetup', function(data) {
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        resize();
    });

    socket.on('leaderboard', function (data) {
        leaderboard = data.leaderboard;
        var status = '<span class="title">Leaderboard</span>';
        for (var i = 0; i < leaderboard.length; i++) {
            status += '<br />';
            if (leaderboard[i].id == player.id){
                if(leaderboard[i].name.length !== 0)
                    status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
                else
                    status += '<span class="me">' + (i + 1) + ". An unnamed cell</span>";
            } else {
                if(leaderboard[i].name.length !== 0)
                    status += (i + 1) + '. ' + leaderboard[i].name;
                else
                    status += (i + 1) + '. An unnamed cell';
            }
        }
        //status += '<br />Players: ' + data.players;
        document.getElementById('status').innerHTML = status;
    });

    // Handle movement.
    socket.on('serverTellPlayerMove', function (userData, foodsList, massList, virusList) {
        var playerData;
        for(var i =0; i< userData.length; i++) {
            if(typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        
        var xoffset = player.x - playerData.x;
        var yoffset = player.y - playerData.y;

        player.x = playerData.x;
        player.y = playerData.y;
        player.hue = playerData.hue;
        player.massTotal = playerData.massTotal;
        player.cells = playerData.cells;
        player.xoffset = isNaN(xoffset) ? 0 : xoffset;
        player.yoffset = isNaN(yoffset) ? 0 : yoffset;
        users = userData;
        foods = foodsList;
        viruses = virusList;
        fireFood = massList;
    });

    // Death.
    socket.on('RIP', function () {
        global.gameStart = false;
        global.died = true;
        window.setTimeout(function() {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            global.died = false;
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle);
                global.animLoopHandle = undefined;
            }
        }, 2500);
    });

    socket.on('kick', function (data) {
        global.gameStart = false;
        reason = data;
        global.kicked = true;
        socket.close();
    });

    socket.on('virusSplit', function (virusCell) {
        socket.emit('2', virusCell);
        reenviar = false;
    });
}

function startGame() {
    global.playerName = connectButton.textContent
    global.playerSkin = skinCanvas
    global.screenWidth = window.innerWidth
    global.screenHeight = window.innerHeight


    console.log('play clicked')
    document.querySelector('#start-menu-wrapper').style.display = 'none'
    document.querySelector('#game-wrapper').style.display = 'block'

    if(!socket) {
        socket = io()
        setupSocket(socket)
    }


    if (!global.animLoopHandle) {
        animloop();
    }
    socket.emit('respawn');
    window.canvas.socket = socket;
    global.socket = socket;
}

function drawCircle(centerX, centerY, radius, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    graph.beginPath();

    for (var i = 0; i < sides; i++) {
        theta = (i / sides) * 2 * Math.PI;
        x = centerX + radius * Math.sin(theta);
        y = centerY + radius * Math.cos(theta);
        graph.lineTo(x, y);
    }

    graph.closePath();
    graph.stroke();
    graph.fill();
}

function drawFood(food) {
    graph.strokeStyle = 'hsl(' + food.hue + ', 100%, 45%)';
    graph.fillStyle = 'hsl(' + food.hue + ', 100%, 50%)';
    graph.lineWidth = foodConfig.border;
    drawCircle(food.x - player.x + global.screenWidth / 2,
               food.y - player.y + global.screenHeight / 2,
               food.radius, global.foodSides);
}

function drawVirus(virus) {
    graph.strokeStyle = virus.stroke;
    graph.fillStyle = virus.fill;
    graph.lineWidth = virus.strokeWidth;
    drawCircle(virus.x - player.x + global.screenWidth / 2,
               virus.y - player.y + global.screenHeight / 2,
               virus.radius, global.virusSides);
}

function drawFireFood(mass) {
    graph.strokeStyle = 'hsl(' + mass.hue + ', 100%, 45%)';
    graph.fillStyle = 'hsl(' + mass.hue + ', 100%, 50%)';
    graph.lineWidth = playerConfig.border+10;
    drawCircle(mass.x - player.x + global.screenWidth / 2,
               mass.y - player.y + global.screenHeight / 2,
               mass.radius-5, 18 + (~~(mass.masa/5)));
}

function resizeSkin(radius) {
    img.style.width = radius + 'px'
    img.style.height = radius + 'px'
}

function drawPlayers(order) {
    var start = {
        x: player.x - (global.screenWidth / 2),
        y: player.y - (global.screenHeight / 2)
    };

    for(var z=0; z<order.length; z++)
    {
        var userCurrent = users[order[z].nCell];
        var cellCurrent = users[order[z].nCell].cells[order[z].nDiv];

        var x=0;
        var y=0;

        var points = 30 + ~~(cellCurrent.mass/5);
        var increase = Math.PI * 2 / points;

        

        skinCanvas.width = cellCurrent.radius
        skinCanvas.height = cellCurrent.radius

        skinGraph.drawImage(img, cellCurrent.x, cellCurrent.y, img.height,img.width)


        graph.strokeStyle = 'hsl(' + userCurrent.hue + ', 100%, 45%)';
        graph.fillStyle = graph.createPattern(skinCanvas, 'repeat')
        // graph.fillStyle = 'hsl(' + userCurrent.hue + ', 100%, 50%)';
        graph.lineWidth = playerConfig.border;


        // graph.strokeStyle = 'hsl(' + userCurrent.hue + ', 100%, 45%)';
        // console.log(cellCurrent.radius)
        // skinCanvas.width = cellCurrent.radius
        // skinCanvas.height = cellCurrent.radius
        // skinGraph.drawImage(img, 0, 0, cellCurrent.radius, cellCurrent.width)
        // // console.log(skinGraph)
        // // console.log(userCurrent.hue)

        // let drawnImg = graph.drawImage(img, 0, 0, cellCurrent.radius, cellCurrent.radius)
        // console.log('drawn', drawnImg)

        // // skin = graph.drawImage(img, 0, 0, cellCurrent.radius, cellCurrent.radius)
        // graph.fillStyle = graph.createPattern(drawnImg, 'no-repeat')
        // // graph.fillStyle = 'hsl(' + userCurrent.hue + ', 100%, 50%)';
        // // graph.lineWidth = playerConfig.border;

        var xstore = [];
        var ystore = [];

        global.spin += 0.0;

        var circle = {
            x: cellCurrent.x - start.x,
            y: cellCurrent.y - start.y
        };

        for (var i = 0; i < points; i++) {

            x = cellCurrent.radius * Math.cos(global.spin) + circle.x;
            y = cellCurrent.radius * Math.sin(global.spin) + circle.y;
            if(typeof(userCurrent.id) == "undefined") {
                x = valueInRange(-userCurrent.x + global.screenWidth / 2,
                                 global.gameWidth - userCurrent.x + global.screenWidth / 2, x);
                y = valueInRange(-userCurrent.y + global.screenHeight / 2,
                                 global.gameHeight - userCurrent.y + global.screenHeight / 2, y);
            } else {
                x = valueInRange(-cellCurrent.x - player.x + global.screenWidth / 2 + (cellCurrent.radius/3),
                                 global.gameWidth - cellCurrent.x + global.gameWidth - player.x + global.screenWidth / 2 - (cellCurrent.radius/3), x);
                y = valueInRange(-cellCurrent.y - player.y + global.screenHeight / 2 + (cellCurrent.radius/3),
                                 global.gameHeight - cellCurrent.y + global.gameHeight - player.y + global.screenHeight / 2 - (cellCurrent.radius/3) , y);
            }
            global.spin += increase;
            xstore[i] = x;
            ystore[i] = y;
        }
        /*if (wiggle >= player.radius/ 3) inc = -1;
        *if (wiggle <= player.radius / -3) inc = +1;
        *wiggle += inc;
        */
        for (i = 0; i < points; ++i) {
            if (i === 0) {
                graph.beginPath();
                graph.moveTo(xstore[i], ystore[i]);
            } else if (i > 0 && i < points - 1) {
                graph.lineTo(xstore[i], ystore[i]);
            } else {
                graph.lineTo(xstore[i], ystore[i]);
                graph.lineTo(xstore[0], ystore[0]);
            }

        }
        graph.lineJoin = 'round';
        graph.lineCap = 'round';
        graph.fill();
        // graph.stroke();
        var nameCell = "";
        if(typeof(userCurrent.id) == "undefined")
            nameCell = player.name;
        else
            nameCell = userCurrent.name;

        var fontSize = Math.max(cellCurrent.radius / 3, 12);
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = playerConfig.textColor;
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + fontSize + 'px sans-serif';

        if (global.toggleMassState === 0) {
            graph.strokeText(nameCell, circle.x, circle.y);
            graph.fillText(nameCell, circle.x, circle.y);
        } else {
            graph.strokeText(nameCell, circle.x, circle.y);
            graph.fillText(nameCell, circle.x, circle.y);
            graph.font = 'bold ' + Math.max(fontSize / 3 * 2, 10) + 'px sans-serif';
            if(nameCell.length === 0) fontSize = 0;
            graph.strokeText(Math.round(cellCurrent.mass), circle.x, circle.y+fontSize);
            graph.fillText(Math.round(cellCurrent.mass), circle.x, circle.y+fontSize);
        }
    }
}

function valueInRange(min, max, value) {
    return Math.min(max, Math.max(min, value));
}

function drawgrid() {
     graph.lineWidth = 1;
     graph.strokeStyle = global.lineColor;
     graph.globalAlpha = 0.15;
     graph.beginPath();

    for (var x = global.xoffset - player.x; x < global.screenWidth; x += global.screenHeight / 18) {
        graph.moveTo(x, 0);
        graph.lineTo(x, global.screenHeight);
    }

    for (var y = global.yoffset - player.y ; y < global.screenHeight; y += global.screenHeight / 18) {
        graph.moveTo(0, y);
        graph.lineTo(global.screenWidth, y);
    }

    graph.stroke();
    graph.globalAlpha = 1;
}

function drawborder() {
    graph.lineWidth = 1;
    graph.strokeStyle = playerConfig.borderColor;

    // Left-vertical.
    if (player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.screenWidth/2 - player.x, 0 ? player.y > global.screenHeight/2 : global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x, global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Top-horizontal.
    if (player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(0 ? player.x > global.screenWidth/2 : global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }
}

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.msRequestAnimationFrame     ||
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

window.cancelAnimFrame = (function(handle) {
    return  window.cancelAnimationFrame     ||
            window.mozCancelAnimationFrame;
})();

function animloop() {
    global.animLoopHandle = window.requestAnimFrame(animloop);
    gameLoop();
}

function gameLoop() {
    if (global.died) {
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';
        graph.fillText('You died!', global.screenWidth / 2, global.screenHeight / 2);
    }
    else if (!global.disconnected) {
        if (global.gameStart) {
            graph.fillStyle = global.backgroundColor;
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            drawgrid();
            foods.forEach(drawFood);
            fireFood.forEach(drawFireFood);
            viruses.forEach(drawVirus);

            if (global.borderDraw) {
                drawborder();
            }
            var orderMass = [];
            for(var i=0; i<users.length; i++) {
                for(var j=0; j<users[i].cells.length; j++) {
                    orderMass.push({
                        nCell: i,
                        nDiv: j,
                        mass: users[i].cells[j].mass
                    });
                }
            }
            orderMass.sort(function(obj1, obj2) {
                return obj1.mass - obj2.mass;
            });

            drawPlayers(orderMass);
            socket.emit('0', window.canvas.target); // playerSendTarget "Heartbeat".

        } else {
            graph.fillStyle = '#333333';
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            graph.textAlign = 'center';
            graph.fillStyle = '#FFFFFF';
            graph.font = 'bold 30px sans-serif';
            graph.fillText('Game Over!', global.screenWidth / 2, global.screenHeight / 2);
        }
    } else {
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';
        if (global.kicked) {
            if (reason !== '') {
                graph.fillText('You were kicked for:', global.screenWidth / 2, global.screenHeight / 2 - 20);
                graph.fillText(reason, global.screenWidth / 2, global.screenHeight / 2 + 20);
            }
            else {
                graph.fillText('You were kicked!', global.screenWidth / 2, global.screenHeight / 2);
            }
        }
        else {
              graph.fillText('Disconnected!', global.screenWidth / 2, global.screenHeight / 2);
        }
    }
}


window.addEventListener('resize', resize);

function resize() {
    if (!socket) return;

    player.screenWidth = c.width = global.screenWidth =  window.innerWidth;
    player.screenHeight = c.height = global.screenHeight = window.innerHeight;

    if (global.playerType == 'spectate') {
        player.x = global.gameWidth / 2;
        player.y = global.gameHeight / 2;
    }

    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}

document.querySelector("#start").addEventListener('click', startGame)

connectButton.addEventListener('click', connectWallet)

document.querySelector('#skin-btn').addEventListener('click', fetchNFTs)




