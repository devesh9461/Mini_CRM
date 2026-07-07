import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGravatarUrl } from '../utils/gravatar';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [loginGravatar, setLoginGravatar] = useState(null);

  const handleLoginUsernameChange = (e) => {
    const val = e.target.value;
    setLoginUsername(val);
    setLoginErrors(p => ({ ...p, username: '' }));
    setError(null);
    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      getGravatarUrl(val, 80).then(setLoginGravatar);
    } else {
      setLoginGravatar(null);
    }
  };

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState({});
  const [regGravatar, setRegGravatar] = useState(null);

  const handleRegEmailChange = (e) => {
    const val = e.target.value;
    setRegEmail(val);
    setRegErrors(p => ({ ...p, email: '' }));
    setError(null);
    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      getGravatarUrl(val, 80).then(setRegGravatar);
    } else {
      setRegGravatar(null);
    }
  };

  const [forgotEmail, setForgotEmail] = useState('');

  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const passRef = useRef(null);

  const validateLogin = () => {
    const errs = {};
    if (!loginUsername.trim()) errs.username = 'Please enter your username';
    if (!loginPassword) errs.password = 'Password is required';
    else if (loginPassword.length < 6) errs.password = 'Min 6 characters required';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!regUsername.trim()) errs.username = 'Please enter a username';
    if (!regEmail.trim()) errs.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = 'Enter a valid email address';
    if (!regPassword) errs.password = 'Password is required';
    else if (regPassword.length < 6) errs.password = 'Min 6 characters required';
    if (regPassword !== regConfirmPassword) errs.confirm = 'Passwords do not match';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateLogin()) return;
    setSubmitting(true);
    try {
      await login(loginUsername, loginPassword);
      if (remember) localStorage.setItem('crm_remember', 'true');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateRegister()) return;
    setSubmitting(true);
    try {
      await register(regUsername, regEmail, regPassword);
      setShowRegister(false);
      setLoginUsername(regUsername);
      setLoginPassword(regPassword);
      setError('Account created! Please sign in.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      console.log('Forgot password request for', forgotEmail);
      setShowForgot(false);
      setError('If that email exists, a reset link has been sent.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePass = () => {
    if (passRef.current) {
      const next = passRef.current.type === 'password' ? 'text' : 'password';
      passRef.current.type = next;
      setShowPass(next === 'text');
    }
  };

  const carousel = (
    <div className="login-carousel">
      <span className="login-dot login-dot--active" />
      <span className="login-dot" />
      <span className="login-dot" />
      <span className="login-dot" />
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-left">
        <svg className="login-illustration" viewBox="0 0 380 280" fill="none">
          <rect x="40" y="100" width="140" height="90" rx="8" stroke="#0D9488" strokeWidth="2" fill="none"/>
          <rect x="44" y="108" width="50" height="6" rx="3" fill="#0D9488" opacity="0.3"/>
          <rect x="44" y="120" width="70" height="4" rx="2" fill="#0D9488" opacity="0.15"/>
          <rect x="44" y="130" width="55" height="4" rx="2" fill="#0D9488" opacity="0.15"/>
          <rect x="44" y="140" width="80" height="4" rx="2" fill="#0D9488" opacity="0.15"/>
          <rect x="100" y="60" width="18" height="50" rx="3" fill="#0D9488" opacity="0.25"/>
          <rect x="124" y="40" width="18" height="70" rx="3" fill="#0D9488" opacity="0.4"/>
          <rect x="148" y="55" width="18" height="55" rx="3" fill="#0D9488" opacity="0.55"/>
          <rect x="172" y="30" width="18" height="80" rx="3" fill="#0D9488" opacity="0.7"/>
          <circle cx="260" cy="140" r="28" stroke="#0D9488" strokeWidth="2" fill="none"/>
          <path d="M240 186 Q260 210 280 186" stroke="#0D9488" strokeWidth="2" fill="none"/>
          <rect x="228" y="180" width="64" height="40" rx="6" stroke="#0D9488" strokeWidth="2" fill="none"/>
          <rect x="232" y="186" width="56" height="6" rx="2" fill="#0D9488" opacity="0.2"/>
          <rect x="232" y="196" width="56" height="3" rx="1.5" fill="#0D9488" opacity="0.12"/>
          <rect x="220" y="220" width="80" height="6" rx="3" fill="#0D9488" opacity="0.3"/>
          <rect x="230" y="226" width="60" height="4" rx="2" fill="#0D9488" opacity="0.2"/>
          <rect x="310" y="50" width="22" height="38" rx="5" stroke="#0D9488" strokeWidth="1.8" fill="none"/>
          <circle cx="321" cy="80" r="3" fill="#0D9488" opacity="0.3"/>
          <path d="M42 170 Q42 158 54 158 H86 Q98 158 98 170 V186 Q98 198 86 198 H68 L56 210 V198 H54 Q42 198 42 186 Z" stroke="#0D9488" strokeWidth="1.8" fill="none"/>
          <line x1="56" y1="172" x2="88" y2="172" stroke="#0D9488" strokeWidth="1.5" opacity="0.2"/>
          <line x1="56" y1="180" x2="80" y2="180" stroke="#0D9488" strokeWidth="1.5" opacity="0.15"/>
          <line x1="56" y1="188" x2="74" y2="188" stroke="#0D9488" strokeWidth="1.5" opacity="0.1"/>
          <g transform="translate(290, 110) scale(0.7)">
            <path d="M10 34 L22 26 L34 34 L30 18 L38 10 L22 18 L14 10 L10 26 Z" stroke="#0D9488" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
          </g>
          <circle cx="330" cy="180" r="4" fill="#0D9488" opacity="0.12"/>
          <circle cx="340" cy="160" r="3" fill="#0D9488" opacity="0.08"/>
          <circle cx="50" cy="48" r="5" fill="#0D9488" opacity="0.1"/>
          <circle cx="180" cy="200" r="3.5" fill="#0D9488" opacity="0.08"/>
        </svg>
        <h2 className="login-left-title">
          Diplo<span className="login-title-x">X</span>{' '}
          <span className="login-title-crm">CRM</span>
        </h2>
        <p className="login-left-subtitle">Manage customers, deals &amp; team in one place.</p>
        {carousel}
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="4" y="10" width="28" height="20" rx="4" stroke="#0D9488" strokeWidth="2" fill="none"/>
              <rect x="8" y="14" width="20" height="4" rx="1.5" fill="#0D9488" opacity="0.2"/>
              <rect x="8" y="20" width="20" height="3" rx="1.5" fill="#0D9488" opacity="0.12"/>
              <line x1="18" y1="8" x2="18" y2="4" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18" y1="32" x2="18" y2="36" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="login-logo-text">
              <span className="login-logo-dark">DIPLO</span><span className="login-logo-accent login-logo-x">X</span>{' '}
              <span className="login-logo-accent">CRM</span>
            </div>
          </div>

          {showRegister ? (
            <form onSubmit={handleRegister} className="login-form" noValidate>
              <div className="login-field">
                <label className="login-label">Username</label>
                <div className={`login-input-wrap${regErrors.username ? ' login-input-wrap--error' : ''}`}>
                  <input type="text" placeholder="Enter username" value={regUsername} onChange={(e) => { setRegUsername(e.target.value); setRegErrors(p => ({ ...p, username: '' })); setError(null); }} />
                </div>
                {regErrors.username && <span className="login-field-error">{regErrors.username}</span>}
              </div>
              <div className="login-field">
                <label className="login-label">Email</label>
                <div className="login-email-with-avatar">
                  <div className={`login-input-wrap${regErrors.email ? ' login-input-wrap--error' : ''}`} style={{ flex: 1 }}>
                    <input type="email" placeholder="you@example.com" value={regEmail} onChange={handleRegEmailChange} />
                  </div>
                  {regGravatar && (
                    <img src={regGravatar} alt="" className="login-gravatar-preview" />
                  )}
                </div>
                {regErrors.email && <span className="login-field-error">{regErrors.email}</span>}
              </div>
              <div className="login-field">
                <label className="login-label">Password</label>
                <div className={`login-input-wrap${regErrors.password ? ' login-input-wrap--error' : ''}`}>
                  <input ref={passRef} type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => { setRegPassword(e.target.value); setRegErrors(p => ({ ...p, password: '' })); setError(null); }} />
                  <button type="button" className="login-eye" onClick={togglePass} tabIndex={-1} aria-label="Toggle password visibility">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {regErrors.password && <span className="login-field-error">{regErrors.password}</span>}
              </div>
              <div className="login-field">
                <label className="login-label">Confirm Password</label>
                <div className={`login-input-wrap${regErrors.confirm ? ' login-input-wrap--error' : ''}`}>
                  <input type="password" placeholder="Re-enter password" value={regConfirmPassword} onChange={(e) => { setRegConfirmPassword(e.target.value); setRegErrors(p => ({ ...p, confirm: '' })); setError(null); }} />
                </div>
                {regErrors.confirm && <span className="login-field-error">{regErrors.confirm}</span>}
              </div>
              {error && <div className="login-api-error">{error}</div>}
              <button type="submit" className="login-btn-primary" disabled={submitting}>
                {submitting ? 'Creating account\u2026' : 'Create Account'}
              </button>
              <p className="login-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => { setShowRegister(false); setError(null); setRegErrors({}); }}>Sign In</button>
              </p>
            </form>
          ) : showForgot ? (
            <form onSubmit={handleForgot} className="login-form" noValidate>
              <div className="login-field">
                <label className="login-label">Email address</label>
                <div className="login-input-wrap">
                  <input type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setError(null); }} />
                </div>
              </div>
              {error && <div className="login-api-error">{error}</div>}
              <button type="submit" className="login-btn-primary" disabled={submitting}>
                {submitting ? 'Sending\u2026' : 'Send Reset Link'}
              </button>
              <p className="login-switch">
                <button type="button" onClick={() => { setShowForgot(false); setError(null); }}>Back to Sign In</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="login-form" noValidate>
              <div className="login-field">
                <label className="login-label">Username or email</label>
                <div className="login-email-with-avatar">
                  <div className={`login-input-wrap${loginErrors.username ? ' login-input-wrap--error' : ''}`} style={{ flex: 1 }}>
                    <input type="text" placeholder="you@example.com" value={loginUsername} onChange={handleLoginUsernameChange} autoComplete="username" />
                  </div>
                  {loginGravatar && (
                    <img src={loginGravatar} alt="" className="login-gravatar-preview" />
                  )}
                </div>
                {loginErrors.username && <span className="login-field-error">{loginErrors.username}</span>}
              </div>
              <div className="login-field">
                <label className="login-label">Password</label>
                <div className={`login-input-wrap${loginErrors.password ? ' login-input-wrap--error' : ''}`}>
                  <input ref={passRef} type="password" placeholder="Enter password" value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginErrors(p => ({ ...p, password: '' })); setError(null); }} autoComplete="current-password" />
                  <button type="button" className="login-eye" onClick={togglePass} tabIndex={-1} aria-label="Toggle password visibility">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {loginErrors.password && <span className="login-field-error">{loginErrors.password}</span>}
              </div>
              <div className="login-row">
                <label className="login-checkbox">
                  <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                  <span>Remember me</span>
                </label>
                <button type="button" className="login-forgot" onClick={() => setShowForgot(true)}>Forgot password?</button>
              </div>
              {error && <div className="login-api-error">{error}</div>}
              <button type="submit" className="login-btn-primary" disabled={submitting}>
                {submitting ? 'Signing in\u2026' : 'Sign In'}
              </button>
              <div className="login-divider"><span>or</span></div>
              <button type="button" className="login-btn-google" disabled>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
              <p className="login-switch">
                New here?{' '}
                <button type="button" onClick={() => { setShowRegister(true); setError(null); setLoginErrors({}); }}>Create an Account</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
