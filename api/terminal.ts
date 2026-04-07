import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { command = '', currentFiles = [] } = req.body as {
    command: string;
    currentFiles: string[];
  };

  let output = '';
  let newState: Record<string, unknown> = {};

  if (command === 'help') {
    output =
      'Available commands:\n- ls: list files\n- touch <file>: create file\n- pip install <pkg>: install python package\n- git init: initialize repository\n- git add .\n- git commit -m "message"\n- git remote add origin <url>\n- git push -u origin main\n- ssh root@vps-ip: connect to server';
  } else if (command.startsWith('pip install')) {
    const pkg = command.split(' ')[2] || 'package';
    output = `Collecting ${pkg}...\nDownloading ${pkg}-1.0.0.whl\nInstalling collected packages: ${pkg}\nSuccessfully installed ${pkg}-1.0.0`;
    newState = { installedPackages: [pkg] };
  } else if (command.startsWith('touch')) {
    const filename = command.split(' ')[1];
    output = '';
    newState = { files: [filename] };
  } else if (command === 'git init') {
    output = 'Initialized empty Git repository in /home/student/project/.git/';
    newState = { gitInitialized: true };
  } else if (command === 'git add .' || command.startsWith('git add ')) {
    output = '';
    newState = { gitAdded: true };
  } else if (command.startsWith('git commit')) {
    const match = command.match(/-m\s+["'](.+)["']/);
    const msg = match ? match[1] : 'initial commit';
    output = `[main (root-commit) a1b2c3d] ${msg}\n 3 files changed, 150 insertions(+)`;
    newState = { gitCommitted: true };
  } else if (command.startsWith('git remote add')) {
    output = '';
    newState = { gitRemoteAdded: true };
  } else if (command.startsWith('git push')) {
    output =
      'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nWriting objects: 100% (3/3), 300 bytes | 300.00 KiB/s, done.\nTo https://github.com/user/repo.git\n * [new branch]      main -> main';
    newState = { gitPushed: true };
  } else if (command.startsWith('ssh')) {
    output =
      "root@vps-ip's password: \nWelcome to Ubuntu 22.04 LTS\nlast login: Tue Mar 31 16:20:00 2026";
    newState = { sshConnected: true };
  } else if (command === 'ls') {
    output = (currentFiles as string[]).join('  ') || '(empty)';
  } else if (command === '') {
    output = '';
  } else {
    output = `sh: command not found: ${command.split(' ')[0]}`;
  }

  res.status(200).json({ output, newState });
}
