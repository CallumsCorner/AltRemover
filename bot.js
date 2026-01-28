BOT_TOKEN=your_bot_token
GUILD_ID=your_guild_id
INACTIVE_ROLE_ID=role_id


const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const INACTIVE_ROLE_ID = process.env.INACTIVE_ROLE_ID;

const INACTIVITY_DAYS = 30;
const MIN_MESSAGES = 10;

const COUNT_ONLY = false;
const DRY_RUN = false;

const OUTPUT_FILE = 'inactive_users.txt';
const LOW_ACTIVITY_FILE = 'low_activity_users.txt';

if (!BOT_TOKEN || !GUILD_ID || !INACTIVE_ROLE_ID) {
    console.error('Missing env vars');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let hitRateLimit = false;

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    if (DRY_RUN && !COUNT_ONLY) {
        fs.writeFileSync(
            OUTPUT_FILE,
            `Inactive users (${new Date().toLocaleString()})\n\n`
        );
    }

    fs.writeFileSync(
        LOW_ACTIVITY_FILE,
        `Low activity users (${new Date().toLocaleString()})\n\n`
    );

    await scanGuild();
    process.exit(0);
});

async function scanGuild() {
    const guild = await client.guilds.fetch(GUILD_ID);
    const members = await guild.members.fetch();
    const inactiveRole = await guild.roles.fetch(INACTIVE_ROLE_ID);

    const cutoff = Date.now() - INACTIVITY_DAYS * 86400000;

    let inactive = 0;
    let active = 0;
    let lowActivity = 0;

    for (const member of members.values()) {
        if (member.user.bot) continue;
        if (member.roles.cache.has(INACTIVE_ROLE_ID)) continue;

        const { lastMessageDate, messageCount } =
            await getMessageInfo(member.id);

        if (messageCount < MIN_MESSAGES) {
            lowActivity++;
            fs.appendFileSync(
                LOW_ACTIVITY_FILE,
                `${member.user.tag} (${messageCount} messages)\n`
            );
        }

        if (!lastMessageDate || lastMessageDate < cutoff) {
            inactive++;

            if (!COUNT_ONLY) {
                if (DRY_RUN) {
                    const last = lastMessageDate
                        ? new Date(lastMessageDate).toLocaleDateString()
                        : 'never';

                    fs.appendFileSync(
                        OUTPUT_FILE,
                        `${member.user.tag} last message: ${last}\n`
                    );
                } else {
                    await member.roles.add(inactiveRole);
                }
            }
        } else {
            active++;
        }

        await sleep(hitRateLimit ? 7000 : 5000);
        hitRateLimit = false;
    }

    console.log('Done');
    console.log(`Active: ${active}`);
    console.log(`Inactive: ${inactive}`);
    console.log(`Low activity: ${lowActivity}`);
}

async function getMessageInfo(userId) {
    const url =
        `https://discord.com/api/v10/guilds/${GUILD_ID}/messages/search` +
        `?author_id=${userId}&limit=1`;

    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bot ${BOT_TOKEN}`,
                },
            });

            if (res.status === 429) {
                hitRateLimit = true;
                const data = await res.json();
                await sleep((data.retry_after || 1) * 1000);
                continue;
            }

            if (!res.ok) {
                return { lastMessageDate: null, messageCount: 0 };
            }

            const data = await res.json();

            const count = data.total_results || 0;
            const last =
                data.messages?.[0]?.[0]?.timestamp
                    ? new Date(data.messages[0][0].timestamp).getTime()
                    : null;

            return { lastMessageDate: last, messageCount: count };
        } catch {
            await sleep(1000);
        }
    }

    return { lastMessageDate: null, messageCount: 0 };
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

client.login(BOT_TOKEN);
