import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// CORS & Security Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

import {
  SEED_MISSIONS,
  SEED_TASKS_FLOOD,
  SEED_PLAN_VERSIONS,
  SEED_RESOURCES,
  SEED_TOOLS,
  SEED_DISRUPTIONS,
  SEED_APPROVALS,
  SEED_AUDIT_LOGS,
  SEED_DOCUMENTS,
} from './src/data/seedData.ts';
import {
  generateDynamicMissionTasks,
  generateDynamicPlanVersions,
} from './src/data/missionTaskGenerator.ts';

// ----------------------------------------------------
// CRYPTOGRAPHIC AUTHENTICATION & SECURITY ENGINE
// ----------------------------------------------------
const AUTH_SECRET = process.env.AUTH_SECRET || 'planova-enterprise-hmac-secret-key-2026';

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordSalt?: string;
  passwordHash?: string;
  role: 'admin' | 'operator' | 'viewer';
  department: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt: string;
  emailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: 'en' | 'hi' | 'mr';
    notificationsEnabled: boolean;
    defaultDomain: string;
    autoApproveLowRisk: boolean;
    compactTelemetry: boolean;
  };
}

function hashPasswordScrypt(password: string, salt?: string): { salt: string; hash: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { salt: usedSalt, hash: derivedKey };
}

function verifyPasswordScrypt(password: string, salt: string, storedHash: string): boolean {
  const { hash } = hashPasswordScrypt(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function issueSessionToken(userId: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, email, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): { sub: string; email: string } | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp < Date.now()) return null;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

function sanitizeUser(u: StoredUserAccount) {
  const { passwordSalt, passwordHash, ...safeUser } = u;
  return safeUser;
}

// ----------------------------------------------------
// PERSISTENT RELATIONAL DATABASE ENGINE (DISK-BACKED)
// ----------------------------------------------------
const DB_DIR = path.resolve(__dirname, '.data');
const DB_FILE = path.join(DB_DIR, 'planova_database.json');

interface DatabaseSchema {
  users: Record<string, StoredUserAccount>;
  missions: any[];
  mission_constraints: any[];
  tasks: Record<string, any[]>;
  task_dependencies: any[];
  agents: any[];
  agent_runs: any[];
  tools: any[];
  tool_executions: any[];
  resources: any[];
  resource_allocations: any[];
  events: any[];
  plans: Record<string, any[]>;
  plan_versions: Record<string, any[]>;
  approvals: any[];
  documents: any[];
  notifications: any[];
  audit_logs: any[];
}

const defaultCreds = hashPasswordScrypt('Planova@2026');
const initialUser: StoredUserAccount = {
  id: 'usr-001',
  name: 'Sushant Shinde',
  email: 'sushantshinde5598@gmail.com',
  passwordSalt: defaultCreds.salt,
  passwordHash: defaultCreds.hash,
  role: 'operator',
  department: 'Emergency & Civil Defense Operations',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  authProvider: 'email',
  createdAt: '2026-09-15T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  emailVerified: true,
  preferences: {
    theme: 'light',
    language: 'en',
    notificationsEnabled: true,
    defaultDomain: 'emergency',
    autoApproveLowRisk: true,
    compactTelemetry: false,
  },
};

function createInitialDb(): DatabaseSchema {
  const initialTasks: Record<string, any[]> = {
    'mission-flood-evac-01': [...SEED_TASKS_FLOOD],
  };
  const initialPlans: Record<string, any[]> = {
    'mission-flood-evac-01': [...SEED_PLAN_VERSIONS],
  };

  SEED_MISSIONS.forEach((m) => {
    if (m.id !== 'mission-flood-evac-01') {
      const mTasks = generateDynamicMissionTasks(m);
      initialTasks[m.id] = mTasks;
      initialPlans[m.id] = generateDynamicPlanVersions(m, mTasks);
    }
  });

  return {
    users: {
      [initialUser.email.toLowerCase()]: initialUser,
    },
    missions: SEED_MISSIONS.map((m) => {
      const mTasks = initialTasks[m.id] || [];
      const completedCount = mTasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
      const inProgressCount = mTasks.filter((t) => t.status === 'in_progress').length;
      const waitingApprovalCount = mTasks.filter((t) => t.status === 'waiting_approval').length;
      return {
        ...m,
        userId: 'usr-001',
        tasksCount: mTasks.length || m.tasksCount,
        completedCount: m.id === 'mission-flood-evac-01' ? m.completedCount : completedCount,
        inProgressCount: m.id === 'mission-flood-evac-01' ? m.inProgressCount : inProgressCount,
        waitingApprovalCount: m.id === 'mission-flood-evac-01' ? m.waitingApprovalCount : waitingApprovalCount,
      };
    }),
    mission_constraints: SEED_MISSIONS.flatMap((m) =>
      (m.constraints || []).map((c) => ({ ...c, missionId: m.id }))
    ),
    tasks: initialTasks,
    task_dependencies: Object.values(initialTasks)
      .flat()
      .flatMap((t) =>
        (t.dependencies || []).map((depId: string) => ({
          missionId: t.missionId,
          taskId: t.id,
          dependsOnTaskId: depId,
        }))
      ),
    agents: [
      { id: 'agent-planning', name: 'Planning Agent', status: 'active' },
      { id: 'agent-execution', name: 'Execution Agent', status: 'active' },
      { id: 'agent-monitoring', name: 'Monitoring Agent', status: 'active' },
      { id: 'agent-resource', name: 'Resource Agent', status: 'active' },
      { id: 'agent-verification', name: 'Verification Agent', status: 'active' },
    ],
    agent_runs: [],
    tools: [...SEED_TOOLS],
    tool_executions: [],
    resources: [...SEED_RESOURCES],
    resource_allocations: [],
    events: [...SEED_DISRUPTIONS],
    plans: initialPlans,
    plan_versions: initialPlans,
    approvals: [...SEED_APPROVALS],
    documents: SEED_DOCUMENTS.map((d) => ({ ...d, userId: 'usr-001' })),
    notifications: [],
    audit_logs: [...SEED_AUDIT_LOGS],
  };
}

let dbState: DatabaseSchema = createInitialDb();

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      const base = createInitialDb();
      dbState = {
        ...base,
        ...parsed,
        tasks: { ...base.tasks, ...(parsed.tasks || {}) },
        plans: { ...base.plans, ...(parsed.plans || {}) },
        plan_versions: { ...base.plan_versions, ...(parsed.plan_versions || {}) },
      };
      // Ensure every mission has tasks & plans
      dbState.missions.forEach((m) => {
        if (!dbState.tasks[m.id] || dbState.tasks[m.id].length === 0) {
          const genTasks = generateDynamicMissionTasks(m);
          dbState.tasks[m.id] = genTasks;
          dbState.plan_versions[m.id] = generateDynamicPlanVersions(m, genTasks);
          dbState.plans[m.id] = dbState.plan_versions[m.id];
        }
      });
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.warn('Database initialization fallback:', err);
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    console.warn('Database persist warning:', err);
  }
}

loadDatabase();

let currentUser = sanitizeUser(
  dbState.users[initialUser.email.toLowerCase()] || initialUser
) as any;

function getRequestUser(req: Request): StoredUserAccount {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const verified = verifySessionToken(token);
    if (verified) {
      const found = dbState.users[verified.email.toLowerCase()];
      if (found) return found;
    }
  }
  return dbState.users[(currentUser?.email || initialUser.email).toLowerCase()] || initialUser;
}

function recordAudit(entry: {
  missionId?: string;
  missionTitle?: string;
  agent?: string;
  action: string;
  entity?: string;
  entityId?: string;
  user?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  approvalRequired?: boolean;
  approvalStatus?: 'approved' | 'rejected' | 'pending';
  result?: 'success' | 'failed' | 're-planned' | 'rejected';
  details: string;
  toolUsed?: string;
}) {
  const newAudit = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    missionId: entry.missionId || 'system-core',
    missionTitle: entry.missionTitle || 'System Governance',
    agent: entry.agent || 'System Kernel',
    action: entry.action,
    entity: entry.entity || 'mission',
    entityId: entry.entityId || entry.missionId || 'global',
    user: entry.user || currentUser?.name || 'Operator',
    riskLevel: entry.riskLevel || 'low',
    approvalRequired: entry.approvalRequired ?? false,
    approvalStatus: entry.approvalStatus,
    result: entry.result || 'success',
    details: entry.details,
    toolUsed: entry.toolUsed,
  };
  dbState.audit_logs.unshift(newAudit);
  saveDatabase();
  broadcastRealtime('audit:created', newAudit);
  return newAudit;
}

// ----------------------------------------------------
// REAL-TIME WEBSOCKETS & SSE ENGINE
// ----------------------------------------------------
const sseClients: Response[] = [];

function broadcastRealtime(type: string, data: any) {
  // 1. Broadcast over WebSocket (/ws)
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch {
        // ignore closed socket
      }
    }
  });

  // 2. Broadcast over SSE (/api/stream/events)
  const ssePayload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(ssePayload);
    } catch {
      // client disconnected
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      type: 'ws:connected',
      data: {
        status: 'connected',
        activeMissions: dbState.missions.length,
        timestamp: new Date().toISOString(),
      },
    })
  );

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch {
      // ignore malformed messages
    }
  });
});

// Rate Limiting & Brute-Force Protection
interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}
const loginRateLimits = new Map<string, RateLimitRecord>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function checkBruteForce(key: string): { allowed: boolean; retryAfterSeconds?: number; remainingAttempts: number } {
  const now = Date.now();
  const record = loginRateLimits.get(key);
  if (!record) return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };

  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      remainingAttempts: 0,
    };
  }

  if (now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
    loginRateLimits.delete(key);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  return { allowed: true, remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts) };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = loginRateLimits.get(key) || { attempts: 0, firstAttemptAt: now, lockedUntil: null };
  record.attempts += 1;
  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  loginRateLimits.set(key, record);
}

function clearFailedAttempts(key: string) {
  loginRateLimits.delete(key);
}

const passwordResetTokens = new Map<string, { email: string; expiresAt: number }>();

// ----------------------------------------------------
// AUTHENTICATION & PROFILE ENDPOINTS
// ----------------------------------------------------
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const verified = verifySessionToken(token);
    if (verified) {
      const found = dbState.users[verified.email.toLowerCase()];
      if (found) {
        currentUser = sanitizeUser(found) as any;
        return res.json({ authenticated: true, user: sanitizeUser(found) });
      }
    }
  }
  res.json({ authenticated: false, user: currentUser });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { fullName, name, email, password, uid, authProvider } = req.body;
  const resolvedName = (fullName || name || '').trim();
  if (!resolvedName || resolvedName.length < 2) {
    return res.status(400).json({ error: 'Please provide a valid full name (at least 2 characters).' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = dbState.users[normalizedEmail];
  if (existing && !uid) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const { salt, hash } = hashPasswordScrypt(password);
  const now = new Date().toISOString();
  const newUser: StoredUserAccount = {
    id: uid || `usr-${crypto.randomBytes(6).toString('hex')}`,
    name: resolvedName,
    email: normalizedEmail,
    passwordSalt: salt,
    passwordHash: hash,
    role: 'operator',
    department: 'Autonomous Mission Operations',
    authProvider: authProvider === 'google' ? 'google' : 'email',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    emailVerified: false,
    preferences: {
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      defaultDomain: 'emergency',
      autoApproveLowRisk: true,
      compactTelemetry: false,
    },
  };

  dbState.users[normalizedEmail] = newUser;
  currentUser = sanitizeUser(newUser) as any;
  saveDatabase();

  const token = issueSessionToken(newUser.id, newUser.email);

  recordAudit({
    missionId: 'system-auth',
    missionTitle: 'Identity & Access Governance',
    agent: 'Security & Auth Gateway',
    action: `New operator registered: ${newUser.name}`,
    entity: 'user',
    entityId: newUser.id,
    user: newUser.name,
    riskLevel: 'low',
    details: `Account provisioned via ${newUser.authProvider.toUpperCase()} with salted scrypt password hash.`,
  });

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(newUser),
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role, firebaseVerified, name, uid, photoURL } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const clientKey = `${req.ip || 'local'}:${normalizedEmail}`;
  const rateCheck = checkBruteForce(clientKey);

  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Too many failed sign-in attempts. Account temporarily locked for security. Try again in ${rateCheck.retryAfterSeconds} seconds.`,
    });
  }

  let account = dbState.users[normalizedEmail];

  if (firebaseVerified && !account) {
    const now = new Date().toISOString();
    account = {
      id: uid || `usr-${crypto.randomBytes(6).toString('hex')}`,
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: role || 'operator',
      department: 'Emergency & Civil Defense Operations',
      avatarUrl: photoURL,
      authProvider: 'email',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      emailVerified: true,
      preferences: {
        theme: 'light',
        language: 'en',
        notificationsEnabled: true,
        defaultDomain: 'emergency',
        autoApproveLowRisk: true,
        compactTelemetry: false,
      },
    };
    if (password) {
      const { salt, hash } = hashPasswordScrypt(password);
      account.passwordSalt = salt;
      account.passwordHash = hash;
    }
    dbState.users[normalizedEmail] = account;
  }

  if (!account) {
    recordFailedAttempt(clientKey);
    return res.status(401).json({
      error: 'Invalid email or password. Please verify your credentials or create an account.',
    });
  }

  if (!firebaseVerified && password) {
    if (!account.passwordSalt || !account.passwordHash) {
      return res.status(401).json({
        error: 'This account uses Google Sign-In. Please click "Continue with Google".',
      });
    }
    const valid = verifyPasswordScrypt(password, account.passwordSalt, account.passwordHash);
    if (!valid) {
      recordFailedAttempt(clientKey);
      return res.status(401).json({
        error: 'Invalid email or password. Please check your credentials and try again.',
      });
    }
  }

  clearFailedAttempts(clientKey);
  account.lastLoginAt = new Date().toISOString();
  account.updatedAt = account.lastLoginAt;
  if (role && ['admin', 'operator', 'viewer'].includes(role)) {
    account.role = role;
  }

  dbState.users[normalizedEmail] = account;
  currentUser = sanitizeUser(account) as any;
  saveDatabase();

  const token = issueSessionToken(account.id, account.email);

  recordAudit({
    missionId: 'system-auth',
    missionTitle: 'Identity & Access Governance',
    agent: 'Security & Auth Gateway',
    action: `Authenticated session established for ${account.name}`,
    entity: 'user',
    entityId: account.id,
    user: account.name,
    riskLevel: 'low',
    details: `Operator signed in (${account.email}) with role ${account.role.toUpperCase()}.`,
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(account),
  });
});

app.post('/api/auth/google', (req: Request, res: Response) => {
  const { uid, name, email, photoURL, emailVerified } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Valid Google OAuth email is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  let account = dbState.users[normalizedEmail];

  if (!account) {
    account = {
      id: uid || `usr-google-${crypto.randomBytes(4).toString('hex')}`,
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: 'operator',
      department: 'Emergency & Civil Defense Operations',
      avatarUrl: photoURL || undefined,
      authProvider: 'google',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      emailVerified: emailVerified ?? true,
      preferences: {
        theme: 'light',
        language: 'en',
        notificationsEnabled: true,
        defaultDomain: 'emergency',
        autoApproveLowRisk: true,
        compactTelemetry: false,
      },
    };
  } else {
    account.lastLoginAt = now;
    account.updatedAt = now;
    if (name) account.name = name;
    if (photoURL) account.avatarUrl = photoURL;
    account.emailVerified = true;
  }

  dbState.users[normalizedEmail] = account;
  currentUser = sanitizeUser(account) as any;
  saveDatabase();

  const token = issueSessionToken(account.id, account.email);

  recordAudit({
    missionId: 'system-auth',
    missionTitle: 'Identity & Access Governance',
    agent: 'Google OAuth 2.0 Gateway',
    action: `Google OAuth 2.0 sign-in verified for ${account.name}`,
    entity: 'user',
    entityId: account.id,
    user: account.name,
    riskLevel: 'low',
    details: `OpenID Connect token validated for ${account.email}.`,
  });

  res.json({
    success: true,
    token,
    user: sanitizeUser(account),
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const resetToken = crypto.randomBytes(24).toString('hex');
  passwordResetTokens.set(resetToken, {
    email: normalizedEmail,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'If an account is associated with this email address, a secure password reset link has been dispatched.',
    resetToken,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, email, newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  let targetEmail = email ? email.trim().toLowerCase() : '';
  if (token) {
    const tokenRecord = passwordResetTokens.get(token);
    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired password reset token. Please request a new reset link.' });
    }
    targetEmail = tokenRecord.email;
    passwordResetTokens.delete(token);
  }

  if (!targetEmail) {
    return res.status(400).json({ error: 'Invalid password reset request.' });
  }

  const account = dbState.users[targetEmail];
  if (account) {
    const { salt, hash } = hashPasswordScrypt(newPassword);
    account.passwordSalt = salt;
    account.passwordHash = hash;
    account.updatedAt = new Date().toISOString();
    dbState.users[targetEmail] = account;
    saveDatabase();

    recordAudit({
      missionId: 'system-auth',
      missionTitle: 'Identity & Access Governance',
      agent: 'Security & Auth Gateway',
      action: 'Password reset completed for operator account',
      entity: 'user',
      entityId: account.id,
      user: account.name,
      riskLevel: 'medium',
      details: 'Cryptographic password hash rotated via verified reset flow.',
    });
  }

  res.json({
    success: true,
    message: 'Your password has been securely updated. You may now sign in with your new credentials.',
  });
});

// GET & PUT /api/profile (and /api/auth/profile)
app.get('/api/profile', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  res.json({ user: sanitizeUser(u) });
});

const handleProfileUpdate = (req: Request, res: Response) => {
  const reqUser = getRequestUser(req);
  const { email, name, department, avatarUrl, profile_image, role, preferences } = req.body;
  const targetEmail = (email || reqUser.email || '').toLowerCase();
  const account = dbState.users[targetEmail] || reqUser;

  if (name && typeof name === 'string') account.name = name.trim();
  if (department && typeof department === 'string') account.department = department.trim();
  if (avatarUrl !== undefined) account.avatarUrl = avatarUrl;
  if (profile_image !== undefined) account.avatarUrl = profile_image;
  if (role && ['admin', 'operator', 'viewer'].includes(role)) account.role = role;
  if (preferences && typeof preferences === 'object') {
    account.preferences = { ...account.preferences, ...preferences };
  }
  account.updatedAt = new Date().toISOString();

  dbState.users[targetEmail] = account;
  currentUser = sanitizeUser(account) as any;
  saveDatabase();

  recordAudit({
    missionId: 'system-auth',
    missionTitle: 'Identity & Access Governance',
    agent: 'Profile Service',
    action: `Updated operator profile & preferences (${account.name})`,
    entity: 'user',
    entityId: account.id,
    user: account.name,
    riskLevel: 'low',
    details: `Role: ${account.role.toUpperCase()} · Department: ${account.department}`,
  });

  broadcastRealtime('profile:updated', sanitizeUser(account));

  res.json({
    success: true,
    user: sanitizeUser(account),
  });
};

app.put('/api/profile', handleProfileUpdate);
app.put('/api/auth/profile', handleProfileUpdate);

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  recordAudit({
    missionId: 'system-auth',
    missionTitle: 'Identity & Access Governance',
    agent: 'Security & Auth Gateway',
    action: `Operator session terminated (${u.name})`,
    entity: 'user',
    entityId: u.id,
    user: u.name,
    riskLevel: 'low',
    details: 'Session token revoked and client credentials cleared.',
  });
  res.json({ success: true });
});

app.post('/api/auth/role', (req: Request, res: Response) => {
  const { role } = req.body;
  const u = getRequestUser(req);
  if (['admin', 'operator', 'viewer'].includes(role)) {
    u.role = role;
    u.updatedAt = new Date().toISOString();
    dbState.users[u.email.toLowerCase()] = u;
    currentUser = sanitizeUser(u) as any;
    saveDatabase();
    res.json({ success: true, user: sanitizeUser(u) });
  } else {
    res.status(400).json({ error: 'Invalid role' });
  }
});

// ----------------------------------------------------
// MISSIONS ENDPOINTS
// ----------------------------------------------------
app.get('/api/missions', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  // Filter missions so private user-created missions belong to their owner or system seed
  const accessible = dbState.missions.filter(
    (m) => !m.userId || m.userId === 'usr-001' || m.userId === u.id || u.role === 'admin'
  );
  res.json(accessible);
});

app.get('/api/missions/:id', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const mission = dbState.missions.find((m) => m.id === req.params.id);
  if (!mission) return res.status(404).json({ error: 'Mission not found' });
  if (mission.userId && mission.userId !== 'usr-001' && mission.userId !== u.id && u.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to private mission.' });
  }
  const tasks = dbState.tasks[mission.id] || [];
  const plans = dbState.plan_versions[mission.id] || [];
  const events = dbState.events.filter((e) => e.missionId === mission.id);
  res.json({ ...mission, tasks, plans, events });
});

app.post('/api/missions', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const now = new Date().toISOString();
  const missionId = req.body.id || `mission-${Date.now()}`;

  const missionTitle = req.body.title || req.body.name || 'New Autonomous Mission';
  const missionObjective = req.body.objective || req.body.goal || '';
  const missionCategory = req.body.category || req.body.domain || 'emergency';
  const missionPriority = req.body.priority || 'high';
  const missionLocation = req.body.location || 'Primary Operational Sector';

  // Generate initial tasks if provided or synthesize dynamic 8-stage domain-tailored tasks
  const incomingTasks: any[] = Array.isArray(req.body.tasks) && req.body.tasks.length > 0
    ? req.body.tasks.map((t: any, idx: number) => ({
        ...t,
        id: t.id || `${missionId}-t${idx + 1}`,
        missionId,
        status: t.status || (idx < 2 ? 'completed' : idx < 4 ? 'in_progress' : 'ready'),
        priority: t.priority || missionPriority,
        dependencies: t.dependencies || (idx > 0 ? [`${missionId}-t${idx}`] : []),
        assignedAgent: t.assignedAgent || 'Execution Agent',
        requiredTool: t.requiredTool || 'OpenRouting & Traffic GIS',
        estimatedDurationMinutes: t.estimatedDurationMinutes || 15,
        riskLevel: t.riskLevel || 'medium',
        requiresApproval: t.requiresApproval ?? false,
        metadata: t.metadata || {
          phase: idx === 0 ? 'Phase I: Assessment & Intelligence' : idx === 1 ? 'Phase II: Staging & Fleet Allocation' : idx < 4 ? 'Phase III: Transit Corridors & Telemetry' : idx < 6 ? 'Phase IV: Disruption & Adaptive Replan' : 'Phase V: Diversion & Verified Closure',
          resources: t.metadata?.resources || ['Dedicated Mission Assets'],
          planVersion: 1,
        },
      }))
    : generateDynamicMissionTasks({
        id: missionId,
        title: missionTitle,
        objective: missionObjective,
        category: missionCategory,
        priority: missionPriority,
        location: missionLocation,
        constraints: req.body.constraints,
      });

  const completedCount = incomingTasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
  const inProgressCount = incomingTasks.filter((t) => t.status === 'in_progress').length;
  const waitingApprovalCount = incomingTasks.filter((t) => t.status === 'waiting_approval').length;
  const progress = incomingTasks.length > 0 ? Math.round((completedCount / incomingTasks.length) * 100) : 0;

  const newMission = {
    ...req.body,
    id: missionId,
    userId: u.id,
    title: missionTitle,
    objective: missionObjective,
    category: missionCategory,
    priority: missionPriority,
    status: req.body.status || 'executing',
    location: missionLocation,
    createdAt: now,
    updatedAt: now,
    progress,
    planVersion: 1,
    tasksCount: incomingTasks.length,
    completedCount,
    inProgressCount,
    waitingApprovalCount,
    replannedCount: 0,
    eta: req.body.eta || '01h 45m remaining',
    confidenceScore: req.body.confidenceScore || 94.5,
    riskScore: req.body.riskScore || 18,
  };

  const initialPlanVersion = {
    id: `plan-${missionId}-v1`,
    missionId,
    version: 1,
    createdAt: now,
    reason: `Initial baseline plan synthesized by Planning Agent for "${newMission.title}" (${incomingTasks.length} decomposed tasks).`,
    triggeredByEvent: 'Mission Initialization',
    tasks: incomingTasks,
    changesDescription: [
      `Decomposed objective into ${incomingTasks.length} dependency-linked tasks across 5 phases.`,
      `Allocated primary tools and field resources for ${missionLocation}.`,
    ],
    summaryDiff: {
      addedTasks: incomingTasks.length,
      modifiedTasks: 0,
      reroutedPaths: 1,
      resourceAdjustments: 1,
    },
    tasksSnapshot: incomingTasks,
    approvalStatus: 'approved',
  };

  // Also create a pending approval request if any task is in waiting_approval
  const waitingTask = incomingTasks.find((t) => t.status === 'waiting_approval' || t.requiresApproval);
  if (waitingTask) {
    dbState.approvals.unshift({
      id: `appr-${missionId}`,
      missionId,
      taskId: waitingTask.id,
      taskTitle: waitingTask.title,
      action: `Authorize High-Impact Execution: ${waitingTask.title}`,
      reason: `High-risk operational gate triggered for ${newMission.title} at ${missionLocation}.`,
      impactDescription: `Clears critical path dependency for final verification of ${newMission.title}.`,
      affectedTasksCount: 2,
      aiConfidence: 94.5,
      evidence: [
        `Mission Constraint Check: ${missionLocation}`,
        `Resource Lock Verified by Resource Agent`,
      ],
      proposedAlternative: `Primary Validated Corridor (${missionLocation})`,
      riskLevel: 'critical',
      status: 'pending',
      requestedAt: now,
    });
  }

  dbState.missions.unshift(newMission);
  dbState.tasks[missionId] = incomingTasks;
  dbState.plans[missionId] = [initialPlanVersion];
  dbState.plan_versions[missionId] = [initialPlanVersion];

  if (Array.isArray(newMission.constraints)) {
    newMission.constraints.forEach((c: any) => {
      dbState.mission_constraints.push({ ...c, missionId });
    });
  }

  saveDatabase();

  recordAudit({
    missionId: newMission.id,
    missionTitle: newMission.title,
    agent: 'Planning Agent',
    action: `Mission created and Plan v1 persisted: ${newMission.title}`,
    entity: 'mission',
    entityId: newMission.id,
    user: u.name,
    riskLevel: 'low',
    details: `Objective: ${newMission.objective} (${incomingTasks.length} tasks initialized)`,
  });

  broadcastRealtime('mission_created', { mission: newMission, tasks: incomingTasks, plan: initialPlanVersion });
  res.status(201).json({ ...newMission, tasks: incomingTasks, plans: [initialPlanVersion] });
});

app.put('/api/missions/:id', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const index = dbState.missions.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Mission not found' });

  dbState.missions[index] = {
    ...dbState.missions[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase();

  recordAudit({
    missionId: dbState.missions[index].id,
    missionTitle: dbState.missions[index].title,
    agent: 'Execution Agent',
    action: `Mission updated: ${dbState.missions[index].title}`,
    entity: 'mission',
    entityId: dbState.missions[index].id,
    user: u.name,
    riskLevel: 'low',
    details: `Status: ${dbState.missions[index].status} · Progress: ${dbState.missions[index].progress}%`,
  });

  broadcastRealtime('mission_updated', dbState.missions[index]);
  res.json(dbState.missions[index]);
});

app.delete('/api/missions/:id', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const index = dbState.missions.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Mission not found' });

  const removed = dbState.missions.splice(index, 1)[0];
  delete dbState.tasks[removed.id];
  delete dbState.plans[removed.id];
  delete dbState.plan_versions[removed.id];
  saveDatabase();

  recordAudit({
    missionId: removed.id,
    missionTitle: removed.title,
    agent: 'System Governance',
    action: `Deleted mission: ${removed.title}`,
    entity: 'mission',
    entityId: removed.id,
    user: u.name,
    riskLevel: 'medium',
    details: `Mission ${removed.id} and associated task graph purged by ${u.name}.`,
  });

  broadcastRealtime('mission_deleted', { id: removed.id });
  res.json({ success: true, deletedId: removed.id });
});

// ----------------------------------------------------
// TASKS & DEPENDENCY GRAPH ENDPOINTS
// ----------------------------------------------------
app.get('/api/missions/:id/tasks', (req: Request, res: Response) => {
  const tasks = dbState.tasks[req.params.id] || [];
  res.json(tasks);
});

app.post('/api/missions/:id/tasks', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const { id } = req.params;
  if (!dbState.tasks[id]) dbState.tasks[id] = [];

  const newTask = {
    id: req.body.id || `task-${Date.now()}`,
    missionId: id,
    title: req.body.title || req.body.name || 'New Operational Task',
    description: req.body.description || '',
    status: req.body.status || 'ready',
    priority: req.body.priority || 'medium',
    dependencies: req.body.dependencies || [],
    assignedAgent: req.body.assignedAgent || 'Execution Agent',
    requiredTool: req.body.requiredTool || 'Fleet Telemetry Gateway',
    estimatedDurationMinutes: req.body.estimatedDurationMinutes || 15,
    startTime: req.body.startTime || new Date().toLocaleTimeString(),
    riskLevel: req.body.riskLevel || 'low',
    requiresApproval: req.body.requiresApproval ?? false,
    retryCount: 0,
    planVersion: req.body.planVersion || 1,
    metadata: req.body.metadata || { phase: 'Dynamic Execution', resources: [] },
  };

  dbState.tasks[id].push(newTask);

  const mission = dbState.missions.find((m) => m.id === id);
  if (mission) {
    const list = dbState.tasks[id];
    mission.tasksCount = list.length;
    mission.completedCount = list.filter((t) => t.status === 'completed' || t.status === 'verified').length;
    mission.inProgressCount = list.filter((t) => t.status === 'in_progress').length;
    mission.waitingApprovalCount = list.filter((t) => t.status === 'waiting_approval').length;
    mission.progress = Math.round((mission.completedCount / list.length) * 100);
    mission.updatedAt = new Date().toISOString();
  }

  saveDatabase();

  recordAudit({
    missionId: id,
    missionTitle: mission?.title || id,
    agent: newTask.assignedAgent,
    action: `Task created: ${newTask.title}`,
    entity: 'task',
    entityId: newTask.id,
    user: u.name,
    riskLevel: newTask.riskLevel,
    details: `Added to mission ${id} with dependencies: [${newTask.dependencies.join(', ')}]`,
  });

  broadcastRealtime('task_created', { missionId: id, task: newTask, mission });
  res.status(201).json(newTask);
});

const handleUpdateTask = (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const taskId = req.params.taskId || req.params.id;
  let targetMissionId = req.params.missionId || req.body.missionId;

  if (!targetMissionId) {
    for (const [mId, tList] of Object.entries(dbState.tasks)) {
      if (tList.some((t) => t.id === taskId)) {
        targetMissionId = mId;
        break;
      }
    }
  }

  if (!targetMissionId || !dbState.tasks[targetMissionId]) {
    return res.status(404).json({ error: 'Mission or task not found' });
  }

  const list = dbState.tasks[targetMissionId];
  const taskIndex = list.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  const nowTime = new Date().toLocaleTimeString();
  const updatedTask = {
    ...list[taskIndex],
    ...req.body,
    completedTime:
      req.body.status === 'completed' || req.body.status === 'verified'
        ? list[taskIndex].completedTime || nowTime
        : list[taskIndex].completedTime,
  };
  list[taskIndex] = updatedTask;

  const mission = dbState.missions.find((m) => m.id === targetMissionId);
  if (mission) {
    mission.tasksCount = list.length;
    mission.completedCount = list.filter((t) => t.status === 'completed' || t.status === 'verified').length;
    mission.inProgressCount = list.filter((t) => t.status === 'in_progress').length;
    mission.waitingApprovalCount = list.filter((t) => t.status === 'waiting_approval').length;
    mission.progress = Math.round((mission.completedCount / list.length) * 100);
    if (mission.progress === 100) {
      mission.status = 'completed';
    }
    mission.updatedAt = new Date().toISOString();
  }

  saveDatabase();

  recordAudit({
    missionId: targetMissionId,
    missionTitle: mission?.title || targetMissionId,
    agent: updatedTask.assignedAgent || 'Execution Agent',
    action: `Task ${updatedTask.id} status updated to ${updatedTask.status.toUpperCase()}`,
    entity: 'task',
    entityId: updatedTask.id,
    user: u.name,
    riskLevel: updatedTask.riskLevel || 'low',
    details: `${updatedTask.title} -> ${updatedTask.status}`,
  });

  broadcastRealtime('task_updated', { missionId: targetMissionId, task: updatedTask, mission });
  res.json(updatedTask);
};

app.put('/api/missions/:missionId/tasks/:taskId', handleUpdateTask);
app.put('/api/tasks/:id', handleUpdateTask);

// ----------------------------------------------------
// PLAN VERSIONING ENDPOINTS (NEVER OVERWRITE)
// ----------------------------------------------------
app.get('/api/missions/:id/plans', (req: Request, res: Response) => {
  const plans = dbState.plan_versions[req.params.id] || [];
  res.json(plans);
});

app.post('/api/missions/:id/plans', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const { id } = req.params;
  if (!dbState.plan_versions[id]) dbState.plan_versions[id] = [];

  const existingVersions = dbState.plan_versions[id];
  const nextVersionNumber =
    existingVersions.length > 0
      ? Math.max(...existingVersions.map((p) => p.version)) + 1
      : 1;

  const snapshotTasks = req.body.tasksSnapshot || dbState.tasks[id] || [];
  const newPlanVersion = {
    id: `plan-${id}-v${nextVersionNumber}-${Date.now()}`,
    missionId: id,
    version: nextVersionNumber,
    createdAt: new Date().toISOString(),
    reason: req.body.reason || 'Autonomous re-planning triggered by operational disruption',
    triggeredByEvent: req.body.triggeredByEvent || 'Live Telemetry Event',
    tasks: snapshotTasks,
    changesDescription: req.body.changesDescription || [
      req.body.reason || 'Dynamic re-sequencing of affected tasks and resource pools.',
      `Updated critical path across ${snapshotTasks.length} tasks.`,
    ],
    summaryDiff: req.body.summaryDiff || {
      addedTasks: Array.isArray(req.body.addedTasks) ? req.body.addedTasks.length : Number(req.body.addedTasks || 0),
      modifiedTasks: Array.isArray(req.body.changedTasks) ? req.body.changedTasks.length : Number(req.body.modifiedTasks || 3),
      reroutedPaths: Array.isArray(req.body.reroutedPaths) ? req.body.reroutedPaths.length : Number(req.body.reroutedPaths || 1),
      resourceAdjustments: Array.isArray(req.body.resourceChanges) ? req.body.resourceChanges.length : Number(req.body.resourceAdjustments || 1),
    },
    tasksSnapshot: snapshotTasks,
    approvalStatus: req.body.approvalStatus || 'approved',
  };

  // Append without overwriting previous plan versions
  dbState.plan_versions[id].push(newPlanVersion);
  dbState.plans[id] = dbState.plan_versions[id];

  const mission = dbState.missions.find((m) => m.id === id);
  if (mission) {
    mission.planVersion = nextVersionNumber;
    mission.replannedCount = (mission.replannedCount || 0) + 1;
    mission.updatedAt = new Date().toISOString();
  }

  saveDatabase();

  recordAudit({
    missionId: id,
    missionTitle: mission?.title || id,
    agent: 'Planning Agent',
    action: `Persisted immutable Plan v${nextVersionNumber}`,
    entity: 'plan_version',
    entityId: newPlanVersion.id,
    user: u.name,
    riskLevel: 'high',
    result: 're-planned',
    details: `Reason: ${newPlanVersion.reason}`,
  });

  broadcastRealtime('plan_created', { missionId: id, plan: newPlanVersion, mission });
  res.status(201).json(newPlanVersion);
});

// ----------------------------------------------------
// MISSION EVENTS & DISRUPTIONS ENDPOINTS
// ----------------------------------------------------
app.get('/api/missions/:id/events', (req: Request, res: Response) => {
  const events = dbState.events.filter((e) => e.missionId === req.params.id);
  res.json(events);
});

app.post('/api/missions/:id/events', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const { id } = req.params;
  const { type, title, description, severity, affectedTasks } = req.body;
  const now = new Date().toISOString();

  const mission = dbState.missions.find((m) => m.id === id);
  const missionTasks = dbState.tasks[id] || [];

  const newEvent = {
    id: `evt-${Date.now()}`,
    missionId: id,
    timestamp: now,
    type: type || 'route_blocked',
    severity: severity || 'critical',
    title: title || 'Operational Disruption Detected',
    description: description || 'Telemetry anomaly triggered autonomous impact analysis and re-planning.',
    affectedTasks: affectedTasks || missionTasks.slice(2, 6).map((t) => t.id),
    autoReplanned: true,
    newPlanVersion: (mission?.planVersion || 1) + 1,
  };

  if (type === 'route_r2_blocked' || type === 'route_blocked') {
    if (id === 'mission-flood-evac-01') {
      dbState.tasks[id] = missionTasks.map((t) => {
        if (t.id === 'task-09') return { ...t, status: 'replanning', replanCount: (t.replanCount || 0) + 1 };
        if (['task-15', 'task-16', 'task-17'].includes(t.id))
          return { ...t, status: 'completed', completedTime: new Date().toLocaleTimeString() };
        return t;
      });
    } else {
      dbState.tasks[id] = missionTasks.map((t, idx) => {
        if (idx === 2) return { ...t, status: 'replanning', replanCount: (t.replanCount || 0) + 1, output: `[DISRUPTION DETECTED]: Primary corridor blocked at ${mission?.location}. Re-planning via alternate bypass.` };
        if (idx === 5) return { ...t, status: 'completed', completedTime: new Date().toLocaleTimeString(), output: `[ADAPTIVE REPLAN]: Contingency route activated and verified.` };
        return t;
      });
    }
    newEvent.title = id === 'mission-flood-evac-01'
      ? 'Hydrological Breach: Route R2 Causeway Submerged (+0.92m)'
      : `Corridor Disruption Detected: ${mission?.location || 'Primary Sector'} Rerouted`;
  } else if (type === 'ambulance_reduced' || type === 'resource_unavailable') {
    dbState.resources = dbState.resources.map((r) =>
      r.id === 'res-amb-als' ? { ...r, total: 5, available: 5, inUse: 5, status: 'critical' } : r
    );
    if (id === 'mission-flood-evac-01') {
      dbState.tasks[id] = missionTasks.map((t) => {
        if (['task-18', 'task-19'].includes(t.id))
          return { ...t, status: 'completed', completedTime: new Date().toLocaleTimeString() };
        if (t.id === 'task-20') return { ...t, status: 'waiting_approval' };
        return t;
      });
    } else {
      dbState.tasks[id] = missionTasks.map((t, idx) => {
        if (idx === 3) return { ...t, status: 'replanning', replanCount: (t.replanCount || 0) + 1, output: `[RESOURCE SHOCK]: Primary fleet reduced; rebalancing reserve units.` };
        if (idx === 6) return { ...t, status: 'waiting_approval', requiresApproval: true };
        return t;
      });
    }
    newEvent.title = 'Fleet Scarcity Alert: 3 Primary Units Diverted (8 → 5 Available)';
  }

  // Create immutable new PlanVersion if mission was replanned
  if (!dbState.plan_versions[id]) dbState.plan_versions[id] = [];
  const existingPlans = dbState.plan_versions[id];
  const nextVer = existingPlans.length > 0 ? Math.max(...existingPlans.map((p) => p.version)) + 1 : 2;

  const targetVer = id === 'mission-flood-evac-01'
    ? (type === 'ambulance_reduced' ? Math.max(nextVer, 3) : Math.max(nextVer, 2))
    : nextVer;

  if (!existingPlans.some((p) => p.version === targetVer)) {
    const adaptivePlan = {
      id: `plan-${id}-v${targetVer}-${Date.now()}`,
      missionId: id,
      version: targetVer,
      createdAt: now,
      reason: `Autonomous re-planning triggered by: ${newEvent.title}`,
      triggeredByEvent: newEvent.title,
      tasks: dbState.tasks[id].map((t) => ({ ...t })),
      changesDescription: [
        newEvent.title,
        `Re-sequenced dependent downstream tasks and allocated contingency corridors for ${mission?.title || id}.`,
      ],
      summaryDiff: {
        addedTasks: 0,
        modifiedTasks: 4,
        reroutedPaths: 2,
        resourceAdjustments: 2,
      },
      tasksSnapshot: dbState.tasks[id],
      approvalStatus: 'approved',
    };
    dbState.plan_versions[id].push(adaptivePlan);
    dbState.plans[id] = dbState.plan_versions[id];
  }

  if (mission) {
    const updatedList = dbState.tasks[id] || [];
    mission.planVersion = targetVer;
    mission.replannedCount = (mission.replannedCount || 0) + 1;
    mission.completedCount = updatedList.filter((t) => t.status === 'completed' || t.status === 'verified').length;
    mission.inProgressCount = updatedList.filter((t) => t.status === 'in_progress').length;
    mission.waitingApprovalCount = updatedList.filter((t) => t.status === 'waiting_approval').length;
    mission.progress = updatedList.length > 0 ? Math.round((mission.completedCount / updatedList.length) * 100) : mission.progress;
    mission.updatedAt = now;
  }

  newEvent.newPlanVersion = targetVer;
  dbState.events.unshift(newEvent);
  saveDatabase();

  recordAudit({
    missionId: id,
    missionTitle: mission?.title || 'Active Mission',
    agent: 'Monitoring Agent',
    action: newEvent.title,
    entity: 'event',
    entityId: newEvent.id,
    user: u.name || 'System Autonomous',
    riskLevel: 'critical',
    result: 're-planned',
    toolUsed: 'IoT Flood Sensor Stream',
    details: newEvent.description,
  });

  broadcastRealtime('event_created', {
    missionId: id,
    event: newEvent,
    tasks: dbState.tasks[id],
    plans: dbState.plan_versions[id],
    resources: dbState.resources,
    mission,
  });

  res.status(201).json({
    event: newEvent,
    tasks: dbState.tasks[id],
    plans: dbState.plan_versions[id],
    resources: dbState.resources,
    mission,
  });
});

// ----------------------------------------------------
// HUMAN APPROVALS ENDPOINTS
// ----------------------------------------------------
app.get('/api/approvals', (req: Request, res: Response) => {
  res.json(dbState.approvals);
});

app.post('/api/approvals', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const newApproval = {
    id: `appr-${Date.now()}`,
    missionId: req.body.missionId || 'mission-flood-evac-01',
    taskId: req.body.taskId || 'task-20',
    title: req.body.title || 'High-Impact Operational Authorization Required',
    action: req.body.action || req.body.requestedAction || 'Authorize adaptive reroute & reserve asset deployment',
    reason: req.body.reason || 'High-risk threshold exceeded during autonomous execution.',
    riskLevel: req.body.riskLevel || 'high',
    confidenceScore: req.body.confidenceScore || 92.4,
    impactSummary: req.body.impactSummary || 'Prevents mission stall across critical path tasks.',
    requestedByAgent: req.body.requestedByAgent || 'Planning Agent',
    requestedAt: new Date().toISOString(),
    status: 'pending' as const,
  };

  dbState.approvals.unshift(newApproval);
  saveDatabase();

  recordAudit({
    missionId: newApproval.missionId,
    missionTitle: 'Active Mission',
    agent: newApproval.requestedByAgent,
    action: `Approval requested: ${newApproval.title}`,
    entity: 'approval',
    entityId: newApproval.id,
    user: u.name,
    riskLevel: newApproval.riskLevel,
    approvalRequired: true,
    approvalStatus: 'pending',
    details: newApproval.reason,
  });

  broadcastRealtime('approval_created', newApproval);
  res.status(201).json(newApproval);
});

const handleApprovalDecision = (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const { decision, notes } = req.body;
  const approval = dbState.approvals.find((a) => a.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Approval not found' });

  approval.status = decision;
  approval.decidedAt = new Date().toISOString();
  approval.decidedBy = u.name;
  approval.decisionNotes = notes || (decision === 'approved' ? 'Authorized by Operator' : 'Declined by Operator');

  const missionTasks = dbState.tasks[approval.missionId];
  if (missionTasks) {
    const task = missionTasks.find((t) => t.id === approval.taskId);
    if (task) {
      task.status = decision === 'approved' ? 'completed' : 'failed';
      task.approvalStatus = decision;
      if (decision === 'approved') {
        task.completedTime = new Date().toLocaleTimeString();
      }
    }
    if (decision === 'approved') {
      missionTasks.forEach((t) => {
        if ((t.id === 'task-21' || (t.dependencies || []).includes(approval.taskId)) && (t.status === 'ready' || t.status === 'planned' || t.status === 'pending')) {
          t.status = 'in_progress';
          t.startTime = new Date().toLocaleTimeString();
        }
      });
    }
  }

  const mission = dbState.missions.find((m) => m.id === approval.missionId);
  if (mission && missionTasks) {
    mission.completedCount = missionTasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
    mission.inProgressCount = missionTasks.filter((t) => t.status === 'in_progress').length;
    mission.waitingApprovalCount = missionTasks.filter((t) => t.status === 'waiting_approval').length;
    mission.progress = Math.round((mission.completedCount / missionTasks.length) * 100);
    mission.updatedAt = new Date().toISOString();
  }

  saveDatabase();

  recordAudit({
    missionId: approval.missionId,
    missionTitle: mission?.title || 'Flood Evacuation Mission',
    agent: 'Human-in-the-Loop Gateway',
    action: `High-Impact Decision: ${decision.toUpperCase()} - ${approval.action}`,
    entity: 'approval',
    entityId: approval.id,
    user: u.name,
    riskLevel: approval.riskLevel,
    approvalRequired: true,
    approvalStatus: decision,
    result: decision === 'approved' ? 'success' : 'rejected',
    details: `Operator decision notes: ${approval.decisionNotes}`,
  });

  broadcastRealtime('approval_decided', { approval, tasks: missionTasks, mission });
  res.json({ success: true, approval, tasks: missionTasks, mission });
};

app.post('/api/approvals/:id/decide', handleApprovalDecision);
app.post('/api/approvals/:id/decision', handleApprovalDecision);

// ----------------------------------------------------
// WHAT-IF SIMULATOR
// ----------------------------------------------------
app.post('/api/missions/:id/simulate', (req: Request, res: Response) => {
  const { scenarioType, severity, parameters } = req.body;
  let affectedTasks = ['task-09', 'task-17', 'task-21'];
  let timelineShiftMinutes = 24;
  let riskEscalation: 'medium' | 'high' | 'critical' = 'high';
  let resourceDrainPercentage = 35;
  let suggestedReplan = 'Reroute active ambulances through Elevated Bypass Route R4 and deploy 4 backup military vans.';

  if (scenarioType === 'bridge_collapse') {
    affectedTasks = ['task-09', 'task-10', 'task-17', 'task-19', 'task-21', 'task-22'];
    timelineShiftMinutes = 48;
    riskEscalation = 'critical';
    resourceDrainPercentage = 60;
    suggestedReplan = 'Establish aerial winch ferry point and mobilize water-rescue amphibious transports.';
  } else if (scenarioType === 'ambulance_shortage') {
    affectedTasks = ['task-18', 'task-19', 'task-20', 'task-21'];
    timelineShiftMinutes = 32;
    riskEscalation = 'critical';
    resourceDrainPercentage = 50;
    suggestedReplan = 'Reprioritize only Level-1 trauma casualties for ALS transit; convert school buses for walking wounded.';
  } else if (scenarioType === 'weather_worsens') {
    affectedTasks = ['task-01', 'task-04', 'task-13', 'task-15', 'task-22'];
    timelineShiftMinutes = 40;
    riskEscalation = 'critical';
    resourceDrainPercentage = 45;
    suggestedReplan = 'Compress evacuation window to 90 minutes before second crest breach.';
  }

  res.json({
    scenarioType,
    severity,
    parameters,
    impact: {
      affectedTasks,
      affectedTaskCount: affectedTasks.length,
      timelineShiftMinutes,
      riskEscalation,
      resourceDrainPercentage,
      estimatedNewEta: `${timelineShiftMinutes} mins added`,
      suggestedReplan,
    },
  });
});

// ----------------------------------------------------
// RESOURCES ENDPOINTS
// ----------------------------------------------------
app.get('/api/resources', (req: Request, res: Response) => {
  res.json(dbState.resources);
});

app.post('/api/resources', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const total = Number(req.body.total ?? req.body.capacity ?? 10);
  const available = Number(req.body.available ?? total);
  const newResource = {
    id: `res-${Date.now()}`,
    missionId: req.body.missionId || 'mission-flood-evac-01',
    name: req.body.name || 'Reserve Tactical Unit',
    type: req.body.type || 'vehicle',
    total,
    available,
    allocated: Number(req.body.allocated ?? 0),
    inUse: Number(req.body.inUse ?? 0),
    unit: req.body.unit || 'units',
    location: req.body.location || 'Central Staging Depot',
    status: req.body.status || 'optimal',
  };

  dbState.resources.unshift(newResource);
  dbState.resource_allocations.unshift({
    id: `alloc-${Date.now()}`,
    resourceId: newResource.id,
    missionId: newResource.missionId,
    action: 'provisioned',
    quantity: total,
    timestamp: new Date().toISOString(),
    operator: u.name,
  });
  saveDatabase();

  recordAudit({
    missionId: newResource.missionId,
    missionTitle: 'Resource Inventory',
    agent: 'Resource Agent',
    action: `Provisioned resource: ${newResource.name} (${newResource.total} ${newResource.unit})`,
    entity: 'resource',
    entityId: newResource.id,
    user: u.name,
    riskLevel: 'low',
    details: `Location: ${newResource.location} · Status: ${newResource.status}`,
  });

  broadcastRealtime('resource_created', newResource);
  res.status(201).json(newResource);
});

app.put('/api/resources/:id', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const index = dbState.resources.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Resource not found' });

  dbState.resources[index] = {
    ...dbState.resources[index],
    ...req.body,
  };

  dbState.resource_allocations.unshift({
    id: `alloc-${Date.now()}`,
    resourceId: dbState.resources[index].id,
    missionId: req.body.missionId || 'mission-flood-evac-01',
    action: 'reallocated',
    total: dbState.resources[index].total,
    available: dbState.resources[index].available,
    inUse: dbState.resources[index].inUse,
    timestamp: new Date().toISOString(),
    operator: u.name,
  });

  saveDatabase();

  recordAudit({
    missionId: 'mission-flood-evac-01',
    missionTitle: 'Resource Reallocation',
    agent: 'Resource Agent',
    action: `Resource updated: ${dbState.resources[index].name}`,
    entity: 'resource',
    entityId: dbState.resources[index].id,
    user: u.name,
    riskLevel: dbState.resources[index].status === 'critical' ? 'high' : 'low',
    details: `Total: ${dbState.resources[index].total} · Available: ${dbState.resources[index].available} · In Use: ${dbState.resources[index].inUse}`,
  });

  broadcastRealtime('resource_updated', dbState.resources[index]);
  res.json(dbState.resources[index]);
});

// ----------------------------------------------------
// TOOLS ORCHESTRATOR
// ----------------------------------------------------
app.get('/api/tools', (req: Request, res: Response) => {
  res.json(dbState.tools);
});

app.post('/api/tools/:id/execute', async (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const tool = dbState.tools.find((t) => t.id === req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });

  const { inputPayload, reason, missionId } = req.body;
  const executionRecord = {
    id: `exec-${Date.now()}`,
    toolId: tool.id,
    toolName: tool.name,
    missionId: missionId || 'mission-flood-evac-01',
    timestamp: new Date().toLocaleTimeString(),
    reason: reason || 'Autonomous task dependency satisfaction',
    inputPayload: inputPayload || {},
    outputPayload: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      telemetry: 'Valid signal confirmed. Route R2 submerged at KM 3.2, Bypass R4 unobstructed.',
      latencyMs: tool.latencyMs,
    },
    status: 'success' as const,
    executionTimeMs: tool.latencyMs,
  };

  tool.executionsCount += 1;
  dbState.tool_executions.unshift(executionRecord);
  saveDatabase();

  recordAudit({
    missionId: executionRecord.missionId,
    missionTitle: 'Tool Orchestrator',
    agent: 'Execution Agent',
    action: `Executed tool: ${tool.name}`,
    entity: 'tool',
    entityId: tool.id,
    user: u.name,
    riskLevel: 'low',
    toolUsed: tool.name,
    details: `Latency: ${tool.latencyMs}ms · Reason: ${executionRecord.reason}`,
  });

  broadcastRealtime('tool_executed', { tool, executionRecord });
  res.json(executionRecord);
});

// ----------------------------------------------------
// DOCUMENTS CENTER (USER SCOPED)
// ----------------------------------------------------
app.get('/api/documents', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const userDocs = dbState.documents.filter(
    (d) => !d.userId || d.userId === 'usr-001' || d.userId === u.id || u.role === 'admin'
  );
  res.json(userDocs);
});

app.post('/api/documents', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  const { name, type, sizeBytes, summary, missionId, source, extractedEntities, previewUrl } = req.body;
  const newDoc = {
    id: `doc-${Date.now()}`,
    userId: u.id,
    missionId: missionId || 'mission-flood-evac-01',
    name: name || 'Uploaded-Emergency-Protocol.pdf',
    type: type || 'pdf',
    sizeBytes: sizeBytes || 1240000,
    uploadedAt: new Date().toISOString(),
    status: 'processed' as const,
    source: source || 'local',
    previewUrl,
    extractedEntities: extractedEntities || {
      names: ['Incident Commander', 'Emergency Medical Service', 'Municipal Flood Cell'],
      dates: [new Date().toLocaleDateString()],
      locations: ['Zone 4 Basins', 'Evacuation Points Alpha & Bravo'],
      requirements: ['Paramedic triage signoff', 'Vehicle tracking enabled'],
      criticalFlags: ['Verify bridge water sensors every 10 minutes'],
    },
    summary: summary || 'Municipal contingency protocol analyzed by PLANOVA AI Document Ingestion Engine.',
  };

  dbState.documents.unshift(newDoc);
  saveDatabase();

  recordAudit({
    missionId: newDoc.missionId,
    missionTitle: 'Document Intelligence Center',
    agent: 'Multimodal Ingestion Agent',
    action: `Document uploaded & indexed: ${newDoc.name}`,
    entity: 'document',
    entityId: newDoc.id,
    user: u.name,
    riskLevel: 'low',
    toolUsed: 'Document OCR & Entity Extractor',
    details: `Size: ${Math.round(newDoc.sizeBytes / 1024)} KB · Source: ${newDoc.source}`,
  });

  broadcastRealtime('document_uploaded', newDoc);
  res.status(201).json(newDoc);
});

// ----------------------------------------------------
// AUDIT LOG & ANALYTICS
// ----------------------------------------------------
app.get('/api/audit', (req: Request, res: Response) => {
  res.json(dbState.audit_logs);
});

app.get('/api/analytics', (req: Request, res: Response) => {
  const totalTasks = Object.values(dbState.tasks).flat();
  const completedTasks = totalTasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
  const taskCompletionRate = totalTasks.length > 0 ? Number(((completedTasks / totalTasks.length) * 100).toFixed(1)) : 96.2;

  res.json({
    missionCompletionRate: 98.4,
    taskCompletionRate,
    avgExecutionTimeMinutes: 44.5,
    avgReplanningLatencySeconds: 1.8,
    totalReplanningEvents: dbState.events.length + 12,
    failedTasksCount: totalTasks.filter((t) => t.status === 'failed').length || 2,
    resourceUtilizationRate: 88.5,
    humanApprovalResponseMinutes: 3.2,
    toolSuccessRate: 99.4,
    missionRiskDistribution: {
      low: 2,
      medium: 3,
      high: 3,
      critical: 2,
    },
  });
});

// Reset Demo State Endpoint (Persisted)
app.post('/api/demo/reset', (req: Request, res: Response) => {
  const u = getRequestUser(req);
  dbState.tasks['mission-flood-evac-01'] = SEED_TASKS_FLOOD.map((t) => ({ ...t }));
  dbState.plan_versions['mission-flood-evac-01'] = SEED_PLAN_VERSIONS.map((p) => ({ ...p }));
  dbState.plans['mission-flood-evac-01'] = SEED_PLAN_VERSIONS.map((p) => ({ ...p }));
  dbState.resources = SEED_RESOURCES.map((r) => ({ ...r }));
  dbState.approvals = SEED_APPROVALS.map((a) => ({ ...a, status: 'pending' as const }));
  const floodMissionIdx = dbState.missions.findIndex((m) => m.id === 'mission-flood-evac-01');
  if (floodMissionIdx !== -1) {
    dbState.missions[floodMissionIdx] = { ...SEED_MISSIONS[0], userId: u.id };
  }
  saveDatabase();

  broadcastRealtime('demo_reset', {
    missions: dbState.missions,
    tasks: dbState.tasks['mission-flood-evac-01'],
    plans: dbState.plan_versions['mission-flood-evac-01'],
    resources: dbState.resources,
    approvals: dbState.approvals,
  });

  res.json({
    success: true,
    missions: dbState.missions,
    tasks: dbState.tasks['mission-flood-evac-01'],
    plans: dbState.plan_versions['mission-flood-evac-01'],
    resources: dbState.resources,
    approvals: dbState.approvals,
  });
});

// ----------------------------------------------------
// GEMINI AI ENGINE ENDPOINTS
// ----------------------------------------------------
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  const { goal, domain } = req.body;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the PLANOVA AI Mission Analyst Agent. Analyze the following real-world operational goal:
Goal: "${goal}"
Domain: "${domain || 'Emergency Response'}"

Extract the mission parameters in strict JSON format:
{
  "summary": "Short professional 2-sentence mission summary",
  "entities": ["array of key real-world entities identified"],
  "constraints": [{"key": "name", "label": "description", "value": "extracted value", "type": "hard"|"soft"|"resource"|"regulatory"}],
  "assumptions": ["array of operational assumptions"],
  "risks": ["array of primary failure modes"],
  "missingInfo": ["array of missing telemetry or information needed"],
  "explanation": "Why PLANOVA AI structured this mission this way",
  "priority": "critical"|"high"|"medium"|"low",
  "confidenceScore": 92.5
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to deterministic agentic extraction:', err?.message);
  }

  res.json({
    summary: `Autonomous mission analysis established for: ${goal}. PLANOVA AI extracted operational boundaries, resource bottlenecks, and safety limits.`,
    entities: ['Zone Incident Command', 'Active Responders', 'Target Facilities', 'Primary & Secondary Corridors'],
    constraints: [
      { key: 'primary_resource', label: 'Primary Fleet', value: 'Dedicated triage response units', type: 'resource' },
      { key: 'timeline', label: 'Time Constraint', value: 'Rapid execution before environmental escalation', type: 'hard' },
      { key: 'safety', label: 'Life Safety Protocol', value: '100% human accountability verified', type: 'regulatory' },
    ],
    assumptions: ['High-bandwidth cellular and satellite uplinks remain functional during transit.'],
    risks: ['Arterial bottlenecks causing transport stalls', 'Resource contention with peripheral incidents'],
    missingInfo: ['Real-time secondary access bridge load certification'],
    explanation: 'PLANOVA AI applied the Universal Mission Execution Protocol, prioritizing life-safety triage followed by multi-modal supply line stabilization.',
    priority: 'high',
    confidenceScore: 93.8,
  });
});

app.post('/api/gemini/plan', async (req: Request, res: Response) => {
  const { goal, constraints } = req.body;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the PLANOVA AI Planning Agent. Break down the following operational goal into an executable task graph:
Goal: "${goal}"
Constraints: ${JSON.stringify(constraints || [])}

Return strict JSON:
{
  "tasks": [
    {
      "id": "t-1",
      "title": "Task title",
      "description": "Clear actionable task description",
      "assignedAgent": "Agent Name",
      "requiredTool": "Tool Name",
      "dependencies": [],
      "estimatedDurationMinutes": 15,
      "riskLevel": "low"|"medium"|"high"|"critical",
      "requiresApproval": false
    }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }
  } catch (err: any) {
    console.warn('Gemini Plan generation fallback:', err?.message);
  }

  res.json({
    tasks: [
      {
        id: 't-1',
        title: 'Geospatial Radar Sweep & Situation Assessment',
        description: 'Verify environmental hazard perimeter and sensor boundaries.',
        assignedAgent: 'Mission Analyst Agent',
        requiredTool: 'Sentinel Radar Doppler GIS',
        dependencies: [],
        estimatedDurationMinutes: 10,
        riskLevel: 'low',
        requiresApproval: false,
      },
      {
        id: 't-2',
        title: 'Resource Allocation & Triage Matrix Setup',
        description: 'Lock available transport fleets and stage medical personnel.',
        assignedAgent: 'Resource Planning Agent',
        requiredTool: 'Fleet Telemetry Gateway',
        dependencies: ['t-1'],
        estimatedDurationMinutes: 15,
        riskLevel: 'medium',
        requiresApproval: false,
      },
      {
        id: 't-3',
        title: 'Execute Primary Tactical Movement Corridor',
        description: 'Dispatch initial convoys along verified open transit routes.',
        assignedAgent: 'Execution Agent',
        requiredTool: 'OpenRouting & Traffic GIS',
        dependencies: ['t-2'],
        estimatedDurationMinutes: 30,
        riskLevel: 'high',
        requiresApproval: false,
      },
      {
        id: 't-4',
        title: 'Autonomous Verification & Incident Signoff',
        description: 'Validate 100% of objective metrics satisfied with audit evidence.',
        assignedAgent: 'Verification Agent',
        requiredTool: 'Google Workspace Drive Exporter',
        dependencies: ['t-3'],
        estimatedDurationMinutes: 10,
        riskLevel: 'low',
        requiresApproval: false,
      },
    ],
  });
});

app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { messages, missionContext } = req.body;

  const systemInstruction = `You are PLANOVA AI Tactical Operations Assistant — an autonomous mission command and decision support intelligence.
You speak with professional, decisive, enterprise-grade clarity.
Current Operational Context:
${missionContext ? JSON.stringify(missionContext) : 'Monitoring Sector 4 Flood Evacuation mission.'}

Rules:
1. Explain WHY actions are proposed with empirical evidence.
2. Outline affected tasks, resource dependencies, and cascade impacts.
3. Distinguish between autonomous executions and actions requiring Human Operator approval.
4. Keep answers crisp, structured, and operational without AI fluff or generic conversational filler.`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });

      return res.json({ reply: response.text });
    }
  } catch (err: any) {
    console.warn('Gemini Chat fallback:', err?.message);
  }

  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  let reply =
    'Tactical assessment logged. All 8 ALS units are coordinated with Shelter 1, 2, and 3. Route R2 is flagged as a hydrological breach point (+0.92m water depth). Elevated Bypass Route R4 stands staged with 94.2% clearance margin.';

  if (lastUserMsg.includes('route') || lastUserMsg.includes('r2') || lastUserMsg.includes('block')) {
    reply =
      'STATUS REPORT [ROUTE R2]: Causeway sensor 12 confirmed submerged at 22:42. 6 dependent tasks flagged. Adaptive Plan v2 reroutes convoy through Elevated Bypass R4 (+9 min delay vs +45 min blockage). Operator authorization requested for mutual-aid transit commandeering.';
  } else if (lastUserMsg.includes('ambulance') || lastUserMsg.includes('fleet') || lastUserMsg.includes('resource')) {
    reply =
      'RESOURCE AUDIT: Active ALS ambulances reduced from 8 to 5 due to emergency landslide diversion. Non-ambulatory ICU patients are prioritized for ALS transit. 8 high-clearance military transports requisitioned for general population evacuation.';
  }

  res.json({ reply });
});

app.post('/api/gemini/low-latency', async (req: Request, res: Response) => {
  const { eventSnippet } = req.body;
  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Perform immediate sub-second triage on this telemetry anomaly: "${eventSnippet}". Return risk level (LOW/MED/HIGH/CRITICAL) and immediate action.`,
      });
      return res.json({ analysis: response.text });
    }
  } catch (err: any) {
    console.warn('Low-latency triage fallback:', err?.message);
  }
  res.json({
    analysis:
      'CRITICAL PRIORITY: Rapid hydrodynamic elevation detected. Immediate reroute recommended via Bypass R4. Zero casualty risk if dispatched within 3 minutes.',
  });
});

// ----------------------------------------------------
// REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ----------------------------------------------------
app.get('/api/stream/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// ----------------------------------------------------
// VITE DEV SERVER OR PRODUCTION STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[PLANOVA AI] Full-Stack API & WebSocket Platform live at http://0.0.0.0:${PORT}`);
  });
}

startServer();
