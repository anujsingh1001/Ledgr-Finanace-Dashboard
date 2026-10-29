import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import LedgrLogo from '../assets/ledgrfulllogolight.png';

export default function AuthPage() {
  const { authenticate, state } = useAppContext();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setLocalError('');
    if (mode === 'register' && !name.trim()) return setLocalError('Please enter your name.');
    if (password.length < (mode === 'register' ? 8 : 1)) return setLocalError('Password must contain at least 8 characters.');
    await authenticate(mode, { ...(mode === 'register' ? { name: name.trim() } : {}), email: email.trim(), password });
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <img src={LedgrLogo} alt="Ledgr" className="auth-logo" />
        <p className="auth-eyebrow">PERSONAL FINANCE, MADE CLEAR</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'Log in to continue to your dashboard.' : 'Your transactions are private to your account.'}</p>
        <form onSubmit={submit}>
          {mode === 'register' && <label className="auth-field">Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={80} /></label>}
          <label className="auth-field">Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label className="auth-field">Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1} /></label>
          {(localError || state.authError) && <p className="auth-error" role="alert">{localError || state.authError}</p>}
          <button className="btn btn-primary auth-submit" type="submit" disabled={state.authLoading}>{state.authLoading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? 'New to Ledgr?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalError(''); }} type="button">{mode === 'login' ? 'Create an account' : 'Log in'}</button></p>
      </section>
    </main>
  );
}
