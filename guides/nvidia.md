---
title: "Installing NVIDIA Graphics Card Drivers on Proxmox (PVE 8)"
description: "Install and config NVIDIA drivers on Proxmox VE host and enable GPU usage in LXC containers."
---



Before we begin, I want to thank my colleague @juanlu13 for providing the [original source](https://forums.plex.tv/t/plex-hw-acceleration-in-lxc-container-anyone-with-success/219289/34?utm_source=pocket_mylist) on which this manual is based.

In this guide, we will install the Nvidia drivers, the persistent service, and an optional patch to remove the maximum encoding sessions limit.

- We will install Nvidia drivers on the Proxmox host.
- We will configure the drivers for use in any LXC.

To perform the installation, we must:

1. Blacklist the "nouveau" driver if we haven't already. If we have already done this, we can skip this step.

We can check it like this:
```
cat /etc/modprobe.d/blacklist.conf
```
The example image shows that "blacklist nouveau" is already added to the blacklist.

![Blacklist check](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-2.png)

If in our case it doesn't show: blacklist nouveau

We add it like this so it's not used and we can install the Nvidia driver.

```
echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf
```
```
reboot
```

2. Make sure we have these repositories added:

(*If we have installed the post-installation script from [tteck](https://tteck.github.io/Proxmox/) or [xshok](https://github.com/extremeshok/xshok-proxmox), we can skip this step as it's not necessary since these repositories are already added.*)

```
nano /etc/apt/sources.list
```

## Proxmox 7
```
deb http://ftp.debian.org/debian bullseye main contrib
deb http://ftp.debian.org/debian bullseye-updates main contrib
deb http://security.debian.org/debian-security bullseye-security main contrib
deb http://download.proxmox.com/debian/pve bullseye pve-no-subscription
```

## Proxmox 8
```
deb http://ftp.debian.org/debian bookworm main contrib
deb http://ftp.debian.org/debian bookworm-updates main contrib
deb http://security.debian.org/debian-security bookworm-security main contrib
deb http://deb.debian.org/debian bookworm main contrib non-free-firmware
deb http://deb.debian.org/debian bookworm-updates main contrib non-free-firmware
# security updates
deb http://security.debian.org/debian-security bookworm-security main contrib non-free-firmware
```

Update the packages and Proxmox

```
apt update && apt dist-upgrade -y
```

Before we start, let's install two packages we'll need, git and the kernel headers to install the drivers:

```
apt-get install git
```
```
apt-get install -qqy pve-headers-`uname -r` gcc make 
```

## 1 - Install Nvidia drivers on the Proxmox host

### - Driver:

To begin, we need to know what the latest stable driver available is:*

(*If we're going to install the patch to bypass the maximum encoding limit, we need to make sure that patch is available for the driver version we're going to install.*) We can check it [here](https://github.com/keylase/nvidia-patch).
```
https://download.nvidia.com/XFree86/Linux-x86_64/latest.txt 
```

We can check the complete list of Drivers [here](https://download.nvidia.com/XFree86/Linux-x86_64/)

When it shows us the result, we copy the number and replace "/latest.txt" with it.

For example, like this:

```
https://download.nvidia.com/XFree86/Linux-x86_64/525.116.03/
```

Once inside the directory, we copy the link of the installer that ends with the .run extension

![NVIDIA driver download](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-1.png)

For example:
```
https://download.nvidia.com/XFree86/Linux-x86_64/525.116.03/NVIDIA-Linux-x86_64-525.116.03.run
```

#### Let's start with the installation:

```
mkdir /opt/nvidia
```
```
cd /opt/nvidia
```
We download the driver we copied earlier.
```
wget https://download.nvidia.com/XFree86/Linux-x86_64/525.116.03/NVIDIA-Linux-x86_64-525.116.03.run
```
We give it execution permissions.
```
chmod +x NVIDIA-Linux-x86_64-525.116.03.run
```
We execute.
```
./NVIDIA-Linux-x86_64-525.116.03.run --no-questions --ui=none --disable-nouveau
```
Once finished, we reboot.
```
reboot
```
After Proxmox has rebooted, we continue with the installation. We execute:
```
/opt/nvidia/NVIDIA-Linux-x86_64-525.116.03.run --no-questions --ui=none
```

Now we add to etc/modules:
```
nano /etc/modules-load.d/modules.conf
```
```
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
nvidia
nvidia_uvm
```
We save:
ctrl + x.

We update initramfs:
```
update-initramfs -u -k all
```
Next, we create rules to load the drivers at boot for nvidia and nvidia_uvm:
```
nano /etc/udev/rules.d/70-nvidia.rules
```
We paste:
```
# /etc/udev/rules.d/70-nvidia.rules
# Create /nvidia0, /dev/nvidia1 … and /nvidiactl when nvidia module is loaded
KERNEL=="nvidia", RUN+="/bin/bash -c '/usr/bin/nvidia-smi -L'"
#
# Create the CUDA node when nvidia_uvm CUDA module is loaded
KERNEL=="nvidia_uvm", RUN+="/bin/bash -c '/usr/bin/nvidia-modprobe -c0 -u'"
```
We save: ctrl + x

### - NVIDIA driver persistence:

Now we install NVIDIA driver persistence:
```
cd /opt/nvidia
git clone https://github.com/NVIDIA/nvidia-persistenced.git
cd nvidia-persistenced/init
./install.sh
```
```
reboot
```

We check that the driver is installed and the service is running:
```
nvidia-smi
```
![NVIDIA SMI output](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-3.png)
```
systemctl status nvidia-persistenced
```
![NVIDIA persistence service status](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-4.png)

### - Patch:

Now as an option, we patch the nvidia driver to remove the maximum encoding sessions. According to the developer, the NVENC patch removes the restriction on the maximum number of simultaneous NVENC video encoding sessions imposed by Nvidia on consumer-level GPUs.

```
cd /opt/nvidia
git clone https://github.com/keylase/nvidia-patch.git
cd nvidia-patch
./patch.sh
```
![NVIDIA patch application](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-5.png)

## 2- Configure the drivers to be able to use them in any LXC.

First, we need to obtain this data:
```
ls -l /dev/nv*
```
![NVIDIA device list](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-6.png)

Let's say, for example, that we're going to use the Plex LXC from tteck's script with ID100. If we have it running, we turn it off.
```
nano /etc/pve/lxc/100.conf
```
If there are any, we comment out all lines where it appears:
- lxc.cgroup2.devices.allow...
- /dev/dri...

and we paste this inside the LXC configuration file, which corresponds to the data we obtained with: ls -l /dev/nv*

(*the numbers may vary from one system to another*)

```
lxc.cgroup2.devices.allow: c 195:* rwm
lxc.cgroup2.devices.allow: c 509:* rwm
lxc.cgroup2.devices.allow: c 10:* rwm
lxc.cgroup2.devices.allow: c 238:* rwm
lxc.mount.entry: /dev/nvidia0 dev/nvidia0 none bind,optional,create=file
lxc.mount.entry: /dev/nvidiactl dev/nvidiactl none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm dev/nvidia-uvm none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-modeset dev/nvidia-modeset none bind,optional,create=file
lxc.mount.entry: /dev/nvidia-uvm-tools dev/nvidia-uvm-tools none bind,optional,create=file
lxc.mount.entry: /dev/nvram dev/nvram none bind,optional,create=file
```

![LXC configuration](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-7.png)

We save:
ctrl + x.

We run the LXC and we're going to install the Nvidia driver inside it.
**IMPORTANT: we do this installation from the LXC console, not from Proxmox**

```
mkdir /opt/nvidia
```
```
cd /opt/nvidia
```
```
wget https://download.nvidia.com/XFree86/Linux-x86_64/525.116.03/NVIDIA-Linux-x86_64-525.116.03.run
```
```
chmod +x NVIDIA-Linux-x86_64-525.116.03.run
```
```
./NVIDIA-Linux-x86_64-525.116.03.run --no-kernel-module
```

When this screen appears, we select everything by default, each time it asks us.

![NVIDIA driver installation](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-8.png)

Once the installation is finished, we check that everything is correct

```
nvidia-smi
```

![NVIDIA SMI in LXC](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-9.png)

```
ls -l /dev/nv*
```

![NVIDIA devices in LXC](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-10.png)

## We check that Plex uses the graphics card.

As we can see, the Plex LXC container makes use of the Nvidia graphics card from our Proxmox host.

![Plex using NVIDIA GPU 1](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-11.png)

![Plex using NVIDIA GPU 2](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/nvidia/nvidia-12.png)

If we want any LXC to use our graphics card, we simply follow the same steps.

If we want to use the Nvidia graphics card in Docker, we need to install nvidia-docker2 as an extra.

Inside the LXC where we have Docker, we can do it with this simple script:
```
wget https://raw.githubusercontent.com/MacRimi/manuales/main/NVIDIA/nvidia-docker.sh
```
```
chmod +x nvidia-docker.sh
```
```
./nvidia-docker.sh
```

---

<div style="display: flex; justify-content: center; align-items: center;">
  <a href="https://ko-fi.com/G2G313ECAN" target="_blank" style="display: flex; align-items: center; text-decoration: none;">
    <img src="https://raw.githubusercontent.com/MacRimi/HWEncoderX/main/images/kofi.png" alt="Support me on Ko-fi" style="width:175px; margin-right:65px;"/>
  </a>
</div>

If you found this tutorial helpful and useful, you can buy me a Ko-fi! Thank you! 😊
