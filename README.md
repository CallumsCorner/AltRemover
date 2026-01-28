# The Soprano Hub Alt Scanner

This script is a **simple tool for The Soprano Hub** that identifies inactive members and low-activity users.  
It can assign an “Inactive” role automatically to members who haven’t sent messages in a set number of days.

It’s basic, slow, and relies entirely on Discord’s API — but it **works reliably** for small to medium-sized servers like Soprano's Server

---

## How it Works

1. **Checks all members** of your guild.
2. **Skips bots** and members who already have the inactive role.
3. **Fetches last message info** for each member via Discord’s search API.
4. **Marks users inactive** if they haven’t posted in `INACTIVITY_DAYS` (default 30).
5. **Logs low-activity users** who have sent fewer than `MIN_MESSAGES` (default 10).
6. Operates in different modes:
   - `COUNT_ONLY` – just counts inactive/low-activity users, no roles assigned.
   - `DRY_RUN` – lists users who *would* get the role, but doesn’t assign anything.
   - `LIVE` – actually assigns roles to inactive users.

---

## Important Notes

- **This script is slow.**  
  Discord heavily rate-limits message search requests. The script waits several seconds between users to avoid hitting limits. Speeding it up will break it.

- **Not foolproof.**  
  Discord’s search API for bots is unofficial and can change anytime. Works now, but no guarantees.

- **Basic but effective.**  
  No database, no advanced logging — just does the job with what Discord provides.