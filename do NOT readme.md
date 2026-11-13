This is my javascript Friday Night Funkin' engine, ACE Engine (Aloe's Cool Engine), in use for my mod FNF: Dark Minds. I don't expect anyone else to try to use this engine, but feel free to use! I'll likely make a guide of how to use it once it's finished

# Permissions:
- I give permission for anyone to use my au characters / my Dark  variants of the characters for their own mods, just ask me first <br>
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
keep things lowercase when entering the first value (eg "speaker" "mood" "style") as that's how they are accepted (for multiple word ones they are accepted as "hasFlag", "spriteShader"
## Visual Novel
All Values: <br>
* [Id](#id)
* [Speaker](#speaker)
* [Char](#char)
* [Mood](#mood)
* [Position](#position)
* [Text](#text)
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
* [NewChapter](#newchapter)
* [Choices](#choices)
### Id
allows the player to save if they get to a line with an id, without it, only scene autosaving and chapter autosaving works, as linesaving & manual saving grabs the id of the current line
### Speaker
the visual display name
### Char
the internal id to pull sprites from + their blip sfx. folder pathing = “assets/vn/sprites/${char}/${mood}.png”. 
### Mood
changes which sprite is used. folder pathing = “assets/vn/sprites/${char}/${mood}.png”
### Position
 puts the sprite somewhere on the box. accepts “left” “center” “right”. if you don’t like those options, (maybe you wanna put a sprite in the air or something idk) add a custom one in renderVNSprite()
### Text
what the character says
### Style
modifies the box. currently modifies color, border color, box overlay, and the speaker container (referred to as tag/speaker tag). for a custom overlay, folder pathing = “assets/ui/images/{style}-overlay.png”. recommended overlay size is 1200x250. for adding new styles or wanting a style to modify new things (eg font), go to renderBox()
### Speed
modifies how fast or slow a line is spoken. used on a 1.1x 0.9x 1x 0.5x 1.5x scale (1.1x = faster 0.9x = slower) any number values accepted
### Muted
mutes the blips for the line (for if you want just a sfx to play, a moment of silence, etc)
### Effect
modifies how the text is rendered. current effects: none add some later
### Background
changes the background. folder pathing = “assets/vn/backgrounds/${background}.png”
### SpriteShader
i need to learn shaders
### BgShader
yeah
### ScreenShader
yeah
### Ambience
NOT ADDED
### Track
NOT ADDED
### Triggers
NOT ADDED
### HasFlag
shows the line if the player has the flag. usage “hasFlag”: “didSomething”
### HasNoFlag
shows the line if the player does not have the flag. usage “hasNoFlag”: “didSomething”
### Next
brings the player to the next scene. folder pathing = “assets/vn/dialogue/${scene}.json” add folders to the name if needed, eg “next”: “week1/coffee-scene”. use for end of chapters, otherwise use branching or choices for dynamic paths
### Branches
like next, but more dynamic. does not show anything on screen, it is purely internal. requires an array. parameters: “type”: flag/meter/inv. if flag, the values “needed”, “value”, and “scene” are required. needed must be either true or false, if marked as false and the player does not have the flag, they are transported there. if meter, the values “min” “max” “value” and “scene” are needed. min and max includes the number itself. if inv, i didn’t program that yet. <br>
example: <br>
"branches": [<br>
    { "type": "flag", “value”: “didX”, "needed": true, "scene": "scene1" },<br>
    { "type": "meter", “value”: “love”: "min": 30, "max": 40, "scene": "scene2" },<br>
    { "type": "inv", “value”: “gun” FIGURE OUT "scene": "scene3" }<br>
  ]<br>
### NewChapter
increases the current chapter by 1. just does currentChapter++. mark only once in a dialogue array, preferably the very top
### Choices
NOT ADDED

## Point And Click
Engine Not Finished Yet
## FNF
Engine Not Finished Yet
# Assets Used:
- add things here when i need to credit people for using their assets
