const { createHash } = require('crypto');

let handler = async (message, { args, prefix, command }) => {
    if (!args[0]) {
        return message.reply(`*✳️ Ingrese número de serie, verifique su número de serie con el comando:* ${prefix + command}`);
    }

    const user = db.data.users[message.author.id];
    const sn = createHash('md5').update(message.author.id).digest('hex');

    if (args[0] !== sn) {
        return message.reply('⚠️ Número de serie incorrecto, usar:* !myns');
    }

    user.registered = false;
    user.limit -= 2;
    user.exp -= 200;

    await message.reply('*✅ ᴿᵉᵍᶦˢᵗʳᵒ ᵉˡᶦᵐᶦⁿᵏᵒ*');
};
handler.help = ['unreg'];
handler.tags = ['rg'];
handler.command = /^unreg$/i;
module.exports = handler; 
