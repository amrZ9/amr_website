"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Copy, Check, RotateCcw, ArrowLeft, Users } from "lucide-react";
import { STREET_NPCS } from "@/data/streetWorld";
import neighborhoodWorld from "@/data/neighborhoodWorld.json";

interface NpcProfile {
  name: string;
  story: string;
  connections: string[]; // up to 3 NPC IDs (e.g. "NPC-04")
  topics?: string[];
}

type HubState = Record<string, NpcProfile>;

const STORAGE_KEY = "amrz9_npc_hub_v2";

const DEFAULT_HUB: HubState = Object.fromEntries(
  (neighborhoodWorld.npcs as Array<{
    npcId: string;
    name: string;
    story: string;
    connections: string[];
    topics?: string[];
  }>).map((n) => [
    n.npcId,
    {
      name: n.name ?? "",
      story: n.story ?? "",
      connections: n.connections ?? [],
      topics: n.topics ?? [],
    },
  ])
);

export default function NpcHubPage() {
  const roster = useMemo(
    () =>
      STREET_NPCS.map((npc, idx) => ({
        npcId: `NPC-${String(idx + 1).padStart(2, "0")}`,
        id: npc.id,
        defaultLabel: npc.name,
        behavior: npc.behavior,
        image: npc.frames[0],
        frameCount: npc.frames.length,
      })),
    []
  );

  const [hub, setHub] = useState<HubState>(DEFAULT_HUB);
  const [filter, setFilter] = useState<"all" | "ambient" | "stroller" | "customer">("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setHub(JSON.parse(raw));
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hub));
    } catch {
      // ignore storage errors
    }
  }, [hub, hydrated]);

  const getEntry = (npcId: string): NpcProfile =>
    hub[npcId] ?? { name: "", story: "", connections: [] };

  const updateEntry = (npcId: string, patch: Partial<NpcProfile>) => {
    setHub((prev) => {
      const current = prev[npcId] ?? { name: "", story: "", connections: [] };
      return {
        ...prev,
        [npcId]: { ...current, ...patch },
      };
    });
  };

  const toggleConnection = (npcId: string, targetNpcId: string) => {
    const current = getEntry(npcId);
    const exists = current.connections.includes(targetNpcId);
    if (exists) {
      updateEntry(npcId, {
        connections: current.connections.filter((c) => c !== targetNpcId),
      });
    } else if (current.connections.length < 3) {
      updateEntry(npcId, {
        connections: [...current.connections, targetNpcId],
      });
    }
  };

  const buildExportPayload = () =>
    roster.map((item) => {
      const entry = getEntry(item.npcId);
      return {
        npcId: item.npcId,
        spriteId: item.id,
        behavior: item.behavior,
        frames: item.frameCount,
        photoPath: item.image,
        photoUrl:
          typeof window !== "undefined"
            ? `${window.location.origin}${item.image}`
            : item.image,
        name: entry.name.trim(),
        story: entry.story.trim(),
        connections: entry.connections,
      };
    });

  const handleExportJson = () => {
    const data = buildExportPayload();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amrz9-npc-hub.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    const data = buildExportPayload();
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all NPC names, stories, and connections?")) {
      setHub({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const filtered = roster.filter((item) => {
    if (filter !== "all" && item.behavior !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const entry = getEntry(item.npcId);
    return (
      item.npcId.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.story.toLowerCase().includes(q)
    );
  });

  const filledCount = roster.filter(
    (r) => getEntry(r.npcId).name.trim() || getEntry(r.npcId).story.trim()
  ).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f7f4",
        color: "#141414",
        padding: "32px 24px 80px",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingBottom: 24,
            borderBottom: "1px solid #e2e0da",
            marginBottom: 24,
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#666",
                marginBottom: 8,
              }}
            >
              <ArrowLeft size={14} /> Back to amrz9.com
            </Link>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              NPC Hub.
            </h1>
            <p style={{ color: "#555", fontSize: 14, marginTop: 4 }}>
              {roster.length} characters · {filledCount} customized · Auto-saved in your browser
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              onClick={handleCopyJson}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #141414",
                background: "#fff",
                color: "#141414",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied JSON" : "Copy JSON"}
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid #141414",
                background: "#141414",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={15} />
              Export Roster + Photos
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset all fields"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid #d4d2cc",
                background: "transparent",
                color: "#666",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["all", "stroller", "customer", "ambient"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  cursor: "pointer",
                  border: "1px solid #141414",
                  background: filter === tab ? "#141414" : "#fff",
                  color: filter === tab ? "#fff" : "#141414",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by NPC ID, name, or story..."
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: "1px solid #d4d2cc",
              background: "#fff",
              fontSize: 13,
              minWidth: 260,
              outline: "none",
            }}
          />
        </div>

        {/* Character Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {filtered.map((item) => {
            const entry = getEntry(item.npcId);
            return (
              <article
                key={item.npcId}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e0da",
                  borderRadius: 16,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Top Row: Face crop + ID */}
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 14,
                      background: "#f4f3ef",
                      border: "1px solid #e5e4df",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={entry.name || item.npcId}
                      style={{
                        width: "100%",
                        height: "190%",
                        objectFit: "contain",
                        objectPosition: "top center",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "#141414",
                          color: "#fff",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {item.npcId}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#666",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.behavior}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) =>
                        updateEntry(item.npcId, { name: e.target.value })
                      }
                      placeholder="Name (optional)"
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid #dddad2",
                        fontSize: 14,
                        fontWeight: 600,
                        background: "#faf9f6",
                      }}
                    />
                  </div>
                </div>

                {/* Story */}
                <textarea
                  value={entry.story}
                  onChange={(e) =>
                    updateEntry(item.npcId, { story: e.target.value })
                  }
                  placeholder="Story / vibe / visual notes..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #dddad2",
                    fontSize: 13,
                    resize: "vertical",
                    background: "#faf9f6",
                    fontFamily: "inherit",
                  }}
                />

                {/* Connections (up to 3) */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#555",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} /> Connections ({entry.connections.length}/3)
                    </span>
                  </div>

                  {/* Selected connection pills */}
                  {entry.connections.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 8,
                      }}
                    >
                      {entry.connections.map((connId) => {
                        const connName = getEntry(connId).name.trim();
                        return (
                          <button
                            key={connId}
                            type="button"
                            onClick={() => toggleConnection(item.npcId, connId)}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 9px",
                              borderRadius: 999,
                              background: "#eceae3",
                              border: "1px solid #d0cdc4",
                              cursor: "pointer",
                            }}
                          >
                            {connId}
                            {connName ? ` · ${connName}` : ""} ×
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Add connection dropdown */}
                  {entry.connections.length < 3 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          toggleConnection(item.npcId, e.target.value);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid #dddad2",
                        background: "#fff",
                        fontSize: 12,
                        color: "#444",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">+ Connect to another NPC...</option>
                      {roster
                        .filter(
                          (other) =>
                            other.npcId !== item.npcId &&
                            !entry.connections.includes(other.npcId)
                        )
                        .map((other) => {
                          const otherName = getEntry(other.npcId).name.trim();
                          return (
                            <option key={other.npcId} value={other.npcId}>
                              {other.npcId}
                              {otherName ? ` — ${otherName}` : ` (${other.id})`}
                            </option>
                          );
                        })}
                    </select>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
