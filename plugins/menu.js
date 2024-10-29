import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import moment from 'moment-timezone';

const handler = async (message, args, { db, isOwner, commands, client }) => {
    const totalCommands = Array.isArray(commands) ? commands.length : 0; 
  //  const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0); 
 //   const totalGuilds = client.guilds.cache.size; 
    let fecha = moment.tz('America/Bogota').format('DD/MM/YYYY');
    let hora = moment.tz('America/Argentina/Buenos_Aires').format('LT');
    const user = `<@${message.author.id}>`;

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Menú')
        .setDescription(`Hola ${user}, Como esta 💖\n\n` +
            `🕒 Fecha: ${fecha}\n` +
            `🕒 Hora: ${hora}\n` +
            `Lista de comando:\n\n•#setwelcome\n#setbye\n#play\n#speed`)
        .setImage('https://qu.ax/wXciz.jpg')
        .setTimestamp()
        .setFooter({ text: wm });

    const rowMenu = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('opcion1')
                .setLabel('Reglas')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('opcion2')
                .setLabel('Opción 2')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('opcion3')
                .setLabel('Opción 3')
                .setStyle(ButtonStyle.Success)
        );

    const msgMenu = await message.channel.send({ embeds: [embed], components: [rowMenu] });

    const filterMenu = i => i.user.id === message.author.id;
    const collectorMenu = msgMenu.createMessageComponentCollector({ filter: filterMenu, time: 15000 });

    collectorMenu.on('collect', async interaction => {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.customId === 'opcion1') {
            await interaction.followUp('Aquí van las reglas...');
        } else if (interaction.customId === 'opcion2') {
            await interaction.followUp('Has seleccionado la opción 2.');
        } else if (interaction.customId === 'opcion3') {
            await interaction.followUp('Has seleccionado la opción 3.');
        }
    });

    collectorMenu.on('end', collected => {
        if (collected.size === 0) {
            message.channel.send('⚠️ No seleccionaste nada.');
        }
    });
};

handler.help = ['menu'];
handler.tags = ['help'];
handler.command = /^menu|help$/i;

export default handler;
