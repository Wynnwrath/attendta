import glob
import re

files = sorted(glob.glob('v2/**/*.html', recursive=True))

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    # Normalizing path:
    # f = v2\index.html -> depth 1 -> src="assets/attendTa_logo.jpg"
    # f = v2\admin\users.html -> depth 2 -> src="../assets/attendTa_logo.jpg"
    normalized = f.replace('\\', '/')
    parts = normalized.split('/')
    
    if len(parts) == 2: # v2/index.html
        correct_src = 'assets/attendTa_logo.jpg'
    else: # v2/admin/users.html, v2/account/login.html, etc.
        correct_src = '../assets/attendTa_logo.jpg'
        
    # Replace any src="assets/attendTa_logo.jpg" or src="../assets/attendTa_logo.jpg"
    # with the correct_src
    pattern = r'src="(?:\.\./)?assets/attendTa_logo\.jpg"'
    new_content, count = re.subn(pattern, f'src="{correct_src}"', content)
    
    if count > 0:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        print(f"Fixed {f}: set src to {correct_src} ({count} instances)")
    else:
        print(f"No logo found in {f}")
