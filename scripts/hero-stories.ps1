# Hero story scenes - life moments of Frogface (for animated hero carousel)
# nano_banana_2 + character sheets for consistency. ASCII-only. Skip-existing. Waves.

$hf = "$env:APPDATA\npm\node_modules\@higgsfield\cli\vendor\hf.exe"
$charV2 = "73e0ba05-0768-4645-afda-b63197fceaf4"
$pose   = "32a45125-2abc-493c-8900-1488fabf7c98"
$root   = "D:\PROJECTS\FROGFACE-SPACE\refs\hero-stories"
New-Item -ItemType Directory -Path $root -Force | Out-Null

$STYLE = "Outlined cartoonish painterly illustration, clean confident linework, cozy atmospheric fantasy swamp-city world (Zootopia-like town of huts and shops on stilts). Cohesive CALM MUTED palette, gentle amber light, evening mood, fireflies, soft mist. Cartoonish charming and cinematic, restrained. NOT busy, NOT over-detailed, NOT photorealistic, NOT oversaturated, NOT the over-detailed ChatGPT look. Keep upper area calmer for possible text overlay."
$FROG = "the anthropomorphic green frog character from the reference sheets (consistent face and design), in his signature black hoodie with the frog-mark logo."

$items = @()
function Add($name, $prompt) { $script:items += [pscustomobject]@{ name=$name; prompt="$prompt $STYLE" } }

Add "s01-work-night"   "$FROG sits working at a laptop late at night inside his cozy hut, an orange lava lamp glowing beside him, a coffee mug, focused and calm, warm lamp light, posters on the wall. Cinematic interior hero shot."
Add "s02-rap-crowd"    "$FROG on a small stage holding a microphone, RAPPING passionately in front of a cheering crowd of other frogs at a brick music bar, warm stage lights, energy and joy, raised hands in the audience. Dynamic cinematic hero shot."
Add "s03-guitar-stage" "$FROG playing an electric guitar on the Edison bar stage under warm spotlights, a small crowd of frogs watching, music notes feel, live-gig energy. Cinematic hero shot."
Add "s04-coffee-tower" "$FROG sits on a wooden pier bench with a coffee cup, seen from behind, gazing across the swamp town toward a distant glowing residential tower at sunset. The classic dreaming pose. Cinematic wide hero shot."
Add "s05-walk-town"    "$FROG walking through the swamp town at dusk, hands in hoodie pockets, passing cozy stilted huts with warm windows, boardwalks, other frogs around, relaxed confident stroll. Cinematic side hero shot."
Add "s06-drafting"     "$FROG standing at a large drafting table covered in glowing blueprints and technical drawings, a pencil in hand, focused professional, screens nearby, a creative workshop. Cinematic hero shot."
Add "s07-pitch"        "$FROG presenting to a client frog across a desk, gesturing at glowing dashboards and screens on the wall, confident and professional B2B meeting vibe, warm office. Cinematic hero shot."
Add "s08-rooftop"      "$FROG standing on a rooftop balcony at sunset overlooking the whole swamp city and the distant tower, hands on the railing, aspirational and calm, wind in the hoodie. Cinematic wide hero shot."
Add "s09-bar-counter"  "$FROG behind a wooden bar counter polishing a glass, warm pendant lamps, bottles on shelves, a cozy brick bar, a slight confident smile, host energy. Cinematic hero shot."
Add "s10-rollerblades" "$FROG cruising on roller-blades along the wooden boardwalks of the swamp town at dusk, motion and energy, arms out for balance, fireflies streaking past, fun and free. Dynamic cinematic hero shot."
Add "s11-lofi-chill"   "$FROG sitting on the edge of a pier with big headphones on, nodding to lo-fi music, eyes half closed, a coffee beside him, fireflies and mist, chill evening vibe. Cinematic hero shot."
Add "s12-mural"        "$FROG spray-painting a big colourful FROG MURAL on a brick wall in the swamp town, a spray can in hand, creative street-art energy, paint drips, dusk light. Cinematic hero shot."

Write-Output "TOTAL: $($items.Count)"
$items = $items | Where-Object { -not (Test-Path "$root\$($_.name).png") }
Write-Output "REMAINING: $($items.Count)"

# Sequential foreground loop - bulletproof, no Start-Job context issues
$ok = 0; $fail = 0; $idx = 0
foreach ($it in $items) {
  $idx++
  Write-Output "[$idx/$($items.Count)] $($it.name) ..."
  $out = & $hf generate create nano_banana_2 --prompt $it.prompt --aspect_ratio "16:9" --resolution "2k" --image $charV2 --image $pose --wait --json 2>&1
  try {
    $u = ($out -join "`n" | ConvertFrom-Json)[0].result_url
    if ($u) { Invoke-WebRequest -Uri $u -OutFile "$root\$($it.name).png" -UseBasicParsing -TimeoutSec 120; Write-Output "  OK  $($it.name)"; $ok++ }
    else { Write-Output "  --  $($it.name) NO URL"; $fail++ }
  } catch { Write-Output "  ERR $($it.name) :: $(($out | Select-Object -Last 2) -join ' | ')"; $fail++ }
}
Write-Output "DONE: $ok ok, $fail failed"
