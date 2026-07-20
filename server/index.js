import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/home-sky";
const JWT_SECRET = process.env.JWT_SECRET || "home-sky-dev-secret-change-me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173"] }));
app.use(express.json());

const locationSchema = new mongoose.Schema(
  {
    savedId: { type: String, required: true },
    label: { type: String, required: true },
    name: { type: String, required: true },
    admin1: { type: String, default: "" },
    country: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    authProvider: { type: String, enum: ["password", "google"], default: "password" },
    googleId: { type: String, default: "" },
    locations: { type: [locationSchema], default: [] },
    defaultLocationId: { type: String, default: "" },
    activeLocationId: { type: String, default: "" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

function createToken(user) {
  return jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    locations: user.locations,
    defaultLocationId: user.defaultLocationId,
    activeLocationId: user.activeLocationId,
  };
}

async function requireAuth(request, response, next) {
  try {
    const authHeader = request.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return response.status(401).json({ message: "Please sign in again." });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) {
      return response.status(401).json({ message: "Please sign in again." });
    }

    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ message: "Please sign in again." });
  }
}

app.get("/api/health", (request, response) => {
  response.json({ ok: true });
});

app.post("/api/auth/signup", async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password || password.length < 6) {
      return response.status(400).json({ message: "Name, email, and a 6 character password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(409).json({ message: "An account already exists for this email." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    return response.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch {
    return response.status(500).json({ message: "Could not create account." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    return response.json({ token: createToken(user), user: publicUser(user) });
  } catch {
    return response.status(500).json({ message: "Could not sign in." });
  }
});

app.get("/api/auth/google/config", (request, response) => {
  response.json({
    enabled: Boolean(GOOGLE_CLIENT_ID),
    clientId: GOOGLE_CLIENT_ID,
  });
});

app.post("/api/auth/google", async (request, response) => {
  try {
    if (!googleClient) {
      return response.status(400).json({ message: "Google login is not configured yet." });
    }

    const { credential } = request.body;
    if (!credential) {
      return response.status(400).json({ message: "Google credential is required." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return response.status(400).json({ message: "Google account email is required." });
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email,
        email: payload.email,
        passwordHash: "google-oauth-user",
        authProvider: "google",
        googleId: payload.sub,
      });
    } else {
      user.authProvider = user.authProvider || "google";
      user.googleId = user.googleId || payload.sub;
      await user.save();
    }

    return response.json({ token: createToken(user), user: publicUser(user) });
  } catch {
    return response.status(401).json({ message: "Could not verify Google login." });
  }
});

app.get("/api/me", requireAuth, async (request, response) => {
  response.json({ user: publicUser(request.user) });
});

app.put("/api/locations", requireAuth, async (request, response) => {
  const { locations, defaultLocationId, activeLocationId } = request.body;

  request.user.locations = Array.isArray(locations) ? locations : [];
  request.user.defaultLocationId = defaultLocationId || "";
  request.user.activeLocationId = activeLocationId || "";
  await request.user.save();

  response.json({ user: publicUser(request.user) });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Home Sky API listening on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB.", error.message);
    process.exit(1);
  });
