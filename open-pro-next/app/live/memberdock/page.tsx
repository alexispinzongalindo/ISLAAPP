"use client";

import { useMemo, useState } from "react";

type TierId = "free" | "silver" | "gold";

type Tier = {
  id: TierId;
  name: string;
  price: number;
  trialDays: number;
};

type Post = {
  id: string;
  title: string;
  body: string;
  kind: "text" | "video";
  minTier: TierId;
  dripAt: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  tier: TierId;
  joinedAt: string;
  inDirectory: boolean;
};

type Sub = {
  id: string;
  memberId: string;
  tier: TierId;
  startedAt: string;
  active: boolean;
};

type EventLog = {
  id: string;
  type: "email" | "payment" | "system";
  text: string;
  at: string;
};

const tierRank: Record<TierId, number> = { free: 0, silver: 1, gold: 2 };
const today = new Date().toISOString().slice(0, 10);

const tierSeed: Tier[] = [
  { id: "free", name: "Free", price: 0, trialDays: 0 },
  { id: "silver", name: "Silver", price: 19, trialDays: 7 },
  { id: "gold", name: "Gold", price: 49, trialDays: 7 },
];

const postSeed: Post[] = [
  { id: "p1", title: "Welcome Resource Kit", body: "Starter workflow and templates.", kind: "text", minTier: "free", dripAt: today },
  { id: "p2", title: "Creator Ops Blueprint", body: "Internal systems and weekly playbook.", kind: "video", minTier: "silver", dripAt: today },
];

export default function MemberDockLive() {
  const [tiers, setTiers] = useState<Tier[]>(tierSeed);
  const [posts, setPosts] = useState<Post[]>(postSeed);
  const [members, setMembers] = useState<Member[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [coupon, setCoupon] = useState({ code: "CREATOR20", offPct: 20, trialDays: 7 });
  const [newPost, setNewPost] = useState({ title: "", body: "", kind: "text" as "text" | "video", minTier: "silver" as TierId, dripAt: today });
  const [signup, setSignup] = useState({ name: "", email: "", tier: "free" as TierId, useCoupon: true, inDirectory: true });
  const [error, setError] = useState("");
  const [portalMemberId, setPortalMemberId] = useState("");

  const memberById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const mrr = useMemo(() => {
    return subs
      .filter((s) => s.active)
      .reduce((sum, s) => {
        const t = tiers.find((x) => x.id === s.tier);
        return sum + (t?.price || 0);
      }, 0);
  }, [subs, tiers]);

  const newMembers = useMemo(() => members.filter((m) => m.joinedAt === today).length, [members]);
  const churn = useMemo(() => {
    const inactive = subs.filter((s) => !s.active).length;
    return subs.length ? Math.round((inactive / subs.length) * 100) : 0;
  }, [subs]);

  const canAccess = (memberTier: TierId, postTier: TierId) => tierRank[memberTier] >= tierRank[postTier];

  const pushLog = (type: EventLog["type"], text: string) => {
    setLogs((prev) => [{ id: `l-${Math.random().toString(36).slice(2, 8)}`, type, text, at: new Date().toLocaleTimeString() }, ...prev]);
  };

  const updateTierPrice = (id: TierId, price: number) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, price: Math.max(0, price) } : t)));
  };

  const publishPost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    const post: Post = { id: `p-${Math.random().toString(36).slice(2, 8)}`, ...newPost, title: newPost.title.trim(), body: newPost.body.trim() };
    setPosts((prev) => [post, ...prev]);
    setNewPost({ title: "", body: "", kind: "text", minTier: "silver", dripAt: today });
    pushLog("system", `Post published: ${post.title}`);
  };

  const signUpMember = () => {
    const name = signup.name.trim();
    const email = signup.email.trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !emailOk) {
      setError("Name and valid email are required.");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === email)) {
      setError("Email already exists.");
      return;
    }
    setError("");
    const member: Member = {
      id: `m-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      tier: signup.tier,
      joinedAt: today,
      inDirectory: signup.inDirectory,
    };
    setMembers((prev) => [member, ...prev]);
    setSubs((prev) => [{ id: `s-${Math.random().toString(36).slice(2, 8)}`, memberId: member.id, tier: signup.tier, startedAt: today, active: true }, ...prev]);
    setPortalMemberId(member.id);
    setSignup((s) => ({ ...s, name: "", email: "" }));
    pushLog("email", `Welcome email sent to ${member.email}.`);
    if (signup.tier !== "free") {
      const tier = tiers.find((t) => t.id === signup.tier);
      const discounted = signup.useCoupon ? (tier?.price || 0) * (1 - coupon.offPct / 100) : tier?.price || 0;
      pushLog("payment", `Stripe mock checkout: ${member.name} started ${signup.tier} at $${discounted.toFixed(2)}.`);
    }
  };

  const upgradeMember = (memberId: string, to: TierId) => {
    const member = memberById[memberId];
    if (!member || tierRank[to] <= tierRank[member.tier]) return;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, tier: to } : m)));
    setSubs((prev) => prev.map((s) => (s.memberId === memberId && s.active ? { ...s, tier: to } : s)));
    const tier = tiers.find((t) => t.id === to);
    pushLog("payment", `${member.name} upgraded to ${to}. Charge created: $${(tier?.price || 0).toFixed(2)}.`);
    pushLog("email", `Upgrade confirmation sent to ${member.email}.`);
  };

  const portalMember = memberById[portalMemberId];
  const visiblePosts = useMemo(() => {
    if (!portalMember) return [];
    return posts.filter((p) => canAccess(portalMember.tier, p.minTier) && p.dripAt <= today);
  }, [portalMember, posts]);

  return (
    <div className="min-h-screen bg-[#0a1222] text-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#231742] via-[#1b1533] to-[#11192b] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">MemberDock · Creator Memberships</p>
          <h1 className="mt-1 text-3xl font-semibold">Tiered memberships with gated content</h1>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <Stat label="MRR" value={`$${mrr}`} />
            <Stat label="Churn" value={`${churn}%`} />
            <Stat label="New Members" value={String(newMembers)} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4 space-y-6">
            <Panel title="Tiers & Pricing">
              <div className="space-y-2">
                {tiers.map((t) => (
                  <div key={t.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="font-medium">{t.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span>$</span>
                      <input
                        className="w-20 rounded border border-white/15 bg-white/5 px-2 py-1"
                        type="number"
                        value={t.price}
                        min={0}
                        onChange={(e) => updateTierPrice(t.id, Number(e.target.value) || 0)}
                      />
                      <span>/month</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-[#0f1a34] p-3 text-sm">
                <p className="font-medium">Coupons + Trial</p>
                <p className="text-slate-300/80">{coupon.code} · {coupon.offPct}% off · {coupon.trialDays} trial days</p>
              </div>
            </Panel>

            <Panel title="Member Signup">
              <Input label="Name" value={signup.name} onChange={(v) => setSignup((s) => ({ ...s, name: v }))} />
              <Input label="Email" value={signup.email} onChange={(v) => setSignup((s) => ({ ...s, email: v }))} />
              <Select label="Tier" value={signup.tier} onChange={(v) => setSignup((s) => ({ ...s, tier: v as TierId }))}>
                <option value="free">Free</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </Select>
              <div className="mt-2 space-y-1 text-sm">
                <label className="block">
                  <input type="checkbox" className="mr-2" checked={signup.useCoupon} onChange={(e) => setSignup((s) => ({ ...s, useCoupon: e.target.checked }))} />
                  Apply coupon
                </label>
                <label className="block">
                  <input type="checkbox" className="mr-2" checked={signup.inDirectory} onChange={(e) => setSignup((s) => ({ ...s, inDirectory: e.target.checked }))} />
                  Show in member directory
                </label>
              </div>
              {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
              <button onClick={signUpMember} className="mt-3 rounded-lg bg-violet-500 px-3 py-2 font-semibold text-white hover:bg-violet-400">
                Sign up member
              </button>
            </Panel>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <Panel title="Post Editor (Gated + Drip)">
              <div className="grid gap-3">
                <Input label="Title" value={newPost.title} onChange={(v) => setNewPost((p) => ({ ...p, title: v }))} />
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-300/90">Content</span>
                  <textarea
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
                    rows={3}
                    value={newPost.body}
                    onChange={(e) => setNewPost((p) => ({ ...p, body: e.target.value }))}
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <Select label="Type" value={newPost.kind} onChange={(v) => setNewPost((p) => ({ ...p, kind: v as "text" | "video" }))}>
                    <option value="text">Text</option>
                    <option value="video">Video Embed</option>
                  </Select>
                  <Select label="Min Tier" value={newPost.minTier} onChange={(v) => setNewPost((p) => ({ ...p, minTier: v as TierId }))}>
                    <option value="free">Free</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </Select>
                  <Input label="Drip date" type="date" value={newPost.dripAt} onChange={(v) => setNewPost((p) => ({ ...p, dripAt: v }))} />
                </div>
              </div>
              <button onClick={publishPost} className="mt-3 rounded-lg bg-violet-500 px-3 py-2 font-semibold text-white hover:bg-violet-400">
                Publish post
              </button>
            </Panel>

            <Panel title="Published Posts">
              <div className="space-y-2">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-slate-300/80">{p.kind} · {p.minTier}+ · drip {p.dripAt}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Member Directory (Opt-in)">
              <div className="space-y-2">
                {members.filter((m) => m.inDirectory).map((m) => (
                  <div key={m.id} className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm">
                    {m.name} · {m.tier}
                  </div>
                ))}
                {members.filter((m) => m.inDirectory).length === 0 && <p className="text-sm text-slate-300/80">No public members yet.</p>}
              </div>
            </Panel>
          </div>

          <div className="xl:col-span-3 space-y-6">
            <Panel title="Member Area (Portal)">
              <Select label="Member" value={portalMemberId} onChange={setPortalMemberId}>
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} · {m.tier}</option>
                ))}
              </Select>
              {portalMember && (
                <div className="mt-2 rounded-lg border border-white/10 bg-[#0f1a34] p-3">
                  <p className="text-sm font-medium">{portalMember.name}</p>
                  <p className="text-xs text-slate-300/80">{portalMember.email}</p>
                  <div className="mt-2 flex gap-2">
                    {portalMember.tier !== "silver" && (
                      <button onClick={() => upgradeMember(portalMember.id, "silver")} className="rounded border border-white/20 px-2 py-1 text-xs">Upgrade Silver</button>
                    )}
                    {portalMember.tier !== "gold" && (
                      <button onClick={() => upgradeMember(portalMember.id, "gold")} className="rounded border border-white/20 px-2 py-1 text-xs">Upgrade Gold</button>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-3 space-y-2">
                {portalMember && visiblePosts.map((p) => (
                  <div key={p.id} className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-slate-200/90">{p.body}</p>
                  </div>
                ))}
                {portalMember && visiblePosts.length === 0 && <p className="text-sm text-slate-300/80">No unlocked posts yet.</p>}
              </div>
            </Panel>

            <Panel title="Email to Screen">
              <div className="max-h-72 space-y-2 overflow-auto pr-1">
                {logs.map((l) => (
                  <div key={l.id} className="rounded-lg border border-white/10 bg-[#0f1a34] p-2.5 text-xs">
                    <p className="text-violet-200/80">{l.at} · {l.type}</p>
                    <p className="text-slate-100">{l.text}</p>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-sm text-slate-300/80">No events yet.</p>}
              </div>
            </Panel>
          </div>
        </section>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111a30] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/85">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-xs text-slate-300/80">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300/90">{label}</span>
      <input
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300/90">{label}</span>
      <select
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
