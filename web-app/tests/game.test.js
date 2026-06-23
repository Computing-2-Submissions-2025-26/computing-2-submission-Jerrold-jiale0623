import { strict as assert } from "assert";
import {
    getNewGame,
    initialState,
    clampStat,
    isIcyCell,
    formatCostLine,
    checkStatus,
    isAtCamp,
    hasRestedHere,
    getCurrentCell,
    getNextCell,
    moveForward,
    campAndRest,
    useItem
} from "../game.js";

// ── getNewGame() structure ────────────────────────────────────────────────────

describe("getNewGame()", function () {

    it("returns an object with player, inventory, trail, and status fields", function () {
        const game = getNewGame();
        assert.ok(game.player,    "missing player");
        assert.ok(game.inventory, "missing inventory");
        assert.ok(game.trail,     "missing trail");
        assert.ok(game.status,    "missing status");
    });

    it("starts with status 'playing'", function () {
        const game = getNewGame();
        assert.equal(game.status, "playing");
    });

    it("returns a deep copy — mutating one game does not affect another", function () {
        const g1 = getNewGame();
        const g2 = getNewGame();
        g1.player.stamina = 0;
        assert.equal(g2.player.stamina, 100, "mutation in g1 leaked into g2");
    });

    it("returns a deep copy — mutating does not affect initialState", function () {
        const game = getNewGame();
        game.player.position = 99;
        assert.equal(initialState.player.position, 0, "mutation leaked into initialState");
    });
});

// ── Player initial state ──────────────────────────────────────────────────────

describe("initial player stats", function () {

    it("starts at position 0", function () {
        assert.equal(getNewGame().player.position, 0);
    });

    it("starts with stamina 100", function () {
        assert.equal(getNewGame().player.stamina, 100);
    });

    it("starts with hunger 100", function () {
        assert.equal(getNewGame().player.hunger, 100);
    });

    it("starts with warmth 100", function () {
        assert.equal(getNewGame().player.warmth, 100);
    });

    it("starts without crampons equipped", function () {
        assert.equal(getNewGame().player.gear.crampons, false);
    });
});

// ── Inventory ─────────────────────────────────────────────────────────────────

describe("initial inventory", function () {

    it("is non-empty", function () {
        assert.ok(getNewGame().inventory.length > 0);
    });

    it("every item has id, name, and type", function () {
        getNewGame().inventory.forEach(function (item) {
            assert.ok(item.id,   "item missing id: " + JSON.stringify(item));
            assert.ok(item.name, "item missing name: " + JSON.stringify(item));
            assert.ok(item.type, "item missing type: " + JSON.stringify(item));
        });
    });

    it("contains at least one stamina item", function () {
        const has = getNewGame().inventory.some(i => i.type === "stamina");
        assert.ok(has, "no stamina items in inventory");
    });

    it("contains at least one hunger item", function () {
        const has = getNewGame().inventory.some(i => i.type === "hunger");
        assert.ok(has, "no hunger items in inventory");
    });

    it("contains at least one warmth item", function () {
        const has = getNewGame().inventory.some(i => i.type === "warmth");
        assert.ok(has, "no warmth items in inventory");
    });

    it("contains crampons gear item", function () {
        const has = getNewGame().inventory.some(i => i.type === "gear" && i.gear === "crampons");
        assert.ok(has, "crampons not found in inventory");
    });
});

// ── Trail structure ───────────────────────────────────────────────────────────

describe("trail", function () {

    it("has at least 20 nodes", function () {
        assert.ok(getNewGame().trail.length >= 20);
    });

    it("first node is type 'start'", function () {
        assert.equal(getNewGame().trail[0].type, "start");
    });

    it("last node is type 'summit'", function () {
        const trail = getNewGame().trail;
        assert.equal(trail[trail.length - 1].type, "summit");
    });

    it("every node has id, day, name, type, and image", function () {
        getNewGame().trail.forEach(function (node) {
            assert.ok(node.id   !== undefined, "node missing id");
            assert.ok(node.day  !== undefined, "node missing day");
            assert.ok(node.name,               "node missing name");
            assert.ok(node.type,               "node missing type");
            assert.ok(node.image,              "node missing image");
        });
    });

    it("node ids are sequential starting from 0", function () {
        getNewGame().trail.forEach(function (node, index) {
            assert.equal(node.id, index, "node id out of sequence at index " + index);
        });
    });

    it("spans exactly 5 days", function () {
        const days = new Set(getNewGame().trail.map(n => n.day));
        assert.equal(days.size, 5);
    });

    it("days 1–4 each end with a camp node", function () {
        const trail = getNewGame().trail;
        for (let day = 1; day <= 4; day++) {
            const hascamp = trail.some(n => n.day === day && n.type === "camp");
            assert.ok(hascamp, "day " + day + " has no camp node");
        }
    });

    it("day 5 ends with the summit, not a camp", function () {
        const trail = getNewGame().trail;
        const day5 = trail.filter(n => n.day === 5);
        const last = day5[day5.length - 1];
        assert.equal(last.type, "summit");
    });

    it("node types are all valid values", function () {
        const valid = new Set(["start", "normal", "hard", "danger", "camp", "safe", "summit"]);
        getNewGame().trail.forEach(function (node) {
            assert.ok(valid.has(node.type), "unknown type '" + node.type + "' on node " + node.id);
        });
    });

    it("only the last node is type 'summit'", function () {
        const trail = getNewGame().trail;
        const summits = trail.filter(n => n.type === "summit");
        assert.equal(summits.length, 1);
        assert.equal(summits[0].id, trail.length - 1);
    });

    it("only the first node is type 'start'", function () {
        const starts = getNewGame().trail.filter(n => n.type === "start");
        assert.equal(starts.length, 1);
        assert.equal(starts[0].id, 0);
    });
});

// ── clampStat ─────────────────────────────────────────────────────────────────

describe("clampStat(value)", function () {

    it("returns 0 for a negative value", function () {
        assert.equal(clampStat(-10), 0);
    });

    it("returns 0 for exactly 0", function () {
        assert.equal(clampStat(0), 0);
    });

    it("returns 100 for a value above 100", function () {
        assert.equal(clampStat(150), 100);
    });

    it("returns 100 for exactly 100", function () {
        assert.equal(clampStat(100), 100);
    });

    it("returns the value unchanged when within [0, 100]", function () {
        assert.equal(clampStat(42), 42);
        assert.equal(clampStat(1),  1);
        assert.equal(clampStat(99), 99);
    });
});

// ── isIcyCell ─────────────────────────────────────────────────────────────────

describe("isIcyCell(cell)", function () {

    it("returns true when name contains 'ice'", function () {
        assert.equal(isIcyCell({ name: "Broken Ice Bridge", type: "danger" }), true);
    });

    it("returns true when name contains 'icy'", function () {
        assert.equal(isIcyCell({ name: "Icy Bottleneck", type: "hard" }), true);
    });

    it("returns true when name contains 'snow'", function () {
        assert.equal(isIcyCell({ name: "Heavy Night Snow", type: "danger" }), true);
    });

    it("returns true when name contains 'frozen'", function () {
        assert.equal(isIcyCell({ name: "Frozen Tarn Edge", type: "hard" }), true);
    });

    it("is case-insensitive", function () {
        assert.equal(isIcyCell({ name: "ICE FALL", type: "hard" }), true);
    });

    it("returns false for a normal, non-icy location", function () {
        assert.equal(isIcyCell({ name: "Fir Tree Trail", type: "normal" }), false);
    });

    it("returns false for a camp node", function () {
        assert.equal(isIcyCell({ name: "Camp 2", type: "camp" }), false);
    });
});

// ── formatCostLine ────────────────────────────────────────────────────────────

describe("formatCostLine(s, h, w)", function () {

    it("formats negative deltas with a minus sign", function () {
        const result = formatCostLine(-7, -4, -4);
        assert.ok(result.includes("−7"), "should show −7 Stam");
        assert.ok(result.includes("−4 Food"), "should show −4 Food");
        assert.ok(result.includes("−4 Warm"), "should show −4 Warm");
    });

    it("formats positive deltas with a plus sign", function () {
        const result = formatCostLine(30, 0, 20);
        assert.ok(result.includes("+30 Stam"), "should show +30 Stam");
        assert.ok(result.includes("+20 Warm"), "should show +20 Warm");
    });

    it("omits components whose delta is 0", function () {
        const result = formatCostLine(-5, 0, 0);
        assert.ok(!result.includes("Food"), "hunger (0) should be omitted");
        assert.ok(!result.includes("Warm"), "warmth (0) should be omitted");
    });

    it("returns an empty string when all deltas are 0", function () {
        assert.equal(formatCostLine(0, 0, 0), "");
    });
});

// ── checkStatus ───────────────────────────────────────────────────────────────

describe("checkStatus(state)", function () {

    it("returns 'playing' when all stats are above 0 and not at summit", function () {
        const state = getNewGame();
        assert.equal(checkStatus(state), "playing");
    });

    it("returns 'over' when stamina reaches 0", function () {
        const state = getNewGame();
        state.player.stamina = 0;
        assert.equal(checkStatus(state), "over");
    });

    it("returns 'over' when hunger reaches 0", function () {
        const state = getNewGame();
        state.player.hunger = 0;
        assert.equal(checkStatus(state), "over");
    });

    it("returns 'over' when warmth reaches 0", function () {
        const state = getNewGame();
        state.player.warmth = 0;
        assert.equal(checkStatus(state), "over");
    });

    it("returns 'won' when position is the last trail node", function () {
        const state = getNewGame();
        state.player.position = state.trail.length - 1;
        assert.equal(checkStatus(state), "won");
    });

    it("returns 'over' even if position is the last node but a stat is 0", function () {
        const state = getNewGame();
        state.player.position = state.trail.length - 1;
        state.player.stamina  = 0;
        // 'over' takes precedence over 'won'
        assert.equal(checkStatus(state), "over");
    });
});

// ── getCurrentCell / getNextCell ──────────────────────────────────────────────

describe("getCurrentCell(state)", function () {

    it("returns the trail node matching the player's position", function () {
        const state = getNewGame();
        const cell  = getCurrentCell(state);
        assert.equal(cell.id, state.player.position);
    });

    it("returns the correct node after moving position", function () {
        const state = getNewGame();
        state.player.position = 3;
        const cell = getCurrentCell(state);
        assert.equal(cell.id, 3);
    });
});

describe("getNextCell(state)", function () {

    it("returns the node one step ahead of the player", function () {
        const state = getNewGame();
        const next  = getNextCell(state);
        assert.equal(next.id, 1);
    });

    it("returns null when the player is at the last node", function () {
        const state = getNewGame();
        state.player.position = state.trail.length - 1;
        assert.equal(getNextCell(state), null);
    });
});

// ── isAtCamp ──────────────────────────────────────────────────────────────────

describe("isAtCamp(state)", function () {

    it("returns false at the starting position (type 'start')", function () {
        assert.equal(isAtCamp(getNewGame()), false);
    });

    it("returns true when the player is on a camp node", function () {
        const state = getNewGame();
        const campNode = state.trail.find(n => n.type === "camp");
        state.player.position = campNode.id;
        assert.equal(isAtCamp(state), true);
    });

    it("returns false on a normal terrain node", function () {
        const state = getNewGame();
        const normalNode = state.trail.find(n => n.type === "normal");
        state.player.position = normalNode.id;
        assert.equal(isAtCamp(state), false);
    });
});

// ── moveForward ───────────────────────────────────────────────────────────────

describe("moveForward(state)", function () {

    it("advances position by exactly 1", function () {
        const state  = getNewGame();
        const result = moveForward(state);
        assert.equal(result.state.player.position, 1);
    });

    it("returns an events array with at least one message", function () {
        const result = moveForward(getNewGame());
        assert.ok(Array.isArray(result.events));
        assert.ok(result.events.length > 0);
    });

    it("does not mutate the input state (pure function guarantee)", function () {
        const state       = getNewGame();
        const origStam    = state.player.stamina;
        const origPos     = state.player.position;
        moveForward(state);
        assert.equal(state.player.stamina,  origStam, "input state stamina was mutated");
        assert.equal(state.player.position, origPos,  "input state position was mutated");
    });

    it("applies the base movement cost of −7 stamina before terrain effects", function () {
        // Move to node 1 (normal terrain, non-icy).
        // Additional terrain drain: stamina −1 (normal) + surprise event (id 1 → index 1: −4).
        // Total stamina drain = 7 + 1 + 4 = 12.  100 − 12 = 88.
        const result = moveForward(getNewGame());
        assert.equal(result.state.player.stamina, 88);
    });

    it("applies the base movement cost of −4 hunger before terrain effects", function () {
        // Normal terrain: hunger −1; surprise event (index 1): hunger −1.
        // Total hunger drain = 4 + 1 + 1 = 6.  100 − 6 = 94.
        const result = moveForward(getNewGame());
        assert.equal(result.state.player.hunger, 94);
    });

    it("applies the base movement cost of −4 warmth before terrain effects", function () {
        // Normal terrain: warmth 0; surprise event (index 1): warmth 0.
        // Total warmth drain = 4 + 0 + 0 = 4.  100 − 4 = 96.
        const result = moveForward(getNewGame());
        assert.equal(result.state.player.warmth, 96);
    });

    it("clamps stamina to 0 and sets status 'over' when drain exceeds remaining stamina", function () {
        // Node 1: total stamina drain = 12 (base 7 + terrain 1 + event 4).
        // Set stamina to exactly 12 so it reaches 0.
        const state = getNewGame();
        state.player.stamina = 12;
        const result = moveForward(state);
        assert.equal(result.state.player.stamina, 0);
        assert.equal(result.state.status, "over");
    });

    it("sets status 'over' when hunger is drained to 0", function () {
        // Node 1: total hunger drain = 6 (base 4 + terrain 1 + event 1).
        const state = getNewGame();
        state.player.hunger  = 6;
        const result = moveForward(state);
        assert.equal(result.state.player.hunger, 0);
        assert.equal(result.state.status, "over");
    });

    it("sets status 'over' when warmth is drained to 0", function () {
        // Node 1 (normal): warmth drain = 4 (base only — normal terrain and event 1 are 0).
        const state = getNewGame();
        state.player.warmth  = 4;
        const result = moveForward(state);
        assert.equal(result.state.player.warmth, 0);
        assert.equal(result.state.status, "over");
    });

    it("sets status 'won' when the player reaches the summit alive", function () {
        const state = getNewGame();
        // Place player one step before the summit
        state.player.position = state.trail.length - 2;
        const result = moveForward(state);
        assert.equal(result.state.player.position, state.trail.length - 1);
        assert.equal(result.state.status, "won");
    });

    it("is a no-op when status is already 'over'", function () {
        const state = getNewGame();
        state.status = "over";
        const result = moveForward(state);
        assert.equal(result.state.player.position, 0);
        assert.equal(result.events.length, 0);
    });

    it("is a no-op when status is already 'won'", function () {
        const state = getNewGame();
        state.player.position = state.trail.length - 1;
        state.status = "won";
        const result = moveForward(state);
        // Position stays at last node, no events
        assert.equal(result.state.player.position, state.trail.length - 1);
        assert.equal(result.events.length, 0);
    });

    it("applies extra warmth drain for icy terrain nodes", function () {
        // Find the first icy, non-camp, non-summit node in the trail.
        const game    = getNewGame();
        const icyNode = game.trail.find(n =>
            n.name.toLowerCase().includes("ice") ||
            n.name.toLowerCase().includes("icy") ||
            n.name.toLowerCase().includes("snow") ||
            n.name.toLowerCase().includes("frozen")
        );
        assert.ok(icyNode, "trail has no icy node to test with");

        // Place the player one step before the icy node.
        const state = getNewGame();
        state.player.position = icyNode.id - 1;

        const withoutIcy  = moveForward(getNewGame());    // moving to non-icy node 1
        const withIcy     = moveForward(state);           // moving to icy node

        // Warmth drain on an icy node must be strictly greater than for a normal move.
        const warmthDropNormal = 100 - withoutIcy.state.player.warmth;
        const warmthDropIcy    = 100 - withIcy.state.player.warmth;
        assert.ok(
            warmthDropIcy > warmthDropNormal,
            "icy terrain should drain more warmth than normal terrain"
        );
    });

    it("crampons reduce stamina drain on icy terrain", function () {
        const game    = getNewGame();
        const icyNode = game.trail.find(n =>
            n.name.toLowerCase().includes("ice") ||
            n.name.toLowerCase().includes("icy") ||
            n.name.toLowerCase().includes("snow") ||
            n.name.toLowerCase().includes("frozen")
        );
        assert.ok(icyNode, "trail has no icy node to test with");

        // Without crampons
        const stateNoCrampons = getNewGame();
        stateNoCrampons.player.position = icyNode.id - 1;
        const resultNo = moveForward(stateNoCrampons);

        // With crampons equipped
        const stateCrampons = getNewGame();
        stateCrampons.player.position        = icyNode.id - 1;
        stateCrampons.player.gear.crampons   = true;
        const resultWith = moveForward(stateCrampons);

        assert.ok(
            resultWith.state.player.stamina > resultNo.state.player.stamina,
            "crampons should save stamina on icy terrain"
        );
    });

    it("does not apply a surprise event on camp nodes", function () {
        const game     = getNewGame();
        const campNode = game.trail.find(n => n.type === "camp");
        const state    = getNewGame();
        state.player.position = campNode.id - 1;
        const result = moveForward(state);
        const hasEvent = result.events.some(e => e.startsWith("⚠️ Event:"));
        assert.equal(hasEvent, false, "camp node should not trigger a surprise event");
    });

    it("does not deduct any stats when arriving at a camp node", function () {
        // Camp is a safe haven: stamina, hunger, and warmth must not decrease on arrival.
        const game     = getNewGame();
        const campNode = game.trail.find(n => n.type === "camp");
        const state    = getNewGame();
        state.player.position = campNode.id - 1;
        const result = moveForward(state);
        assert.ok(result.state.player.stamina >= state.player.stamina, "stamina should not drop on camp arrival");
        assert.ok(result.state.player.hunger  >= state.player.hunger,  "hunger should not drop on camp arrival");
        assert.ok(result.state.player.warmth  >= state.player.warmth,  "warmth should not drop on camp arrival");
    });

    it("does not apply a surprise event on the summit", function () {
        const state = getNewGame();
        state.player.position = state.trail.length - 2;
        const result = moveForward(state);
        const hasEvent = result.events.some(e => e.startsWith("⚠️ Event:"));
        assert.equal(hasEvent, false, "summit should not trigger a surprise event");
    });
});

// ── campAndRest ───────────────────────────────────────────────────────────────

describe("campAndRest(state)", function () {

    // Helper: return a state with the player standing on the first camp node.
    function atCamp(overrides) {
        const state = getNewGame();
        state.player.position = state.trail.find(n => n.type === "camp").id;
        if (overrides) Object.assign(state.player, overrides);
        return state;
    }

    it("restores 30 stamina", function () {
        const result = campAndRest(atCamp({ stamina: 50 }));
        assert.equal(result.state.player.stamina, 80);
    });

    it("restores 20 warmth", function () {
        const result = campAndRest(atCamp({ warmth: 40 }));
        assert.equal(result.state.player.warmth, 60);
    });

    it("costs 15 hunger", function () {
        const result = campAndRest(atCamp({ hunger: 80 }));
        assert.equal(result.state.player.hunger, 65);
    });

    it("does not change the player's position", function () {
        const state  = atCamp();
        const campId = state.player.position;
        const result = campAndRest(state);
        assert.equal(result.state.player.position, campId);
    });

    it("clamps stamina at 100 — cannot exceed the maximum", function () {
        // 90 + 30 = 120, should clamp to 100
        const result = campAndRest(atCamp({ stamina: 90 }));
        assert.equal(result.state.player.stamina, 100);
    });

    it("clamps warmth at 100", function () {
        const result = campAndRest(atCamp({ warmth: 90 }));
        assert.equal(result.state.player.warmth, 100);
    });

    it("clamps hunger at 0 — starvation if already low", function () {
        // 10 − 15 = −5, should clamp to 0
        const result = campAndRest(atCamp({ hunger: 10 }));
        assert.equal(result.state.player.hunger, 0);
    });

    it("sets status 'over' if hunger reaches 0 while resting", function () {
        const result = campAndRest(atCamp({ hunger: 15 }));
        assert.equal(result.state.player.hunger, 0);
        assert.equal(result.state.status, "over");
    });

    it("does not mutate the input state (pure function guarantee)", function () {
        const state    = atCamp({ stamina: 60 });
        const origStam = state.player.stamina;
        campAndRest(state);
        assert.equal(state.player.stamina, origStam);
    });

    it("returns an events array with at least one message", function () {
        const result = campAndRest(atCamp());
        assert.ok(Array.isArray(result.events));
        assert.ok(result.events.length > 0);
    });

    it("is a no-op when status is already 'over'", function () {
        const state = atCamp({ stamina: 20 });
        state.status = "over";
        const result = campAndRest(state);
        assert.equal(result.state.player.stamina, 20);
        assert.equal(result.events.length, 0);
    });

    it("does not restore stats when player is not at a camp node", function () {
        // Player starts at position 0 (type 'start'), which is not a camp.
        const state = getNewGame();
        state.player.stamina = 50;
        const result = campAndRest(state);
        assert.equal(result.state.player.stamina, 50, "stamina should not change off-camp");
    });

    it("returns an explanatory event when called off a camp node", function () {
        const result = campAndRest(getNewGame());
        assert.ok(result.events.length > 0);
    });

    it("records the camp id in restedAtCamps after resting", function () {
        const state  = atCamp();
        const campId = state.player.position;
        const result = campAndRest(state);
        assert.ok(result.state.restedAtCamps.includes(campId));
    });

    it("does not allow resting at the same camp a second time", function () {
        const state   = atCamp({ stamina: 50 });
        const after1  = campAndRest(state).state;        // first rest
        const after2  = campAndRest(after1);             // second attempt
        // Stamina must not increase again on the second call
        assert.equal(after2.state.player.stamina, after1.player.stamina);
    });

    it("returns an explanatory event on the second rest attempt", function () {
        const state  = atCamp();
        const after1 = campAndRest(state).state;
        const result = campAndRest(after1);
        assert.ok(result.events.length > 0);
    });

    it("allows resting at a different camp after having rested at one already", function () {
        // Rest at camp 1, then move to camp 2 and rest there — should succeed.
        const state   = atCamp({ stamina: 50 });
        const after1  = campAndRest(state).state;

        // Move player to the next camp
        const nextCamp = after1.trail.find(n => n.type === "camp" && n.id > after1.player.position);
        assert.ok(nextCamp, "no second camp node found in trail");
        const atCamp2 = { ...after1, player: { ...after1.player, position: nextCamp.id, stamina: 50 } };
        const result  = campAndRest(atCamp2);
        assert.ok(result.state.player.stamina > 50, "resting at a second camp should restore stamina");
    });
});

// ── useItem ───────────────────────────────────────────────────────────────────

describe("useItem(state, index)", function () {

    // Helper: find the first item of a given type and return its inventory index
    function indexOfType(state, type) {
        return state.inventory.findIndex(i => i.type === type);
    }

    it("restores stamina when using a stamina item", function () {
        const state = getNewGame();
        state.player.stamina = 60;
        const idx    = indexOfType(state, "stamina");
        const value  = state.inventory[idx].value;
        const result = useItem(state, idx);
        assert.equal(result.state.player.stamina, 60 + value);
    });

    it("restores hunger when using a hunger item", function () {
        const state = getNewGame();
        state.player.hunger = 40;
        const idx    = indexOfType(state, "hunger");
        const value  = state.inventory[idx].value;
        const result = useItem(state, idx);
        assert.equal(result.state.player.hunger, 40 + value);
    });

    it("restores warmth when using a warmth item", function () {
        const state = getNewGame();
        state.player.warmth = 50;
        const idx    = indexOfType(state, "warmth");
        const value  = state.inventory[idx].value;
        const result = useItem(state, idx);
        assert.equal(result.state.player.warmth, 50 + value);
    });

    it("clamps the restored stat at 100", function () {
        const state = getNewGame();
        state.player.stamina = 95;    // Energy Bar restores 18; 95 + 18 = 113 → 100
        const idx    = indexOfType(state, "stamina");
        const result = useItem(state, idx);
        assert.equal(result.state.player.stamina, 100);
    });

    it("removes the used item from the inventory", function () {
        const state      = getNewGame();
        const idx        = indexOfType(state, "stamina");
        const itemBefore = state.inventory[idx];
        const lenBefore  = state.inventory.length;
        const result     = useItem(state, idx);
        assert.equal(result.state.inventory.length, lenBefore - 1);
        // The used item must not appear at the same index any more
        const stillThere = result.state.inventory.some(i => i === itemBefore);
        assert.equal(stillThere, false, "item reference still present in new inventory");
    });

    it("equips a gear item and sets the gear flag", function () {
        const state  = getNewGame();
        const idx    = indexOfType(state, "gear");
        const gearKey = state.inventory[idx].gear;
        const result = useItem(state, idx);
        assert.equal(result.state.player.gear[gearKey], true);
    });

    it("removes a gear item from inventory after equipping", function () {
        const state    = getNewGame();
        const idx      = indexOfType(state, "gear");
        const lenBefore = state.inventory.length;
        const result   = useItem(state, idx);
        assert.equal(result.state.inventory.length, lenBefore - 1);
    });

    it("does not remove a camp item from inventory", function () {
        const state    = getNewGame();
        const idx      = indexOfType(state, "camp");
        const lenBefore = state.inventory.length;
        const result   = useItem(state, idx);
        assert.equal(result.state.inventory.length, lenBefore);
    });

    it("returns an informative event message for a camp item", function () {
        const state  = getNewGame();
        const idx    = indexOfType(state, "camp");
        const result = useItem(state, idx);
        assert.ok(result.events.length > 0, "no event returned for camp item");
    });

    it("does not mutate the input state when consuming an item", function () {
        const state    = getNewGame();
        const origLen  = state.inventory.length;
        const origStam = state.player.stamina;
        state.player.stamina = 60;
        const idx = indexOfType(state, "stamina");
        useItem(state, idx);
        assert.equal(state.inventory.length, origLen,  "input inventory was mutated");
        assert.equal(state.player.stamina,   60,       "input stamina was mutated");
    });

    it("is a no-op when status is 'over'", function () {
        const state = getNewGame();
        state.status = "over";
        state.player.stamina = 50;
        const idx    = indexOfType(state, "stamina");
        const result = useItem(state, idx);
        assert.equal(result.state.player.stamina, 50);
        assert.equal(result.events.length, 0);
    });

    it("is a no-op for an out-of-range index", function () {
        const state  = getNewGame();
        const result = useItem(state, 9999);
        assert.equal(result.state.inventory.length, state.inventory.length);
        assert.equal(result.events.length, 0);
    });

    it("sets status 'over' if consuming an item is not enough to save a stat at 0", function () {
        // This checks checkStatus is called after useItem: if stamina was already 0
        // before using a warmth item, status remains 'over'.
        const state = getNewGame();
        state.player.stamina = 0;
        const idx    = indexOfType(state, "warmth");
        const result = useItem(state, idx);
        assert.equal(result.state.status, "over");
    });
});
