import { strict as assert } from "assert";
import { getNewGame, initialState } from "../game.js";

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
