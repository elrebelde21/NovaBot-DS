import { googleImage } from "@bochilteam/scraper";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import moment from "moment-timezone";

let handler = async (message, { args, prefix, command }) => {
  try {
    const text = args.join(" ");
    if (!text) return message.reply(`🤔 **¿Qué quieres buscar?**\nEj: \`${prefix + command} Loli\``);

const forbidden = [
      "caca","polla","porno","porn","gore","cum","semen","puta","puto","culo","pussy","hentai",
      "pene","coño","zoofilia","desnudo","desnuda","xnxx","xvideos","teta","vagina","porno",
      "rule34","xxx","pedo","necro","yuri","anal","blowjob","ahegao","ecchi","sex","hot",
      "niña","niñas","infantil","pack","abuso","panocha","pedo","violacion"
    ];
    if (forbidden.some(w => text.toLowerCase().includes(w))) return message.reply("🙄 No voy a buscar tus pendejadas…");

    const loadingMsg = await message.reply("🔎 **Buscando imágenes...**");

    const results = await googleImage(text);
    const imgs = Array.isArray(results)
      ? results
      : typeof results.getRandom === "function"
      ? [results.getRandom()]
      : [];

    if (!imgs || imgs.length === 0) {
      await loadingMsg.delete().catch(() => {});
      return message.reply("❌ No se encontraron imágenes.");
    }

    const images = imgs.slice(0, 15);
    let index = 0;

    const fecha = moment()
      .tz("America/Argentina/Buenos_Aires")
      .format("DD/MM/YYYY");

    const getEmbed = () =>
      new EmbedBuilder()
        .setColor("#00AEEF")
        .setTitle(`🖼 Imagen ${index + 1}/${images.length}`)
        .setDescription(`🔎 **Resultados de:** \`${text}\``)
        .setImage(images[index])
        .setFooter({
          text: `Google Images • Solicitado por ${message.author.username} | ${fecha}`,
          iconURL: message.author.displayAvatarURL({ size: 256 })
        });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("img_prev")
        .setLabel("⏪")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("img_next")
        .setLabel("⏩")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setLabel("🔗 Abrir")
        .setStyle(ButtonStyle.Link)
        .setURL(images[index])
    );

    await loadingMsg.delete().catch(() => {});

    const msg = await message.reply({
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

      if (i.customId === "img_next") index = (index + 1) % images.length;
      if (i.customId === "img_prev")
        index = (index - 1 + images.length) % images.length;

      const newButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("img_prev")
          .setLabel("⏪")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("img_next")
          .setLabel("⏩")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setLabel("🔗 Abrir")
          .setStyle(ButtonStyle.Link)
          .setURL(images[index])
      );

      i.update({
        embeds: [getEmbed()],
        components: [newButtons]
      });
    });

    collector.on("end", () => {
      try {
        msg.edit({ components: [] }).catch(() => {});
      } catch {}
    });
  } catch (err) {
    console.error("Error image:", err);
    return message.reply("❌ Error al buscar imágenes.");
  }
};

handler.help = ["image <texto>"];
handler.desc = ["Busca imágenes en Google."];
handler.tags = ["buscadores"];
handler.command = /^image|gimage|imagen$/i;

export default handler;
