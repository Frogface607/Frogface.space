# /about scroll-comic panels v2 - biography scenes with NEUTRAL base sheet + situational clothing per era.
# Base anchor: base-v3-neutral (UUID 11307639-90db-44b9-8e9b-c098476b5f50). No locked hoodie, no peace pendant.
# Sequential foreground (reliable) + retry-on-502 + skip-existing. ASCII-only.

$hf = "$env:APPDATA\npm\node_modules\@higgsfield\cli\vendor\hf.exe"
$base = "11307639-90db-44b9-8e9b-c098476b5f50"
$root = "D:\PROJECTS\FROGFACE-SPACE\refs\about-panels"
New-Item -ItemType Directory -Path $root -Force | Out-Null

$STYLE = "Outlined cartoonish painterly illustration, clean confident linework, cozy atmospheric storybook mood, cohesive CALM MUTED palette, warm amber and soft evening light, gentle mist. Cinematic single-frame comic panel, emotional and warm, restrained. NOT photorealistic, NOT 3D, NOT Pixar, NOT busy, NOT over-detailed, NOT oversaturated, NOT the over-detailed ChatGPT look. Keep one calmer area for possible text overlay. No text in image, no speech bubbles."
$FROG = "the same anthropomorphic green frog character from the reference sheet (consistent face, body and design)"

$items = @(
  @{n="p01-novolenino";    p="$FROG but as a YOUNG CHILD version, wearing simple 2000s kid clothes (t-shirt and shorts), roller skates on his feet, a book under his arm, sitting in the courtyard of a worn Soviet apartment block at golden hour, an old soviet PAZ bus parked nearby. Nostalgic warm childhood scene."}
  @{n="p02-soundboard";    p="$FROG as a TEENAGER, wearing casual teen clothes (simple t-shirt), working behind an audio mixing console at a small school event, cables, speakers and a little stage, focused on the faders, warm working light. His first real job."}
  @{n="p03-adman";         p="$FROG as a young man in a casual buttoned shirt, standing at a wall covered with advertising sketches and sticky notes, brainstorming campaign ideas, a coffee mug, marker in hand, excited inventive energy, cozy studio."}
  @{n="p04-metka";         p="$FROG as a young adult wearing his own streetwear (a t-shirt with a local district / old bus print), in a small merch shop, racks of printed hoodies and tees around, rolls of fabric and shipping boxes, proud small-business moment."}
  @{n="p05-studio";        p="$FROG as a brand designer wearing a casual sweater, at a desk covered with restaurant menus, logos, brand identity sheets and printed samples, a tablet, focused craftsman, warm creative office."}
  @{n="p06-mic";           p="$FROG wearing casual stage clothes (t-shirt or open shirt), holding a microphone on a small stage, freestyling, a warm spotlight, silhouettes of a swaying crowd, raw honest music performance."}
  @{n="p07-edison-build";  p="$FROG as a young man in a work t-shirt, together with an older larger father frog (similar features), building a bar from scratch in an empty raw basement, brick walls, tools, strings of vintage Edison bulbs hung at different heights starting to glow, the beginning of a legend."}
  @{n="p08-edison-allroles"; p="$FROG wearing a denim bartender apron with rolled-up sleeves, doing everything at once in a lively craft beer bar: pulling a beer at the tap with a sound mixing console nearby and a bucket of water by his feet, while a jazz band plays on a small stage, vintage Edison bulbs, gig posters on the brick walls. Energetic feel of one man doing every job."}
  @{n="p09-nechto";        p="$FROG wearing a casual apron, holding a signature burger in a retrofuturistic UFO-themed burger joint, lava lamps, soft neon, retro posters, a bittersweet ironic mood, beautiful but heavy. The expensive lesson."}
  @{n="p10-swamp-to-tower"; p="$FROG as an adult wearing a simple clean modern grey hoodie (NO necklace, no pendant), standing at the edge of a misty swamp at dawn, a path leading through the fog toward a glowing Tower on the horizon, calm and confident (NOT desperate), fireflies, hopeful soft light. The climb out of the swamp."}
)

Write-Output "TOTAL: $($items.Count)"
$items = $items | Where-Object { -not (Test-Path "$root\$($_.n).png") }
Write-Output "REMAINING: $($items.Count)"

$ok=0; $fail=0; $i=0
foreach ($it in $items) {
  $i++
  $prompt = "$($it.p) $STYLE"
  $done = $false
  for ($try=1; $try -le 3 -and -not $done; $try++) {
    Write-Output "[$i/$($items.Count)] $($it.n) try $try ..."
    $out = & $hf generate create nano_banana_2 --prompt $prompt --aspect_ratio "16:9" --resolution "2k" --image $base --wait --json 2>&1
    try {
      $u = ($out -join "`n" | ConvertFrom-Json)[0].result_url
      if ($u) { Invoke-WebRequest -Uri $u -OutFile "$root\$($it.n).png" -UseBasicParsing -TimeoutSec 120; Write-Output "  OK $($it.n)"; $ok++; $done=$true }
      else { Write-Output "  no url, retry"; Start-Sleep -Seconds 4 }
    } catch { Write-Output "  err retry"; Start-Sleep -Seconds 4 }
  }
  if (-not $done) { Write-Output "  FAILED $($it.n)"; $fail++ }
}
Write-Output "DONE: $ok ok, $fail failed"
