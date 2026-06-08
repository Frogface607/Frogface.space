import re, sys
path = r"C:\Users\Дмитрий\Downloads\Новая-глава-жизни (2).md"
text = open(path, encoding="utf-8").read()
blocks = re.split(r'^# (you asked|chatgpt response)\s*$', text, flags=re.M)
out = []
i = 1
while i < len(blocks) - 1:
    tag = blocks[i].strip()
    body = blocks[i + 1]
    if tag == "you asked":
        body = re.sub(r'^>?\s*message time:.*$', '', body, flags=re.M)
        body = re.sub(r'^---\s*$', '', body, flags=re.M)
        body = body.strip()
        if len(body) > 25:
            out.append(body)
    i += 2
print("=== %d Boss messages (voice) ===" % len(out))
for n, b in enumerate(out, 1):
    print("\n--- [%d] ---" % n)
    print(b[:1500])
