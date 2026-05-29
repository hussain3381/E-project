/* ============================
   Authentication Feature Module (login.html & signup.html)
   Extends global js/app.js authentication flow
   ============================ */

/* ===== Authentication State Management ===== */
const authState = {
  currentUser: null,
  isAuthenticated: false,
  accounts: [],

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem("oceangate_user") || "null");
      const storedAccounts = JSON.parse(localStorage.getItem("oceangate_accounts") || "[]");
      if (Array.isArray(storedAccounts)) {
        this.accounts = storedAccounts;
      }
      if (stored && stored.email) {
        this.currentUser = stored;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.log("Auth state load failed:", error);
      this.accounts = [];
    }
  },

  saveUser() {
    if (this.currentUser) {
      localStorage.setItem("oceangate_user", JSON.stringify(this.currentUser));
    }
  },

  saveAccounts() {
    localStorage.setItem("oceangate_accounts", JSON.stringify(this.accounts));
  },

  login(email, password) {
    const account = this.accounts.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!account || account.password !== password) {
      return false;
    }

    this.currentUser = {
      email: account.email,
      name: account.fullName,
      loginTime: new Date().toISOString(),
    };
    this.isAuthenticated = true;
    this.saveUser();
    return true;
  },

  signup(fullName, email, password) {
    const existing = this.accounts.some(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (existing) {
      return false;
    }

    const account = {
      fullName,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    this.accounts.push(account);
    this.saveAccounts();
    this.currentUser = {
      email: account.email,
      name: account.fullName,
      createdAt: account.createdAt,
    };
    this.isAuthenticated = true;
    this.saveUser();
    return true;
  },

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem("oceangate_user");
  },
};

/* ===== Form Handling ===== */
function initAuthPage() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Initialize AOS if page loaded
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true, offset: 120 });
  }
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const rememberMe = document.getElementById("rememberMe").checked;

  // Validation
  if (!email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (!email.includes("@")) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  const loggedIn = authState.login(email, password);
  if (!loggedIn) {
    showNotification("Invalid email or password. Please try again.", "error");
    return;
  }

  if (rememberMe) {
    localStorage.setItem("oceangate_remember_email", email);
  } else {
    localStorage.removeItem("oceangate_remember_email");
  }

  showNotification("Sign in successful! Redirecting...", "success");

  const redirectTarget = getRedirectTarget();
  setTimeout(() => {
    window.location.href = redirectTarget || "./index.html";
  }, 1500);
}

function handleSignup(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const agreeTerms = document.getElementById("agreeTerms").checked;

  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (!email.includes("@")) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Passwords do not match", "error");
    return;
  }

  if (!agreeTerms) {
    showNotification("Please agree to the Terms of Service", "error");
    return;
  }

  const created = authState.signup(fullName, email, password);
  if (!created) {
    showNotification("An account with this email already exists.", "error");
    return;
  }

  showNotification("Account created successfully! Redirecting...", "success");

  const redirectTarget = getRedirectTarget();
  setTimeout(() => {
    window.location.href = redirectTarget || "./index.html";
  }, 1500);
}

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existing = document.querySelector(".auth-notification");
  if (existing) existing.remove();

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "auth-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === "success" ? "rgba(76, 175, 80, 0.9)" : type === "error" ? "rgba(244, 67, 54, 0.9)" : "rgba(33, 150, 243, 0.9)"};
    color: white;
    border-radius: 6px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ===== Social Authentication Handlers ===== */
function setupSocialAuthButtons() {
  const socialBtns = document.querySelectorAll(".social-btn");

  socialBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const provider = btn.classList.contains("google-btn")
        ? "Google"
        : btn.classList.contains("github-btn")
          ? "GitHub"
          : "Facebook";

      showNotification(`${provider} authentication coming soon!`, "info");
    });
  });
}

/* ===== Remember Email Feature ===== */
function loadRememberedEmail() {
  const email = localStorage.getItem("oceangate_remember_email");
  if (email && document.getElementById("email")) {
    document.getElementById("email").value = email;
    if (document.getElementById("rememberMe")) {
      document.getElementById("rememberMe").checked = true;
    }
  }
}

function setupPasswordToggleButtons() {
  const toggleButtons = document.querySelectorAll(".password-toggle");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.closest(".password-input-wrap")?.querySelector("input");
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      button.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });
}

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (!redirect) return null;
  try {
    const url = new URL(redirect, window.location.origin);
    return url.pathname + url.search;
  } catch (error) {
    return null;
  }
}

function isPublicPage() {
  const path = window.location.pathname.toLowerCase();
  return path.endsWith("/login.html") || path.endsWith("/signup.html") || path.endsWith("/forgot.html");
}

function requireAuth() {
  if (authState.isAuthenticated) {
    return;
  }

  if (isPublicPage()) {
    return;
  }

  const destination = window.location.pathname + window.location.search;
  const loginUrl = `login.html?redirect=${encodeURIComponent(destination)}`;
  window.location.replace(loginUrl);
}

/* ===== Page Initialization ===== */
document.addEventListener("DOMContentLoaded", () => {
  authState.load();
  requireAuth();
  initAuthPage();
  loadRememberedEmail();
  setupSocialAuthButtons();
  setupPasswordToggleButtons();
});

/* ===== Keyframe animations for notifications ===== */
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
