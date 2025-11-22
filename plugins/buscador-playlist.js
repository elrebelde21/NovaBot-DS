import yts from "yt-search";
import moment from "moment-timezone";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, prefix, command }) => {
  try {
    const text = args.join(" ");
    if (!text) return message.reply(`⚠️ **¿Qué quieres buscar en YouTube?**\nEj: \`${prefix + command} bad bunny\``);

    const loading = await message.reply("🔎 Buscando en YouTube...");

    const result = await yts(text);
    const videos = result.videos;

    if (!videos || videos.length === 0) {
      await loading.delete().catch(() => {});
      return message.reply("❌ No se encontraron resultados.");
    }

    const items = videos.slice(0, 15);
    let index = 0;

    const fecha = moment()
      .tz("America/Argentina/Buenos_Aires")
      .format("DD/MM/YYYY");

    const getEmbed = () => {
      const v = items[index];

      return new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`🎧 Resultado ${index + 1}/${items.length}`)
        .setDescription(`
**🎵 Título:** ${v.title}
**👥 Autor:** ${v.author.name}
**⌛ Duración:** ${v.timestamp}
**👀 Vistas:** ${v.views.toLocaleString()}
**📆 Publicado:** ${v.ago}

🔗 **[Abrir en YouTube](${v.url})**
`)
        .setImage(v.thumbnail)
        .setFooter({
          text: `YouTube • Solicitado por ${message.author.username} | ${fecha}`,
          iconURL: message.author.displayAvatarURL({ size: 256 })
        });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("yt_prev")
        .setStyle(ButtonStyle.Primary)
        .setLabel("⏪"),

      new ButtonBuilder()
        .setCustomId("yt_next")
        .setStyle(ButtonStyle.Primary)
        .setLabel("⏩"),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir video")
        .setURL(items[index].url)
    );

    await loading.delete().catch(() => {});

    const msg = await message.reply({
      content: `**Resultados para:** \`${text}\``,
      embeds: [getEmbed()],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: 90_000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== message.author.id)
        return i.reply({
          content: "❌ Solo quien usó el comando puede navegar.",
          ephemeral: true
        });

      if (i.customId === "yt_next") {
        index = (index + 1) % items.length;
      } else if (i.customId === "yt_prev") {
        index = (index - 1 + items.length) % items.length;
      }

      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("yt_prev")
          .setStyle(ButtonStyle.Primary)
          .setLabel("⏪"),

        new ButtonBuilder()
          .setCustomId("yt_next")
          .setStyle(ButtonStyle.Primary)
          .setLabel("⏩"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("🔗 Abrir video")
          .setURL(items[index].url)
      );

      i.update({
        embeds: [getEmbed()],
        components: [updatedRow]
      });
    });

    collector.on("end", () => {
      try {
        msg.edit({ components: [] }).catch(() => {});
      } catch {}
    });
  } catch (err) {
    console.log("Error YTS:", err);
    message.reply("❌ Error al buscar en YouTube.");
  }
};

handler.help = ["yts <texto>"];
handler.desc = ["Busca videos en YouTube."];
handler.tags = ["buscadores"];
handler.command = /^(yts|playlist|playlista|playvid2|ytsearch)$/i;

export default handler;
