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
    if (!text) return message.reply(`⚠️ **¿Qué canción deseas buscar?**\nEj: \`${prefix + command} ozuna te vas\``);

    const loading = await message.reply("🎵 Buscando letra...");

    let lyricsData = null;
    let source = "fgmods";

    try {
      const url = `https://api.fgmods.xyz/api/other/lyrics?text=${encodeURIComponent(text)}&apikey=elrebelde21`;

      const res = await fetch(url);
      const json = await res.json();

      if (!json?.result?.lyrics) throw new Error("FGMods vacío.");

      lyricsData = {
        title: json.result.title || "Desconocido",
        artist: json.result.artist || "Desconocido",
        url: json.result.url || null,
        lyrics: json.result.lyrics || "No disponible",
        image: json.result.image || "https://i.imgur.com/ZZhWb9Y.png"
      };
    } catch {
      source = "delirius";
    }

    if (source === "delirius") {
      try {
        const url = `https://api.delirius.store/search/lyrics?query=${encodeURIComponent(text)}`;

        const res = await fetch(url);
        const json = await res.json();

        if (!json?.status || !json?.data?.lyrics)
          throw new Error("Delirius vacío.");

        const info = json.data;

        lyricsData = {
          title: info.title || "Desconocido",
          artist: info.artists || "Desconocido",
          url: null,
          lyrics: info.lyrics || "No disponible",
          image: "https://i.imgur.com/ZZhWb9Y.png"
        };
      } catch (err) {
        await loading.delete().catch(() => {});
        return message.reply("❌ No se pudo obtener la letra.");
      }
    }

    const fecha = moment()
      .tz("America/Argentina/Buenos_Aires")
      .format("DD/MM/YYYY");

    const embed = new EmbedBuilder()
      .setColor("#FF4FD8")
      .setTitle(`🎵 Letra — ${lyricsData.title}`)
      .setThumbnail(lyricsData.image)
      .setDescription(
        `
**🎤 Artista:** ${lyricsData.artist}
${lyricsData.url ? `**🔗 URL:** [Click aquí](${lyricsData.url})` : ""}

📄 **Letra:**  
${lyricsData.lyrics.substring(0, 3500)}  
        `
      )
      .setFooter({
        text: `Lyrics • Solicitado por ${message.author.username} | ${fecha}`,
        iconURL: message.author.displayAvatarURL({ size: 256 })
      });

    const row =
      lyricsData.url !== null
        ? new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel("🎧 Ver canción")
              .setURL(lyricsData.url)
          )
        : [];

    await loading.delete().catch(() => {});

    return message.reply({
      embeds: [embed],
      components: row.length ? row : []
    });
  } catch (err) {
    console.log("❌ Error lyrics:", err);
    return message.reply("❌ Error al obtener la letra.");
  }
};

handler.help = ["letra <canción>"];
handler.desc = ["Busca la letra de una canción."];
handler.tags = ["buscadores"];
handler.slash = {
  name: "letra",
  description: "Busca la letra de una canción.",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^(letra|letras|lyrics|lyric|lirik)$/i;

export default handler;
