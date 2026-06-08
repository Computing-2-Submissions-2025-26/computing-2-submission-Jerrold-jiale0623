/**
 * Initial game state
 * Contains player attributes, position, initial inventory, and the complete trail map
 */
export const initialState = {
    player: {
        position: 0,       // Player starts at the beginning (Base Camp, index 0)
        stamina: 100,      // Stamina
        hunger: 100,       // Hunger
        warmth: 100,       // Warmth
        gear: {
            crampons: false // Whether crampons are currently equipped
        }
    },
    // Inventory array
    inventory: [
        { id: 'energy_bar', name: '🍫 Energy Bar', type: 'stamina', value: 18 },
        { id: 'energy_bar', name: '🍫 Energy Bar', type: 'stamina', value: 18 },
        { id: 'jerky', name: '🥩 Beef Jerky', type: 'hunger', value: 30 },
        { id: 'trail_mix', name: '🥜 Trail Mix', type: 'hunger', value: 25 },
        { id: 'rice_ball', name: '🍙 Rice Ball', type: 'hunger', value: 24 },
        { id: 'chocolate', name: '🍫 Dark Chocolate', type: 'hunger', value: 18 },
        { id: 'dried_fruit', name: '🍇 Dried Fruit', type: 'hunger', value: 20 },
        { id: 'soup', name: '🍲 Instant Soup', type: 'hunger', value: 22 },
        { id: 'hot_tea', name: '☕ Hot Tea', type: 'warmth', value: 24 },
        { id: 'hand_warmer', name: '🔥 Hand Warmer', type: 'warmth', value: 28 },
        { id: 'down_jacket', name: '🧥 Down Midlayer', type: 'warmth', value: 35 },
        { id: 'oxygen', name: '🫁 Oxygen Cylinder', type: 'stamina', value: 28 },
        { id: 'crampons', name: '🥾 Crampons', type: 'gear', gear: 'crampons' },
        { id: 'tent', name: '⛺ Bivouac Tent', type: 'camp', value: 0 }
    ],
    // Trail map: 5-day route, with at least 4 random events/location nodes per day
    trail: [
        { id: 0, day: 1, x: 5, y: 78, name: "🏠 Base Camp", type: "start", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80" },
        { id: 1, day: 1, x: 10, y: 58, name: "🌲 Fir Tree Trail", type: "normal", image: "images/DSC_7622.jpg" },
        { id: 2, day: 1, x: 15, y: 72, name: "💧 Broken Ice Bridge", type: "danger", image: "images/IMG_5004_TIF.jpg" },
        { id: 3, day: 1, x: 20, y: 42, name: "🧭 Misty Fork", type: "hard", image: "https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1600&q=80" },
        { id: 4, day: 1, x: 25, y: 55, name: "🦶 Slippery Cobbled path", type: "hard", image: "images/DSC_6439.jpg" },
        { id: 5, day: 1, x: 30, y: 28, name: "⛺ Camp 1", type: "camp", image: "images/camping.jpg" },
        { id: 6, day: 2, x: 34, y: 48, name: "🪨 Scree Traverse", type: "hard", image: "images/DSC_5002.jpg" },
        { id: 7, day: 2, x: 38, y: 70, name: "🌫️ Whiteout Slopes", type: "danger", image: "images/DSC_6221.jpg" },
        { id: 8, day: 2, x: 42, y: 36, name: "🧊 Icy Bottleneck", type: "hard", image: "images/DSC_6139-2.jpg" },
        { id: 9, day: 2, x: 47, y: 58, name: "🌬️ Windchill Exposure", type: "danger", image: "images/DSC_6167.jpg" },
        { id: 10, day: 2, x: 51, y: 32, name: "⛺ Camp 2", type: "camp", image: "images/camping.jpg" },
        { id: 11, day: 3, x: 55, y: 66, name: "❄️ Stormy Col", type: "danger", image: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1600&q=80" },
        { id: 12, day: 3, x: 59, y: 42, name: "🪢 Fixed Rope Section", type: "hard", image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1600&q=80" },
        { id: 13, day: 3, x: 63, y: 76, name: "🧊 Frozen Tarn Edge", type: "hard", image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1600&q=80" },
        { id: 14, day: 3, x: 67, y: 28, name: "🌨️ Heavy Night Snow", type: "danger", image: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?auto=format&fit=crop&w=1600&q=80" },
        { id: 15, day: 3, x: 70, y: 50, name: "⛺ Camp 3", type: "camp", image: "images/camping.jpg" },
        { id: 16, day: 4, x: 74, y: 24, name: "🏔️ High-Altitude Snow Slope", type: "hard", image: "images/high-altitude-snow.jpg" },
        { id: 17, day: 4, x: 78, y: 48, name: "😮‍💨 Hypoxia Zone", type: "danger", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80" },
        { id: 18, day: 4, x: 82, y: 70, name: "🪨 Rockfall Couloir", type: "danger", image: "https://images.unsplash.com/photo-1465188162913-8fb5709d6d57?auto=format&fit=crop&w=1600&q=80" },
        { id: 19, day: 4, x: 86, y: 36, name: "🧤 Soaked Gloves", type: "hard", image: "https://images.unsplash.com/photo-1455156218388-5e61b526818b?auto=format&fit=crop&w=1600&q=80" },
        { id: 20, day: 4, x: 89, y: 56, name: "⛺ Camp 4", type: "camp", image: "images/camping.jpg" },
        { id: 21, day: 5, x: 91, y: 30, name: "🌬️ Summit Ridge Wind", type: "danger", image: "https://images.unsplash.com/photo-1480497490787-505ec076689f?auto=format&fit=crop&w=1600&q=80" },
        { id: 22, day: 5, x: 94, y: 64, name: "🧊 Knife-edge Ice Ridge", type: "hard", image: "https://images.unsplash.com/photo-1485160497022-3e09382fb310?auto=format&fit=crop&w=1600&q=80" },
        { id: 23, day: 5, x: 96, y: 44, name: "🌫️ Zero Visibility", type: "danger", image: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1600&q=80" },
        { id: 24, day: 5, x: 98, y: 22, name: "🪫 The Final Wall", type: "hard", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80" },
        { id: 25, day: 5, x: 99, y: 10, name: "🚩 The Summit", type: "summit", image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80" }
    ],
    // Current game status: playing, won, over
    status: 'playing' 
};

/**
 * Get a copy of the initial state
 * Ensures the original object is not mutated during gameplay resets
 */
export function getNewGame() {
    // Deep copy the object using JSON methods
    return JSON.parse(JSON.stringify(initialState));
}