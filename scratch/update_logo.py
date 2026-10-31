import glob
import re
import os

files = sorted(glob.glob('v2/**/*.html', recursive=True))

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    # Calculate relative path to v2/assets/attendTa_logo.jpg
    # from v2/index.html -> assets/attendTa_logo.jpg
    # from v2/admin/users.html -> ../assets/attendTa_logo.jpg
    rel_depth = f.replace('\\', '/').count('/') - 1
    if rel_depth == 1:
        img_src = 'assets/attendTa_logo.jpg'
    else:
        img_src = '../assets/attendTa_logo.jpg'
        
    logo_img_tag = f'<img src="{img_src}" alt="AttendTa Logo" class="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-slate-200 shadow-2xs">'

    # Look for the letter A div pattern
    # <div class="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-lg">A</div>
    # or variations
    pattern = r'<div class="[^"]*rounded-lg bg-blue-700[^"]*">A</div>'
    new_content, count = re.subn(pattern, logo_img_tag, content)
    
    if count > 0:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        print(f"Replaced {count} occurrence(s) in {f} with {img_src}")
    else:
        print(f"No match for letter A in {f}")
