const { createHash } = require('crypto');

let handler = async (message) => {
    let sn = createHash('md5').update(message.author.id).digest('hex');
    await message.reply(`Su número de serie es: ${sn}`);
};
handler.help = ['myns'];
handler.tags = ['rg'];
handler.command = /^myns$/i;
module.exports = handler; 
