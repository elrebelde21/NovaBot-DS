import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import moment from "moment-timezone";
import fetch from "node-fetch";

let handler = async (message, { db, prefix, command }) => {
  try {
    let userId = message.author.id;

    const embed = new EmbedBuilder()
      .setColor("#FF66CC")
      .setTitle("🗳️ ¡Apoya a NovaBot-DS!")
      .setDescription(`Hola **${message.author.username}** ✨

Votar ayuda muchísimo al bot y además te recompensa:

🎁 **Recompensa base:** 5.000 XP  
🔥 **Racha diaria:** +1.000 XP por cada día votado  
🕒 Puedes votar cada 12 horas.

Presiona **Votar**, vota en top.gg y luego pulsa **Confirmar Voto**.`)
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🗳️ Votar")
        .setStyle(ButtonStyle.Link)
        .setURL("https://top.gg/bot/1318609986087026699/vote"),

      new ButtonBuilder()
        .setCustomId("confirm_vote")
        .setLabel("✅ Confirmar Voto")
        .setStyle(ButtonStyle.Success)
    );

    const msg = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== userId)
        return i.reply({ content: "❌ Este menú no es para ti.", ephemeral: true });

      if (i.customId !== "confirm_vote") return;
      let votos = await fetch("https://vote.skyultraplus.com/votes")
        .then(r => r.json())
        .catch(() => null);

      if (!votos || !votos[userId]) {
        return i.reply({
          content: "❌ No encontré ningún voto tuyo. Vota primero en top.gg",
          ephemeral: true
        });
      }

      const lastVote = votos[userId].lastVote;
      const now = Date.now();

      const user = db.data.users[userId];

      if (!user) {
        return i.reply({ content: "Error interno: user no encontrado.", ephemeral: true });
      }

      if (user.lastTopVote && user.lastTopVote >= lastVote) {
        return i.reply({
          content: "❌ Ya reclamaste tu recompensa por este voto.",
          ephemeral: true
        });
      }

      let days = 24 * 60 * 60 * 1000;

      if (!user.voteStreak) user.voteStreak = 0;
      if (!user.lastTopVote) user.lastTopVote = 0;

      if (now - user.lastTopVote > days) {
        user.voteStreak = 0;
      }

      user.voteStreak++;

      // --- RECOMPENSAS ---
      let reward = 5000 + (user.voteStreak * 1000);

      user.exp += reward;
      user.lastTopVote = lastVote;

      await db.write();

      return i.reply({
        content: `🎉 **¡Voto confirmado!**

Ganaste **${reward.toLocaleString()} XP**
🔥 Racha actual: **${user.voteStreak} días**
Gracias por apoyar al bot ❤️`,
        ephemeral: true
      });

    });

  } catch (err) {
    console.log("Error en vote:", err);
    message.reply("❌ Error en el comando vote.");
  }
};

handler.help = ["vote"];
handler.desc = "Vota por el bot y reclama tu recompensa.";
handler.tags = ["econ"];
handler.command = /^vote$/i;
handler.slash = { name: "vote", description: "Vota por el bot y reclama tu recompensa" };

export default handler;

