#!/usr/bin/env bash
set -euo pipefail

# Claude Pet Installer — downloads the latest release from GitHub
REPO="scm1400/claude-pet"
API_URL="https://api.github.com/repos/$REPO/releases/latest"

info()  { printf "\033[1;34m→\033[0m %s\n" "$*"; }
ok()    { printf "\033[1;32m✓\033[0m %s\n" "$*"; }
err()   { printf "\033[1;31m✗\033[0m %s\n" "$*" >&2; exit 1; }

# Detect OS and architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)  PLATFORM="mac" ;;
  Linux)   PLATFORM="linux" ;;
  *)       err "Unsupported OS: $OS. Use install.ps1 for Windows." ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH_LABEL="x64" ;;
  arm64|aarch64) ARCH_LABEL="arm64" ;;
  *)             err "Unsupported architecture: $ARCH" ;;
esac

info "Detected: $OS ($ARCH_LABEL)"

# Fetch latest release info
info "Fetching latest release..."
RELEASE_JSON=$(curl -fsSL "$API_URL") || err "Failed to fetch release info"
VERSION=$(echo "$RELEASE_JSON" | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"//;s/".*//')
info "Latest version: $VERSION"

# Determine download asset
if [ "$PLATFORM" = "mac" ]; then
  if [ "$ARCH_LABEL" = "arm64" ]; then
    PATTERN="arm64.*\.dmg"
  else
    PATTERN="x64.*\.dmg\|Claude.Pet.*\.dmg"
  fi
  ASSET_URL=$(echo "$RELEASE_JSON" | grep '"browser_download_url"' | grep -i '\.dmg"' | head -1 | sed 's/.*"browser_download_url": *"//;s/".*//')
  FILENAME="Claude-Pet-${VERSION}.dmg"
elif [ "$PLATFORM" = "linux" ]; then
  # Prefer AppImage
  ASSET_URL=$(echo "$RELEASE_JSON" | grep '"browser_download_url"' | grep -i '\.AppImage"' | head -1 | sed 's/.*"browser_download_url": *"//;s/".*//')
  if [ -z "$ASSET_URL" ]; then
    ASSET_URL=$(echo "$RELEASE_JSON" | grep '"browser_download_url"' | grep -i '\.deb"' | head -1 | sed 's/.*"browser_download_url": *"//;s/".*//')
    FILENAME="claude-pet-${VERSION}.deb"
  else
    FILENAME="Claude-Pet-${VERSION}.AppImage"
  fi
fi

[ -z "${ASSET_URL:-}" ] && err "No installer found for $PLATFORM ($ARCH_LABEL)"

TMPDIR="${TMPDIR:-/tmp}"
DOWNLOAD_PATH="$TMPDIR/$FILENAME"

info "Downloading $FILENAME..."
curl -fSL --progress-bar -o "$DOWNLOAD_PATH" "$ASSET_URL" || err "Download failed"
ok "Downloaded to $DOWNLOAD_PATH"

# Install
if [ "$PLATFORM" = "mac" ]; then
  info "Mounting DMG..."
  MOUNT_POINT=$(hdiutil attach "$DOWNLOAD_PATH" -nobrowse | tail -1 | awk '{print $NF}')
  APP_PATH=$(find "$MOUNT_POINT" -name "*.app" -maxdepth 1 | head -1)
  if [ -n "$APP_PATH" ]; then
    info "Installing to /Applications..."
    cp -R "$APP_PATH" /Applications/
    hdiutil detach "$MOUNT_POINT" -quiet
    ok "Claude Pet installed to /Applications!"
    info "Run: open '/Applications/Claude Pet.app'"
  else
    hdiutil detach "$MOUNT_POINT" -quiet
    err "No .app found in DMG"
  fi
elif [ "$PLATFORM" = "linux" ]; then
  if [[ "$FILENAME" == *.AppImage ]]; then
    INSTALL_DIR="${HOME}/.local/bin"
    mkdir -p "$INSTALL_DIR"
    mv "$DOWNLOAD_PATH" "$INSTALL_DIR/claude-pet"
    chmod +x "$INSTALL_DIR/claude-pet"
    ok "Claude Pet installed to $INSTALL_DIR/claude-pet"
    info "Make sure $INSTALL_DIR is in your PATH"
    info "Run: claude-pet"
  elif [[ "$FILENAME" == *.deb ]]; then
    info "Installing .deb package..."
    sudo dpkg -i "$DOWNLOAD_PATH" || sudo apt-get install -f -y
    ok "Claude Pet installed!"
    info "Run: claude-pet"
  fi
fi

rm -f "$DOWNLOAD_PATH" 2>/dev/null || true
ok "Installation complete!"
