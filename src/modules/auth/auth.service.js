const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../../models");
const AppError = require("../../common/AppError");
const { hashPassword, comparePassword } = require("../../utils/password.util");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt.util");
const { hashToken } = require("../../utils/tokenHash.util");

const normalizeEmail = (email) => email.trim().toLowerCase();

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const persistRefreshToken = async (user, refreshToken) => {
  const decoded = jwt.decode(refreshToken);
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
  });
};

const issueTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await persistRefreshToken(user, refreshToken);
  return {
    accessToken,
    refreshToken,
  };
};

const register = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return { user: toPublicUser(user) };
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid email or password", 401);
  }

  return issueTokenPair(user);
};

const refresh = async ({ refreshToken }) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ where: { tokenHash } });

  if (!stored) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (stored.revokedAt) {
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: stored.userId, revokedAt: null } }
    );
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (stored.expiresAt.getTime() <= Date.now()) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findByPk(decoded.sub);
  if (!user || user.id !== stored.userId) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  stored.revokedAt = new Date();
  await stored.save();

  return issueTokenPair(user);
};

const logout = async ({ refreshToken }) => {
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ where: { tokenHash } });
  if (stored && !stored.revokedAt) {
    stored.revokedAt = new Date();
    await stored.save();
  }
  return null;
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
