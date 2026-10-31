import glob
import re

# Update all root legacy officer and auth pages to also use attendTa_logo.jpg
root_htmls = [
    'officer.html', 'officer-reports.html', 'officer-events.html', 'officer-registrations.html',
    'officer-kiosk.html', 'officer-masterdata.html', 'officer-approvals.html', 'officer-certificates.html',
    'admin.html', 'student.html', 'login.html'
]

img_tag = '<img src="attendTa_logo.jpg" alt="AttendTa Logo" style="width: 24px; height: 24px; object-fit: contain; border-radius: 6px; background: #fff; padding: 1px; border: 1px solid var(--border-color, #e2e8f0);">'

for f in root_htmls:
    try:
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        
        # Replace the SVG inside officer-header-brand
        # <a href="officer.html" class="officer-header-brand">\s*<svg[^>]*>.*?</svg>
        p1 = r'(<a[^>]*class="[^"]*officer-header-brand[^"]*"[^>]*>)\s*<svg[^>]*>.*?</svg>'
        new_content, c1 = re.subn(p1, rf'\1\n        {img_tag}', content, flags=re.DOTALL)
        
        # Replace SVG inside auth-brand
        p2 = r'(<a[^>]*class="[^"]*auth-brand[^"]*"[^>]*>)\s*<svg[^>]*>.*?</svg>'
        new_content, c2 = re.subn(p2, rf'\1\n        {img_tag}', new_content, flags=re.DOTALL)
        
        if c1 + c2 > 0:
            with open(f, 'w', encoding='utf-8') as fp:
                fp.write(new_content)
            print(f"Updated root {f}: {c1 + c2} replacement(s)")
        else:
            print(f"No match in root {f}")
    except Exception as e:
        print(f"Error {f}: {e}")
