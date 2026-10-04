from pathlib import Path
import subprocess, re, json
root = Path(__file__).resolve().parents[2]
def original(name):
    return subprocess.check_output(['git', '-c', 'safe.directory='+str(root), 'show', 'HEAD:'+name], cwd=root)
results = {}
for page in (root/'assets/essays').glob('*.html'):
    old = original(page.relative_to(root).as_posix()).decode('utf-8')
    without_styles = re.sub(r'\s*<style[^>]*>[\s\S]*?</style>\s*', '\n    ', old)
    results[page.name] = without_styles.replace('\r\n','\n') == page.read_text(encoding='utf-8')
print(json.dumps(results, indent=2))
assert all(results.values()), 'Article content changed beyond stylesheet removal'
(root/'_design/theme-validation/content-preservation.json').write_text(json.dumps(results,indent=2))
