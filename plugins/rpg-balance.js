import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const handler = async (message, { db }) => {
  try {
    const guildId = message.guild.id;
    const userMention = message.mentions.users.first() || message.author;
    const userId = userMention.id;

    db.data.users ??= {};
    db.data.users[userId] ??= { 
      limit: 20, 
      money: 100, 
      voteStreak: 0,
      exp: 0 
    };

    let userGlobal = db.data.users[userId];

    db.data.levels ??= {};
    db.data.levels[guildId] ??= {};
    db.data.levels[guildId][userId] ??= { 
      exp: 0,
      level: 0 
    };

    let levelData = db.data.levels[guildId][userId];

    const nivel = levelData.level;
    const expServer = levelData.exp;
    const expTotal = userGlobal.exp;       
    const expNecesaria = (nivel + 1) ** 3 * 100;

    const progreso = Math.min(expServer / expNecesaria, 1);
    const barra = "█".repeat(Math.floor(progreso * 10)).padEnd(10, "▬");

    const embed = new EmbedBuilder()
      .setColor("#00FFFF")
      .setAuthor({ name: `${userMention.username}'s Perfil`, iconURL: userMention.displayAvatarURL() })
      .setThumbnail(userMention.displayAvatarURL({ size: 512 }))
      .addFields(
        { name: "Nivel (en este servidor)", value: `**${nivel}**`, inline: true },
        { name: "Experiencia Total", value: `${expTotal.toLocaleString()} XP`, inline: true },
        { name: "Diamantes", value: `**${userGlobal.limit || 0}** 💎`, inline: true },
        { name: "nsCoins", value: `**${userGlobal.money || 0}** 🪙`, inline: true },
        { name: "Racha de votos", value: userGlobal.voteStreak ? `**${userGlobal.voteStreak} día${userGlobal.voteStreak > 1 ? "s" : ""}** 🔥` : "0", inline: true }
      )
      .setDescription(`**Progreso → Nivel ${nivel + 1} (Servidor)**\n` + `\`${barra}\` ${expServer}/${expNecesaria}`)
      .setFooter({ text: "Comprar diamante con el comando .buy" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("refresh")
        .setLabel("Actualizar")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🔄")
    );

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async i => {
      if (i.user.id !== message.author.id)
        return i.reply({ content: "Solo el dueño puede refrescar.", ephemeral: true });

      await i.deferUpdate();
      await handler(i, { db });
    });

  } catch (err) {
    console.error("Error en balance:", err);
    message.reply("Error al mostrar el perfil.");
  }
};

handler.help = ["balance", "bal", "perfil"];
handler.tags = ["rpg"];
handler.command = /^(balance?|bal|perfil|profile)$/i;

export default handler;
