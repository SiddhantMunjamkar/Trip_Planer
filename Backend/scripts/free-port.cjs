const { execSync } = require('child_process');

const port = Number(process.env.PORT || 5000);

function freePortWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== '0') {
        pids.add(pid);
      }
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[PORT] Freed port ${targetPort} (stopped PID ${pid})`);
      } catch {
        // Process may have already exited
      }
    }

    if (pids.size === 0) {
      console.log(`[PORT] Port ${targetPort} is already free`);
    }
  } catch {
    console.log(`[PORT] Port ${targetPort} is already free`);
  }
}

function freePortUnix(targetPort) {
  try {
    execSync(`lsof -ti:${targetPort} | xargs kill -9 2>/dev/null || true`, {
      shell: true,
      stdio: 'ignore',
    });
    console.log(`[PORT] Attempted to free port ${targetPort}`);
  } catch {
    console.log(`[PORT] Port ${targetPort} is already free`);
  }
}

if (process.platform === 'win32') {
  freePortWindows(port);
} else {
  freePortUnix(port);
}
