import { PermissionsBitField } from 'discord.js';

let handler = async (message, { args, client }) => {
    try {
if (args.length === 0) return await message.reply('⚠️ Por favor, proporciona un link de servidor\n**• Ejemplo:** /join https://discord.gg/swYg2tW5');

const inviteLink = await client.generateInvite({
permissions: [PermissionsBitField.Flags.Administrator, 
],
scopes: ['bot', 'applications.commands'],
});

await message.reply(`⚠️ No puedo unirme automáticamente. Por favor, usa este enlace para invitarme manualmente:\n${inviteLink}`);
} catch (error) {
await message.reply('⚠️ Hubo un error al generar el enlace de invitación. Inténtalo más tarde.');
console.error(error);
    }
};

handler.help = ['join'];
handler.tags = ['bot'];
handler.command = /^join$/i;
handler.rowner = false;
export default handler;
