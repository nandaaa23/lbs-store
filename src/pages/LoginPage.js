import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : null;
      if (!role) { setError("Account has no role assigned. Contact admin."); setLoggingIn(false); return; }
      if (role === "staff") navigate("/staff/dashboard");
      else navigate("/store");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
      setLoggingIn(false);
    }
  };

  return (
    <>
      <style>{`
        .login-wrapper {
          display: flex;
          min-height: 100vh;
        }
        .login-left {
          flex: 1;
          background: #111;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 50px;
        }
        .login-left h1 { font-size: 2rem; margin-bottom: 12px; }
        .login-left p  { font-size: 1rem; opacity: 0.8; }
        .login-right {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
        }
        .login-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 30px;
          width: 100%;
          max-width: 360px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
        .login-card h2 { margin-bottom: 4px; }
        .login-input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .login-btn {
          padding: 12px;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        .login-register-link {
          text-align: center;
          font-size: 0.875rem;
        }
        .login-register-link span {
          cursor: pointer;
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .login-wrapper { flex-direction: column; }
          .login-left {
            padding: 32px 24px;
            text-align: center;
          }
          .login-left h1 { font-size: 1.5rem; }
          .login-right { padding: 24px 16px; align-items: flex-start; padding-top: 32px; }
          .login-card { padding: 24px 20px; }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-left">
          <h1>Campus Store</h1>
          <p>Login to access your student or staff dashboard.</p>
        </div>
        <div className="login-right">
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Login</h2>
            {error && <div className="login-error">{error}</div>}
            <input className="login-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="login-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="login-btn" disabled={loggingIn}>
              {loggingIn ? "Logging in..." : "Login"}
            </button>
            <p className="login-register-link">
              No account?{" "}
              <span onClick={() => navigate("/register")}>Register</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
