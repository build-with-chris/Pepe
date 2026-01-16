#!/usr/bin/env python3
"""CLI tool to manage Clerk user roles.

Usage:
    python cli/clerk_roles.py list                    # List all users
    python cli/clerk_roles.py set USER_ID ROLE        # Set role for user
    python cli/clerk_roles.py get USER_ID             # Get user info

Roles:
    shows-artist  - Artist portal access
    shows-admin   - Admin portal access
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_API_BASE = "https://api.clerk.com/v1"

if not CLERK_SECRET_KEY:
    print("Error: CLERK_SECRET_KEY not found in environment")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
    "Content-Type": "application/json"
}


def list_users():
    """List all users with their roles."""
    resp = requests.get(f"{CLERK_API_BASE}/users?limit=100", headers=headers)
    if resp.status_code != 200:
        print(f"Error: {resp.status_code} - {resp.text}")
        return

    users = resp.json()
    if not users:
        print("No users found.")
        return

    print(f"\n{'ID':<35} {'Email':<30} {'Role':<15} {'Name'}")
    print("-" * 100)

    for user in users:
        user_id = user.get("id", "")
        emails = user.get("email_addresses", [])
        email = emails[0]["email_address"] if emails else "N/A"
        metadata = user.get("public_metadata", {}) or {}
        role = metadata.get("role", "none")
        first = user.get("first_name", "") or ""
        last = user.get("last_name", "") or ""
        name = f"{first} {last}".strip() or "N/A"

        print(f"{user_id:<35} {email:<30} {role:<15} {name}")


def get_user(user_id: str):
    """Get detailed user info."""
    resp = requests.get(f"{CLERK_API_BASE}/users/{user_id}", headers=headers)
    if resp.status_code != 200:
        print(f"Error: {resp.status_code} - {resp.text}")
        return

    user = resp.json()
    print(f"\nUser ID: {user.get('id')}")
    print(f"Email: {user.get('email_addresses', [{}])[0].get('email_address', 'N/A')}")
    print(f"Name: {user.get('first_name', '')} {user.get('last_name', '')}")
    print(f"Public Metadata: {user.get('public_metadata', {})}")
    print(f"Private Metadata: {user.get('private_metadata', {})}")


def set_role(user_id: str, role: str):
    """Set user role in public metadata."""
    valid_roles = ["shows-artist", "shows-admin", "none"]

    if role not in valid_roles:
        print(f"Error: Invalid role '{role}'. Valid roles: {', '.join(valid_roles)}")
        return

    # Get current metadata
    resp = requests.get(f"{CLERK_API_BASE}/users/{user_id}", headers=headers)
    if resp.status_code != 200:
        print(f"Error fetching user: {resp.status_code} - {resp.text}")
        return

    user = resp.json()
    current_metadata = user.get("public_metadata", {}) or {}

    # Update role
    if role == "none":
        current_metadata.pop("role", None)
    else:
        current_metadata["role"] = role

    # Update user
    update_resp = requests.patch(
        f"{CLERK_API_BASE}/users/{user_id}",
        headers=headers,
        json={"public_metadata": current_metadata}
    )

    if update_resp.status_code != 200:
        print(f"Error updating user: {update_resp.status_code} - {update_resp.text}")
        return

    print(f"✓ Role '{role}' set for user {user_id}")

    # Show updated user
    get_user(user_id)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    command = sys.argv[1]

    if command == "list":
        list_users()
    elif command == "get":
        if len(sys.argv) < 3:
            print("Usage: python clerk_roles.py get USER_ID")
            return
        get_user(sys.argv[2])
    elif command == "set":
        if len(sys.argv) < 4:
            print("Usage: python clerk_roles.py set USER_ID ROLE")
            print("Roles: shows-artist, shows-admin, none")
            return
        set_role(sys.argv[2], sys.argv[3])
    else:
        print(f"Unknown command: {command}")
        print(__doc__)


if __name__ == "__main__":
    main()
