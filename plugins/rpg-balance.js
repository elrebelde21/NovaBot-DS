import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const handler = async (message, { db, args }) => {
  try {
    const guildId = message.guild.id;
    const userTarget = message.mentions?.users?.first?.() || (args?.[0]?.id ? args[0] : null) || message.author;
    const userId = userTarget.id;
    const userGlobal = db.data.users?.[userId];
    const levelData = db.data.levels?.[guildId]?.[userId];

    if (!userGlobal) {
      return message.reply(`❌ **${userTarget.username}** no existe en mi base de datos.`);
    }

    const nivel = levelData.level || "0";
    const expServer = levelData.exp;
    const expTotal = userGlobal.exp;
    const expNecesaria = (nivel + 1) ** 3 * 100;

    const progreso = Math.min(expServer / expNecesaria, 1);
    const barra = "█".repeat(Math.floor(progreso * 10)).padEnd(10, "▬");

    const embed = new EmbedBuilder()
      .setColor("#00FFFF")
      .setAuthor({
        name: `${userTarget.username}'s Perfil`,
        iconURL: userTarget.displayAvatarURL(),
      })
      .setThumbnail(userTarget.displayAvatarURL({ size: 512 }))
      .addFields(
        {
          name: "Nivel (en este servidor)",
          value: `**${nivel}**`,
          inline: true,
        },
        {
          name: "Experiencia Total",
          value: `${expTotal.toLocaleString()} XP`,
          inline: true,
        },
        {
          name: "Diamantes",
          value: `**${userGlobal.limit}** 💎`,
          inline: true,
        },
        {
          name: "nsCoins",
          value: `**${userGlobal.money}** 🪙`,
          inline: true,
        },
        {
          name: "Racha de votos",
          value: userGlobal.voteStreak
            ? `**${userGlobal.voteStreak} día${
                userGlobal.voteStreak > 1 ? "s" : ""
              }** 🔥`
            : "0",
          inline: true,
        }
      )
      .setDescription(
        `**Progreso → Nivel ${nivel + 1} (Servidor)**\n` +
          `\`${barra}\` ${expServer}/${expNecesaria}`
      )
      .setFooter({ text: "Comprar diamante con el comando .buy" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("refresh_bal")
        .setLabel("Actualizar")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🔄")
    );

    const msg = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      time: 60_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== message.author.id) {
        return i.reply({
          content: "Solo el dueño puede refrescar.",
          ephemeral: true,
        });
      }

      await i.deferUpdate();

      await handler(
        {
          ...message,
          author: i.user,
          mentions: message.mentions,
          reply: (data) => i.editReply(data),
        },
        { db, args }
      );
    });
  } catch (err) {
    console.error("❌ Error en balance:", err);
    message.reply("❌ Error al mostrar el perfil.");
  }
};
handler.help = ["balance", "bal"];
handler.tags = ["rpg"];
handler.desc = ["Ver tu perfil o el de otro usuario"];
handler.command = /^(balance?|bal)$/i;
handler.slash = {
  name: "bal",
  description: "Ver tu perfil o el de otro usuario",
  options: [
    {
      name: "user",
      description: "Usuario a consultar",
      type: 6,
      required: false,
    },
  ],
};

export default handler;
