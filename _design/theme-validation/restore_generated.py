from pathlib import Path
import subprocess
root = Path(__file__).resolve().parents[2]
for name in ('_site/index.html', '_site/404.html'):
    content = subprocess.check_output(['git', '-c', 'safe.directory='+str(root), 'show', 'HEAD:'+name], cwd=root)
    (root/name).write_bytes(content)
print('Restored the two tracked build artifacts; source changes and the running preview are preserved.')
