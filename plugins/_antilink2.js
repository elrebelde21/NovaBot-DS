const URL_REGEX = /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})[^\s]*/gi;

const DOMAINS = [
  {
    id: "discord",
    domains: ["discord.gg", "discord.com", "discordapp.com"]
  },
  {
    id: "youtube",
    domains: ["youtube.com", "youtu.be"]
  },
  {
    id: "twitch",
    domains: ["twitch.tv"]
  },
  {
    id: "kick",
    domains: ["kick.com"]
  },
  {
    id: "tiktok",
    domains: ["tiktok.com"]
  },
  {
    id: "twitter",
    domains: ["twitter.com", "x.com"]
  },
  {
    id: "instagram",
    domains: ["instagram.com"]
  },
  {
    id: "facebook",
    domains: ["facebook.com"]
  },
  {
    id: "threads",
    domains: ["threads.net"]
  },
  {
    id: "reddit",
    domains: ["reddit.com"]
  },
  {
    id: "snapchat",
    domains: ["snapchat.com"]
  },
  {
    id: "pinterest",
    domains: ["pinterest.com"]
  },
  {
    id: "whatsapp",
    domains: ["whatsapp.com", "chat.whatsapp.com"]
  },
  {
    id: "telegram",
    domains: ["t.me", "telegram.me", "telegram.org"]
  },
  {
    id: "spotify",
    domains: ["spotify.com"]
  },
  {
    id: "soundcloud",
    domains: ["soundcloud.com"]
  },
  {
    id: "gifs",
    domains: ["tenor.com", "giphy.com"]
  },
  {
    id: "imgur",
    domains: ["imgur.com"]
  },
  {
    id: "drive",
    domains: ["drive.google.com"]
  },
  {
    id: "dropbox",
    domains: ["dropbox.com"]
  },
  {
    id: "mega",
    domains: ["mega.nz"]
  },
  {
    id: "mediafire",
    domains: ["mediafire.com"]
  },
  {
    id: "wetransfer",
    domains: ["wetransfer.com"]
  },
  {
    id: "github",
    domains: ["github.com"]
  },
  {
    id: "gitlab",
    domains: ["gitlab.com"]
  },
  {
    id: "paypal",
    domains: ["paypal.com"]
  },
  {
    id: "shorteners",
    domains: ["bit.ly", "tinyurl.com", "cutt.ly", "rebrand.ly"]
  }
];

export const before = async (message, { db, isAdmin, isBotAdmin }) => {
  if (!message.guild || message.author.bot) return;

  const settings = db.data.settings?.[message.guild.id]?.antilink;
  if (!settings?.enabled) return;

  if (settings.exemptRoles?.length) {
    if (message.member.roles.cache.some(r => settings.exemptRoles.includes(r.id))) {
      return;
    }
  }

  if (settings.whitelistChannels?.includes(message.channel.id)) {
    return;
  }

  const links = message.content.match(URL_REGEX);
  if (!links) return;

  const blocked = links.find(link =>
    settings.domains.some(id => {
      const platform = DOMAINS.find(d => d.id === id);
      return platform?.domains.some(domain =>
        link.toLowerCase().includes(domain)
      );
    })
  );

  if (!blocked) return;
  if (isAdmin) return message.reply("🙄 **AntiLink activo**, pero te salvaste porque sos **admin**.");
  if (!isBotAdmin) return message.reply("⚠️ Te salvarte gilpollas en antilink esta activo pero no soy admin no te puedo eliminar")

  await message.delete().catch(() => {});

  const uid = message.author.id;
  settings.violations[uid] = (settings.violations[uid] || 0) + 1;

  await message.channel.send(`⚠️ <@${uid}> enlace prohibido\nViolaciones: **${settings.violations[uid]}/${settings.limit}**`);
  if (settings.violations[uid] >= settings.limit) {
    switch (settings.action) {
      case "warn":
        break;

      case "mute":
      case "timeout":
        await message.member
          .timeout(settings.limit * 60 * 1000, "AntiLink timeout")
          .catch(() => {});
        break;

      case "ban":
        await message.member
          .ban({ reason: "AntiLink automático" })
          .catch(() => {});
        break;
    }

    delete settings.violations[uid];
  }

  await db.write();
};
