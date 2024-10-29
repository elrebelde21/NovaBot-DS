import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (message, args) => {
const searchText = args.join(' ');
if (!searchText) {
return message.channel.send('🚩 Ejemplo de uso: #play maluma');
}

const videoSearch = await yts(searchText);
if (!videoSearch.all.length) {
return message.react("❌").then(() => message.channel.send("❌ No se encontraron resultados."));
}

const vid = videoSearch.all[0]; 
const videoUrl = vid.url;
const rowPlay = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('audio')
        .setLabel('Audio')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('video')
        .setLabel('Video')
        .setStyle(ButtonStyle.Secondary)
    );

  const msgPlay = await message.channel.send({
    content: `💖 ¿Qué quieres hacer con **${vid.title}**?`,
    components: [rowPlay]
  });
  
  const filterPlay = i => i.user.id === message.author.id;
  const collectorPlay = msgPlay.createMessageComponentCollector({ filter: filterPlay, time: 15000 });
  
  collectorPlay.on('collect', async interaction => {
    await interaction.deferReply();

    if (interaction.customId === 'audio') {
      const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
      const apiResponse = await fetch(apiUrl);
      const delius = await apiResponse.json();

      if (!delius.status) {
        return interaction.followUp("⚠️ Error al descargar el audio.");
      }

      const downloadUrl = delius.data.download.url;
      interaction.followUp({
        files: [{
          attachment: downloadUrl,
          name: `${vid.title}.mp3`
        }]
      }).then(() => message.react("✅"));
    }

    if (interaction.customId === 'video') {
      const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
      const apiResponse = await fetch(apiUrl);
      const delius = await apiResponse.json();

      if (!delius.status) {
        return interaction.followUp("⚠️ Error al descargar el video.");
      }

      const downloadUrl = delius.data.download.url;
      interaction.followUp({
        files: [{
          attachment: downloadUrl,
          name: `${vid.title}.mp4`
        }]
      }).then(() => message.react("✅"));
    }
  });

  collectorPlay.on('end', collected => {
    if (collected.size === 0) {
      message.channel.send("⚠️ Tardaste en seleccionar la opción, por favor intenta de nuevo.");
    }
  });
};
handler.help = ['play'];
handler.tags = ['media'];
handler.command = /^play$/i;
export default handler;
