// filters

const windows = {
  "delete": {
    "keywords": [
      "(?:^|\\s)\\bdel\\b(?:\\s|$)",
      "(?:^|\\s)\\berase\\b(?:\\s|$)",
      "(?:^|\\s)\\brd\\b(?:\\s|$)",
      "(?:^|\\s)\\brmdir\\b(?:\\s|$)",
      "(?:^|\\s)\\bformat\\b(?:\\s|$)",
      "(?:^|\\s)\\bdiskpart\\b(?:\\s|$)",
      "(?:^|\\s)\\bRemove-Item\\b[\\s\\S]*?\\b-Recurse\\b|(?:^|\\s)\\bRemove-Item\\b[\\s\\S]*?\\b-r\\b(?!\\w)",
      "(?:^|\\s)\\bClear-RecycleBin\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in permanent data loss. Please proceed with caution."
  },
  "shutdown": {
    "keywords": [
      "(?:^|\\s)\\bshutdown\\b[\\s\\S]*\\s[-/][srlhp]\\b",
      "(?:^|\\s)\\bStop-Computer\\b",
      "(?:^|\\s)\\bRestart-Computer\\b"
    ],
    "msg": "DENGER: You are executing a command that may result in system shutdown or restart. Please proceed with caution."
  },
  "registry": {
    "keywords": [
      "(?:^|\\s)\\breg\\b\\s+\\bdelete\\b",
      "(?:^|\\s)\\breg\\b\\s+\\badd\\b",
      "(?:^|\\s)\\bregedit\\b.*?\\b[/-]s\\b",
      "(?:^|\\s)\\bRemove-ItemProperty\\b(?:\\s|$)",
      "(?:^|\\s)\\bSet-ItemProperty\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system registry modification or deletion. Please proceed with caution."
  },
  "clear-logs": {
    "keywords": [
      "(?:^|\\s)\\bwevtutil\\b\\s+\\bcl\\b",
      "(?:^|\\s)\\bClear-EventLog\\b(?:\\s|$)",
      "(?:^|\\s)\\bClear-WinEvent\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system event log clearing. Please proceed with caution."
  },
  "permission": {
    "keywords": [
      "(?:^|\\s)\\btakeown\\b(?:\\s|$)",
      "(?:^|\\s)\\bicacls\\b(?:\\s|$)",
      "(?:^|\\s)\\bcacls\\b(?:\\s|$)",
      "(?:^|\\s)\\bSet-Acl\\b(?:\\s|$)",
      "(?:^|\\s)\\bGet-Acl\\b(?:\\s|$)"
    ],
    "msg": "DENGER: You are executing a command that may result in system permission modification or deletion. Please proceed with caution."
  }
}

const darwin = {
  "darwin-delete": {
    "keywords": [
      "rm -",
      "rmdir ",
      "unlink ",
      "srm ",
      "rm -rf",
      "rm -r",
      "rm -f",
      "rm *"
    ],
    "msg": "DENGER: You are executing a command that may result in permanent data loss. Please proceed with caution.",
  },
  "darwin-disk": {
    "keywords": [
      "diskutil eraseDisk",
      "diskutil partitionDisk",
      "diskutil zeroDisk",
      "diskutil randomDisk",
      "dd ",
      "hdiutil burn",
      "newfs ",
      "mkfs "
    ],
    "msg": "DENGER: You are executing a command that may result in system disk erase, partition, or overwrite operation. Please proceed with caution.",
  },
  "darwin-shutdown": {
    "keywords": [
      "shutdown -h",
      "shutdown -r",
      "shutdown -s",
      "reboot ",
      "halt ",
      "poweroff "
    ],
    "msg": "DENGER: You are executing a command that may result in system shutdown or restart. Please proceed with caution.",
  },
  "darwin-sysctl": {
    "keywords": [
      "sysctl -w",
      "nvram -d",
      "nvram ",
      "csrutil disable",
      "csrutil enable"
    ],
    "msg": "DENGER: You are executing a command that may result in system core parameter or security setting modification. Please proceed with caution.",
  },
  "darwin-permission": {
    "keywords": [
      "chmod 777",
      "chmod -R",
      "chown ",
      "xattr -c",
      "sudo "
    ],
    "msg": "DENGER: You are executing a command that may result in system permission modification or deletion. Please proceed with caution.",
  }
}

const linux = {
  "linux-delete": {
    "keywords": [
      "rm -",
      "rm ",
      "rmdir ",
      "unlink ",
      "shred ",
      "wipe ",
      "rm -rf",
      "rm -r",
      "rm -f",
      "rm --no-preserve-root",
      "find -delete"
    ],
    "msg": "DENGER: You are executing a command that may result in permanent data loss. Please proceed with caution.",
  },
  "linux-disk": {
    "keywords": [
      "mkfs.",
      "mkfs ",
      "mke2fs ",
      "fdisk ",
      "parted ",
      "dd ",
      "wipefs ",
      "hdparm ",
      "blkdiscard ",
      "fstrim "
    ],
    "msg": "DENGER: You are executing a command that may result in system disk erase, partition, or overwrite operation. Please proceed with caution.",
  },
  "linux-shutdown": {
    "keywords": [
      "shutdown -h",
      "shutdown -r",
      "shutdown -P",
      "reboot ",
      "halt ",
      "poweroff ",
      "systemctl poweroff",
      "systemctl reboot",
      "systemctl suspend",
      "systemctl hibernate"
    ],
    "msg": "DENGER: You are executing a command that may result in system shutdown or restart. Please proceed with caution.",
  },
  "linux-root-destroy": {
    "keywords": [
      ":(){ :|:& };:",
      "chmod -R 777 /",
      "chown -R root:root /",
      "rm -rf /",
      "dd of=/dev/",
      "> /dev/sd",
      "echo c > /proc/sysrq-trigger",
      "mkfs. /dev/",
      "fdisk /dev/"
    ],
    "msg": "DENGER: You are executing a command that may result in system self-destruct. Please proceed with caution.",
  },
  "linux-permission": {
    "keywords": [
      "chmod 777",
      "chmod -R",
      "chmod +s",
      "chown ",
      "chgrp ",
      "sudo ",
      "su -",
      "setuid",
      "setgid"
    ],
    "msg": "DENGER: You are executing a command that may result in system permission modification or deletion. Please proceed with caution.",
  },
  "linux-network": {
    "keywords": [
      "iptables -F",
      "iptables -X",
      "ufw disable",
      "firewall-cmd --stop",
      "ip link set down",
      "ifconfig down",
      "nmcli networking off"
    ],
    "msg": "DENGER: You are executing a command that may result in system network rule modification or network interface disabling. Please proceed with caution.",
  },
  "linux-system-config": {
    "keywords": [
      "/etc/passwd",
      "/etc/shadow",
      "/etc/sudoers",
      "/etc/fstab",
      "/etc/hosts",
      "sysctl -w",
      "modprobe -r",
      "rmmod ",
      "insmod "
    ],
    "msg": "DENGER: You are executing a command that may result in system configuration or kernel module modification. Please proceed with caution.",
  }
}


// initialization functions

import Conf from 'conf';
import type { t_command_schema, t_config_schema } from '../forms/schema.ts'

type config_conf = Conf<t_config_schema>

/**
 * single initialization
 * @param store Conf instance
 * @param key config's key ot path (e.g. "a.b.c")
 * @param defaultValue default value
 * @returns whether initialized
 */

export const initIfMissing = <T>(
  store: config_conf,
  key: string,
  defaultValue: T
): boolean => {
  const currentValue = store.get(key);

  if (currentValue === undefined || currentValue === null) {
    store.set(key, defaultValue);
    return true;
  }

  return false;
};

/**
 * batch initialization
 * @param store Conf instance
 * @param defaults default config object
 * @returns initialized keys list
 */

export const initBatch = <T extends Record<string, any>>(
  store: config_conf,
  defaults: T
): string[] => {

  const initialized: string[] = [];

  const traverse = (obj: Record<string, any>, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        if (initIfMissing(store, fullPath, value)) {
          initialized.push(fullPath);
        }
      }

      else {
        traverse(value, fullPath);
      }
    }
  };

  traverse(defaults);

  return initialized;
};

/**
 * conditional initialization
 * @param store Conf instance
 * @param key config's path
 * @param factory factory function)
 */

export const initConditional = <T>(
  store: config_conf,
  key: string,
  factory: () => T
): void => {
  initIfMissing(store, key, factory());
};

export default {
  windows,
  darwin,
  linux,
  initIfMissing,
  initBatch,
  initConditional
}