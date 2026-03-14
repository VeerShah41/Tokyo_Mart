import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── Home Screen (shown after login) ─────────────────────────────────────────
function HomeScreen({ user, onLogout }) {
    const [data, setData] = useState(null);

    // ← existing health-check code, untouched
    useEffect(() => {
        fetch(`${API_URL}/api/health`)
            .then(res => res.json())
            .then(data => setData(data))
            .catch(err => console.error('Error fetching health check:', err));
    }, []);

    return (
        <div className="container">
            <div className="home-header">
                <h1>🛒 Tokyo Mart</h1>
                <div className="user-pill">
                    <span>👤 {user.name}</span>
                    <span className="role-badge">{user.role}</span>
                    <button className="btn-logout" onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div className="home-welcome">
                <h2>Welcome back, {user.name}! 👋</h2>
                <p className="home-sub">You are successfully logged in to Tokyo Mart.</p>
            </div>

            {/* ← existing health-check card */}
            <div className="card">
                <h2>Backend Status</h2>
                {data ? (
                    <div>
                        <p>Status: <span className="status-ok">{data.status}</span></p>
                        <p>Service: {data.service}</p>
                        <p>Timestamp: {data.timestamp}</p>
                    </div>
                ) : (
                    <p>Loading backend status...</p>
                )}
            </div>
        </div>
    );
}

// ─── Auth Screen (Login + Signup toggled) ─────────────────────────────────────
function LoginScreen({ onLogin }) {
    const [mode, setMode]         = useState('login'); // 'login' | 'signup'
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [loading, setLoading]   = useState(false);

    const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body     = mode === 'login'
                ? { email, password }
                : { name, email, password };

            const res  = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();

            if (!res.ok) {
                setError(json.message || (mode === 'login' ? 'Login failed.' : 'Registration failed.'));
            } else {
                localStorage.setItem('tm_token', json.token);
                localStorage.setItem('tm_user', JSON.stringify(json.user));
                onLogin(json.user);
            }
        } catch {
            setError('Could not reach server. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h1 className="login-title">🛒 Tokyo Mart</h1>

                {/* Tab toggle */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => switchMode('login')}
                        type="button"
                    >Login</button>
                    <button
                        className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                        onClick={() => switchMode('signup')}
                        type="button"
                    >Sign Up</button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error   && <p className="login-error">{error}</p>}
                    {success && <p className="login-success">{success}</p>}

                    <button className="btn-login" type="submit" disabled={loading}>
                        {loading
                            ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                            : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tm_user')); }
        catch { return null; }
    });

    const handleLogin  = (u) => setUser(u);
    const handleLogout = () => {
        localStorage.removeItem('tm_token');
        localStorage.removeItem('tm_user');
        setUser(null);
    };

    if (!user) return <LoginScreen onLogin={handleLogin} />;
    return <HomeScreen user={user} onLogout={handleLogout} />;
}

export default App
