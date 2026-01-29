# The Soprano Hub Alt Scanner

This script is a simple utility for The Soprano Hub that helps find inactive members and users with very low activity. It can automatically assign an “Inactive” role to members who have not sent messages in a set number of days.

It is intentionally basic and a bit slow, and it relies entirely on Discord’s API. For small to medium servers like Soprano’s Server, it works ok.

---

## How it Works

1. Checks all members in your guild.
2. Skips bots and members who already have the inactive role.
3. Fetches each member’s most recent message using Discord’s search API.
4. Marks users as inactive if they have not posted in `INACTIVITY_DAYS` (default: 30).
5. Logs low-activity users who have sent fewer than `MIN_MESSAGES` (default: 10).

---

## Important Notes

- This script is slow.  
  Discord rate-limits message search heavily, so the script waits several seconds between users to avoid hitting limits. Trying to speed it up will likely cause it to break.

- Not foolproof.  
  Discord’s message search for bots is unofficial and may change at any time. It works now, but there are no guarantees.

- Basic but effective.  
  There is no database and no advanced logging. It is designed to be simple and get the job done.
