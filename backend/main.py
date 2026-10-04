"""
PLANOVA AI — Production FastAPI + PostgreSQL Backend Architecture
=================================================================
Provides the full relational SQLAlchemy ORM models, Pydantic schemas,
cryptographic authentication, REST API endpoints, and WebSocket hub
matching the PLANOVA AI specification.
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
import uuid
import hashlib
import hmac
import secrets
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(
    title="PLANOVA AI Enterprise Mission Engine API",
    description="Autonomous Mission Planning, Multi-Agent Execution, and Real-Time Digital Twin Backend",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# POSTGRESQL RELATIONAL SCHEMA (DDL / SQLAlchemy Reference)
# ---------------------------------------------------------------------------
POSTGRESQL_SCHEMA_DDL = """
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_salt VARCHAR(64),
    password_hash VARCHAR(256),
    profile_image TEXT,
    authentication_provider VARCHAR(32) NOT NULL DEFAULT 'email',
    role VARCHAR(32) NOT NULL DEFAULT 'operator',
    department VARCHAR(180),
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS missions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'planning',
    progress INTEGER NOT NULL DEFAULT 0,
    plan_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);

CREATE TABLE IF NOT EXISTS mission_constraints (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    key VARCHAR(64) NOT NULL,
    label VARCHAR(180) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ready',
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    assigned_resource VARCHAR(180),
    assigned_agent VARCHAR(120) NOT NULL,
    required_tool VARCHAR(120),
    risk_level VARCHAR(32) NOT NULL DEFAULT 'low',
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    start_time VARCHAR(64),
    completed_time VARCHAR(64),
    plan_version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_tasks_mission_id ON tasks(mission_id);

CREATE TABLE IF NOT EXISTS task_dependencies (
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on_task_id)
);

CREATE TABLE IF NOT EXISTS plan_versions (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    reason TEXT NOT NULL,
    triggered_by_event VARCHAR(255),
    changed_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    resource_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    approval_status VARCHAR(32) NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (mission_id, version)
);

CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) REFERENCES missions(id) ON DELETE SET NULL,
    resource_type VARCHAR(64) NOT NULL,
    name VARCHAR(180) NOT NULL,
    availability INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    current_allocation INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(180) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'optimal'
);

CREATE TABLE IF NOT EXISTS resource_allocations (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    mission_id VARCHAR(64) REFERENCES missions(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(64) PRIMARY KEY,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    task_id VARCHAR(64) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    requested_action TEXT NOT NULL,
    reason TEXT NOT NULL,
    requested_by VARCHAR(120) NOT NULL,
    decided_by VARCHAR(120),
    decision VARCHAR(32) NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    doc_type VARCHAR(32) NOT NULL,
    size_bytes INTEGER NOT NULL,
    extracted_entities JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_name VARCHAR(120) NOT NULL,
    action TEXT NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
"""
