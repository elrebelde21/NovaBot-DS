import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

let handler = async (message, { db }) => {
  try {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const maxDaysToShowLost = 5;

    const users = Object.entries(db.data.users)
      .map(([id, data]) => ({
        id,
        streak: data.voteStreak || 0,
        lastVote: data.lastTopVote || 0
      }))
      .filter(u => u.streak > 0);

    if (users.length === 0) return message.reply("🔥 Nadie tiene racha de votos aún.");

    const activos = users.filter(u => now - u.lastVote < oneDay * 1.5);

    const perdidos = users.filter(u => {
      const daysSinceLastVote = (now - u.lastVote) / oneDay;
      const daysSinceLost = daysSinceLastVote; 
      return u.streak >= 3 && 
             daysSinceLastVote >= 1.5 && 
             daysSinceLost < maxDaysToShowLost;
    });

    activos.sort((a, b) => b.streak - a.streak);
    perdidos.sort((a, b) => b.streak - a.streak);

    let page = 0;
    const perPage = 10;

    const generateEmbed = () => {
      const start = page * perPage;

      const listaActivos = activos.slice(start, start + perPage);
      const listaPerdidos = perdidos.slice(start, start + perPage);

      const embed = new EmbedBuilder()
        .setColor("#00FF99")
        .setTitle("🔥 Rachas de votos 👀")
        .setDescription(`**Rachas activas** (${activos.length})\n` +
          (listaActivos.length > 0
            ? listaActivos.map((u, i) => `${start + i + 1}. <@${u.id}> → **${u.streak} día${u.streak > 1 ? "s" : ""}** 🔥`).join("\n")
            : "—\n") +

          `\n**Rachas perdidas recientemente** (${perdidos.length})\n` +
          (listaPerdidos.length > 0
            ? listaPerdidos.map((u, i) => {
                const daysAgo = Math.floor((now - u.lastVote) / oneDay);
                return `${start + i + 1}. <@${u.id}> → perdió **${u.streak} día${u.streak > 1 ? "s" : ""}** hace ${daysAgo} día${daysAgo > 1 ? "s" : ""} 💔`;
              }).join("\n") : ""
          )
        )
         .setFooter({ text: `Página ${page + 1} • Total usuarios con racha: ${activos.length}` })
        .setTimestamp();

      const row = new ActionRowBuilder();
      const totalPages = Math.ceil(Math.max(activos.length, perdidos.length) / perPage);

      if (page > 0) {
        row.addComponents(new ButtonBuilder().setCustomId("prev").setLabel("⬅️ Anterior").setStyle(ButtonStyle.Primary));
      }
      if (page < totalPages - 1) {
        row.addComponents(new ButtonBuilder().setCustomId("next").setLabel("Siguiente ➡️").setStyle(ButtonStyle.Primary));
      }

      return { embed, row: row.components.length > 0 ? row : null };
    };

    const { embed, row } = generateEmbed();
    const msg = await message.reply({
      embeds: [embed],
      components: row ? [row] : []
    });

    if (!row) return;

    const collector = msg.createMessageComponentCollector({ time: 180000 });

    collector.on("collect", async (i) => {
      if (i.customId === "prev") page--;
      if (i.customId === "next") page++;

      const newPage = generateEmbed();
      await i.update({
        embeds: [newPage.embed],
        components: newPage.row ? [newPage.row] : []
      });
    });

  } catch (err) {
    console.error("Error en .rachas:", err);
    message.reply("Error al mostrar las rachas.");
  }
};

handler.help = ["rachas", "streak", "votostreak"];
handler.tags = ["rpg"];
handler.desc = ['para quien esta el top global de la rachas'];
handler.command = /^(rachas?|streak|votostreak|leaderboardvotos?)$/i;
handler.slash = { name: "rachas", description: "para quien esta el top global de la rachas" };

export default handler;