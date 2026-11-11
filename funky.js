import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.mjs"

const kap = kaplay({
    width: 1595,
    height: 1099,
    letterbox: true,
    loadingScreen: false
});

let assets = [];

async function addAssets() {
    const r = await fetch("data/assets.json");
    assets = await r.json();

    await Promise.all(
    assets.map((a) => kap.loadSprite(a.name, a.src, a.options))
  );
}

    kap.onLoading((progress) => {
    kap.drawText({
        text: `LOADING... [${Math.floor(progress * assets.length)} / ${assets.length}]`,
        font: "monospace",
        size: 50,
        pos: kap.center(),
        anchor: "center",
        align: "center",
    });
});

kap.load(addAssets());
kap.setBackground(0,0,0);

kap.loadFont("Doiscallme", "fonts/docallismeonstreet.otf");

let version = "0.0.0";

let inventory = new Map();
let gameFlags = {};
let stickers = {};

async function addRandomData() {
        const inventoryResponse = await fetch('data/inventory.json');
        const inventoryData = await inventoryResponse.json();
        inventory = new Map(Object.entries(inventoryData));

        const flagsResponse = await fetch('data/flags.json');
        const flagsData = await flagsResponse.json();
        gameFlags = flagsData;

        //const stickersResponse = await fetch('data/stickers.json');
        //const sitckersData = await stickersResponse.json();
        //stickers = stickersData;
}

addRandomData();

//i want to add translation support, but i don't have any plans to get translators bc no one is going to translate so much dialogue
// when each week will have over tens of thousands of words
// if anyone does wanna, feel free tho ❤

let inDialogue = false;
let shownDialogue = new Set();
let currentScene = null;
let dialogueQueue = [];

async function loadDialogue(sceneName, lineId = null) {
}
        function showDialogue(data, lineId = null) {
            inDialogue = true;
            dialogueQueue = getLine(data);
        }

function closeDialogue() {
}

// adding a new line char to separate speaker from the old way of rendering the sprite, might be a bit redundant but 
// id like to separate visual (speaker) from internal id (char)
// i think old way also pulled from only /sprites? i plan to have a bunch of folders within sprites, no direct images
// inside /sprites itself so i will handle that

function getLine(data) {
    return data.map(line => ({
        id: line.id || null,
        speaker: line.speaker || null,
        char: line.char || null,
        mood: line.mood || null,
        position: line.position || 'center',
        text: line.text || '',
        style: line.style || 'default',
        background: line.background || null,
        ambience: line.ambience || null,
        track: line.track || null,
        triggers: line.triggers || [],
        next: line.next || null,
        branches: line.branches || null,
        newChapter: line.newChapter || false,
        choices: line.choices || []
    }));
}

function type() {
}

function renderLine(line) {
    // i need to add back the html and css vro
}

    let meters = {
    stamina: 100,
    sanity: 100,
    picolove: 50,
    keithlove: 50,
    approval: 0,
    lv: 0
};
