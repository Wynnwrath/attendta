import os
import re

v2_files = []
for root, dirs, files in os.walk('v2'):
    for f in files:
        if f.endswith('.html'):
            v2_files.append(os.path.join(root, f))

broken = []
valid = 0

for file_path in v2_files:
    file_dir = os.path.dirname(file_path)
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # find all href and action attributes
    matches = re.findall(r'(?:href|action)=["\']([^#"\'\s\?]+)["\']', content)
    for link in matches:
        if link.startswith(('http:', 'https:', 'mailto:', 'tel:', 'javascript:')):
            continue
        if link.endswith('.css') or link.endswith('.js') or link.endswith('.jpg') or link.endswith('.png') or link.endswith('.svg'):
            target = os.path.normpath(os.path.join(file_dir, link))
            if not os.path.exists(target):
                broken.append((file_path, link, target, 'asset'))
            else:
                valid += 1
            continue
        
        target = os.path.normpath(os.path.join(file_dir, link))
        if os.path.exists(target) or os.path.exists(target + '.html'):
            valid += 1
        else:
            broken.append((file_path, link, target, 'page'))

print(f"Total HTML files in v2/: {len(v2_files)}")
print(f"Valid links/assets: {valid}")
if broken:
    print(f"Found {len(broken)} broken references:")
    for src, link, tgt, kind in broken:
        print(f"  [{kind}] in {src}: '{link}' -> not found at {tgt}")
else:
    print("ALL links and assets in v2/ exist and resolve properly!")
