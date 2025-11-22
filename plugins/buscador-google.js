import fetch from "node-fetch";
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
    if (!text) return message.reply(`⚠️ **Ingresa un término de búsqueda.**\nEj: \`${prefix + command} cómo instalar nodejs\``);

    const res = await fetch(`https://api.delirius.store/search/googlesearch?query=${encodeURIComponent(text)}`);
    const data = await res.json();

    if (!data.status || !data.data || data.data.length === 0)
      return message.reply(`❌ No se encontraron resultados para **${text}**`);

    const results = data.data;
    let index = 0;

  //  const screenshot = `https://image.thum.io/get/fullpage/https://google.com/search?q=${encodeURIComponent(text)}`;
  const screenshot = `https://api.dorratz.com/ssweb?url=https://google.com/search?q=${encodeURIComponent(text)}`;
const fecha = moment().tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");

    const getEmbed = () => {
      const r = results[index];

      return new EmbedBuilder()
        .setColor("#4285F4")
        .setTitle(`🔍 Resultado ${index + 1}/${results.length}`)
        .setDescription(
          `**${r.title}**\n\n🌐 **[URL](${r.url})**\n\n📝 **Descripción:**\n${r.description}`
        )
        .setImage(screenshot)
        .setFooter({
          text: `Google • Solicitado por ${message.author.username} | ${fecha}`,
          iconURL: message.author.displayAvatarURL({ size: 256 })
        });
    };

    const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId("g_prev")
        .setStyle(ButtonStyle.Primary)
        .setLabel("⏪"),

    new ButtonBuilder()
        .setCustomId("g_next")
        .setStyle(ButtonStyle.Primary)
        .setLabel("⏩"),

    new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir enlace")
        .setURL(results[index].url)
);

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

      if (i.customId === "g_next") {
        index = (index + 1) % results.length;
      } else if (i.customId === "g_prev") {
        index = (index - 1 + results.length) % results.length;
      } else if (i.customId === "g_close") {
        collector.stop();
        return i.update({
          content: "🛑 Búsqueda cerrada.",
          embeds: [],
          components: []
        });
      }

      i.update({
        embeds: [getEmbed()],
        components: [row]
      });
    });

    collector.on("end", () => {
      try {
        msg.edit({ components: [] }).catch(() => {});
      } catch {}
    });
  } catch (err) {
    console.error("Error Google:", err);
    message.reply("❌ Error al realizar la búsqueda.");
  }
};

handler.help = ["google <texto>"];
handler.desc = ["Busca información en Google."];
handler.tags = ["buscadores"];
handler.command = /^google$/i;

export default handler;
