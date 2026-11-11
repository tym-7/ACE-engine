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
