# Hero EXPERT scenes - Frogface as serious professional / AI builder.
# Sequential foreground (reliable) + retry-on-502 + skip-existing. ASCII-only.

$hf = "$env:APPDATA\npm\node_modules\@higgsfield\cli\vendor\hf.exe"
$char = "73e0ba05-0768-4645-afda-b63197fceaf4"
$pose = "32a45125-2abc-493c-8900-1488fabf7c98"
$root = "D:\PROJECTS\FROGFACE-SPACE\refs\hero-stories"   # same folder, prefix e
New-Item -ItemType Directory -Path $root -Force | Out-Null

$STYLE = "Outlined cartoonish painterly illustration, clean confident linework, cozy atmospheric fantasy swamp-city world (huts and modern offices on stilts). Cohesive CALM MUTED palette, gentle amber and cool screen light, evening mood, fireflies, soft mist. Cartoonish charming and cinematic, restrained, professional and impressive but warm. NOT busy, NOT over-detailed, NOT photorealistic, NOT oversaturated, NOT the over-detailed ChatGPT look. Keep upper area calmer for text overlay."
$FROG = "the anthropomorphic green frog character from the reference sheets (consistent face and design), in his signature black hoodie with the frog-mark logo, confident and capable."

$items = @(
  @{n="e01-keynote";   p="$FROG on a conference stage giving a confident keynote talk, a huge screen behind him glowing with charts, graphs and a frog-mark logo, an audience of frogs watching, a spotlight, thought-leader energy. Cinematic hero shot."}
  @{n="e02-dev-setup"; p="$FROG at a sleek multi-monitor developer workstation at night, several screens glowing with code and live dashboards, a mechanical keyboard, a coffee mug, deep focus, professional pro setup, warm desk lamp. Cinematic hero shot."}
  @{n="e03-mission-control"; p="$FROG standing in a high-tech control room / command center, a wall of screens showing analytics, maps and automations running, arms crossed, calm and in command, cool blue glow mixed with warm light. Cinematic hero shot."}
  @{n="e04-boardroom";  p="$FROG presenting a system architecture diagram on a large glass whiteboard to a few client frogs seated around a table, gesturing at the plan, sharp professional B2B meeting, warm modern office. Cinematic hero shot."}
  @{n="e05-ai-interface"; p="$FROG interacting with a glowing floating holographic AI interface, translucent screens and data hovering around his hands, gesturing thoughtfully, mastering the tech, subtle and elegant not cheesy sci-fi, warm-cool light. Cinematic hero shot."}
  @{n="e06-data-review"; p="$FROG at a sleek desk reviewing restaurant and business analytics dashboards on a tablet and monitors (HoReCa metrics, charts, menus), focused expert, a small model building on the desk, professional warm studio. Cinematic hero shot."}
  @{n="e07-handshake";  p="$FROG shaking hands with a client frog across a desk, closing a deal, both confident and pleased, glowing screens in the background, warm professional office, trust and partnership. Cinematic hero shot."}
  @{n="e08-founder";    p="$FROG as a confident founder, leaning casually against a desk in a modern creative studio, arms crossed, a slight knowing smile, looking toward the viewer, screens and blueprints and plants around, warm cinematic portrait light. Cinematic founder portrait hero shot."}
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
    $out = & $hf generate create nano_banana_2 --prompt $prompt --aspect_ratio "16:9" --resolution "2k" --image $char --image $pose --wait --json 2>&1
    try {
      $u = ($out -join "`n" | ConvertFrom-Json)[0].result_url
      if ($u) { Invoke-WebRequest -Uri $u -OutFile "$root\$($it.n).png" -UseBasicParsing -TimeoutSec 120; Write-Output "  OK $($it.n)"; $ok++; $done=$true }
      else { Write-Output "  no url, retry"; Start-Sleep -Seconds 4 }
    } catch { Write-Output "  err retry"; Start-Sleep -Seconds 4 }
  }
  if (-not $done) { Write-Output "  FAILED $($it.n)"; $fail++ }
}
Write-Output "DONE: $ok ok, $fail failed"
