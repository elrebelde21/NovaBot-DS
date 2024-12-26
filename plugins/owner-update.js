import { execSync } from 'child_process';

const handler = async (message, args) => {
    try {
        let stdout = execSync('git pull').toString();
        await message.reply(`\`\`\`${stdout}\`\`\``);
    } catch (e) {
        try {
            let updatee = execSync('git remote set-url origin https://github.com/elrebelde21/NovaBot-DS.git && git pull').toString();
            await message.reply(`\`\`\`${updatee}\`\`\``); 
        } catch (error) {
            await message.reply('❌ Error al ejecutar el comando git pull.');
        }
    }
};
handler.help = ['update'];
handler.tags = ['owner'];
handler.command = /^(update|actualizar|fix|fixed)$/i; 
handler.rowner = true; 
handler.admin = false
handler.botAdmin = false
export default handler;
