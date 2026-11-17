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

async function addCharacterData() {
    const r = await fetch('assets/fnf/sprites/characters.json');
    const data = await r.json();
    charData = data;
}

//addCharacterData();

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
        translation: line.translation || '',
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
    pico: "assets/vn/sfx/blips/pixelText.mp3",
    default: "assets/vn/sfx/blips/pixelText.mp3"
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

    if (currentLine.translation && settings.translate) {
        translateText();
    }
    
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

    if (currentLine.next) {
        nextScene = currentLine.next;
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

function translateText() {
    const transBox = document.getElementById("translation-box");
    transBox.innerHTML = currentLine.translation;
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
    const currentCount = inventory.get(item) || 0;
    inventory.set(item, currentCount - amount);
}
// i would add a check so that it cant go under 0 but im too stupid and lazy for that
// ngl it shouldnt realistically happen like for example
// if i wrote you buy something with 5 coins, it wouldve only decreased it if u had over 5 anyway


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
        VNBg.use(kap.shader(currentLine.bgShader));
    } else {
        VNBG.unuse("shader");
    }
    //
}

function renderVNUI() {
    // render the tag and the bg box here cuz they use images too okay now just the tag

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
function handleDialogue() {
    const enter = getAsset(`assets/vn/sfx/blips/textboxClick.mp3`);
    if (typeId) {
        finishTyping();
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

let songData = null;


function handleHit(rating) {
    if (rating === "sick") {
        if (settings.hardMode) {
            hp = Math.min(maxHP, hp + 1);
            score += 500;
        }
        if (!settings.hardMode) {
            hp = Math.min(maxHP, hp + 5);
            score += 350;
        }
        combo++;
        sick++;
    }
    if (rating === "good") {
        if (settings.hardMode) {
            hp = Math.max(0, hp - 5);
            score += 0;
        }
        if (!settings.hardMode) {
            hp = Math.min(maxHp, hp + 2);
            score += 200;
        }
        good++;
        combo++;
    }
    if (rating === "bad") {
        if (settings.hardMode) {
            hp = Math.max(0, hp - 10);
            score -= 150;
            combo = 0;
        }
        if (!settings.hardMode) {
            hp = Math.max(0, hp + 0);
            score += 100;
            combo++;
        }
        bad++;
    }
    if (rating === "shit") {
        if (settings.hardMode) {
            hp = Math.max(0, hp - 15);
            score -= 300;
        }
        if (!settings.hardMode) {
            hp = Math.max(0, hp + 0);
            score += 50;
        }
        shit++;
        combo = 0;
    }
    //
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

function resetScore() {
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
        opponentPosition: { ...data.opponentPosition },
        opponent2Position: { ...data.opponent2Position },
        playerPosition: { ...data.playerPosition },
        player2Position: { ...data.player2Position },
        speakerPosition: { ...data.speakerPosition },
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

async function startSong(song, difficulty) {
    await loadSong(song, difficulty);
    resetScore();
}

function playCutscene(src, finished) {
    const cutscene = document.getElementById("cutscene");
    cutscene.style.display = "block";
    cutscene.src = src;
    cutscene.play();
    cutscene.onended = () => {
        cutscene.style.display = "none";
        if (finished) finished();
    };
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
            kap.z(10),
            "checkBPM",
            "FNFChar",
            { holdTimer: 0 }
        ]);
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

function animate(char, charId, animation) {
    // figure out how to look up pages from charData
    // do animation things here
}

function changeBPM(bpm) {
    songData.bpm = bpm;
    kap.get("checkBPM").forEach(a => {
        a.animSpeed = songData.bpm / 576;
    });
}
