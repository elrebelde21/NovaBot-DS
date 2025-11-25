import fetch from "node-fetch";
import axios from "axios";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection
} from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";

let handler = async (message, { args, prefix, command }) => {
  try {
    const query = args.join(" ");
    if (!query) return message.reply(`🎧 *Ingresa el nombre o link de Spotify.*\n\nEj:\n${prefix + command} ozuna`);

    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel)
      return message.reply("🔊 Debes estar **en un canal de voz** para usar este comando.");

    const loading = await message.reply("⏳ *Buscando canción en Spotify...*");

    const searchRes = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(query)}`);
    const songData = await searchRes.json();

    if (!songData?.data?.length) {
      await loading.edit("❌ No se encontró nada para esa búsqueda.");
      return;
    }

    const track = songData.data[0];

    const embed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle(`🎵 ${track.title}`)
      .setDescription(
        `👤 **Artista:** ${track.artist}\n` +
        `💿 **Álbum:** ${track.album}\n` +
        `⏱ **Duración:** ${track.duration}\n` +
        `📅 **Publicado:** ${track.publish}\n\n` +
        `🔗 [Abrir en Spotify](${track.url})`
      )
      .setThumbnail(track.image)
      .setFooter({ text: "Spotify Downloader 🎶" });

    await loading.edit({ content: "🎶 *Preparando descarga...*", embeds: [embed] });

    const sources = [
      async () => {
        const r = await fetch(`https://api.siputzx.my.id/api/d/spotify?url=${track.url}`);
        const d = await r.json();
        return d?.data?.download;
      },
      async () => {
        const r = await fetch(`https://api.delirius.store/download/spotifydl?url=${track.url}`);
        const d = await r.json();
        return d?.data?.url;
      }
    ];

    let downloadUrl = null;

    for (const src of sources) {
      try {
        downloadUrl = await src();
        if (downloadUrl) break;
      } catch { }
    }

    if (!downloadUrl)
      return loading.edit("❌ *No se pudo obtener la descarga desde ninguna API.*");

    await loading.edit("🎧 *Descargando y reproduciendo...*");

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(downloadUrl);

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Playing, () => {
      message.channel.send(`🎶 **Reproduciendo:** *${track.title}*`);
    });

    player.on(AudioPlayerStatus.Idle, () => {
      const conn = getVoiceConnection(message.guild.id);
      if (conn) conn.destroy();
      message.channel.send("🔚 **Reproducción finalizada.**");
    });

    player.on("error", (err) => {
      console.error("Error Spotify:", err);
      message.reply("❌ Error al reproducir la canción.");
    });

  } catch (err) {
    console.error("❌ Error Spotify:", err);
    return message.reply("❌ Ocurrió un error al procesar la canción.");
  }
};

handler.help = ["spotify"];
handler.tags = ["downloader"];
handler.command = /^spotify|music$/i;
handler.register = true;

export default handler;
