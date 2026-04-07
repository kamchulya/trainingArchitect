import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory log storage for the session
  let sessionLogs: { timestamp: string, level: string, message: string }[] = [];

  // Endpoint for the real bot to send logs to this dashboard
  app.post('/api/logs/ingest', (req, res) => {
    const { level, message } = req.body;
    const newLog = {
      timestamp: new Date().toISOString(),
      level: level || 'INFO',
      message: message || ''
    };
    sessionLogs.push(newLog);
    if (sessionLogs.length > 50) sessionLogs.shift();
    res.status(200).json({ status: 'received' });
  });

  // Endpoint for the dashboard to fetch logs
  app.get('/api/logs', (req, res) => {
    res.json(sessionLogs);
  });

  // Clear logs
  app.delete('/api/logs', (req, res) => {
    sessionLogs = [];
    res.json({ status: 'cleared' });
  });

  // Terminal Simulation Endpoint
  app.post("/api/terminal", (req, res) => {
    const { command, currentFiles = [] } = req.body;
    let output = "";
    let newState = {};

    if (command === "help") {
      output = "Available commands: \n- ls: list files\n- touch <file>: create file\n- pip install <pkg>: install python package\n- git init: initialize repository\n- ssh root@vps-ip: connect to server";
    } else if (command.startsWith("pip install")) {
      const pkg = command.split(" ")[2];
      output = `Collecting ${pkg}...\nDownloading ${pkg}-1.0.0.whl\nInstalling collected packages: ${pkg}\nSuccessfully installed ${pkg}-1.0.0`;
      newState = { installedPackages: [pkg] };
    } else if (command.startsWith("touch")) {
      const filename = command.split(" ")[1];
      output = "";
      newState = { files: [filename] };
    } else if (command === "git init") {
      output = "Initialized empty Git repository in /home/student/project/.git/";
      newState = { gitInitialized: true };
    } else if (command === "git add ." || command.startsWith("git add ")) {
      output = "";
      newState = { gitAdded: true };
    } else if (command.startsWith("git commit")) {
      const match = command.match(/-m\s+["'](.+)["']/);
      const msg = match ? match[1] : "initial commit";
      output = `[main (root-commit) a1b2c3d] ${msg}\n 3 files changed, 150 insertions(+)`;
      newState = { gitCommitted: true };
    } else if (command.startsWith("git remote add")) {
      output = "";
      newState = { gitRemoteAdded: true };
    } else if (command.startsWith("git push")) {
      output = "Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nWriting objects: 100% (3/3), 300 bytes | 300.00 KiB/s, done.\nTo https://github.com/user/repo.git\n * [new branch]      main -> main";
      newState = { gitPushed: true };
    } else if (command.startsWith("ssh")) {
      output = "root@vps-ip's password: \nWelcome to Ubuntu 22.04 LTS\nlast login: Tue Mar 31 16:20:00 2026";
      newState = { sshConnected: true };
    } else if (command === "ls") {
      output = currentFiles.join("  ");
    } else {
      output = `sh: command not found: ${command.split(" ")[0]}`;
    }

    res.json({ output, newState });
  });

  // Checkers
  app.post("/api/check/openai", (req, res) => {
    const { key } = req.body;
    if (key && key.startsWith("sk-")) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false, error: "Invalid key format" });
    }
  });

  app.post("/api/check/webhook", (req, res) => {
    // Simulate webhook check
    setTimeout(() => {
      res.json({ status: 200, message: "Connection established" });
    }, 1500);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
