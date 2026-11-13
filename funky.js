import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.mjs"

const kap = kaplay({
    canvas: document.getElementById("screen"),
    width: 1595,
    height: 1099,
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
// if i had to add it, i would include something like settings.lang set to 0, add getLang 0 = eng, 1 = esp or whatever order, return lang, edit the loading to accept assets/vn/dialogue/${lang}/${sceneName}.json

// i made "i" as a global variable so idk if "i" can be used anymore in a "for" loop, use index for the meanwhile 

let currentChapter = 0;
let settings = {
  fontSize: 1,
  speedDialogue: 1,
  speedNotes: 0,
  overlay: 0,
  midscroll: false,
  downscroll: false,
  skipPrologue: false,
    muteBlips: false,
  showFPS: false
};

function getTextSpeed() {
    if (settings.speedDialogue === 0) return 45;
    if (settings.speedDialogue === 1) return 30;
    if (settings.speedDialogue === 2) return 10;
    if (settings.speedDialogue === 3) return 0;
}
function getFont() {
    const text = document.getElementById("dialogue-text");
    if (settings.fontSize === 0) text.style.fontSize = "24px";
    if (settings.fontSize === 1) text.style.fontSize = "28px";
    if (settings.fontSize === 2) text.style.fontSize = "32px";
}

// save stuff idk
//
// adding a lot of spaces bc they kinda look ugly copy and pasted like that

let shownDialogue = new Set();

const settingsSave = 'fnf_dark_minds_settings';
const shownSave = 'fnf_dark_minds_shown';
const chapterSave = 'fnf_dark_minds_chapter_save';
const sceneSave = 'fnf_dark_minds_scene_save';
const lineSave = 'fnf-dark-minds_line_save';
const slot1Save = 'fnf-dark-minds_slot1_save';
const slot2Save = 'fnf-dark-minds_slot2_save';
const slot3Save = 'fnf-dark-minds_slot3_save';

function loadShown() {
    const shown = localStorage.getItem(shownSave);
    if (shown) {
        const dialogueData = JSON.parse(shown); 
        shownDialogue = new Set(dialogueData.shownDialogue || []);
    }
}

function saveDialogue() {
    const shownData = {
    shownDialogue: Array.from(shownDialogue),
    };
    localStorage.setItem(shownSave, JSON.stringify(shownData));
}
    loadShown();

function loadGame(data) {
    if (!data) return;
    gameFlags = data.flags;
    meters = data.meters;
    inventory = new Map(Object.entries(data.inventory));
    currentChapter = data.currentChapter || 1;
}


function getGame(sceneName, lineId = null) {
    return {
        currentScene: sceneName,
        currentId: lineId,
        flags: { ...gameFlags },
        meters: { ...meters },
        inventory: Object.fromEntries(inventory),
        currentChapter: currentChapter,
        timestamp: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    };
}

document.addEventListener("keydown", (event) => {
    if (event.key === "1") {
        saveSlot1(currentScene, currentId); 
    } else if (event.key === "2") {
        saveSlot2(currentScene, currentId);
    } else if (event.key === "3") {
        saveSlot3(currentScene, currentId);
    }
});

function saveLine(sceneName, lineId) {
    localStorage.setItem(lineSave, JSON.stringify(getGame(sceneName, lineId)));
}

function saveSlot1(sceneName, lineId) {
    localStorage.setItem(slot1Save, JSON.stringify(getGame(sceneName, lineId)));
}

function saveSlot2(sceneName, lineId) {
    localStorage.setItem(slot2Save, JSON.stringify(getGame(sceneName, lineId)));
}

function saveSlot3(sceneName, lineId) {
    localStorage.setItem(slot3Save, JSON.stringify(getGame(sceneName, lineId)));
}

function saveScene(sceneName) {
    localStorage.setItem(sceneSave, JSON.stringify(getGame(sceneName)));
}

function saveChapter(sceneName, lineId) {
    localStorage.setItem(chapterSave, JSON.stringify(getGame(sceneName, lineId)));
}

function saveSettings() {
    localStorage.setItem(settingsSave, JSON.stringify(settings));
}

function loadSettings() {
    const settingData = localStorage.getItem(settingsSave);
    if (settingData) {
        settings = JSON.parse(settingData);
    }
    //updateSettings();
}

// 
//
//

let inDialogue = false;
let inFreeplay = false;
let currentScene = "";
let currentLine = null;
let currentId = null;
let dialogueQueue = [];
let typeId = null;
let fullText = "";
let nextScene = null;

async function loadDialogue(sceneName, lineId = null) {
    const r = await fetch(`assets/vn/dialogue/${sceneName}.json`);
    const sceneData = await r.json();
    currentScene = sceneName;
    saveScene(sceneName);
    if (!inFreeplay) {
            shownDialogue.add(sceneName);
            saveDialogue();
            }
        showDialogue(sceneData, lineId);
}

        function showDialogue(data, lineId = null) {
            inDialogue = true;
            dialogueQueue = getLine(data);
            document.getElementById("dialogue-box").style.display = "block";
    document.getElementById("dialogue-background").style.display = "block";
    
    if (lineId) {
        while (dialogueQueue.length > 0 && dialogueQueue[0].id !== lineId) {
            dialogueQueue.shift();
        }
    }
    if (dialogueQueue.length > 0) {
        renderLine(dialogueQueue.shift());
    }
        }

function closeDialog() {
  const text = document.getElementById("dialogue-text");
  const box = document.getElementById("dialogue-box");
  const bg = document.getElementById("dialogue-background");

  text.innerHTML = "";
  box.style.display = "none";
  bg.style.display = "none";
}

// adding a new line char to separate speaker from the old way of rendering the sprite, might be a bit redundant but 
// id like to separate visual (speaker) from internal id (char)
// i wanna add a transition sec for backgrounds too

function getLine(data) {
    return data.map(line => ({
        id: line.id || null,
        speaker: line.speaker || null,
        char: line.char || null,
        mood: line.mood || null,
        position: line.position || 'center',
        text: line.text || '',
        style: line.style || 'default',
        speed: line.speed || 1,
        muted: line.muted || false,
        effect: line.effect || null,
        background: line.background || null,
        spriteShader: line.spriteShader || null,
        bgShader: line.bgShader || null,
        screenShader: line.screenShader || null,
        ambience: line.ambience || null,
        track: line.track || null,
        triggers: line.triggers || [],
        hasFlag: line.hasFlag || null,
        hasNoFlag: line.hasNoFlag || null,
        next: line.next || null,
        branches: line.branches || null,
        newChapter: line.newChapter || false,
        choices: line.choices || []
    }));
}

   const charBlip = {
    Pico: "sfx/pixelText.mp3",
    default: "sfx/pixelText.mp3"
};

let i = 0;
let finish = null;
let blip = null;

function startTyping(text, onFinish = null) {
    i = 0;
    if (typeId) {
        clearTimeout(typeId);
        typeId = null;
    }
    fullText = text;
    finish = onFinish;
    const dialogueText = document.getElementById("dialogue-text");
    dialogueText.innerHTML = "";
     blip = new Audio(charBlip[currentLine.char] || charBlip.default);
    type();
    if (settings.speedDialogue === 3) {
        finishTyping();
    }
}

function type() {
    if (i < fullText.length) {
        const c = fullText.charAt(i);
        const next = fullText.charAt(i+1);
        const span = document.createElement('span');
        span.textContent = c;
        i++;
        applyEffect(span);
        document.getElementById("dialogue-text").appendChild(span);
        
        if (!currentLine.muted && !settings.mutedBlips && c !== " ") {
            const clone = blip.cloneNode();
            clone.volume = 0.5;
            clone.play();
        }
        let delay = getTextSpeed() / currentLine.speed;
            if (c === "." || c === "!" || c === "?") {
                if (next !== "." && next !== "!" && next !== "?") {
                    delay += 500;
                }
                } else if (c === ",") {
                    delay += 250;
                }
            typeId = setTimeout(type, delay);
            } else {
                finishTyping();
            }
}
    
function finishTyping() {
    if (typeId) {
    clearTimeout(typeId);
    typeId = null;
    }
    
    const dialogueText = document.getElementById("dialogue-text");
    dialogueText.innerHTML = "";
    for (let index = 0; index < fullText.length; index++) {
        const span = document.createElement("span");
        span.textContent = fullText[index];
        applyEffect(span);
        dialogueText.appendChild(span);
    }
    
    if (finish) finish();
}

function renderLine(line) {
    const text = document.getElementById("dialogue-text");
    const box = document.getElementById("dialogue-box");
    const sprite = document.getElementById("dialogue-sprite");
    const bg = document.getElementById("dialogue-background");
    const tag = document.getElementById("speaker-tag");
    const speaker = document.getElementById("dialogue-speaker");
    // idk how many of these are useless go figure it out and remove later
    
    currentLine = line;

    if (currentLine.hasFlag && !gameFlags[currentLine.hasFlag]) {
        renderLine(dialogueQueue.shift());
        return;
    }
    if (currentLine.hasNoFlag && gameFlags[currentLine.hasNoFlag]) {
        renderLine(dialogueQueue.shift());
        return;
    }
        
    getFont();
    renderVNBg();
    renderVNSprite();
    renderVNUI();
    renderBox(currentLine.style);
    
    if (currentLine.id) {
        saveLine(currentScene, currentLine.id);
                 }
    if (currentLine.newChapter) {
        currentChapter++;
    }
    if (currentLine.triggers) {
        currentLine.triggers.forEach(event => {
            if (event.when === "start") handleTrigger(event);
        });
    }

    if (currentLine.branches) {
        handleBranch(currentLine.branches);
    }
    
    startTyping(currentLine.text, () => {
        if (currentLine.triggers) {
            currentLine.triggers.forEach(event => {
                if (event.when === "finish") handleTrigger(event);
            });
        }
    });
    //
}

function renderBox(style) {
    const box = document.getElementById("dialogue-box");
    if (style === 'pico') {
        VNColor.color = Color.fromHex("#356849");
        box.style.border = '14px solid #0a2d24';
    }
    if (style === 'bf') {
        VNColor.color = Color.fromHex("#263a8e");
    box.style.border = '14px solid #1d0d59';
  } 
    if (style === 'picothink') {
    VNColor.color = Color.fromHex("#458b61");
    box.style.border = '14px solid #144444';
    }
    
}

function applyEffect(text) {
}

function handleBranch(branchs) {
    for (let index = 0; index < branchs.length; index++) {
        let branch = branchs[index];
        if (branch.type === "flag") {
            let isNeeded = branch.needed;
            if (gameFlags[branch.value] && isNeeded) {
                nextScene = branch.scene;
                return;
            }
            if (!gameFlags[branch.value] && !isNeeded) {
                nextScene =  branch.scene;
                return;
            }
        }
        if (branch.type === "meter") {
            let meterNumber = meters[branch.value];
            let num = meterNumber;
            if (num >= branch.min && num <= branch.max) {
                nextScene = branch.scene;
                return;
            }
            }
        if (branch.type === "inv") {
            //
            }
    }
}


function handleTrigger(event) {
}

function giveItem(item, amount){
    const currentCount = inventory.get(item) || 0;
    inventory.set(item, currentCount + amount);
}

//// kaplay stuff idk
///

function getAsset(path) {
    for (let index = 0; index < assets.length; index++) {
        if (assets[index].src === path) {
            return assets[index].name;
        }
    }
    return;
}


// learn how to use shaders / frag

let VNSprite = null;
let VNBg = null;
let VNBox = null;
let VNSpeaker = null;
let VNColor = null;

function renderVNSprite() {
    if (VNSprite) {
    if (!currentLine.char && !currentLine.mood) {
        VNSprite.destroy();
        VNSprite = null;
        return;
    }
    }
    const sprite = getAsset(`assets/vn/sprites/${currentLine.char}/${currentLine.mood}.png`);
    if (!VNSprite) {
        VNSprite = kap.add([
            kap.sprite(sprite),
            kap.pos(200,735),
            kap.anchor("botleft"),
            kap.fixed(),
            kap.z(1),
            ]);
    } else {
            VNSprite.use(kap.sprite(sprite));
        }
    if (currentLine.spriteShader) {
        VNSprite.use(kap.shader(currentLine.spriteShader));
    } else {
        VNSprite.unuse("shader");
    }
    
        // position here
}

function renderVNBg() {
    if (!currentLine.background) return;
    const bg = getAsset(`assets/vn/backgrounds/${currentLine.background}.png`);
    if (!VNBg) {
        VNBg = kap.add([
            kap.sprite(bg),
            kap.pos(0,0),
            kap.fixed(),
            kap.z(0),
            ]);
        return;
    }
    if (VNBg) {
        VNBg.use(kap.sprite(bg));
    }
    if (currentLine.bgShader) {
        VNSprite.use(kap.shader(currentLine.bgShader));
    } else {
        VNSprite.unuse("shader");
    }
    //
}

function renderVNUI() {
    // render the tag and the bg box here cuz they use images too okay now just the tag

    if (!VNColor) {
        VNColor = kap.add([
            kap.rect(1200,250),
            kap.pos(797.5, 989),
            kap.anchor("bot"),
            kap.color(0,0,0),
            kap.fixed(),
            kap.z(2),
            ]);
    }

    const overlay = getAsset(`assets/ui/images/bg-box.png`);
    if (!VNBox) {
        VNBox = kap.add([
    kap.sprite(overlay),
    kap.pos(797.5, 989),
    kap.anchor("bot"),
    kap.fixed(),
    kap.z(2.5),
]);
    }
    const newOverlay = getAsset(`assets/ui/images/${currentLine.style}-overlay.png`); 
    if (newOverlay) {
        VNBox.use(kap.sprite(newOverlay));
    } else {
        VNBox.use(kap.sprite(overlay));
    }
//
}

function removeKaplayVN() {
}
    
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (inDialogue) {
        // do dialogue things
        }
    }
});
    
document.addEventListener("keydown", (e) => {
    if (e.key === "9") {
        loadDialogue("test");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "7") {
        // free play
    }
});
                             

    let meters = {
    stamina: 100,
    sanity: 100,
    picolove: 50,
    keithlove: 50,
    approval: 0,
    lv: 0
};
