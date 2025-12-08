#!/bin/bash

# Parse arguments
for ARGUMENT in "$@"; do
  KEY=$(echo "$ARGUMENT" | cut -f1 -d=)
  VALUE=$(echo "$ARGUMENT" | cut -f2 -d=)
  case "$KEY" in
  host_uid) host_uid=${VALUE} ;;
  host_gid) host_gid=${VALUE} ;;
  host_username) username=${VALUE} ;;  # Changed to match what's passed in Dockerfile.frontend.backend
  osName) osName=${VALUE} ;;
  *) ;;
  esac
done

# Set default values if not provided
host_uid="${host_uid:-1000}"
host_gid="${host_gid:-1000}"
username="${username:-devopsadmin}"  # Use a clearer variable name
osName="${osName:-linux}"

echo "Creating user $username with UID=$host_uid and GID=$host_gid"

# Create home directory
mkdir -p "/home/$username"

# Create the user
useradd --uid "$host_uid" -s /bin/bash -d "/home/$username" "$username"

# Add to groups
usermod -a -G sudo,dialout "$username"

# Set password (for development only)
echo "$username:$username" | chpasswd

# Add sudo permissions
echo "%$username ALL=(ALL) NOPASSWD:ALL" >>/etc/sudoers

# Make sure home directory has correct permissions
chown -R "$username:$host_gid" "/home/$username"

# Verify user was created successfully
id "$username"

echo "User $username created successfully"