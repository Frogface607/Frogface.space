# Mega-batch generator - frogface.space world assets (ASCII-only for PS5.1)
# Aesthetic: cartoonish painterly, calm muted, atmospheric fantasy swamp-city (Zootopia vibe).
# Style anchored by character sheets (also keeps the frog consistent in hero shots).
# Runs in waves of parallel jobs. Outputs to refs/mega-batch/<folder>/<name>.png

$hf = "$env:APPDATA\npm\node_modules\@higgsfield\cli\vendor\hf.exe"
$charV2 = "73e0ba05-0768-4645-afda-b63197fceaf4"
$pose   = "32a45125-2abc-493c-8900-1488fabf7c98"
$root   = "D:\PROJECTS\FROGFACE-SPACE\refs\mega-batch"

$STYLE = "Outlined cartoonish painterly illustration, clean confident linework, cozy atmospheric fantasy swamp-city world - charming wooden huts and shops on stilts over calm water, Zootopia-like little town vibe. Cohesive CALM MUTED palette: soft mossy greens, warm browns, muted purples, gentle amber light. Evening mood, fireflies, soft mist. Cartoonish and charming, restrained. NOT busy, NOT over-detailed, NOT photorealistic, NOT oversaturated, NOT the over-detailed ChatGPT look."

$FROG = "the anthropomorphic green frog character from the reference sheets, in his signature black hoodie with frog mark, relaxed."

$items = @()
function Add-Item($name, $folder, $prompt, $aspect, $frog) {
  $script:items += [pscustomobject]@{ name=$name; folder=$folder; prompt=$prompt; aspect=$aspect; frog=$frog }
}

# ===== HERO (frog on bench looking at tower) - frog MUST be consistent =====
$heroBase = "Cinematic hero illustration: $FROG sits on a small wooden bench or pier at the edge of the swamp, seen from BEHIND in 3/4 back view, holding a coffee cup, gazing toward a distant glowing residential tower on the horizon. A cozy swamp town of stilted huts around. Sunset blending into starry evening sky. Upper area kept open for text. $STYLE"
Add-Item "hero-01" "hero" "$heroBase Wide framing, frog lower-left." "16:9" $true
Add-Item "hero-02" "hero" "$heroBase Frog slightly larger, intimate, tower glowing warm on the right." "16:9" $true
Add-Item "hero-03" "hero" "$heroBase Higher camera, more of the town visible, boardwalks leading toward the tower." "16:9" $true
Add-Item "hero-04" "hero" "$heroBase Deeper twilight, more stars, fireflies prominent, calmer." "16:9" $true
Add-Item "hero-05" "hero" "$heroBase Frog sits on a rock instead of a bench, reeds framing the foreground." "16:9" $true
Add-Item "hero-06" "hero" "$heroBase Warm golden-hour, pink clouds, hopeful." "16:9" $true
Add-Item "hero-07" "hero" "$heroBase Frog on a small dock with a lantern beside him." "16:9" $true
Add-Item "hero-08" "hero" "$heroBase Misty, moody, blue-purple evening, single warm tower beacon." "16:9" $true
Add-Item "hero-09" "hero" "$heroBase Portrait vertical composition for mobile, frog bottom, tower top." "9:16" $true
Add-Item "hero-10" "hero" "$heroBase Vertical mobile framing, cozy huts close, tower far." "9:16" $true
Add-Item "hero-11" "hero" "$heroBase Frog seen more from the side profile, contemplative, town behind." "16:9" $true
Add-Item "hero-12" "hero" "$heroBase Lower angle near the water, lilypads in foreground, tower reflected." "16:9" $true

# ===== EXTERIORS (buildings on stilts, no frog) =====
$extTail = "Single building hero subject on wooden stilts over swamp water, slight 3/4 angle, centered, soft mist at base. NO characters, NO frog in the scene. $STYLE"
Add-Item "edison-a" "exteriors" "A cozy BRICK live-music bar building, mostly solid brick facade with only a few small modest windows (NO big arched glass), simple hanging wooden EDISON sign, a door, warm light from windows, weathered authentic neighbourhood bar. $extTail" "4:3" $false
Add-Item "edison-b" "exteriors" "A brick-and-dark-wood music bar, two small storeys, a tiny stage door, EDISON sign, string lights, chimney, understated and cozy. $extTail" "4:3" $false
Add-Item "studio-a" "exteriors" "A small design and automation STUDIO workshop, wood and modest glass, one window with a desk and screens glowing inside, a subtle frog-mark sign, professional but cozy. $extTail" "4:3" $false
Add-Item "studio-b" "exteriors" "A compact creative STUDIO atelier, warm workshop vibe, tools and a drafting table glimpsed through the window, calm. $extTail" "4:3" $false
Add-Item "receptor-a" "exteriors" "A more serious modern TECH building, sleek dark wood and glass, a clean glowing RECEPTOR sign, dashboards faint through windows, a small antenna, impressive but part of the swamp town. $extTail" "4:3" $false
Add-Item "receptor-b" "exteriors" "A neat tech HQ on stilts, two storeys, glowing screens inside, RECEPTOR sign, modern but cozy, restrained. $extTail" "4:3" $false
Add-Item "shop-a" "exteriors" "A charming CLOTHING and merch SHOP building, hanging garments and t-shirts in the window, a small sign, fairy lights, boutique-on-stilts vibe, the brand METKA. $extTail" "4:3" $false
Add-Item "shop-b" "exteriors" "A cute streetwear SHOP, mannequins in the window, a painted sign, cozy retail charm. $extTail" "4:3" $false
Add-Item "burger-a" "exteriors" "A quirky UFO-themed BURGER joint building, a little flying-saucer shaped roof or sign, neon-ish but muted, fun fast-food-on-stilts, slightly run-down (frozen project), the place called NECHTO. $extTail" "4:3" $false
Add-Item "burger-b" "exteriors" "A small burger diner shack with a saucer sign, warm griddle glow inside, charming and a bit weathered. $extTail" "4:3" $false
Add-Item "graveyard-a" "exteriors" "A small spooky-but-gentle GRAVEYARD of failed projects - a few crooked wooden tombstones on a misty islet, faint glow, ironic and honest not depressing, the graveyard of fuckups. $extTail" "4:3" $false
Add-Item "graveyard-b" "exteriors" "A little ruined building or school of mistakes on a foggy mound, tombstones, lantern, melancholic charm. $extTail" "4:3" $false
Add-Item "gym-a" "exteriors" "A rugged GYM building on stilts, a barbell sign, a punching bag visible through the window, warm vibe, motivational and cozy. $extTail" "4:3" $false
Add-Item "lab-a" "exteriors" "A quirky LABORATORY sandbox building, bubbling colourful flasks faintly glowing through windows, antennae and pipes, mad-science-on-stilts but muted and cute. $extTail" "4:3" $false
Add-Item "music-a" "exteriors" "A small RECORDING STUDIO building, a music note sign, soundproof vibe, a glimpse of a mic and gear through the window, cozy. $extTail" "4:3" $false
Add-Item "hut-a" "exteriors" "A small modest cozy wooden HUT, one room, plank or thatch roof, a single warm window, a tiny frog flag on the roof, a little porch with a stool, humble but tasteful - a creative entrepreneur home, not a slum. $extTail" "4:3" $false
Add-Item "hut-b" "exteriors" "A cozy little hut with a lantern by the door, smoke from a small chimney, frog flag, warm and inviting. $extTail" "4:3" $false
Add-Item "filler-01" "exteriors" "A charming generic swamp-town house on stilts, warm window, plants on the porch, atmospheric filler building. $extTail" "4:3" $false
Add-Item "filler-02" "exteriors" "A tiny crooked swamp shop with a striped awning, fairy lights, cute. $extTail" "4:3" $false
Add-Item "filler-03" "exteriors" "A round mossy hobbit-like swamp dwelling on stilts, a small round door and window, cozy. $extTail" "4:3" $false
Add-Item "filler-04" "exteriors" "A two-storey swamp townhouse with a balcony and hanging plants, warm lights. $extTail" "4:3" $false
Add-Item "filler-05" "exteriors" "A small swamp cafe with outdoor stools on the deck, lanterns, inviting. $extTail" "4:3" $false
Add-Item "filler-06" "exteriors" "A weathered boathouse or dock building with nets and barrels, charming. $extTail" "4:3" $false

# ===== INTERIORS (wide side-view, walkable, uncluttered, no frog) =====
$intTail = "WIDE side-view cutaway interior, like a 2D point-and-click adventure scene, camera straight from the side. A WIDE room with generous OPEN FLOOR SPACE in the middle so a character can walk left to right, furniture pushed to the sides, uncluttered and tidy. NO characters, NO frog. $STYLE"
Add-Item "hut-int-a" "interiors" "Interior of a cozy creative entrepreneur hut: desk with laptop, frog-logo mug and orange lava lamp on the LEFT, a bed on the RIGHT, a few music and frog posters on the back wall, a window showing the distant tower, plank floor with room to walk, tidy not messy. $intTail" "21:9" $false
Add-Item "hut-int-b" "interiors" "Hut interior, calm and minimal: a workdesk on one side, a bed and a small shelf on the other, lava lamp glow, one window to the tower, lots of open floor. $intTail" "21:9" $false
Add-Item "edison-int-a" "interiors" "Interior of EDISON brick bar: a long wooden bar counter on the LEFT with bottles and warm pendant lamps, a small stage with mic and guitar on the RIGHT, brick walls with concert posters, open floor in the middle, stools, cozy live-music venue. $intTail" "21:9" $false
Add-Item "edison-int-b" "interiors" "Edison bar interior, warmer and simpler, bar on one side, stage on the other, framed photos, open walkable floor. $intTail" "21:9" $false
Add-Item "studio-int-a" "interiors" "Interior of a design and automation STUDIO: a desk with glowing screens on the LEFT, a drafting table on the RIGHT, a corkboard with project pins, shelves of gadgets, a frog-mark on the wall, open floor, focused cozy workspace. $intTail" "21:9" $false
Add-Item "studio-int-b" "interiors" "Studio interior, tidy and modern-cozy, monitors and blueprints on the sides, open middle floor, warm light. $intTail" "21:9" $false
Add-Item "receptor-int-a" "interiors" "Interior of RECEPTOR tech HQ: sleek desks with dashboards and analytics screens, a server rack, a meeting nook, restrained modern, open walkable floor. $intTail" "21:9" $false
Add-Item "shop-int-a" "interiors" "Interior of a clothing SHOP: racks of t-shirts and hoodies on the sides, a counter, a mirror, warm boutique light, open floor in the middle. $intTail" "21:9" $false
Add-Item "burger-int-a" "interiors" "Interior of a UFO BURGER joint: a counter and griddle on one side, a couple of booths on the other, retro-diner vibe, warm, open floor. $intTail" "21:9" $false
Add-Item "gym-int-a" "interiors" "Interior of a rugged GYM: weights and a bench on one side, a punching bag and mirror on the other, warm focused vibe, open floor. $intTail" "21:9" $false
Add-Item "lab-int-a" "interiors" "Interior of a LABORATORY sandbox: shelves of bubbling flasks and gadgets on the sides, a workbench with experiments, soft glowing colours but muted, open floor. $intTail" "21:9" $false
Add-Item "music-int-a" "interiors" "Interior of a RECORDING STUDIO: a mixing desk and monitors on one side, a vocal booth with a mic on the other, acoustic panels, warm dim, open floor. $intTail" "21:9" $false
Add-Item "graveyard-int-a" "interiors" "A small dim school of mistakes room: chalkboards with crossed-out ideas, a few desks, lanterns, melancholic but gentle, open floor. $intTail" "21:9" $false
Add-Item "studio-int-c" "interiors" "Cozy studio interior variant, plants, warm lamp, a comfy chair, screens, very tidy and inviting, open floor. $intTail" "21:9" $false

# ===== MAP / establishing overview (no frog) =====
$mapTail = "A cohesive cozy fantasy swamp-town seen as a wide establishing map view, many charming stilted huts and shops connected by wooden boardwalks over calm misty water, lilypads, fireflies, a distant glowing tower on the horizon, evening light. NO characters, NO frog. $STYLE"
Add-Item "map-01" "map" "Slightly elevated 3/4 view of the whole swamp town, navigable map feeling, buildings spread out. $mapTail" "16:9" $false
Add-Item "map-02" "map" "Wider panoramic overview, lots of little buildings, boardwalks weaving between them, tower far on the horizon. $mapTail" "21:9" $false
Add-Item "map-03" "map" "Gentle top-down-ish map of the swamp village, islets and bridges, cozy. $mapTail" "16:9" $false
Add-Item "map-04" "map" "Twilight overview, warm windows dotting the town, mist rolling in, tower beacon. $mapTail" "16:9" $false
Add-Item "map-05" "map" "Vertical map view for mobile, town stacked toward a tower at the top. $mapTail" "9:16" $false
Add-Item "map-06" "map" "Storybook map illustration of the swamp town with a winding boardwalk path. $mapTail" "16:9" $false

# ===== TOWER variants (no frog) =====
$towerTail = "A distant elegant LUXURY RESIDENTIAL SKYSCRAPER on the horizon across the swamp at dusk, sleek modern apartment tower, a glowing PENTHOUSE at the very top with floor-to-ceiling windows and warm golden inviting light (a home to dream of, NOT an office). A few cozy swamp huts in the foreground for scale, mist, reeds, fireflies. NO characters, NO frog. $STYLE"
Add-Item "tower-01" "tower" "Tower centered, penthouse crown glowing warmest like a beacon. $towerTail" "3:4" $false
Add-Item "tower-02" "tower" "Tower slightly off-center, more town in foreground, hazy and aspirational. $towerTail" "3:4" $false
Add-Item "tower-03" "tower" "Taller slimmer tower, dramatic dusk sky, penthouse glow. $towerTail" "9:16" $false
Add-Item "tower-04" "tower" "Tower reflected in the swamp water, calm, dreamy, warm crown. $towerTail" "3:4" $false

# ===== RUN IN WAVES =====
foreach ($f in @("hero","exteriors","interiors","map","tower")) {
  New-Item -ItemType Directory -Path "$root\$f" -Force | Out-Null
}

# Resume: skip items already generated
$items = $items | Where-Object { -not (Test-Path "$root\$($_.folder)\$($_.name).png") }

Write-Output "REMAINING ITEMS: $($items.Count)"
$waveSize = 8
$ok = 0; $fail = 0
for ($i = 0; $i -lt $items.Count; $i += $waveSize) {
  $wave = $items[$i..([Math]::Min($i + $waveSize - 1, $items.Count - 1))]
  Write-Output "--- WAVE $([int]($i / $waveSize) + 1): items $($i+1)..$($i+$wave.Count) ---"
  $jobs = @()
  foreach ($it in $wave) {
    $refArgs = if ($it.frog) { @("--image", $charV2, "--image", $pose) } else { @("--image", $charV2) }
    $j = Start-Job -ScriptBlock {
      param($hf, $prompt, $aspect, $refArgs)
      $a = @("generate","create","nano_banana_2","--prompt",$prompt,"--aspect_ratio",$aspect,"--resolution","2k") + $refArgs + @("--wait","--json")
      & $hf @a 2>&1
    } -ArgumentList $hf, $it.prompt, $it.aspect, $refArgs
    $jobs += [pscustomobject]@{ job=$j; it=$it }
  }
  $jobs.job | Wait-Job -Timeout 600 | Out-Null
  foreach ($jr in $jobs) {
    $out = Receive-Job $jr.job -Keep
    $name = $jr.it.name; $folder = $jr.it.folder
    try {
      $p = $out -join "`n" | ConvertFrom-Json
      $url = $p[0].result_url
      if ($url) {
        Invoke-WebRequest -Uri $url -OutFile "$root\$folder\$name.png" -UseBasicParsing -TimeoutSec 120
        Write-Output "  OK  $folder/$name"; $ok++
      } else { Write-Output "  --  $folder/$name NO URL"; $fail++ }
    } catch { Write-Output "  ERR $folder/$name"; $fail++ }
    Remove-Job $jr.job -Force -ErrorAction SilentlyContinue
  }
}
Write-Output "DONE: $ok ok, $fail failed of $($items.Count)"
