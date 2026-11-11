import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.mjs"

const kap = kaplay({
    width: 1595,
    height: 1099,
    letterbox: true,
});

let assets = [];

async function addAssets() {
    const r = await fetch("data/assets.json");
    assets = await r.json();

    assets.forEach (a=> {
        kap.loadSprite(a.name, a.src, a.options);
            });
}

kap.load(addAssets());

kap.loadFont("Doiscallme", "fonts/Docallismeonstreet.otf");

const loadingText = kap.add([
    kap.text("Loading...", {
        font: "Doiscallme",
        size: 50,
        align: "center"
    }),
    ]);

kap.onLoading((progress) => {
    loadingText.text = `LOADING... [${Math.floor(progress / assets.length)} / ${assets.length}`
});

let inventory = new Map();
let gameFlags = {};
let stickers = {};

async function addRandomData() {
    try {
        const inventoryResponse = await fetch('data/inventory.json');
        const inventoryData = await inventoryResponse.json();
        inventory = new Map(Object.entries(inventoryData));

        const flagsResponse = await fetch('data/flags.json');
        const flagsData = await flagsResponse.json();
        gameFlags = flagsData;

        //const stickersResponse = await fetch('data/stickers.json');
        //const sitckersData = await stickersResponse.json();
        //stickers = stickersData;

    } catch (error) {
        console.error("Error:", error);
    }
}

addRandomData();

    let meters = {
    stamina: 100,
    sanity: 100,
    picolove: 50,
    keithlove: 50,
    approval: 0,
    lv: 0
};
