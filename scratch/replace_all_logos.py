import glob
import re
import os

files = sorted(glob.glob('v2/**/*.html', recursive=True))

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    # Calculate relative path to v2/assets/attendTa_logo.jpg
    # v2/index.html -> assets/attendTa_logo.jpg
    # v2/admin/users.html -> ../assets/attendTa_logo.jpg
    depth = f.replace('\\', '/').count('/') - 1
    if depth == 1:
        img_src = 'assets/attendTa_logo.jpg'
    else:
        img_src = '../assets/attendTa_logo.jpg'
        
    logo_img = f'<img src="{img_src}" alt="AttendTa Logo" class="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-slate-200 shadow-xs shrink-0">'
    logo_img_sm = f'<img src="{img_src}" alt="AttendTa Logo" class="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200 shadow-xs shrink-0">'

    # Match any <div class="..."><span?>A</span?></div> preceding AttendTa
    # Patterns:
    # 1) <div class="...bg-(?:slate|blue)-900... flex items-center justify-center...>\s*A\s*</div>
    # 2) <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-sm">A</div>
    # 3) <div class="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-lg">A</div>
    
    p1 = r'<div class="w-9 h-9 rounded-lg bg-(?:slate-900|blue-700)[^"]*">\s*A\s*</div>'
    p2 = r'<div class="w-8 h-8 rounded-lg bg-(?:slate-900|blue-700)[^"]*">\s*A\s*</div>'
    
    new_c, c1 = re.subn(p1, logo_img, content)
    new_c, c2 = re.subn(p2, logo_img_sm, new_c)
    
    if c1 + c2 > 0:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(new_c)
        print(f"Updated {f}: {c1 + c2} replacement(s)")
    else:
        print(f"No replacement in {f}")
