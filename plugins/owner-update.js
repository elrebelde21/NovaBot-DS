import { execSync } from 'child_process';

const handler = async (message, args) => {
    try {
        // Ejecuta el comando git pull y captura la salida
        let stdout = execSync('git pull').toString();
        await message.reply(`\`\`\`${stdout}\`\`\``); // Responde con el resultado de git pull
    } catch (e) {
        // En caso de error, intenta configurar la URL remota y hacer pull
        try {
            let updatee = execSync('git remote set-url origin https://github.com/elrebelde21/InfinityBot-DS.git && git pull').toString();
            await message.reply(`\`\`\`${updatee}\`\`\``); // Responde con el resultado del segundo intento
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
