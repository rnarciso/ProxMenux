---
title: "Proxmox Backup Cloud"
description: "Set up a simple backup service in Proxmox VE using your personal cloud storage provider (Google Drive, Mega, Dropbox, OneDrive, etc.) as an additional datastore, using rclone for secure backups without scripts."
---



## Preparation:

Connect to Proxmox via your preferred SSH client or from Proxmox's own Shell. Create a new directory in the /mnt folder. You can name it whatever helps you identify it; for example, if you're using Google Drive, you might call it gdrive. Here's how to do it:

```bash
mkdir /mnt/gdrive
```

Now let's add this directory to our datastore.

We'll do it like this:

![Adding new storage](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen1.png)

Next, we specify the name gdrive, the directory we created, and for content, we choose VZDump File.

![Configuring new storage](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen2.png)

Click on Add, and as we can see, it adds the new directory to our datastore.

![New storage added](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen3.png)

## Using rclone for cloud mounting:

Although the directory called gdrive is in our datastore, it's obviously not yet mounted in the cloud. For this, we'll use [rclone](https://rclone.org).

One detail to keep in mind is that rclone has changed the way it authorizes the [service that links to our cloud](https://rclone.org/remote_setup/). To do this, we need to connect via our SSH client and run the following code, changing the user to your Proxmox user (which is likely root if you haven't changed it) and the corresponding Proxmox IP address:

```bash
ssh -L localhost:53682:localhost:53682 root@ip_proxmox
```

Now let's install rclone:

```bash
apt-get update
apt-get install rclone
```

Follow the steps. You can use the rclone [guide](https://rclone.org/docs/) for your cloud provider.

Important: When we reach this point, we'll say "y". It will give us a localhost-type address that we can open and authorize when creating the link with Proxmox.

```
Use web browser to automatically authenticate rclone with remote?
 * Say Y if the machine running rclone has a web browser you can use
 * Say N if running rclone on a (remote) machine without web browser access
If not sure try Y. If Y failed, try N.
y) Yes
n) No
y/n> y
```

Once we have rclone configured, we just need to mount it. We can create a folder in our personal cloud called PBC.

To mount rclone in Proxmox and link it to that folder, we'll do it like this:

```bash
rclone mount gdrive:/PBC /mnt/gdrive --allow-other --allow-non-empty
```

- gdrive:/PBC is the folder in our cloud.
- /mnt/gdrive is the Proxmox directory we added to our datastore.

## Automating rclone mounting

If we want rclone to start on each Proxmox boot, we can use a crontab to do it. Here's how:

```bash
crontab -e
```

Next, it will ask us which type of editor we want to use to edit the file. I indicate option 1, which corresponds to Nano, as it's the console editor that seems simplest and most intuitive to use.
Once inside the editor, we just need to add this line as shown in the image:

```
@reboot rclone mount gdrive:/PBC /mnt/gdrive --allow-other --allow-non-empty
```

![Crontab configuration](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen4.png)

To finish, press the key combination control + X
Indicate "Y" + enter, and with this, we now have rclone mounted in our Proxmox with automatic startup and linked to our cloud.

Now we just need to check if we make a backup and select our gdrive as the destination disk.

![Selecting backup destination](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen5.png)

We'll verify that when the backup is finished, it will be exactly where we wanted it, in our cloud.

![Backup in cloud storage](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen6.png)

## Things to keep in mind

The backups that Proxmox makes, unlike Proxmox Backup Server, are not incremental. Therefore, depending on the space we have in our cloud, the number of copies we make, and their size, we could run out of space quickly.
To avoid this, we can add a copy purge system based on the parameters we want.
For example, we can keep only the last 5 copies as shown in the image.

![Backup retention settings](https://ghproxy.net/https://raw.githubusercontent.com/rnarciso/ProxMenux/main/guides/backup_cloud/imagen7.png)



If you found this tutorial helpful and useful, you can buy me a Ko-fi! Thank you! 😊