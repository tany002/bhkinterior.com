#!/bin/bash
# ============================================================
# 🧠 BHKInterior.com Git Sync Script
# ------------------------------------------------------------
# Keeps your local project in sync with Google AI Studio + GitHub.
# ------------------------------------------------------------
# Usage:
#   1️⃣ Save this file as sync-github.sh in your project root.
#   2️⃣ Give it permission:   chmod +x sync-github.sh
#   3️⃣ Run anytime you want to refresh local copy:
#        ./sync-github.sh
# ============================================================

# --- SETTINGS ---
REPO_DIR="$HOME/bhkinterior.com"       # path to your local project
BRANCH="main"                          # the active branch
REMOTE="origin"                        # usually 'origin'

echo "--------------------------------------------------"
echo "🔄 Starting sync for BHKInterior.com"
echo "📁 Directory: $REPO_DIR"
echo "🌿 Branch: $BRANCH"
echo "--------------------------------------------------"

# --- STEP 1: Go to project directory ---
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ Error: $REPO_DIR is not a valid git repository."
  exit 1
fi

cd "$REPO_DIR" || exit
echo "✅ Switched to $(pwd)"

# --- STEP 2: Fetch latest commits from GitHub ---
echo "📡 Fetching updates from $REMOTE..."
git fetch $REMOTE

# --- STEP 3: Show diff summary ---
echo "🔍 Checking for updates..."
git status

# --- STEP 4: Force reset local files to GitHub main ---
read -p "⚠️  This will replace local changes with the latest GitHub version. Continue? (y/n): " choice
if [[ "$choice" == [Yy]* ]]; then
  echo "💥 Resetting local files..."
  git reset --hard $REMOTE/$BRANCH
  echo "✅ Local copy is now identical to GitHub ($REMOTE/$BRANCH)."
else
  echo "🚫 Operation cancelled. No changes made."
fi

echo "--------------------------------------------------"
echo "✅ Sync complete."
echo "--------------------------------------------------"

