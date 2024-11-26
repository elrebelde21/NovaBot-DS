import yts from "youtube-yts";
import fetch from 'node-fetch';

let handler = async (message, { args, prefix }) => {
const text = args.join(' '); 

if (!text) return message.reply('🚩 Ejemplo de uso: !play maluma');

    let videoSearch;
    try {
        videoSearch = await yts(text);
    } catch (error) {
        return message.reply('❌ Ocurrió un error al realizar la búsqueda.');
    }

    if (!videoSearch.all.length) {
        return message.react("❌").then(() => message.channel.send("❌ No se encontraron resultados."));
    }

    const vid = videoSearch.all[0];
    const videoUrl = vid.url;
let { title, description, thumbnail, videoId, timestamp, views, ago, url } = vid

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

  let msgPlay;
if (vid.thumbnail) {
  msgPlay = await message.channel.send({
    content: `**◉ Titulo:** ${vid.title}\n\n**◉ Descripción:** ${vid.description}\n**◉ Vistas:** ${vid.views}\n**◉ Publicado:** ${vid.ago}`,
    image: {
      url: vid.thumbnail,
    },
    components: [rowPlay]
  });
} else {
  msgPlay = await message.channel.send({
    content: `**◉ Titulo:** ${vid.title}\n\n**◉ Descripción:** ${vid.description}\n**◉ Vistas:** ${vid.views}\n**◉ Publicado:** ${vid.ago}`,
    components: [rowPlay]
  });
}

const filterPlay = i => i.user.id === message.author.id;
    const collectorPlay = msgPlay.createMessageComponentCollector({ filter: filterPlay, time: 15000 });

    collectorPlay.on('collect', async interaction => {
        if (interaction.customId === 'audio') {
            const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
            const apiResponse = await fetch(apiUrl);
            const delius = await apiResponse.json();

            if (!delius.status) {
                return interaction.reply("⚠️ Error al descargar el audio.");
            }

            const downloadUrl = delius.data.download.url;
            interaction.reply({ files: [{ attachment: downloadUrl, name: `${vid.title}.mp3` }] }).then(() => message.react("✅"));
        }

        if (interaction.customId === 'video') {
            const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
            const apiResponse = await fetch(apiUrl);
            const delius = await apiResponse.json();

            if (!delius.status) {
                return interaction.reply("⚠️ Error al descargar el video.");
            }

            const downloadUrl = delius.data.download.url;
            interaction.reply({ files: [{ attachment: downloadUrl, name: `${vid.title}.mp4` }] }).then(() => message.react("✅"));
        }
    });

    collectorPlay.on('end', collected => {
        if (collected.size === 0) {
            message.reply("⚠️ Tardaste en seleccionar la opción, inténtalo de nuevo por favor.");
        }
    });
};
handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play)$/i;
handler.register = true;
handler.limit = 1
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;