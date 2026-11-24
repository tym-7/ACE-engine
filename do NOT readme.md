This is my javascript Friday Night Funkin' engine, ACE Engine (Aloe's Cool Engine), in use for my mod FNF: Dark Minds. I don't expect anyone else to try to use this engine, but feel free to use! I'll likely make a guide of how to use it once it's finished

# Permissions:
- I give permission for anyone to use my au characters / my Dark  variants of the characters for their own mods, just let me know first <br>
- twitter & tumblr @theyaoimachine <br>
- Mod the fuck out of my engine, reuse my code for a different project of yours, I don't care <br>
- You may use any art assets made by me (rn all art assets are 100% made by me) for your own mod for whatever reason (eg it looks cool, need a placeholder), just give credit if it ends up in the final version/public

# Modding Guide:
Inventory, credits, flags, and shaders are located within the data folder while meters are in the raw code. You are more likely to find game specific data you want to modify in their respective folder in assets (eg songs, dialogue, freeplay) instead of data
## For Non Coders:
each value must be wrapped in double quotes (") unless it's a number or true/false <br>
use single quotes inside text for this reason eg "text": "I want to 'quote' this" <br>
do not have commas at the end of arrays for example: <br>
[ <br>
{ <br>
"speaker": "Pico", <br>
"text": "default", <br>
"mood": "neutral" <br>
} <br>
] <br>

if you were to add another piece of dialogue, you would add a comma on the } "}," and let the new last piece of dialogue end without a comma <br>
the first and last character should be a [ and ] add stuff within it <br>
keep things lowercase when entering the first value (eg "speaker" "mood" "style", they are NOT "Speaker" "Mood" "Style") as that's how they are accepted (for multiple word ones they are accepted as "hasFlag", "spriteShader"
## Visual Novel
All Values: <br>
* [Id](#id)
* [Speaker](#speaker)
* [Char](#char)
* [Mood](#mood)
* [Position](#position)
* [Text](#text)
* [Translation](#translation)
* [Style](#style)
* [Speed](#speed)
* [Muted](#muted)
* [Effect](#effect)
* [Background](#background)
* [SpriteShader](#spriteshader)
* [BgShader](#bgshader)
* [ScreenShader](#screenshader)
* [Ambience](#ambience)
* [Track](#track)
* [Triggers](#triggers)
* [HasFlag](#hasflag)
* [HasNoFlag](#hasnoflag)
* [Next](#next)
* [Branches](#branches)
* [GameOver](#gameover)
* [NewChapter](#newchapter)
* [Choices](#choices)
* [Other Features](#other-features)
### Id
allows the player to save if they get to a line with an id, without it, only scene autosaving and chapter autosaving works, as linesaving & manual saving grabs the id of the current line
### Speaker
the visual display name
### Char
the internal id to pull sprites from + their blip sfx. folder pathing = “assets/vn/sprites/${char}/${mood}.png”. <br>
blip sfx and data are found in assets/vn/sfx/blips
### Mood
changes which sprite is used. folder pathing = “assets/vn/sprites/${char}/${mood}.png”
### Position
 puts the sprite somewhere on the box. accepts “left” “center” “right”. if you don’t like those options, (maybe you wanna put a sprite in the air or something idk) add a custom one in renderVNSprite()
### Text
what the character says. to leave the box empty, write "text": "null" with quotes around null.
### Translation
for if a character speaks in a language other than english for a moment. translated text is displayed in a different box when settings are enabled & a line has a translation
### Style
modifies the box. currently modifies color, border color, box overlay, and the speaker container (referred to as tag/speaker tag). for a custom overlay, folder pathing = “assets/ui/images/{style}-overlay.png”. recommended overlay size is 1190x240. for adding new styles or wanting a style to modify new things (eg font), go to renderBox()
### Speed
modifies how fast or slow a line is spoken. used on a 1.1x 0.9x 1x 0.5x 1.5x scale (1.1x = faster 0.9x = slower) any number values accepted
### Muted
mutes the blips for the line (for if you want just a sfx to play, a moment of silence, etc). write as true/false (they are defaulted to false so there's no need to specify false)
### Effect
modifies how the text is rendered. current effects: "shaky"
### Background
changes the background. folder pathing = “assets/vn/backgrounds/${background}.png”
### SpriteShader
i need to learn shaders
### BgShader
yeah
### ScreenShader
yeah
### Ambience
plays music on loop. pathing = "assets/vn/sounds/${ambience}". -mp3 not included, so .wav .ogg, etc, any type are also accepted
### Track
plays music on loop. identical to ambience. ambience is supposed to be used as like background noise like chatter, traffic, but you can use in track too, track is supposed to be music one would actually listen to, playing in the background
### Triggers
small things to spice up dialogue. just like branches, it requires an array, looking for "type" "when" and other values. "when" requires a stated time, either "start" or "finish". the event will either trigger at the start of the dialogue, or when they finish speaking.<br>
current triggers: sfx, silence, animation, addItem, removeItem <br>
sfx requires a "value" which is the src of the sfx you want to play. folder pathing = "" <br>
silence mutes both ambience and track if they are playing. requires no other values <br>
addItem adds an item. requires "value" which is the item name, and "amount" the amount <br>
removeItem removes an item. requires "value" which is the item name, and "amount". amount should be a positive number <br>
animation animates the dialogue sprite. requires "animation" i might change it to "value" later, and "loop". example: "animation": "wave", "loop": true
example: <br>
"triggers": [ <br>
{ "type": "sfx", "when": "start", "value": "assets/vn/sfx/gunshot.mp3" }, <br>
{ "type": "silence", "when": "finish" }, <br>
{ "type": "removeItem", "when": "start", "value": "bullet", "amount": 1 } <br>
] <br>
### HasFlag
shows the line if the player has the flag. usage “hasFlag”: “didSomething”
### HasNoFlag
shows the line if the player does not have the flag. usage “hasNoFlag”: “didSomething”
### Next
brings the player to the next scene. folder pathing = “assets/vn/dialogue/${scene}.json” add folders to the name if needed, eg “next”: “week1/coffee-scene”. use for end of chapters, otherwise use branching or choices for dynamic paths
### Branches
like next, but more dynamic. does not show anything on screen, it is purely internal. requires an array. parameters: “type”: flag/meter/inv/fallback. if flag, the values “needed”, “value”, and “scene” are required. needed must be either true or false, if marked as false and the player does not have the flag, they are transported there. if meter, the values “min” “max” “value” and “scene” are needed. min and max includes the number itself. if inv, it can either work like flag or meter, using needed or min/max. <br>
finally, fallback sends the player to the scene if all else fails. the function works top to bottom, so it must be placed last, it's suggested to put the important/special scenes first and the more basic ones after. scene folder pathing continues to be "assets/vn/dialogue/${scene}.json" <br>
example: <br>
"branches": [<br>
    { "type": "flag", “value”: “didX”, "needed": true, "scene": "scene1" },<br>
    { "type": "meter", “value”: “love”, "min": 30, "max": 40, "scene": "scene2" },<br>
    { "type": "inv", “value”: “gun”, "needed": true, "scene": "scene3" },<br>
    { "type": "inv", “value”: “coins”, "min": 20, "max": 100, "scene": "scene4" },<br>
    { "type": "fallback", "scene": "scene5"} <br>
  ]<br>
### GameOver
shows the gameover screen after the player presses enter during the line. accepted as true/false
### NewChapter
increases the current chapter by 1. just does currentChapter++. mark only once in a dialogue array, as true, preferably the very top
### Choices
shows options on screen for players to choose from. before having the options array, the values for choices are "when" "timer" and "onEnd". "when" decides the choices should be seen, either as "start", at the beginning, or on "finish", when the text finishes typing. if a timer is included, "onEnd" is required to decide the action when the timer is done. timers use ms, so 1.5s = 1500, you would write "timer": 1500, after 1.5s of not pressing an option, onEnd will fire. you would write an "onEnd" the same way as onClick in an option, so we'll get to that later. <br>
options: <br>
values are "text" "condition" "conditionvalue" "onClick" "delay" "min" "max" "style" <br>
onClick / onEnd: <br>
values are "sfx" "item" "itemvalue" "flag" "flagvalue" "meter" "metervalue" "custom" "gameOver" and "scene". this is the exception to my naming rule, i just felt like it to write value lowercase. for sfx, you would write "sfx": "audio.mp3" CHANGING THE AUDIO PATHING EDIT LATER. for item, you would write "item": "coins", "itemvalue": 5. item value can be negative. for flags, you would write "flag": "killedBoss", "flagvalue": true. for meters, you would write "meter": "love", "metervalue": 5. for scene, the pathing follows just like branches or next. "scene": "castle". if you want an immediate game over, set "gameOver": true. for delayed game over, just set the scene to something like "badending" and a few lines later have "gameOver": true on the base level. make your own custom logic in customChoice()<br>
choices are far more complex than branches or triggers written out<br>
example: <br>
### Other Features
Removing Items<br>
(Only accepted in triggers, likely adding support in choices later) You can pass "all" as an amount in trigger type "removeItem" instead of something like 9999 to remove the player's items. If an item goes below 0, it gets capped at 0.<br>
Hybrids<br>
If you were looking into choices or branches wishing multiple types of conditions could be accepted to build better customization, set the type to flag, add a new flag, and head over to checkHybrid() to add whatever conditions you wish to have, example: gameFlags.trusted = (meters.trust > 50 && gameFlags.killedBoss && inventory.get("key") > 0).<br>

## Point And Click
Engine Not Finished Yet
## FNF
In progress

Chart Data:

Sprite Data:

# Assets Used:
- add things here when i need to credit people for using their assets
