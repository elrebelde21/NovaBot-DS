import { EmbedBuilder } from "discord.js";

export async function before(message, { db }) {
  try {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const member = message.member;
    db.data.levels ??= {};
    db.data.levels[guildId] ??= {};
    db.data.levels[guildId][userId] ??= { exp: 0, level: 0 };

    let data = db.data.levels[guildId][userId];
    const xp = Math.floor(Math.random() * 21) + 15;
    data.exp += xp;

    const currentLevel = data.level;
    const newLevel = Math.floor(Math.sqrt(data.exp / 50)); 
    
    if (newLevel > currentLevel) {
      data.level = newLevel;

      const settings = db.data.settings[guildId] || {};
      const canalId = settings.levelupChannel;
      const canal = canalId ? message.guild.channels.cache.get(canalId) : message.channel;

      let texto = settings.levelupMessage || "**{user} ha alcanzado el nivel {level}** 🎉🆙";
      texto = texto
        .replace(/{user}/g, message.author.toString())
        .replace(/{level}/g, newLevel)
        .replace(/{exp}/g, data.exp);

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("¡SUBISTE DE NIVEL! 🥳")
        .setDescription(texto)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))       

      canal.send({ content: `[ AUTOLEVELUP ] 🆙`, embeds: [embed] });

      if (settings.levelupRole) {
        const rol = message.guild.roles.cache.get(settings.levelupRole);
        if (rol && !member.roles.cache.has(rol.id)) {
          member.roles.add(rol).catch(() => {});
        }
      }

      const topRoles = [
        { nivel: 65, rolNombre: "Top Activo 🔥" },
        { nivel: 250, rolNombre: "Leyenda del Servidor 👑" },
        { nivel: 400, rolNombre: "Omega online⚡" }
      ];

      for (const r of topRoles) {
        if (newLevel >= r.nivel) {
          let rolEspecial = message.guild.roles.cache.find(role => role.name === r.rolNombre);
          if (rolEspecial && !member.roles.cache.has(rolEspecial.id)) {
            member.roles.add(rolEspecial).catch(() => {});
          }
        }
      }
    }

    await db.write();
  } catch (e) {
    console.error("Error autolevelup:", e);
  }
}