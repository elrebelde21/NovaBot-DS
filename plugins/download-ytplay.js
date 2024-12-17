import yts from "youtube-yts";
import fetch from 'node-fetch';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

let handler = async (message, { args, prefix }) => {
    const text = args.join(' '); 
    const yt_play = await search(args.join(' '));
    
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
    
    msgPlay = await message.channel.send({
        content: `**◉ Título:** ${vid.title}\n\n**◉ Descripción:** ${vid.description}\n**◉ Vistas:** ${vid.views}\n**◉ Publicado:** ${vid.ago}`,
        files: [
            { attachment: vid.thumbnail,
                name: 'thumbnail.png' 
            }
        ],
        components: [rowPlay]
    });

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

async function search(query, options = {}) {
const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
return search.videos;
}

function MilesNumber(number) {
const exp = /(\d)(?=(\d{3})+(?!\d))/g;
const rep = '$1.';
const arr = number.toString().split('.');
arr[0] = arr[0].replace(exp, rep);
return arr[1] ? arr.join('.') : arr[0];
}
