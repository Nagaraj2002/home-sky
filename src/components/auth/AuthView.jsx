import { useEffect, useState } from "react";
import {
  getGoogleConfig,
  logIn,
  logInWithGoogleCredential,
  signUp,
} from "../../api/backend.js";

export function AuthView({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [googleConfig, setGoogleConfig] = useState({ enabled: false, clientId: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadGoogleConfig() {
      try {
        setGoogleConfig(await getGoogleConfig());
      } catch {
        setGoogleConfig({ enabled: false, clientId: "" });
      }
    }

    loadGoogleConfig();
  }, []);

  useEffect(() => {
    if (!googleConfig.enabled || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: googleConfig.clientId,
      callback: async (response) => {
        try {
          setError("");
          onAuthed(await logInWithGoogleCredential(response.credential));
        } catch (googleError) {
          setError(googleError.message);
        }
      },
    });

    window.google.accounts.id.renderButton(document.getElementById("google-login-button"), {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [googleConfig, onAuthed]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");
      const user =
        mode === "signup"
          ? await signUp(form)
          : await logIn({ email: form.email, password: form.password });
      onAuthed(user);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Home Sky</p>
        <h1>{mode === "signup" ? "Create your sky account" : "Welcome back"}</h1>
        <p className="lede">Sign in first so your saved places stay available after refresh or a new tab.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          ) : null}
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} minLength="6" onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "signup" ? "Sign Up" : "Log In"}
          </button>
        </form>
        <div className="auth-divider">or</div>
        {googleConfig.enabled ? (
          <div id="google-login-button" className="google-login-button" />
        ) : (
          <button className="google-placeholder" type="button" disabled>
            Google login needs a Client ID
          </button>
        )}
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Create account"}
        </button>
      </section>
    </main>
  );
}
