import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", cred.user.uid), { email: form.email, role: form.role });
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err.code, err.message);
      alert(err.message);
    }
  };

  return (
    <>
      <style>{`
        .reg-wrapper {
          display: flex;
          min-height: 100vh;
        }
        .reg-left {
          flex: 1;
          background: #111;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 50px;
        }
        .reg-left h1 { font-size: 2rem; margin-bottom: 12px; }
        .reg-left p  { font-size: 1rem; opacity: 0.8; }
        .reg-right {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
        }
        .reg-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 30px;
          width: 100%;
          max-width: 360px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
        .reg-card h2 { margin-bottom: 4px; }
        .reg-input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .reg-btn {
          padding: 12px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .reg-wrapper { flex-direction: column; }
          .reg-left {
            padding: 32px 24px;
            text-align: center;
          }
          .reg-left h1 { font-size: 1.5rem; }
          .reg-right { padding: 24px 16px; align-items: flex-start; padding-top: 32px; }
          .reg-card { padding: 24px 20px; }
        }
      `}</style>

      <div className="reg-wrapper">
        <div className="reg-left">
          <h1>Join Campus Store</h1>
          <p>Create an account as a Student or Staff and access the system.</p>
        </div>
        <div className="reg-right">
          <form className="reg-card" onSubmit={handleRegister}>
            <h2>Register</h2>
            <input className="reg-input" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="reg-input" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="reg-input" onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
            <button className="reg-btn">Create Account</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
