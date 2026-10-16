'use client';

import { FormEvent, useState } from 'react';
import {
  ArrowRight, BarChart3, Check, Eye, EyeOff, LockKeyhole, Radio, ShieldCheck, Truck,
} from 'lucide-react';

export type AuthRole = 'Fleet Manager' | 'Driver / Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export type AuthUser = {
  name: string;
  email: string;
  role: AuthRole;
};

const roleOptions: { name: AuthRole; description: string; icon: typeof Truck }[] = [
  { name: 'Fleet Manager', description: 'Oversees fleet assets & maintenance', icon: Truck },
  { name: 'Driver / Dispatcher', description: 'Creates trips & monitors deliveries', icon: Radio },
  { name: 'Safety Officer', description: 'Tracks license compliance & safety scores', icon: ShieldCheck },
  { name: 'Financial Analyst', description: 'Tracks fuel, maintenance & ROI', icon: BarChart3 },
];

export default function AuthView({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AuthRole>('Fleet Manager');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const finishAuthentication = (user: AuthUser) => {
    setError('');
    onAuthenticated(user);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Enter your full name to create an account.');
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    finishAuthentication({ name: mode === 'signup' ? name.trim() : email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), email: email.trim().toLowerCase(), role: selectedRole });
  };

  return <main className="auth-screen">
    <section className="auth-story">
      <div className="auth-brand"><span className="auth-brand-mark"><i /><i /><i /></span><span>Transit<strong>Ops</strong></span><span className="auth-brand-status"><i /> OPERATIONS ONLINE</span></div>
      <div className="auth-story-content">
        <span className="auth-eyebrow"><i /> SMART TRANSPORT OPERATIONS PLATFORM</span>
        <h1>Move your fleet.<br /><em>Move your business.</em></h1>
        <p className="auth-intro">One clear view of every vehicle, driver, and delivery. Make the next decision with confidence.</p>
        <div className="auth-benefits">
          <div className="auth-benefit"><span><Truck size={17} /></span><div><strong>Automated dispatch</strong><small>Match the right vehicle and driver, every time.</small></div><Check size={15} /></div>
          <div className="auth-benefit"><span><ShieldCheck size={17} /></span><div><strong>License compliance</strong><small>Keep certifications and safety in view.</small></div><Check size={15} /></div>
          <div className="auth-benefit"><span><BarChart3 size={17} /></span><div><strong>Real-time ROI</strong><small>Know your operational costs as they happen.</small></div><Check size={15} /></div>
        </div>
        <div className="auth-live-card">
          <div className="auth-live-top"><span><i /> NETWORK STATUS</span><span>OCT 16, 2026</span></div>
          <div className="auth-live-stats"><div><strong>07</strong><span>Fleet vehicles</span></div><div><strong>94<small>%</small></strong><span>Compliance rate</span></div><div><strong>02</strong><span>Deliveries live</span></div></div>
          <svg className="auth-route-art" viewBox="0 0 540 76" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 60 C 72 58 79 21 145 28 S 229 71 294 43 S 375 9 431 27 S 493 51 550 16" /><path d="M91 76 C 144 51 160 58 208 47 S 283 8 335 22 S 397 69 476 49" /></svg>
          <div className="auth-live-footer"><span><i /> LIVE FLEET SYNC</span><span>All systems operational</span></div>
        </div>
      </div>
      <div className="auth-story-footer"><span>© 2026 TransitOps, Inc.</span><span>Built for the people who keep the world moving.</span></div>
    </section>

    <section className="auth-panel-wrap">
      <div className="auth-panel-top"><span>Already have access?</span><button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>{mode === 'signin' ? 'Create account' : 'Sign in'} <ArrowRight size={14} /></button></div>
      <div className="auth-card">
        <div className="auth-card-heading"><span className="auth-card-icon"><LockKeyhole size={17} /></span><span className="auth-card-overline">YOUR OPERATIONS, IN SYNC</span><h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'signin' ? 'Sign in to your TransitOps workspace.' : 'Set up your workspace access in a few steps.'}</p></div>
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'selected' : ''} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button><button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button></div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && <label className="auth-field">Full name<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jordan Miller" /></label>}
          <label className="auth-field">Work email<input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label>
          <label className="auth-field">Password<div className="auth-password"><input autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
          <div className="auth-role-heading"><span>Choose your workspace role</span><small>PERSONA</small></div>
          <div className="auth-role-grid">{roleOptions.map(({ name: roleName, description, icon: Icon }) => <button type="button" key={roleName} className={`auth-role-option ${selectedRole === roleName ? 'selected' : ''}`} onClick={() => setSelectedRole(roleName)} aria-pressed={selectedRole === roleName}><span className="auth-role-icon"><Icon size={16} /></span><span className="auth-role-copy"><strong>{roleName}</strong><small>{description}</small></span><i className="auth-role-check">{selectedRole === roleName && <Check size={12} />}</i></button>)}</div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" type="submit">{mode === 'signin' ? 'Sign in to TransitOps' : 'Create account'}<ArrowRight size={16} /></button>
        </form>
        <div className="auth-divider"><span>OR</span></div>
        <button className="auth-demo" type="button" onClick={() => finishAuthentication({ name: 'Jordan Miller', email: 'jordan.miller@northstar.example', role: selectedRole })}><span className="auth-demo-icon"><Truck size={15} /></span><span><strong>Quick demo login</strong><small>Enter as {selectedRole}</small></span><ArrowRight size={15} /></button>
        <p className="auth-terms">By continuing, you agree to the TransitOps <button type="button" onClick={() => setError('Terms of service are available through your organization administrator.')}>Terms of Service</button> and <button type="button" onClick={() => setError('Privacy information is available through your organization administrator.')}>Privacy Policy</button>.</p>
      </div>
      <div className="auth-secure-note"><ShieldCheck size={14} /><span>Secure access to your fleet workspace</span></div>
    </section>
  </main>;
}