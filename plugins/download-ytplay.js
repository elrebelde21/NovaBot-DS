import yts from "youtube-yts";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl");
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
const fs = require('fs'); // Para manejar archivos
const { exec } = require('child_process'); // Para ejecutar comandos como curl

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

    // Detectar el límite de tamaño del servidor
    let maxFileSize = 8 * 1024 * 1024; // Límite base (8 MB en bytes)
    if (message.guild) {
        if (message.guild.features.includes('GUILD_BOOST_LEVEL_3')) {
            maxFileSize = 100 * 1024 * 1024; // 100 MB
        } else if (message.guild.features.includes('GUILD_BOOST_LEVEL_2')) {
            maxFileSize = 50 * 1024 * 1024; // 50 MB
        } else if (message.guild.features.includes('GUILD_BOOST_LEVEL_1')) {
            maxFileSize = 8 * 1024 * 1024; // 8 MB (puede variar según política actual)
        }
    }

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

    let msgPlay = await message.channel.send({
        content: `**◉ Título:** ${vid.title}\n**◉ Descripción:** ${vid.description}\n**◉ Vistas:** ${vid.views}\n**◉ Publicado:** ${vid.ago}\n**◉ Límite de archivo del servidor:** ${(maxFileSize / 1024 / 1024).toFixed(0)} MB`,
        files: [{ attachment: vid.thumbnail, name: 'thumbnail.png' }],
        components: [rowPlay]
    });

    const filterPlay = i => i.user.id === message.author.id;
    const collectorPlay = msgPlay.createMessageComponentCollector({ filter: filterPlay, time: 15000 });

    collectorPlay.on('collect', async interaction => {
        await interaction.deferReply();

        if (interaction.customId === 'audio') {
            try {
                const audioBuffer = await ytmp3(videoUrl);
                if (audioBuffer && audioBuffer.length <= maxFileSize) {
                    return interaction.editReply({
                        content: '✅ Aquí tienes el audio:',
                        files: [{ attachment: audioBuffer, name: `${vid.title}.mp3` }]
                    }).then(() => message.react("✅"));
                } else {
                    // Si el audio es demasiado grande, usar transfer.sh
                    const tempFile = `/tmp/${vid.title.replace(/[^a-zA-Z0-9]/g, '-')}.mp3`; // Sanitizar nombre
                    fs.writeFileSync(tempFile, audioBuffer);
                    exec(`curl --upload-file ${tempFile} https://transfer.sh/${vid.title.replace(/[^a-zA-Z0-9]/g, '-')}.mp3`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error al subir a transfer.sh: ${error}`);
                            return interaction.editReply('⚠️ Error al subir el audio a transfer.sh.');
                        }
                        const downloadLink = stdout.trim();
                        interaction.editReply({
                            content: `⚠️ El audio es demasiado grande (límite: ${(maxFileSize / 1024 / 1024).toFixed(0)} MB). Descárgalo desde aquí:\n🔗 [Descargar audio](${downloadLink})\n🔥 Título: ${vid.title}`
                        }).then(() => message.react("✅"));
                        fs.unlinkSync(tempFile); // Eliminar archivo temporal
                    });
                }
            } catch (error) {
                console.error('Error con ytmp3:', error);
                return interaction.editReply("⚠️ Error al descargar el audio.");
            }
        }

        if (interaction.customId === 'video') {
            try {
                const videoBuffer = await ytmp4(videoUrl);
                if (videoBuffer && videoBuffer.length <= maxFileSize) {
                    return interaction.editReply({
                        content: '✅ Aquí tienes el video:',
                        files: [{ attachment: videoBuffer, name: `${vid.title}.mp4` }]
                    }).then(() => message.react("✅"));
                } else {
                    // Si el video es demasiado grande, usar transfer.sh
                    const tempFile = `/tmp/${vid.title.replace(/[^a-zA-Z0-9]/g, '-')}.mp4`; // Sanitizar nombre
                    fs.writeFileSync(tempFile, videoBuffer);
                    exec(`curl --upload-file ${tempFile} https://transfer.sh/${vid.title.replace(/[^a-zA-Z0-9]/g, '-')}.mp4`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error al subir a transfer.sh: ${error}`);
                            return interaction.editReply('⚠️ Error al subir el video a transfer.sh.');
                        }
                        const downloadLink = stdout.trim();
                        interaction.editReply({
                            content: `⚠️ El video es demasiado grande (límite: ${(maxFileSize / 1024 / 1024).toFixed(0)} MB). Descárgalo desde aquí:\n🔗 [Descargar video](${downloadLink})\n🔥 Título: ${vid.title}`
                        }).then(() => message.react("✅"));
                        fs.unlinkSync(tempFile); // Eliminar archivo temporal
                    });
                }
            } catch (error) {
                console.error('Error con ytmp4:', error);
                return interaction.editReply("⚠️ Error al descargar el video.");
            }
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
handler.rowner = false;
handler.admin = false;
handler.botAdmin = false;
export default handler;

async function search(query, options = {}) {
    const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
    return search.videos;
}

function MilesNumber(number) {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1.';
    const arr = number.toString().split('.');
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join('.') : arr[0];
}