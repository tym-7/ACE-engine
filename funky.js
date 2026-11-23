import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.mjs"

const kap = kaplay({
    canvas: document.getElementById("screen"),
    width: 1595,
    height: 1099,
    loadingScreen: false
});

let assets = [];

// PUT YOUR ASSETS IN THE ASSET JSON DONT BE STUPID LIKE ME
// IM BEING SERIOUS IF YOUR GAME CRASHES ITS PROBABLY CUZ ITS NOT THERE - note to future selves
// MIDSCROLL ALSO EXISTS adjust some code if needed omg i forgot aaaa

// to do:
// overlay for receptors, ui button stuff for vn part, changing keybinds
// im trying to think how i'd do a backlog. maybe make an array and use "unshift"?

async function addAssets() {
    const r = await fetch("data/assets.json");
    assets = await r.json();

    await Promise.all(
    assets.map((a) => {
        if (a.type === "sprite") return kap.loadSprite(a.name, a.src, a.options);
        if (a.type === "music") return kap.loadMusic(a.name, a.src);
        if (a.type === "sound") return kap.loadSound(a.name, a.src);
        if (a.type === "shader") return kap.loadShaderURL(a.name, null, a.src);
        if (a.type === "sheet") return kap.loadSpriteAtlas(a.src, a.data);
    })
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

window.onerror = (msg, src, line) => {
    alert(`Error: ${msg}\nLine: ${line}`);
};

let version = "0.0.0";

let inventory = new Map();
let gameFlags = {};
let stickers = {};

    let meters = {
    stamina: 100,
    sanity: 100,
    picolove: 50,
    keithlove: 50,
    approval: 0,
    lv: 0
};

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

let charData = {};
let charBlip = {};

async function addCharacterData() {
    //const r = await fetch('assets/fnf/sprites/characters.json');
    //const rdata = await r.json();
    const bl = await fetch('assets/vn/sfx/blips/data.json');
    const bldata = await bl.json();
    //charData = rdata;
    charBlip = bldata;
}

let mobileControls = false;

function detectControls() {
    const isMobile = navigator.maxTouchPoints > 0;
    if (isMobile) {
        showPrompt();
    }
}
function showPrompt() {
}

addCharacterData();

//i want to add translation support, but i don't have any plans to get translators bc no one is going to translate so much dialogue
// when each week will have over tens of thousands of words
// if anyone does wanna, feel free tho ❤
// if i had to add it, i would include something like settings.lang set to 0, add getLang 0 = eng, 1 = esp or whatever order, return lang, edit the loading to accept assets/vn/dialogue/${lang}/${sceneName}.json
// this new translation setting has nothing to do with the above, there will be dialogue in a diff language in week 7 

// i made "i" as a global variable so idk if "i" can be used anymore in a "for" loop, use index for the meanwhile 

let currentChapter = 0;
let settings = {
  fontSize: 1,
  speedDialogue: 1,
  speedNotes: 0,
  overlay: 0,
  midscroll: false,
    translate: false,
  downscroll: false,
    hardMode: false,
  skipPrologue: false,
    muteBlips: false,
    autoplay: false,
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

function getNoteSpeed() {
    if (settings.speedNotes === 0) {
        songData.scrollSpeed = songData.scrollSpeed;
        return;
    }
    songData.scrollSpeed = 0.9 + (settings.speedNotes * 0.1); // thank you my brother for the suggestion
}

function getOverlay() {
    return settings.overlay / 10;
}

// save stuff idk
//
// adding a lot of spaces bc they kinda look ugly copy and pasted like that

let shownDialogue = new Set();

const settingsSave = 'fnf_dark_minds_settings';
const keybinds4KSave = 'fnf_dark_minds_keybinds';
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

function loadGame(data) {
    if (!data) return;
    gameFlags = data.flags;
    meters = data.meters;
    inventory = new Map(Object.entries(data.inventory));
    currentChapter = data.currentChapter || 1;
}

function save4Keybinds() {
    localStorage.setItem(keybinds4KSave, JSON.stringify(keybinds4K));
}

function load4Keybinds() {
    const key4Data = localStorage.getItem(keybinds4KSave);
    if (key4Data) {
        keybinds4K = JSON.parse(key4Data);
    }
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
    settings.autoplay = false; // autoplay is not a real setting i am only grouping it up there for ease
    //updateSettings();
}

    loadShown();
    load4Keybinds();
    loadSettings();

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
let finishId = null;
let fullText = "";
let nextScene = null;

async function loadDialogue(sceneName, lineId = null) {
    const r = await fetch(`assets/vn/dialogue/${sceneName}.json`);
    const sceneData = await r.json();
    currentScene = sceneName;
    saveScene(sceneName);
    nextScene = null;
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

function gameOver() {
    alert("Empty function | gameOver");
}

// i wanna add a transition sec for backgrounds too

function getLine(data) {
    return data.map(line => ({
        id: line.id || null,
        speaker: line.speaker || null,
        char: line.char || null,
        mood: line.mood || null,
        position: line.position || 'center',
        text: line.text || '',
        translation: line.translation || null,
        alt: line.alt || null,
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
        gameOver: line.gameOver || false,
        newChapter: line.newChapter || false,
        choices: line.choices || null
    }));
}

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
     let blipSfx = charBlip[currentLine.char] || charBlip.default;
    blip = getAsset(blipSfx);
    if (settings.speedDialogue === 3) {
        finishTyping();
        return;
    }
    type();
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
            kap.play(blip, {volume: 0.5});
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
    if (settings.autoplay) {
        finishId = setTimeout(() => {
            handleDialogue();
        }, 1000 );
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
    const speaker = document.getElementById("dialogue-speaker");
    // keeping just these for now
    
    currentLine = line;
    checkHybrid();

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
    addBacklog();

    if (currentLine.translation && settings.translate) {
        translateText();
    }
    
    if (currentLine.id) {
        saveLine(currentScene, currentLine.id);
                 }
    if (currentLine.newChapter) {
        currentChapter++;
    }
    if (currentLine.choices) {
        if (currentLine.choices.when === "start") {
        showChoices(currentLine.choices);
        }
    }
    if (currentLine.triggers) {
        currentLine.triggers.forEach(event => {
            if (event.when === "start") handleTrigger(event);
        });
    }

    if (currentLine.branches) {
        handleBranch(currentLine.branches);
    }

    if (currentLine.next) {
        nextScene = currentLine.next;
    }
    if (currentLine.text === "null") {
        text.innerHTML = "";
        return;
    }
    
    startTyping(currentLine.text, () => {
        if (currentLine.triggers) {
            currentLine.triggers.forEach(event => {
                if (event.when === "finish") handleTrigger(event);
            });
        }
        if (currentLine.choices) {
            if (currentLine.choices.when === "finish") {
                showChoices(currentLine.choices);
            }
        }
    });
    //
}

// i think i could add a setTimeout (handleTrigger, event.delay, event) to add more customization to triggers

function renderBox(style) {
    const box = document.getElementById("dialogue-box");
    document.getElementById("dialogue-text").style.color = "white";
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
    if (currentLine.effect === 'shaky') {
        text.classList.add('shaky');
    }
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
            let isNeeded = branch.needed;
            let hasItem = (inventory.get(branch.value) || 0) > 0;
            if (isNeeded && hasItem) {
                nextScene = branch.scene;
                return;
            }
            let amount = inventory.get(branch.value) || 0;
            if (amount >= branch.min && amount <= branch.max) {
                nextScene = branch.scene;
                return;
            }
            }
        if (branch.type === "fallback") {
            nextScene = branch.scene;
            return;
        }
        //
    }
}

function showChoices(choices) {
    let cTimerId = null;
    let canceled = false;
    const container = document.getElementById("choice-container");
    container.style.display = "flex";
    container.innerHTML = "";
    if (choices.timer) {
        cTimerId = setTimeout(() => {
            handleChoice(choices.onEnd);
        }, choices.timer);
    }
    choices.options.forEach(option => {
        let delay = 0;
        if (option.delay) {
            delay = option.delay;
        }
        if (option.condition) {
            if (option.condition === "flag" && !gameFlags[option.conditionvalue]) return;
            if (option.condition === "inv" && (inventory.get(option.conditionvalue) < option.min || inventory.get(option.conditionvalue) > option.max)) return;
            if (option.condition === "meter" && (meters[option.conditionvalue] < option.min || meters[option.conditionvalue] > option.max)) return;
        }
        setTimeout(() => {
            if (canceled) return;
        const btn = document.createElement("button");
        btn.innerHTML = option.text;
            if (!option.style) {
        btn.classList.add("choice-btn");
            }
            if (option.style) {
                btn.classList.add(option.style);
            }
        btn.onclick = () => {
            canceled = true;
            clearTimeout(cTimerId);
            handleChoice(option.onClick);
        };
            container.appendChild(btn);
        }, delay);
    });
}

function handleChoice(action) {
    const container = document.getElementById("choice-container");
    container.innerHTML = "";
    container.style.display = "none";
    if (action.sfx) {
        const sfx = getAsset(action.sfx);
        kap.play(sfx);
    }
    if (action.gameOver) {
        gameOver();
        return;
    }
    if (action.custom) {
        customChoice(action.custom);
    }
    if (action.flag) {
        gameFlags[action.flag] = action.flagvalue;
    }
    if (action.meter) {
        meters[action.meter] += action.metervalue;
    }
    if (action.item) {
        if (action.itemvalue > 0) {
            giveItem(action.item, action.itemvalue);
        }
        if (action.itemvalue < 0) {
            removeItem(action.item, -(action.itemvalue));
        }
    }
    if (action.scene) {
        loadDialogue(action.scene);
    }
    if (!action.scene) {
        handleDialogue(true);
    }
}

function handleTrigger(event) {
    if (event.type === "sfx") {
        const sfx = getAsset(event.value);
        kap.play(sfx);
    }
    if (event.type === "silence") {
        stopVNMusic();
    }
    if (event.type === "addItem") {
        giveItem(event.value, event.amount);
    }
    if (event.type === "removeItem") {
        removeItem(event.value, event.amount);
    }
    //
}

function checkHybrid() {
    // i think to set it forever do if (x && y) flag = true; deleting that bracket bc it gives me a heart attack when theyre not even
    // while set to true only if its true should be gameFlag.flag = (x && y);
}

function customChoice(choice) {
    if (choice === "id") {
        // custom logic stuff like idk you want to subtract more than 1 item
        // both of these will get worked on as i actually write the game
    }
}

function translateText() {
    const transBox = document.getElementById("translation-box");
    transBox.innerHTML = currentLine.translation;
}
// make a box in html later
let backlog = [];

function addBacklog() {
    let txt = "";
    if (!currentLine.alt) {
        txt = `${currentLine.speaker}: ${currentLine.text}`;
    }
    if (currentLine.alt) {
        txt = `${currentLine.alt}`;
    }
    backlog.unshift(`${txt}`);
    // add some feature like idk if it gets over 100 lines the last line gets deleted
}

document.getElementById("dialogue-text").addEventListener("mouseenter", () => {
    if (currentLine.translation && settings.translate) {
        const transBox = document.getElementById("translation-box");
        document.getElementById("dialogue-text").style.color = "yellow";
        transBox.style.display = "block";
    }
});

document.getElementById("dialogue-text").addEventListener("mouseleave", () => {
    if (currentLine.translation && settings.translate) {
    renderBox(currentLine.style);
    const transBox = document.getElementById("translation-box");
        transBox.style.display = "none";
    }
});

        

function giveItem(item, amount){
    const currentCount = inventory.get(item) || 0;
    inventory.set(item, currentCount + amount);
}

function removeItem(item, amount){
    if (amount === "all") {
        inventory.set(item, 0);
        return;
    }
    const currentCount = inventory.get(item) || 0;
    inventory.set(item, Math.max(0, currentCount - amount));
}

//// kaplay stuff idk
///

function getAsset(path) {
    for (let index = 0; index < assets.length; index++) {
        if (assets[index].src === path) {
            return assets[index].name;
        }
    }
        alert("Missing asset:" + path);
    return;
}

let VNTrack = null;
let VNAmbience = null;

function playVNMusic() {
    if (currentLine.track) {
        if (VNTrack) {
            VNTrack.stop();
            VNTrack = null;
        }
        let track = getAsset(`assets/vn/sounds/${currentLine.track}`);
        VNTrack = kap.play(track, {loop: true});
    }
    if (currentLine.ambience) {
        if (VNAmbience) {
            VNAmbience.stop();
            VNAmbience = null;
        }
        let ambience = getAsset(`assets/vn/sounds/${currentLine.ambience}`);
        VNAmbience = kap.play(ambience, {loop: true});
    }
}

function stopVNMusic() {
    if (VNTrack) {
        VNTrack.stop();
        VNTrack = null;
    }
    if (VNAmbience) {
        VNAmbience.stop();
        VNAmbience = null;
    }
}
// learn how to use shaders / frag

let VNSprite = null;
let VNBg = null;
let VNBox = null;
let VNTag = null;
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
            kap.pos(200,740),
            kap.anchor("botleft"),
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

    if (VNSprite) {
        if (currentLine.position === "left") {
        VNSprite.anchor = "botleft";
            VNSprite.flipX = false;
            VNSprite.pos = kap.vec2(200, 740);
        }
        if (currentLine.position === "center") {
            VNSprite.anchor = "bot";
            VNSprite.flipX = false;
            VNSprite.pos = kap.vec2(797, 740);
        }
        if (currentLine.position === "right") {
            VNSprite.anchor = "botright";
            VNSprite.flipX = true;
            VNSprite.pos = kap.vec2(1395, 740);
        }
    }
        //
}

function renderVNBg() {
    if (!currentLine.background) return;
    const bg = getAsset(`assets/vn/backgrounds/${currentLine.background}.png`);
    if (!VNBg) {
    VNBg = kap.add([
        kap.sprite(bg),
        kap.pos(0, 0),
        kap.z(0),
    ]);
    } else {
    VNBg.use(kap.sprite(bg));
    }
    if (currentLine.bgShader) {
        VNBg.use(kap.shader(currentLine.bgShader));
    } else {
        VNBg.unuse("shader");
    }
    //
}

function renderVNUI() {
    // render the tag and the bg box here cuz they use images too okay now just the tag
    // honestly what im thinking to render full screen images is just overlaying an image on screen z(10) and set text to null so no dialogue plays instead of hiding the box
    if (!VNColor) {
        VNColor = kap.add([
            kap.rect(1180,240),
            kap.pos(800, 985),
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
    kap.pos(800, 985),
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
    if (currentLine.screenShader) {
        kap.usePostEffect(currentLine.screenShader);
    } else {
        kap.usePostEffect(null);
    }
//
}

function removeKaplayVN() {
    // i just learned tags exist, im thinking about adding everything with the tag VN and then doing
    //kap.destroyAll("VN"); or i could be lazy asf and just destroy everything individually
}
    
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (inDialogue) {
        handleDialogue();
        }
    }
});

// making it into a separate function for idk mobile support
function handleDialogue(handled = false) {
    const enter = getAsset(`assets/vn/sfx/blips/textboxClick.mp3`);
    if (finishId) {
        clearTimeout(finishId);
        finishId = null;
    }
    if (typeId) {
        finishTyping();
        return;
    }
    if (currentLine.gameOver) {
        gameOver();
        return;
    }
    if (currentLine.choices && !handled) {
        return;
    }
    if (nextScene) {
        loadDialogue(nextScene);
        kap.play(enter);
        return;
    }
    if (dialogueQueue.length > 0) {
        renderLine(dialogueQueue.shift());
        kap.play(enter);
        return;
    }
    if (dialogueQueue.length === 0) {
        closeDialogue();
    }
}
    
    
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


// put point and click stuff here

// put fnf stuff here

let timing = null;

let hp = 100;
let maxHp = 200;
let sick = 0;
let good = 0;
let bad = 0;
let shit = 0;
let miss = 0;
let combo = 0;
let score = 0;
let accuracy = "100.00";
let grade = "??";
let comboRank = "??";

let targetX = 0;
let targetY = 0;
let zoom = 0;
let zoomSpeed = 3;
let lerpSpeed = 3;

let songData = null;

let inst = null;
let voicesP = null;
let voicesO = null;
let instId = null;
let voicesPId = null;
let voicesOId = null;

let inSong = false;
let canPause = false;
let isPaused = false;
let blueBalled = false;

let direction4K = ["left", "down", "up", "right"];
let direction6K = ["left", "edit", "these", "values", "okay", "right"];
let keybinds4K = ["D", "F", "J", "K"];
let keybinds6K = ["S", "D", "F", "J", "K", "L"];

let hpDraining = false;
let invisNotes = false;
// add back poison mechanics later

function handleHit(rating) {
    updateHp(rating);
    if (rating === "sick") {
        if (settings.hardMode) {
            score += 500;
        }
        if (!settings.hardMode) {
            score += 350;
        }
        combo++;
        sick++;
    }
    if (rating === "good") {
        if (settings.hardMode) {
            score += 0;
        }
        if (!settings.hardMode) {
            score += 200;
        }
        good++;
        combo++;
    }
    if (rating === "bad") {
        if (settings.hardMode) {
            score -= 150;
            combo = 0;
        }
        if (!settings.hardMode) {
            score += 100;
            combo++;
        }
        bad++;
    }
    if (rating === "shit") {
        if (settings.hardMode) {
            score -= 300;
        }
        if (!settings.hardMode) {
            score += 50;
        }
        shit++;
        combo = 0;
    }
    if (rating === "miss") {
        miss++;
        combo = 0;
    }
    //
}

function updateHp(rating) {
    let table = null;
    if (settings.hardMode) {
        const hardTable = { sick: 1, good: -3, bad: -10, shit: -15, miss: -50};
        table = hardTable;
    }
    if (!settings.hardMode) {
        const normalTable = {sick: 5, good: 2, bad: 0, shit: 0, miss: -8 };
        table = normalTable;
    }
    let num = table[rating];
    if (hpDraining && num > 0) return;
    hp = Math.min(maxHp, hp + num);
}

function calculateAccuracy() {
    totalHit = sick + good + bad + shit + miss;
    if (totalHit === 0) return "??";
    let pts = sick + (good * 0.75) + (bad * 0.5) + (shit * 0.25) + (miss * 0);
    let acc = (pts / totalHit) * 100;
    return Number(accuracy.toFixed(2));
}

function calculateGrade() {
    alert("Empty function | calculateGrade");
}

function calculateComboRank() {
    alert("Empty function | calculateComboRank");
}

function timingController() {
    if (!settings.hardMode) {
        let normalTiming = {
            sick: 45,
            good: 90,
            bad: 135,
            shit: 166
        };
        timing = normalTiming;
    }

    if (settings.hardMode) {
        let hardTiming = {
            sick: 30,
            good: 60,
            bad: 90,
            shit: 166
        };
        timing = hardTiming;
    }
}

let heldKeys = new Set();

window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (!inSong) return;
    let lane = -1;
    if (songData.lanes === 4) {
        lane = keybinds4K.indexOf(e.key.toUpperCase());
    }
    if (songData.lanes === 6) {
        lane = keybinds6K.indexOf(e.key.toUpperCase());
    }
    if (lane === -1) return;
    checkHit(lane);
});

window.addEventListener("keyup", (e) => {
    if (!inSong) return;
    let lane = -1;
    if (songData.lanes === 4) {
        lane = keybinds4K.indexOf(e.key.toUpperCase());
    }
    if (songData.lanes === 6) {
        lane = keybinds6K.indexOf(e.key.toUpperCase());
    }
    if (lane === -1) return;
    releaseLane(lane);
});

function releaseLane(lane) {
    heldKeys.delete(lane);
    animateReceptor("plaR", lane, "idle");
    if (FNFplayer.holdTimer <= 0 && heldKeys.size === 0) {
        animate(FNFplayer, songData.player, "idle");
    }
    if (FNFplayer2 && FNFplayer2.holdTimer <= 0 && heldKeys.size === 0) {
        animate(FNFplayer2, songData.player2, "idle");
    }
}

function checkHit(lane) {
    heldKeys.add(lane);
    let hitTime = inst.time() * 1000;
    const notes = kap.get("head");
    let closestNote = null;
    
    for (let index = 0; index < notes.length; index++) {
        let note = notes[index];
        if (note.lane === lane && note.mustHit) {
            if (!closestNote) {
                closestNote = note;
            } else if (note.time < closestNote.time) {
                closestNote = note;
            }
        }
    }
    
    if (!closestNote) {
        animateReceptor("plaR", lane, "press");
        return;
    }
    let diff = Math.abs(hitTime - closestNote.time);
    if (diff > timing.shit) {
        ghostTap(lane);
        animateReceptor("plaR", lane, "press");
        return;
    }
    if (diff <= timing.sick) {
        handleHit("sick");
        kap.destroy(closestNote);
    } else if (diff <= timing.good) {
        handleHit("good");
        kap.destroy(closestNote);
    } else if (diff <= timing.bad) {
        handleHit("bad");
        kap.destroy(closestNote);
    } else if (diff <= timing.shit) {
        handleHit("shit");
        kap.destroy(closestNote);
    }
    grade = calculateGrade();
    accuracy = calculateAccuracy();
    comboRank = calculateComboRank();
    animateReceptor("plaR", lane, "hit");
    let path = `hit-${getDirection(lane)}`;
    if (closestNote.length === 0) {
    if (closestNote.target === 1) {
        animate(FNFplayer2, songData.player2, path);
    }
    if (closestNote.target === 0) {
        animate(FNFplayer, songData.player, path);
    }
    }
}

function ghostTap(lane) {
    alert("Empty function | ghostTap");
}

function resetScore() {
    hp = 100;
    sick = 0;
    good = 0;
    bad = 0;
    shit = 0;
    miss = 0;
    score = 0; 
    combo = 0;
    accuracy = "100.00";
    grade = "??";
    comboRank = "??";
  }

// id should be used as the folder pathing
// name is just the display
// week should be for bg pathing assets/fnf/${songData.week}/images.png

function getSongData(data) {
    return {
        id: data.id || null,
        name: data.name || "Song",
        week: data.week || null,
        lanes: data.lanes || 4,
        composer: data.composer || "john music",
        charter: data.charter || "john charter",
        bpm: data.bpm || 120,
        scrollSpeed: data.scrollSpeed || 1,
        stageLayers: data.stageLayers || [],
        startCutscene: data.startCutscene || null,
        endCutscene: data.endCutscene || null,
        shader: data.shader || null,
        player: data.player || "pico",
        player2: data.player2 || null,
        opponent: data.opponent || "bf",
        opponent2: data.opponent2 || null,
        speaker: data.speaker || null,
        opponentPosition: { ...data.opponentPosition } || {},
        opponent2Position: { ...data.opponent2Position } || {},
        playerPosition: { ...data.playerPosition },
        player2Position: { ...data.player2Position } || {},
        speakerPosition: { ...data.speakerPosition } || {},
        cameraX: data.cameraX || 0,
        cameraY: data.cameraY || 0,
        cameraZoom: data.cameraZoom || 1,
        opponentNotes: data.opponentNotes || [],
        playerNotes: data.playerNotes || [],
        events: data.events || []
    };  
}

async function loadSong(song, difficulty) {
    const r = await fetch (`assets/fnf/data/${song}/chart-${difficulty}.json`);
    const data = await r.json();
    songData = getSongData(data);
}

let maxBgWidth = 0;
let maxBgHeight = 0;

async function getBgData() {
    const r = await fetch(`assets/fnf/${songData.week}/data.json`);
    const data = await r.json();
    maxBgWidth = data.width;
    maxBgHeight = data.height;
}

async function startSong(song, difficulty) {
    await loadSong(song, difficulty);
    await getBgData();
    resetScore();
    getNoteSpeed();
    setAudio();
    timingController();
    baseBpm = songData.bpm;
    if (songData.startCutscene) {
        playCutscene(songData.startCutscene, part2Start);
        return;
    }
    renderFNFBg();
    renderFNFSprite();
    renderHealthbar();
    part2Start();
}
    async function part2Start() {
        kap.get("changeBPM").forEach(sprite => {
            sprite.play("idle");
        });
        changeBPM(baseBpm);
        renderReceptors();
        if (mobileControls) {
        renderLanes();
        }
        setCamera();
        await startCountdown();
    inst = kap.play(instId);
    voicesP = kap.play(voicesPId);
    if (voicesOId) {
        voicesO = kap.play(voicesOId);
    }
        canPause = true;
}

function restartSong() {
    alert("Empty function | restartSong");
}

async function startCountdown() {
    const cd = ["3", "2", "1", "go"];
    for (let index = 0; index < cd.length; index++) {
        let step = cd[index];
        let img = getAsset(`assets/fnf/ui/countdown/${step}.png`);
        let audio = getAsset(`assets/fnf/ui/countdown/${step}.mp3`);
        kap.play(audio);
        const sImg = kap.add([
            kap.sprite(img),
            kap.pos(450, 800),
            kap.anchor("center"),
            kap.opacity(1),
            kap.z(80),
            "countdown",
            ]);
        await kap.wait(0.5);
    }
}

kap.onUpdate("countdown", (step) => {
    step.opacity = step.opacity - kap.dt() * 2;
    if (step.opacity <= 0.05) {
        kap.destroy(step);
    }
});

function playCutscene(src, finished) {
    const cutscene = document.getElementById("cutscene");
    cutscene.style.display = "block";
    cutscene.src = src;
    cutscene.play();
    cutscene.onended = () => {
        cutscene.style.display = "none";
        cutscene.src = "";
        if (finished) finished();
    };
}

// i wrote this on google docs im sorry this is so flat

function setAudio () {
instId = null;
voicesPId = null;
voicesOId = null;
instId = getAsset(`assets/fnf/songs/${songData.id}/inst.ogg`);
voicesPId = getAsset(`assets/fnf/songs/${songData.id}/voices.ogg`);
if (!voicesPId) {
voicesPId = getAsset(`assets/fnf/songs/${songData.id}/voices-${songData.player}.ogg`);
voicesOId = getAsset(`assets/fnf/songs/${songData.id}/voices-${songData.opponent}.ogg`);
}
}

function checkAudio (time) {
    const allowedDiff = 0.02;
    if (voicesP) {
        let diff = voicesP.time - (time/1000);
        if (diff < -allowedDiff) {
            voicesP.speed = 1.02;
        }
        if (diff > allowedDiff) {
            voicesP.speed = 0.98;
        }
        if (diff >= -allowedDiff && diff <= allowedDiff) {
            voicesP.speed = 1;
        }
    }
    if (voicesO) {
        let diff = voicesO.time - (time/1000);
        if (diff < -allowedDiff) {
            voicesO.speed = 1.02;
        }
        if (diff > allowedDiff) {
            voicesO.speed = 0.98;
        }
        if (diff >= -allowedDiff && diff <= allowedDiff) {
            voicesO.speed = 1;
        }
    }
}

function renderLanes() {
    if (songData.lanes === 4) {
        const lane1 = kap.add([
            kap.rect(350, 1099),
            kap.pos(95, 0),
            kap.area(),
            kap.fixed(),
            kap.color(244, 175, 55),
            kap.opacity(0.10),
            "lane",
            { lane: 0 }
        ]);

        const lane2 = kap.add([
            kap.rect(350, 1099),
            kap.pos(445, 0),
            kap.area(),
            kap.fixed(),
            kap.color(47, 96, 192),
            kap.opacity(0.10),
            "lane",
            { lane: 1 }
        ]);

        const lane3 = kap.add([
            kap.rect(350, 1099),
            kap.pos(795, 0),
            kap.area(),
            kap.fixed(),
            kap.color(40, 189, 138),
            kap.opacity(0.10),
            "lane",
            { lane: 2 }
        ]);

        const lane4 = kap.add([
            kap.rect(350, 1099),
            kap.pos(1145, 0),
            kap.area(),
            kap.fixed(),
            kap.color(209, 34, 92),
            kap.opacity(0.10),
            "lane",
            { lane: 3 }
        ]);
    }
}

kap.onTouchStart((pos, t) => {
    const l = kap.get("lane");
    for (let index = 0; index < l.length; index++) {
        let lane = l[index];
        if (lane.hasPoint(pos)) {
            checkHit(lane.lane);
        }
    }
});
kap.onTouchEnd((pos, t) => {
    const l = kap.get("lane");
    for (let index = 0; index < l.length; index++) {
        let lane = l[index];
        if (lane.hasPoint(pos)) {
            releaseLane(lane.lane);
        }
    }
});

function renderReceptors() {
    kap.destroyAll("receptor");

    let spacing = 155;
    let yPos = 125;
    let xPosOpp = 175;
    let xPosPla = 955;
    
    if (settings.downscroll) {
    yPos = 1099 - 125;
    }
    let delay = songData.lanes;
    if (songData.lanes === 4) {
    if (settings.midscroll) {
    xPosPla = (1595  / 2 ) - (spacing * 1.5);
        delay = 0;
        }
        if (!settings.midscroll) {
            for (let index = 0; index < 4; index++) {
                const x = xPosOpp + (index * spacing);

                const r = kap.add([
                    kap.sprite(`receptor_${index}`, { anim: "idle" }),
                    kap.pos(x, yPos),
                    kap.anchor("center"),
                    kap.opacity(0),
                    kap.fixed(),
                    kap.z(50),
                    "receptor",
                    "oppR"
                ]);
            kap.wait(index * 0.2, () => r.fadeIn(0.3));
            }
    }
                for (let index = 0; index < 4; index++) {
            const x = xPosPla + (index * spacing);

            const r = kap.add([
                kap.sprite(`receptor_${index}`, {anim: "idle"}),
                kap.pos(x, yPos),
                kap.anchor("center"),
                kap.opacity(0),
                kap.fixed(),
                kap.z(50),
                "receptor",
                "plaR"
            ]);
            kap.wait((index + delay) * 0.2, () => r.fadeIn(0.3));
        }
    }
    if (songData.lanes === 6) {
        // modders add stuff here or change it to 6 or 8k. i would also suggest changing the sprite direction
        // to maybe something like 6k-receptor-${index}. keep in mind it'd be the name not the src
    }
    //
}

function spawnNote(n, mustHit) {
    const time = n[0];
    const lane = n[1];
    const length = n[2];
    const type = n[3] || 0;
    const target = n[4] || 0;

    let spacing = 155;
    let posX = 175;
    if (mustHit) {
        posX = 955;
        if (settings.midscroll) {
            posX = (1595 / 2) - (spacing * 1.5);
        }
    }
    const x = posX + (lane * spacing);
    let y = 1099 + 200;
    let anchor = "top";
    if (settings.downscroll) {
        anchor = "bot";
        y = -200;
    }
    let sprite = `arrow_${lane}`;
    if (type === 1) {
        sprite = `arrow-poison_${lane}`;
    }
    let opacity = 1;
    if (settings.midscroll && !mustHit) {
        opacity = 0;
    }
    const note = kap.add([
        kap.sprite(sprite),
        kap.pos(x, y),
        kap.anchor("center"),
        kap.fixed(),
        kap.z(52),
        kap.opacity(opacity),
        "note",
        "head",
        {
            time: time,
            lane: lane,
            length: length,
            type: type,
            target: target,
            mustHit: mustHit
        }
    ]);
    if (length > 0) {
        let height = length * 0.3 * songData.scrollSpeed;
        let endY = y + height;
        if (settings.downscroll) {
            endY = y - height;
        }
        const body = kap.add([
            kap.sprite(`body_${lane}`, { width: 50, height: height }),
            kap.pos(x, y),
            kap.anchor(anchor),
            kap.fixed(),
            kap.z(51),
            kap.opacity(opacity),
            "body",
            "note",
            {
                time: time,
                lane: lane,
                length: length,
                type: type,
                target: target,
                mustHit: mustHit,
                parent: note
            }
        ]);
        const end = kap.add([
            kap.sprite(`end_${lane}`, { flipY: settings.downscroll }),
            kap.pos(x, endY),
            kap.anchor(anchor),
            kap.fixed(),
            kap.z(51),
            kap.opacity(opacity),
            "end",
            "note",
            {
                time: time,
                lane: lane,
                length: length,
                type: type,
                target: target,
                mustHit: mustHit,
                parent: note
            }
        ]);
        note.body = body;
        note.end = end;
        body.end = end;
    }
    //
}

let FNFplayer = null;
let FNFplayer2 = null;
let FNFopponent = null;
let FNFopponent2 = null;
let FNFspeaker = null;

function renderFNFSprite() {
    kap.destroyAll("FNFChar");
    FNFplayer = null;
    FNFplayer2 = null;
    FNFopponent = null;
    FNFopponent2 = null;
    FNFspeaker = null;
        FNFplayer = kap.add([
            kap.sprite(songData.player, { anim: "idle", animSpeed: songData.bpm / 576 }),
            kap.pos(songData.playerPosition),
            kap.scale(charData[songData.player].scale),
            kap.z(10),
            "checkBPM",
            "FNFChar",
            { holdTimer: 0 }
        ]);
    if (songData.opponent) {
        FNFopponent = kap.add([
            kap.sprite(songData.opponent, { anim: "idle", animSpeed: songData.bpm / 576 }),
            kap.pos(songData.opponentPosition),
            kap.scale(charData[songData.opponent].scale),
            kap.z(10),
            "checkBPM",
            "FNFChar",
            { holdTimer: 0 }
        ]);
    }
    if (songData.speaker) {
        FNFspeaker = kap.add([
            kap.sprite(songData.speaker, { anim: "idle", animSpeed: songData.bpm / 576 }),
            kap.pos(songData.speakerPosition),
            kap.scale(charData[songData.speaker].scale),
            kap.z(9),
            "checkBPM",
            "FNFChar",
            { holdTimer: 0 }
        ]);
    }
    if (songData.player2) {
    FNFplayer2 = kap.add([
            kap.sprite(songData.player2, { anim: "idle", animSpeed: songData.bpm / 576 }),
            kap.pos(songData.player2Position),
            kap.scale(charData[songData.player2].scale),
            kap.z(10),
            "checkBPM",
            "FNFChar",
            { holdTimer: 0 }
        ]);
    }
    if (songData.opponent2) {
        FNFopponent2 = kap.add([
            kap.sprite(songData.opponent2, { anim: "idle", animSpeed: songData.bpm / 576 }),
            kap.pos(songData.opponent2Position),
            kap.scale(charData[songData.opponent2].scale),
            kap.z(10),
            "checkBPM",
            "FNFChar",
            { holdTimer: 0 }
        ]);
    }
}

function renderFNFBg() {
    songData.stageLayers.forEach(l => {
        const layerSrc = getAsset(`assets/fnf/${songData.week}/${l.src}`);
        let options = {};
        if (l.type === "animated") {
            options = { anim: "idle", animSpeed: songData.bpm / 576};
        }
        const layer = kap.add([
            kap.sprite(layerSrc, options),
            kap.pos(l.x, l.y),
            kap.z(l.zIndex)
            ]);
        if (l.type === "animated") {
            layer.tag("checkBPM");
        }
    });
}

function getDirection(lane) {
    if (songData.lanes === 4) {
        return direction4K[lane];
    }
    if (songData.lanes === 6) {
        return direction6K[lane];
    }
}

function getPage(animation, charId, char) {
    let pages = charData[charId].pages;
    for (let index = 0; index < pages.length; index++) {
        char.sprite = pages[index];
        if (char.hasAnim(animation)) {
            return pages[index];
        }
    }
}
    
function animate(char, charId, animation, hold = 0) {
    if (!char) return;
    char.sprite = getPage(animation, charId, char);
    char.holdTimer = hold;
    
    if (animation === "idle") {
        char.animSpeed = songData.bpm / 576;
        char.tag("checkBPM");
        char.play("idle", { loop: true });
        return;
    }

    char.untag("checkBPM");
    char.animSpeed = 1;

    if (animation === "gameover-idle") {
        char.play("gameover-idle", {loop: true});
        return;
    }
    if (animation === "gameover-start") {
        char.play("gameover-start", {
            onEnd: () => animate(char, charId, "gameover-idle"),
        });
        return;
    }
    if (animation === "gameover-end") {
        char.play("gameover-end");
        return;
    }
    if (animation === "hit-left" || animation === "hit-right" || animation === "hit-up" || animation === "hit-down") {
        char.play(animation);
        return;
    }
    if (animation === "miss-left" || animation === "miss-right" || animation === "miss-up" || animation === "miss-down") {
    }
    char.play(animation, {
        onEnd: () => {
            animate(char, charId, "idle");
        },
    });
}

kap.onUpdate("FNFChar", (character) => {
    if (character.holdTimer > 0) {
        character.holdTimer -= kap.dt();
        if (character.holdTimer <= 0) {
            character.holdTimer = 0;
            if (character === FNFplayer && heldKeys.size === 0) {
                animate(character, songData.player, "idle");
            }
            if (character === FNFopponent) {
                animate(character, songData.opponent, "idle");
            }
            if (character === FNFplayer2 && heldKeys.size === 0) {
                animate(character, songData.player2, "idle");
            }
            if (character === FNFopponent2) {
                animate(character, songData.opponent2, "idle");
            }
            if (character === FNFspeaker) {
                animate(character, songData.speaker, "idle");
            }
        }
    }
});

function animateReceptor(tag, lane, anim) {
    let recept = kap.get(tag);
    for (let index = 0; index < recept.length; index++) {
        let receptor = recept[index];
        if (receptor.lane === lane) {
            if (tag === "oppR" && anim === "hit") {
                receptor.play(anim, {
                    onEnd: () => {
                        receptor.play("idle");
                    },
                });
            } else {
            receptor.play(anim);
        }
    }
    }
}

function setCamera() {
    let startZoom = songData.cameraZoom;
    kap.setCamScale(kap.vec2(startZoom, startZoom));
    let halfW = (kap.width() / 2) / startZoom;
    let halfH = (kap.height() / 2) / startZoom;
    let startX = kap.clamp(songData.cameraX, halfW, Math.max(halfW, maxBgWidth - halfW));
    let startY = kap.clamp(songData.cameraY, halfH, Math.max(halfH, maxBgHeight - halfH));
    kap.setCamPos(kap.vec2(startX, startY));
    targetX = startX;
    targetY = startY; 
    zoom = startZoom;
}

// im making this the onUpdate that has FNF game loop stuff

kap.onUpdate(() => {
if (!inSong) return;
    let time = inst.time() * 1000;
    updateCamera(targetX, targetY, zoom, zoomSpeed, lerpSpeed);
    handleEvent(time);
    checkAudio(time);
    for (let index = 0; index < songData.playerNotes.length; index++) {
        let note = songData.playerNotes[index];
        if (!note.spawned && note.time < time + 2000) {
        spawnNote(note, true);
        note.spawned = true;
        }
    }
    for (let index = 0; index < songData.opponentNotes.length; index++) {
        let note = songData.opponentNotes[index];
        if (!note.spawned && note.time < time + 2000) {
        spawnNote(note, false);
        note.spawned = true;
        }
    }
});

function updateCamera(targetX, targetY, zoom = 1, zoomSpeed = 3, lerpSpeed = 3) {
    let pos = kap.getCamPos();
    let scale = kap.getCamScale();
    let targetScale = kap.vec2(zoom, zoom);
    let newScale = scale.lerp(targetScale, zoomSpeed * kap.dt());
    kap.setCamScale(newScale);
    
    let halfW = (kap.width() / 2) / newScale.x;
    let halfH = (kap.height() / 2) / newScale.y;
    let targetPos = kap.vec2(targetX, targetY);
    let newPos = pos.lerp(targetPos, lerpSpeed * kap.dt());
    
    newPos.x = kap.clamp(newPos.x, halfW, Math.max(halfW, maxBgWidth - halfW));
    newPos.y = kap.clamp(newPos.y, halfH, Math.max(halfH, maxBgHeight - halfH));
    kap.setCamPos(newPos);
}
kap.onUpdate("head", (note) => {
    if (!inSong) return;
    let diff = note.time - (inst.time() * 1000);
    if (settings.downscroll) {
    note.pos.y = 974 - (diff * 0.3 * songData.scrollSpeed);
    }
    if (!settings.downscroll) {
    note.pos.y = 125 + (diff * 0.3 * songData.scrollSpeed);
    }
    if (diff < -timing.shit && note.mustHit) {
        let missPath = `miss-${getDirection(note.lane)}`;
        kap.destroy(note.end);
        kap.destroy(note.body);
        kap.destroy(note);
        handleHit("miss");
        // anim player later
    }
    let path = `hit-${getDirection(note.lane)}`;
    if (diff <= 0 && !note.mustHit) {
        kap.destroy(note);
        animateReceptor("oppR", note.lane, "hit");
        if (note.length === 0) {
        if (note.target === 0) {
            animate(FNFopponent, songData.opponent, path, 0.35);
        }
        if (note.target === 1) {
            animate(FNFopponent2, songData.opponent2, path, 0.35);
        }
        }
    }
});

const allowedRelease = 500;

kap.onUpdate("body", (note) => {
if (!inSong) return;
    let time = inst.time() * 1000;
    let diff = note.time - time;
    let strumline = 125;
    let bodyTime = (note.time + note.length) - time;
    if (settings.downscroll) {
        strumline = 974;
    }
    if (diff > 0) {
        if (settings.downscroll) {
            note.pos.y = strumline - (diff * 0.3 * songData.scrollSpeed);
        } 
        if (!settings.downscroll) {
            note.pos.y = strumline + (diff * 0.3 * songData.scrollSpeed);
        }
        return;
    }
    if (!note.mustHit) {
        handleSustain(note);
        note.pos.y = strumline;
        note.height = Math.max(0, bodyTime * 0.3 * songData.scrollSpeed);
        if (bodyTime <= 0) {
            animateReceptor("oppR", note.lane, "idle");
            kap.destroy(note);
        }
    }
    if (note.mustHit) {
        if (heldKeys.has(note.lane) || bodyTime <= allowedRelease) {
            handleSustain(note);
            note.pos.y = strumline;
            note.height = Math.max(0, bodyTime * 0.3 * songData.scrollSpeed);
        }
        if (!heldKeys.has(note.lane) && bodyTime > allowedRelease && !note.missed) {
            kap.destroy(note.end);
            kap.destroy(note);
            note.missed = true;
            handleHit("miss");
                let missPath = `miss-${getDirection(note.lane)}`;
                if (note.target === 0) animate(FNFplayer, songData.player, missPath, 0.5);
                if (note.target === 1) animate(FNFplayer2, songData.player2, missPath, 0.5);
        }
        if (bodyTime <= 0) {
            if (heldKeys.has(note.lane)) {
                animateReceptor("plaR", note.lane, "press");
            }
            kap.destroy(note);
        }
    }
});

function handleSustain(note) {
    if (note.handled) return;
    note.handled = true;
    if (!note.mustHit) {
    animateReceptor("oppR", note.lane, "hold");
    let path = `hit-${getDirection(note.lane)}`;
        if (note.target === 0) animate(FNFopponent, songData.opponent, path, note.length/1000);
        if (note.target === 1) animate(FNFopponent2, songData.opponent2, path, note.length/1000);
    }
    if (note.mustHit) {
        animateReceptor("plaR", note.lane, "hold");
        let path = `hit-${getDirection(note.lane)}`;
            if (note.target === 0) animate(FNFplayer, songData.player, path, note.length/1000);
            if (note.target === 1) animate(FNFplayer2, songData.player2, path, note.length/1000);
    }
}

kap.onUpdate("end", (note) => {
    if (!inSong) return;
    let body = note.parent.body;
    let time = inst.time() * 1000;
    let strumline = 125;
    if (settings.downscroll) {
        strumline = 974;
    }
    if (settings.downscroll) {
        note.pos.y = body.pos.y - body.height;
    }
    if (!settings.downscroll) {
        note.pos.y = body.pos.y + body.height;
    }
    if (settings.downscroll && note.pos.y >= strumline) {
        note.pos.y = strumline;
        note.height = Math.max(0, note.height - (0.3 * songData.scrollSpeed * kap.dt() * 1000));
    }
    if (!settings.downscroll && note.pos.y <= strumline) {
        note.pos.y = strumline;
        note.height = Math.max(0, note.height - (0.3 * songData.scrollSpeed * kap.dt() * 1000));
    }
});

kap.onUpdate("invis", (note) => {
    const length = 1099 - 100;
    let distance = 0;
    let strumline = 0;
    if (settings.downscroll) {
        strumline = 1099 - 125;
        distance = strumline - note.pos.y;
    }
    if (!settings.downscroll) {
        strumline = 125;
        distance = note.pos.y - strumline;
    }
    let opacity = Math.max(0, distance/length);
    note.opacity = opacity;
});

function handleEvent(time) {
    if (!songData.events) return;
    for (let index = 0; index < songData.events.length; index++) {
        let event = songData.events[index];
        if (!event.happened && time >= event.time) {
            event.happened = true;
            if (event.type === "animation") {
            }
            if (event.type === "hpDrain") {
                hpDraining = true;
            }
            if (event.type === "camera") {
            }
            if (event.type === "BPMChange") {
                changeBPM(event.bpm);
            }
            //
        }
    }
}

let baseBpm = 0;

function changeBPM(bpm) {
    songData.bpm = bpm;
    kap.get("checkBPM").forEach(a => {
        a.animSpeed = songData.bpm / 576;
    });
}

function spawnSplash(lane) {
    if (songData.lanes === 4) {
        const spacing = 155;
        let x = 955;
        let y = 125;
        if (settings.downscroll) {
            y = 1099 - 125;
        }
        if (settings.midscroll) {
            x = (1595 / 2) - (spacing * 1.5);
        }
        let index = lane * spacing;
        const splash = add([
        sprite("splashes", { anim: lane }),
        pos(x + index, y),
        anchor("center"),
    ]);
    splash.onAnimEnd(() => destroy(splash));
    }
}

function spawnRating(rating) {
    alert("Empty function | spawnRating");
}

function spawnCombo(combo) {
    alert("Empty function | spawnCombo");
}

// things charData should do: contain icon src and name eg "neutral" "losing" "winning" "special", triggering special icons could be modded here
// contain pages of spritesheets, character scale, idk what else is that it colored hp
// i think a good idea would also be "group" to combine stuff like "bf" "bf-christmas" "bf-holding-gf" idk what theyre actually called, for stuff like death anim
// or pause and game over src but also i could just repeat them over in them

let hpbar = null;
let plaBar = null;
let oppBar = null;
let plaIcon = null;
let oppIcon = null;

function renderHealthbar() {
    let y = 0;
    if (settings.downscroll) {
        y = 1099 - 980;
    }
    if (!settings.downscroll) {
        y = 980;
    }
    if (hpbar) {
        kap.destroy(hpbar);
        hpbar = null;
    }
    if (plaBar) {
        kap.destroy(plaBar);
        plaBar = null;
    }
    if (oppBar) {
        kap.destroy(oppBar);
        oppBar = null;
    }
    let bar = getAsset(`assets/fnf/ui/healthbar/healthbar.png`);
    let pColor = charData[songData.player].color;
    let oColor = charData[songData.opponent].color;
     hpbar = kap.add([
                kap.sprite(bar),
                kap.pos(797, y),
                kap.anchor("center"),
                kap.fixed(),
                kap.z(70),
            ]);
    // add stuff here idk man i gotta search stuff up also hp bar width is 930 black part width is 7 inside is 916px
}

function updateHealthbar() {
    alert("Empty function | updateHealthbar");
}

setTimeout(() => {
    loadDialogue("test");
}, 10000);

