import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";

const DOMAINS = [
  {
    id: "discord",
    label: "Discord",
    domains: ["discord.gg", "discord.com", "discordapp.com"],
    emoji: "🔗"
  },
  {
    id: "youtube",
    label: "YouTube",
    domains: ["youtube.com", "youtu.be"],
    emoji: "📺"
  },
  {
    id: "twitch",
    label: "Twitch",
    domains: ["twitch.tv"],
    emoji: "🎮"
  },
  {
    id: "kick",
    label: "Kick",
    domains: ["kick.com"],
    emoji: "🟢"
  },
  {
    id: "tiktok",
    label: "TikTok",
    domains: ["tiktok.com"],
    emoji: "🎵"
  },
  {
    id: "twitter",
    label: "Twitter / X",
    domains: ["twitter.com", "x.com"],
    emoji: "🐦"
  },
  {
    id: "instagram",
    label: "Instagram",
    domains: ["instagram.com"],
    emoji: "📸"
  },
  {
    id: "facebook",
    label: "Facebook",
    domains: ["facebook.com"],
    emoji: "👥"
  },
  {
    id: "threads",
    label: "Threads",
    domains: ["threads.net"],
    emoji: "🧵"
  },
  {
    id: "reddit",
    label: "Reddit",
    domains: ["reddit.com"],
    emoji: "📱"
  },
  {
    id: "snapchat",
    label: "Snapchat",
    domains: ["snapchat.com"],
    emoji: "👻"
  },
  {
    id: "pinterest",
    label: "Pinterest",
    domains: ["pinterest.com"],
    emoji: "📌"
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    domains: ["whatsapp.com", "chat.whatsapp.com"],
    emoji: "🟢"
  },
  {
    id: "telegram",
    label: "Telegram",
    domains: ["t.me", "telegram.me", "telegram.org"],
    emoji: "✈️"
  },
  {
    id: "spotify",
    label: "Spotify",
    domains: ["spotify.com"],
    emoji: "🎧"
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    domains: ["soundcloud.com"],
    emoji: "☁️"
  },
  {
    id: "gifs",
    label: "GIFs",
    domains: ["tenor.com", "giphy.com"],
    emoji: "🖼️"
  },
  {
    id: "imgur",
    label: "Imgur",
    domains: ["imgur.com"],
    emoji: "🖼️"
  },
  {
    id: "drive",
    label: "Google Drive",
    domains: ["drive.google.com"],
    emoji: "☁️"
  },
  {
    id: "dropbox",
    label: "Dropbox",
    domains: ["dropbox.com"],
    emoji: "📦"
  },
  {
    id: "mega",
    label: "Mega",
    domains: ["mega.nz"],
    emoji: "🧊"
  },
  {
    id: "mediafire",
    label: "MediaFire",
    domains: ["mediafire.com"],
    emoji: "📁"
  },
  {
    id: "wetransfer",
    label: "WeTransfer",
    domains: ["wetransfer.com"],
    emoji: "📤"
  },
  {
    id: "github",
    label: "GitHub",
    domains: ["github.com"],
    emoji: "🐙"
  },
  {
    id: "gitlab",
    label: "GitLab",
    domains: ["gitlab.com"],
    emoji: "🦊"
  },
  {
    id: "paypal",
    label: "PayPal",
    domains: ["paypal.com"],
    emoji: "💳"
  },
  {
    id: "shorteners",
    label: "Acortadores",
    domains: ["bit.ly", "tinyurl.com", "cutt.ly", "rebrand.ly"],
    emoji: "🧷"
  }
];

let handler = async (message, { args, db }) => {
  if (!message.guild) return;

  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
    return message.reply("❌ Requiere **Gestionar Servidor**");

  const gid = message.guild.id;

  db.data.settings ||= {};
  db.data.settings[gid] ||= {};
  db.data.settings[gid].antilink ||= {
  enabled: true,
  domains: [],
  action: "warn",
  limit: 3,
  violations: {},
  exemptRoles: [],
  whitelistChannels: []
};

  const al = db.data.settings[gid].antilink;
  // 🔧 NORMALIZACIÓN OBLIGATORIA (DB vieja / futura)
al.enabled ??= true;
al.domains ||= [];
al.exemptRoles ||= [];
al.whitelistChannels ||= [];
al.violations ||= {};
al.action ||= "warn";
al.limit ??= 3;
  const sub = (args[0] || "").toLowerCase();

  /* ===============================
     SIN SUBCOMANDO → AYUDA
  ================================ */
  if (!sub) {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("⚙️ Configuración AntiLink")
      .setDescription(`**Uso disponible:**

\`on/off antilink2\`
activa/desactivar en antilink 

\`.setantilink domains\`
Seleccionar dominios bloqueados (menú)

\`.setantilink action warn|mute|timeout|ban\`
Configurar acción

\`.setantilink violations @usuario\`
Ver violaciones

\`.setantilink reset @usuario\`
Resetear violaciones

\`.setantilink exempt @rol\`
Añadir o remover rol exento

\`.setantilink whitelist #canal\`
Canal exento del antilink

\`.setantilink status\`
Ver configuración actual
      `.trim());

    return message.reply({ embeds: [embed] });
  }

  /* ===============================
     DOMAINS (MENÚ)
  ================================ */
  if (sub === "domains") {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("antilink_domains")
    .setPlaceholder("Selecciona los dominios a bloquear")
    .setMinValues(0)
    .setMaxValues(Math.min(25, DOMAINS.length))
    .addOptions(
      DOMAINS.slice(0, 25).map(d => ({
        label: d.label,
        value: d.id,
        emoji: d.emoji,
        default: al.domains.includes(d.id)
      }))
    );

  const row = new ActionRowBuilder().addComponents(menu);

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🌐 Dominios Bloqueados")
    .setDescription(
      al.domains.length
        ? al.domains.map(d => `• ${d}`).join("\n")
        : "Ninguno"
    );

  const msg = await message.reply({ embeds: [embed], components: [row] });

  const collector = msg.createMessageComponentCollector({ time: 60_000 });

  collector.on("collect", async i => {
    if (i.user.id !== message.author.id)
      return i.reply({ content: "❌ No es para vos", ephemeral: true });

    al.domains = i.values;
    await db.write();

    await i.update({
      embeds: [
        embed.setDescription(
          i.values.length
            ? i.values.map(v => `• ${v}`).join("\n")
            : "Ninguno"
        )
      ],
      components: []
    });
  });

  return;
}

  /* ===============================
     ACTION
  ================================ */
  if (sub === "action") {
  const valid = ["warn", "mute", "timeout", "ban"];
  const type = args[1];
  const limit = args[2] ? parseInt(args[2]) : 1;

  if (!valid.includes(type))
    return message.reply(
      "Uso: `.setantilink action warn|mute|timeout|ban [limite]`"
    );

  if (limit < 1)
    return message.reply("El límite debe ser mayor a 0");

  al.action = type;
  al.limit = limit;

  await db.write();

  return message.reply(
    `✅ Acción: **${type}**\n📊 Límite: **${limit === 1 ? "directo" : limit + " advertencias"}**`
  );
}

  /* ===============================
     VIOLATIONS
  ================================ */
  if (sub === "violations") {
    const u = message.mentions.users.first();
    if (!u) return message.reply("Menciona un usuario");
    return message.reply(
      `Violaciones de ${u.tag}: **${al.violations[u.id] || 0}**`
    );
  }

  /* ===============================
     RESET
  ================================ */
  if (sub === "reset") {
    const u = message.mentions.users.first();
    if (!u) return;
    delete al.violations[u.id];
    await db.write();
    return message.reply("♻️ Violaciones reseteadas");
  }
  
  /* ===============================
   WHITELIST CHANNEL
================================ */
if (sub === "whitelist") {
  const ch = message.mentions.channels.first();
  if (!ch) return message.reply("Menciona un canal");

  if (al.whitelistChannels.includes(ch.id)) {
    al.whitelistChannels = al.whitelistChannels.filter(c => c !== ch.id);
    await db.write();
    return message.reply(`❌ Canal removido de whitelist`);
  } else {
    al.whitelistChannels.push(ch.id);
    await db.write();
    return message.reply(`✅ Canal añadido a whitelist`);
  }
}

  /* ===============================
     EXEMPT
  ================================ */
  if (sub === "exempt") {
  const role = message.mentions.roles.first();
  if (!role) return message.reply("Uso: `.setantilink exempt @rol`");

  if (!Array.isArray(al.exemptRoles)) al.exemptRoles = [];

  const had = al.exemptRoles.includes(role.id);

  if (had) al.exemptRoles = al.exemptRoles.filter(r => r !== role.id);
  else al.exemptRoles.push(role.id);

  await db.write();
  return message.reply(
    had
      ? `✅ Rol removido de exentos: ${role}`
      : `✅ Rol añadido a exentos: ${role}`
  );
}

  /* ===============================
     STATUS
  ================================ */
if (sub === "status") {
  const domainNames = al.domains
    .map(id => DOMAINS.find(d => d.id === id)?.label || id);

  const preview = domainNames.slice(0, 5).join(", ");
  const extra = domainNames.length > 5 ? "…" : "";

  // Roles exentos (menciones)
  const roleMentions = (al.exemptRoles || [])
    .map(id => `<@&${id}>`);

  const rolesPreview = roleMentions.slice(0, 5).join(", ");
  const rolesExtra = roleMentions.length > 5 ? "…" : "";

  const embed = new EmbedBuilder()
    .setColor("#2ecc71")
    .setTitle("🔗 AntiLink Status")
    .setDescription(`
Estado: **${al.enabled ? "ON" : "OFF"}**
Acción: **${al.action}**
Límite: **${al.limit === 1 ? "directo" : al.limit + " advertencias"}**
Dominios: **${al.domains.length}** ${al.domains.length ? `(${preview}${extra})` : ""}
Roles exentos: **${al.exemptRoles.length}** ${al.exemptRoles.length ? `(${rolesPreview}${rolesExtra})` : ""}
Canales whitelist: **${al.whitelistChannels.length}** ${al.whitelistChannels.length ? `(${al.whitelistChannels.slice(0,5).map(id=>`<#${id}>`).join(", ")}${al.whitelistChannels.length>5?"…":""})` : ""}
    `.trim());

  return message.reply({ embeds: [embed] });
}
};

handler.command = /^setantilink$/i;
handler.admin = true;
handler.tags = ["group"];
handler.slash = {
  name: "setantilink",
  description: "Configurar sistema AntiLink",
  options: [
    {
      type: 1,
      name: "status",
      description: "Ver estado del AntiLink"
    },
    {
      type: 1,
      name: "domains",
      description: "Seleccionar dominios bloqueados"
    },
    {
      type: 1,
      name: "action",
      description: "Configurar acción",
      options: [
        {
          type: 3,
          name: "tipo",
          description: "warn | mute | timeout | ban",
          required: true,
          choices: [
            { name: "warn", value: "warn" },
            { name: "mute", value: "mute" },
            { name: "timeout", value: "timeout" },
            { name: "ban", value: "ban" }
          ]
        },
        {
          type: 4,
          name: "limite",
          description: "Cantidad de advertencias (opcional)",
          required: false
        }
      ]
    },
    {
      type: 1,
      name: "whitelist",
      description: "Agregar o quitar canal whitelist",
      options: [
        {
          type: 7,
          name: "canal",
          description: "Canal a exentar",
          required: true
        }
      ]
    }
  ]
};
export default handler;
