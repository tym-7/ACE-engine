# 2026-11-11  [v0.0.0-build.1]
- Redid a lot of the folder pathing
- Reworked the old function that sorted out line data "getLine()"
# 2026-11-13  [v0.0.0-build.2]
- Added a lot of functions back into the visual novel side of the engine
- Reworked how branches worked from the old
- Added being able to use shaders on sprites
- Changed how images render (now using kaplay's functions)
# 2026-11-15  [v0.0.0-build.3]
- Added translation feature
# 2026-11-16 [v0.0.0-build.4]
Finally keeping 100% track of all features being added
- instant dialogue speed now calls finishTyping() before it calls type(), preventing an issue where it would've typed a character, than finish
- blip pathing now pulls from the correct folder
- blips now use kaplay's audio play system
- sfx now plays when advancing dialogue
- beginning to work on the rewrite for the FNF engine
    - hit handling (haven't transported the keydown logic to target lane & closest notes, just hp, timing score, etc)
    - timing depending on difficulty
    - song json loading
    - different folder pathing
    - ability to bpm change
    - bg rendering
    - sprite rendering <br>
    
Developer's Note (aloev): I remember seeing a twitter post a while ago, something about the topic of FNF being too easy / not much mods ever doing anything with the HP or timing itself; most just adding difficulty via mechanics so I got the idea of a hard mode. As you know, for 90% to 99% of mods, you can beat any song with some level of skill; hell, I was able to beat Blazin' as a complete, utter dogshit noob when I first played the game in early 2026 after 10+ attempts, and now I can FC it easily—point is, I'd like to bring some real challenge in (well it's a setting so it's kinda optional) where you genuinely just have to be good and makes you feel like you're playing a rhythm game for the first time again. <br>

(engine max hp = 200 starting 100) <br>
normal: <br>
sick 45ms +5 hp <br>
good 90ms +2 hp <br>
bad 135ms +0 hp <br>
shit 166ms +0 hp <br>

hard: <br>
sick 30ms +1 hp <br>
good 60ms -5 hp <br>
bad 90 ms -10 hp <br>
shit 166ms -15 hp <br>
