#!/usr/bin/env bash

# ==============================================================
# ProxMenux - NAS ISO Selector
# ==============================================================

# Configuracion Base
BASE_DIR="/usr/local/share/proxmenux"
UTILS_FILE="$BASE_DIR/utils.sh"
VENV_PATH="/opt/googletrans-env"

if [[ -f "$UTILS_FILE" ]]; then
    source "$UTILS_FILE"
fi

load_language
initialize_cache

ISO_DIR="/var/lib/vz/template/iso"
mkdir -p "$ISO_DIR"

function select_nas_iso() {

  NAS_OPTIONS=(
    "1" "$(translate "Synology DSM VM")"
    "2" "$(translate "TrueNAS SCALE VM 24.04.2.5") (Dragonfish)"
    "3" "$(translate "TrueNAS CORE VM (FreeBSD based)")"
    "4" "$(translate "OpenMediaVault VM (Debian based)")"
    "5" "$(translate "Rockstor VM (openSUSE based)")"
  )

  NAS_TYPE=$(whiptail --title "ProxMenux - NAS Systems" --menu "$(translate "Select the NAS system to install")" 20 70 6 \
    "${NAS_OPTIONS[@]}" 3>&1 1>&2 2>&3)

  [[ $? -ne 0 ]] && echo "Cancelled." && exit 1

  case "$NAS_TYPE" in
    1)
      bash <(curl -s "https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/scripts/vm/synology.sh")
      exit 0
      ;;
    2)
      ISO_NAME="TrueNAS SCALE 24.04.2.5 (Dragonfish)"
      ISO_URL="https://download.truenas.com/TrueNAS-SCALE-Dragonfish/24.04.2.5/TrueNAS-SCALE-24.04.2.5.iso"
      ISO_FILE="TrueNAS-SCALE-24.04.2.5.iso"
      ISO_PATH="$ISO_DIR/$ISO_FILE"
      ;;
    3)
      LATEST_ISO=$(wget -qO- https://download.freenas.org/latest/x64/ | grep -oP 'href="\K[^"]+\.iso' | head -n1)
      ISO_NAME="TrueNAS CORE (Latest)"
      ISO_URL="https://download.freenas.org/latest/x64/$LATEST_ISO"
      ISO_FILE=$(basename "$LATEST_ISO")
      ISO_PATH="$ISO_DIR/$ISO_FILE"
      ;;
    4)
      ISO_NAME="OpenMediaVault"
      ISO_URL="https://downloads.sourceforge.net/project/openmediavault/7.2.0/openmediavault_7.2.0-amd64.iso"
      ISO_FILE="openmediavault_7.2.0-amd64.iso"
      ISO_PATH="$ISO_DIR/$ISO_FILE"
      ;;
    5)
      ISO_NAME="Rockstor"
      ISO_URL="https://rockstor.com/downloads/installer/leap/15.6/x86_64/Rockstor-Leap15.6-generic.x86_64-5.0.15-0.install.iso"
      ISO_FILE="Rockstor-Leap15.6-generic.x86_64-5.0.15-0.install.iso"
      ISO_PATH="$ISO_DIR/$ISO_FILE"
      ;;
  esac

  export ISO_NAME
  export ISO_URL
  export ISO_FILE
  export ISO_PATH
}
