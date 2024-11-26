import { EmbedBuilder } from 'discord.js';
import cp from 'child_process';
import { promisify } from 'util';
const exec = promisify(cp.exec).bind(cp);

let handler = async (message) => {
    await message.reply('🚀 **Iniciando prueba de velocidad...**');
    try {
        const o = await exec('python3 speed.py --secure --share');
        const { stdout, stderr } = o;

        if (stdout.trim()) {
            const match = stdout.match(/http[^"]+\.png/);
            const urlImagen = match ? match[0] : null;

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('🚀 Resultados de la prueba de velocidad')
                .setDescription(stdout.trim())
                .setTimestamp();

            if (urlImagen) {
                embed.setImage(urlImagen);
            }

            await message.channel.send({ embeds: [embed] });
        }

        if (stderr.trim()) {
            const match2 = stderr.match(/http[^"]+\.png/);
            const urlImagen2 = match2 ? match2[0] : null;
            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('⚠️ Error')
                .setDescription(stderr.trim())
                .setTimestamp();

            if (urlImagen2) {
                embed.setImage(urlImagen2);
            }

            await message.channel.send({ embeds: [embed] });
        }
    } catch (e) {
        console.error(e);
        await message.reply(`⚠️ Error: ${e.message}`);
    }
};

handler.help = ['speed'];
handler.tags = ['main'];
handler.command = /^(speedtest|speed)$/i; 
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;