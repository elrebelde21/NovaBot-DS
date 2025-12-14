import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { pinterest } from "../libs/scraper.js";
import moment from "moment-timezone";

const pinterestAPIs = [
async (text) => {
    const response = await pinterest.search(text, 6);
    const pins = response.result.pins.slice(0, 15);
    return pins.map(r => ({ title: r.title || text, desc: `🔎 Por: ${r.uploader.username}`, img: r.media.images.orig.url }));
    throw new Error("error");
  },
  async (text) => {
    const res = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
    const data = res.data.data.slice(0, 15);
    return data.map(r => ({ title: r.grid_title || text, desc: '', img: r.images_url }));
  },
  async (text) => {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${text}`);
    const data = res.data.slice(0, 15);
    return data.map(r => ({
      title: r.fullname || text,
      desc: `🔸 Autor: ${r.upload_by}\n🔸 Seguidores: ${r.followers}`,
      img: r.image
    }));
  },
  async (text) => {
    const res = await axios.get(`https://api.neoxr.eu/api/search/pinterestv2?text=${encodeURIComponent(text)}`);
    const data = res.data.data.slice(0, 10);
    return data.map(r => ({
      title: r.description || text,
      desc: `🔎 Autor: ${r.name} (@${r.username})`,
      img: r.image
    }));
  }
];

let handler = async (message, { args, prefix, command }) => {
  try {
    const text = args.join(" ");
    if (!text) return message.reply(`⚠️ **Ingresa un término de búsqueda.**\nEj: \`${prefix}${command} nayeon\``);

    let results = null;
    for (const api of pinterestAPIs) {
      try {
        const res = await api(text);
        if (res && res.length > 0) {
          results = res;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!results) return message.reply(`❌ No se encontraron resultados para **${text}**`);
    let index = 0;

    const getEmbed = () => {
      const r = results[index];
const fecha = moment.tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");

      return new EmbedBuilder()
        .setColor("#FF66CC")
        .setTitle(`**${r.title}**`)
        .setDescription(`${r.desc}`)
        .setImage(r.img)
        .setFooter({ text: `Pinterest ${index + 1}/${results.length} • Solicitado por ${message.author.username} | ${fecha}`, iconURL: message.author.displayAvatarURL({ size: 256 }) });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev_p")
        .setStyle(ButtonStyle.Primary)
        .setLabel("⏪"),
      new ButtonBuilder()
        .setCustomId("next_p")
        .setStyle(ButtonStyle.Primary)
        .setLabel("⏩"),
      new ButtonBuilder()
        .setCustomId("close_p")
        .setStyle(ButtonStyle.Danger)
        .setLabel("❌")
    );

    const msg = await message.reply({
      content: `**Resultados para:** \`${text}\``,
      embeds: [getEmbed()],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: 90_000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== message.author.id)
        return i.reply({ content: "❌ Solo quien usó el comando puede navegar.", ephemeral: true });

      if (i.customId === "next_p") {
        index = (index + 1) % results.length;
      } else if (i.customId === "prev_p") {
        index = (index - 1 + results.length) % results.length;
      } else if (i.customId === "close_p") {
        collector.stop();
        return i.update({ content: "🛑 Búsqueda cerrada", embeds: [], components: [] });
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
    console.log("Error Pinterest:", err);
    message.reply("❌ Error al buscar imágenes.");
  }
};

handler.help = ["pinterest"];
handler.desc = ["Busca imágenes en Pinterest."];
handler.tags = ["buscadores"];
handler.slash = {
  name: "pinterest",
  description: "Busca imágenes en Pinterest.",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^pinterest$/i;

export default handler;
