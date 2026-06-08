// 1. Import data from game.js
import { getNewGame } from "./game.js";

// 2. Initialize game state
let currentState = getNewGame();

const terrainLabels = {
    start: "Safe",
    normal: "Normal",
    hard: "Strenuous",
    danger: "Danger",
    camp: "Camp",
    safe: "Shelter",
    summit: "Summit"
};

const terrainEffects = {
    normal: {
        stamina: -1,
        hunger: -1,
        warmth: 0,
        message: "🥾 The trail is decent, but the long trek still drains your condition."
    },
    hard: {
        stamina: -5,
        hunger: -2,
        warmth: -1,
        message: "🪨 The difficult terrain makes your steps heavy, costing extra stamina."
    },
    danger: {
        stamina: -3,
        hunger: -1,
        warmth: -7,
        message: "❄️ Severe weather suddenly hits, rapidly draining your body heat!"
    },
    camp: {
        stamina: 12,
        hunger: 6,
        warmth: 12,
        message: "⛺ You arrive at camp, hydrate, sort your gear, and recover some condition."
    },
    safe: {
        stamina: 5,
        hunger: 3,
        warmth: 5,
        message: "💧 This is a good spot for a brief rest. You recover slightly."
    }
};

const surpriseEvents = [
    { message: "⚠️ Event: Your boot slips; you barely stabilize with your trekking pole.", stamina: -4, hunger: 0, warmth: -1 },
    { message: "⚠️ Event: Your backpack strap loosens. Fixing it wastes precious energy.", stamina: -4, hunger: -1, warmth: 0 },
    { message: "⚠️ Event: Freezing wind pierces your collar, dropping your warmth significantly.", stamina: 0, hunger: 0, warmth: -5 },
    { message: "⚠️ Event: A detour to avoid dangerous terrain consumes extra supplies.", stamina: -2, hunger: -4, warmth: -1 },
    { message: "⚠️ Event: The snow glare is blinding, forcing you to slow your pace.", stamina: -3, hunger: -2, warmth: 0 },
    { message: "⚠️ Event: Whiteout conditions briefly obscure the trail; checking directions costs time.", stamina: -2, hunger: -2, warmth: -2 }
];

function getPoint(cell) {
    return {
        x: cell.x,
        y: cell.y
    };
}

function clampStat(value) {
    return Math.max(0, Math.min(100, value));
}

function changeStat(statName, amount) {
    currentState.player[statName] = clampStat(currentState.player[statName] + amount);
}

function isIcyCell(cell) {
    // Checking for English keywords like Ice, Snow, Cold, Frozen
    const nameStr = cell.name.toLowerCase();
    return nameStr.includes("ice") || nameStr.includes("icy") || nameStr.includes("snow") || nameStr.includes("frozen");
}

function applyTerrainEffect(cell) {
    const effect = terrainEffects[cell.type];

    if (effect) {
        let staminaChange = effect.stamina;
        let warmthChange = effect.warmth;

        if (isIcyCell(cell)) {
            warmthChange -= 5;
            logEvent("🧊 The freezing terrain drains your body heat even faster.");
        }

        if (currentState.player.gear.crampons && isIcyCell(cell)) {
            staminaChange += 5;
            logEvent("🥾 Your crampons grip the ice, saving you some stamina.");
        }

        changeStat("stamina", staminaChange);
        changeStat("hunger", effect.hunger);
        changeStat("warmth", warmthChange);
        logEvent(effect.message);
    }
}

/**
 * Render status panel (dynamically update the three stat bars)
 */
function renderStats() {
    const stats = ["stamina", "hunger", "warmth"];

    stats.forEach(function (statName) {
        const value = currentState.player[statName];
        const fill = document.getElementById(statName + "-fill");
        if (fill) {
            fill.style.width = value + "%";
        }
        document.getElementById(statName + "-val").textContent = value + "%";
        document.getElementById(statName + "-card").classList.toggle("is-low", value <= 30);
    });

    const currentCell = currentState.trail[currentState.player.position];
    document.getElementById("route-progress").textContent =
        "Day " + currentCell.day + " · Station " + (currentState.player.position + 1) + " / " + currentState.trail.length;
}

/**
 * Render inventory items as RPG item slots (large emoji icon + small label)
 */
function renderInventory() {
    const inventoryContainer = document.getElementById("inventory-list");
    inventoryContainer.innerHTML = "";

    if (currentState.inventory.length === 0) {
        const emptyText = document.createElement("p");
        emptyText.className = "empty-inventory";
        emptyText.textContent = "Backpack empty. Every step must be calculated.";
        inventoryContainer.appendChild(emptyText);
        return;
    }

    currentState.inventory.forEach(function (item, index) {
        const itemButton = document.createElement("button");
        itemButton.className = "inventory-item";

        // Split "🍫 Energy Bar" → emoji icon (large) + name text (small)
        const parts = item.name.split(" ");
        const emoji = parts[0];
        const label = parts.slice(1).join(" ");

        const emojiEl = document.createElement("span");
        emojiEl.className = "item-emoji";
        emojiEl.textContent = emoji;

        const nameEl = document.createElement("span");
        nameEl.className = "item-name";
        nameEl.textContent = label;

        itemButton.appendChild(emojiEl);
        itemButton.appendChild(nameEl);
        itemButton.onclick = function () {
            useInventoryItem(index);
        };

        inventoryContainer.appendChild(itemButton);
    });
}

/**
 * Render the trail board as connected nodes (board-game style)
 */
function renderBoard() {
    const boardContainer = document.getElementById("trail-board");
    const sceneName = document.getElementById("scene-name");
    const sceneImage = document.getElementById("scene-image");
    const badge = document.getElementById("terrain-badge");
    const currentCell = currentState.trail[currentState.player.position];
    boardContainer.innerHTML = "";

    if (sceneName && currentCell) {
        sceneName.textContent = currentCell.name;
    }

    if (sceneImage && currentCell && currentCell.image) {
        sceneImage.style.opacity = "0";
        sceneImage.style.backgroundImage = "url('" + currentCell.image + "')";
        requestAnimationFrame(function () {
            sceneImage.style.opacity = "1";
        });
    }

    if (badge && currentCell) {
        badge.textContent = (terrainLabels[currentCell.type] || "Route").toUpperCase();
        badge.className = "terrain-badge " + currentCell.type;
    }

    currentState.trail.forEach(function (cell, index) {
        // Connector line before each node (except the first)
        if (index > 0) {
            const connector = document.createElement("div");
            connector.className = "trail-connector" + (currentState.player.position >= cell.id ? " visited" : "");
            boardContainer.appendChild(connector);
        }

        const node = document.createElement("div");
        node.title = cell.name;

        if (currentState.player.position === cell.id) {
            node.className = "trail-node " + cell.type + " current";
            node.textContent = "🚶";
        } else if (currentState.player.position > cell.id) {
            node.className = "trail-node " + cell.type + " visited";
            node.textContent = "✓";
        } else {
            node.className = "trail-node " + cell.type;
            if (cell.type === "summit") {
                node.textContent = "🚩";
            } else if (cell.type === "camp") {
                node.textContent = "⛺";
            } else if (cell.type === "start") {
                node.textContent = "🏠";
            } else {
                node.textContent = String(cell.id + 1);
            }
        }

        boardContainer.appendChild(node);
    });

    // Scroll the board to keep the current node visible
    const currentNode = boardContainer.querySelector(".trail-node.current");
    if (currentNode) {
        requestAnimationFrame(function () {
            currentNode.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        });
    }
}

function useInventoryItem(index) {
    if (currentState.status !== "playing") {
        return;
    }

    const item = currentState.inventory[index];

    if (item.type === "camp") {
        logEvent("⛺ Tents must be used during 'Camp & Rest'. Keep it in your pack for now.");
        return;
    }

    if (item.type === "gear") {
        currentState.player.gear[item.gear] = true;
        currentState.inventory.splice(index, 1);
        logEvent("🥾 You equipped [" + item.name + "]. Stamina drain on icy terrain will be reduced.");
        updateUI();
        return;
    }

    changeStat(item.type, item.value);
    currentState.inventory.splice(index, 1);
    logEvent("🎒 You consumed [" + item.name + "], restoring " + item.value + " " + getStatName(item.type) + ".");
    checkGameStatus();
    updateUI();
}

function getStatName(type) {
    if (type === "stamina") {
        return "Stamina";
    }

    if (type === "hunger") {
        return "Hunger";
    }

    return "Warmth";
}

/**
 * Add a new record to the console log
 * @param {string} message - The message to broadcast
 */
function logEvent(message) {
    const logContainer = document.getElementById("event-log");
    const li = document.createElement("li");
    li.textContent = message;
    logContainer.appendChild(li);
    updateLogProgress();
    
    // Auto-scroll the log box to the bottom to see the latest message
    const logScroll = document.querySelector(".log-scroll");
    if (logScroll) {
        requestAnimationFrame(function () {
            logScroll.scrollTop = logScroll.scrollHeight;
        });
    }
}

function updateLogProgress() {
    const logCount = document.getElementById("log-count");
    const progressFill = document.getElementById("log-progress-fill");
    if (!logCount || !progressFill) return;
    
    const logItems = document.querySelectorAll("#event-log li");
    const journeyProgress = (currentState.player.position / (currentState.trail.length - 1)) * 100;

    logCount.textContent = logItems.length + " logs";
    progressFill.style.width = journeyProgress + "%";
}

function resetLog() {
    const logContainer = document.getElementById("event-log");
    logContainer.innerHTML = "<li>A new challenge begins. Good luck.</li>";
    updateLogProgress();
}

function restartGame() {
    currentState = getNewGame();
    document.getElementById("game-message").textContent = "Welcome back to the mountains! Plan your route.";
    document.getElementById("btn-move").disabled = false;
    document.getElementById("btn-camp").disabled = false;
    resetLog();
    updateUI();
}

/**
 * Check if the game is over (win or lose)
 */
function checkGameStatus() {
    // Failure condition: Any stat drops to zero or below
    if (currentState.player.stamina <= 0 || currentState.player.hunger <= 0 || currentState.player.warmth <= 0) {
        currentState.status = "over";
        document.getElementById("game-message").textContent = "💀 The extreme environment has broken you. Expedition failed!";
        document.getElementById("btn-move").disabled = true;
        document.getElementById("btn-camp").disabled = true;
        logEvent("❌ Your body has reached its absolute limit, collapsing in the snowstorm...");
    } 
    // Victory condition: Reached the last node on the map
    else if (currentState.player.position === currentState.trail.length - 1) {
        currentState.status = "won";
        document.getElementById("game-message").textContent = "🎉 Incredible! You have conquered the 5000m vertical wall!";
        document.getElementById("btn-move").disabled = true;
        document.getElementById("btn-camp").disabled = true;
        logEvent("🏆 Victory! You stand atop the frozen summit, overlooking the world!");
    }
}

// Node positions on each day's map image (percentage x/y), bottom = trail start, top = camp
const mapDayPositions = {
    1: [
        { x: 50, y: 87 },  // Base Camp
        { x: 43, y: 73 },  // Fir Tree Trail
        { x: 20, y: 54 },  // Broken Ice Bridge
        { x: 50, y: 40 },  // Misty Fork
        { x: 75, y: 45 },  // Slippery Boardwalk
        { x: 65, y: 18 },  // Camp 1
    ],
    2: [
        { x: 30, y: 85 },  // Scree Traverse
        { x: 60, y: 70 },  // Whiteout Slopes
        { x: 40, y: 55 },  // Icy Bottleneck
        { x: 65, y: 38 },  // Windchill Exposure
        { x: 50, y: 20 },  // Camp 2
    ],
    3: [
        { x: 35, y: 82 },  // Stormy Col
        { x: 55, y: 65 },  // Fixed Rope Section
        { x: 30, y: 48 },  // Frozen Tarn Edge
        { x: 65, y: 32 },  // Heavy Night Snow
        { x: 50, y: 16 },  // Camp 3
    ],
    4: [
        { x: 45, y: 83 },  // High-Altitude Snow Slope
        { x: 65, y: 67 },  // Hypoxia Zone
        { x: 35, y: 52 },  // Rockfall Couloir
        { x: 60, y: 36 },  // Soaked Gloves
        { x: 48, y: 18 },  // Camp 4
    ],
    5: [
        { x: 40, y: 80 },  // Summit Ridge Wind
        { x: 62, y: 62 },  // Knife-edge Ice Ridge
        { x: 38, y: 45 },  // Zero Visibility
        { x: 58, y: 28 },  // The Final Wall
        { x: 50, y: 12 },  // The Summit
    ],
};

/**
 * Update the left map panel: switch map image, regenerate nodes, move hiker
 */
function renderMap() {
    const character = document.getElementById("map-character");
    const mapArea = document.querySelector(".map-area");
    const mapTitle = document.getElementById("map-title");
    if (!character || !mapArea) {
        return;
    }

    const pos = currentState.player.position;
    const currentCell = currentState.trail[pos];
    const currentDay = currentCell.day;

    // Switch background image and title for the current day
    mapArea.style.backgroundImage = "url('images/map-day" + currentDay + ".jpg')";
    if (mapTitle) {
        mapTitle.textContent = "DAY " + currentDay + " MAP";
    }

    // Remove all previous map nodes (keep the character element)
    mapArea.querySelectorAll(".map-node").forEach(function (dot) {
        dot.remove();
    });

    const dayPositions = mapDayPositions[currentDay];
    if (!dayPositions) {
        return;
    }

    // Get the trail cells that belong to the current day
    const dayCells = currentState.trail.filter(function (cell) {
        return cell.day === currentDay;
    });

    // Create a dot for each node of this day
    dayCells.forEach(function (cell, dayIndex) {
        const mapPos = dayPositions[dayIndex];
        if (!mapPos) {
            return;
        }
        const dot = document.createElement("div");
        dot.id = "map-dot-" + cell.id;
        dot.className = "map-node " + cell.type;
        dot.title = cell.name;
        dot.style.left = mapPos.x + "%";
        dot.style.top  = mapPos.y + "%";
        dot.classList.toggle("visited", pos > cell.id);
        dot.classList.toggle("current", pos === cell.id);
        mapArea.insertBefore(dot, character);
    });

    // Move hiker to current node's position on this day's map
    const cellIndexInDay = dayCells.findIndex(function (cell) {
        return cell.id === pos;
    });
    const safeIndex = cellIndexInDay >= 0
        ? Math.min(cellIndexInDay, dayPositions.length - 1)
        : dayPositions.length - 1;

    character.style.left = dayPositions[safeIndex].x + "%";
    character.style.top  = dayPositions[safeIndex].y + "%";
}

/**
 * Switch the hiker image based on the lowest critical stat
 * Priority: cold → weak stamina → hungry → normal
 */
function updateHikerImage() {
    const img = document.getElementById("hiker-img");
    if (!img) return;
    const { stamina, hunger, warmth } = currentState.player;

    let src;
    if (warmth <= 30) {
        src = "images/coldhiker.png";
    } else if (stamina <= 30) {
        src = "images/weakhiker.png";
    } else if (hunger <= 30) {
        src = "images/hungryhiker.png";
    } else {
        src = "images/normalhiker.png";
    }

    if (img.src !== src) {
        img.style.opacity = "0";
        setTimeout(function () {
            img.src = src;
            img.style.opacity = "1";
        }, 150);
    }
}

/**
 * Refresh all UI elements centrally
 */
function updateUI() {
    renderStats();
    renderInventory();
    renderBoard();
    updateLogProgress();
    renderMap();
    updateHikerImage();
}

// ==================== 3. Bind Player Action Events ====================

// Click "Move Forward" button
const btnMove = document.getElementById("btn-move");
if (btnMove) {
    btnMove.onclick = function () {
        if (currentState.status !== "playing") {
            return;
        }

        // Player moves forward one node
        currentState.player.position += 1;

        // Moving forward consumes survival stats
        changeStat("stamina", -5);  // Base stamina cost for long-distance trekking
        changeStat("hunger", -4);   // Every section drains hunger
        changeStat("warmth", -4);   // The further from camp, the colder it gets

        // Get current node info and broadcast
        const currentCell = currentState.trail[currentState.player.position];
        logEvent("🚶‍♂️ Pushing through the biting wind, you reach [" + currentCell.name + "].");

        applyTerrainEffect(currentCell);

        if (currentCell.type !== "camp" && currentCell.type !== "summit") {
            const event = surpriseEvents[currentCell.id % surpriseEvents.length];
            changeStat("stamina", event.stamina);
            changeStat("hunger", event.hunger);
            changeStat("warmth", event.warmth);
            logEvent(event.message);
        }

        // Check status and refresh UI
        checkGameStatus();
        updateUI();
    };
}

// Click "Camp & Rest" button
const btnCamp = document.getElementById("btn-camp");
if (btnCamp) {
    btnCamp.onclick = function () {
        if (currentState.status !== "playing") {
            return;
        }

        // Camping restores stamina and warmth, but makes you hungrier
        changeStat("stamina", 30);
        changeStat("warmth", 20);
        changeStat("hunger", -15); // Hunger drops faster while resting/healing

        logEvent("⛺ You set up camp and rest. The campfire restores your warmth and stamina, but your stomach is completely empty.");

        checkGameStatus();
        updateUI();
    };
}

// Click "Restart" button
const btnRestart = document.getElementById("btn-restart");
if (btnRestart) {
    btnRestart.onclick = function () {
        restartGame();
    };
}

// 4. Initialize the display on first load
updateUI();