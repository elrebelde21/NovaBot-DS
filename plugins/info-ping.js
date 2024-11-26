import os from 'os';
import speed from 'performance-now';

const handler = async (message) => {
    let timestamp = speed();
    let latensi = speed() - timestamp;

    let systemInfo = `
       Sistema Operativo: ${os.type()} ${os.release()}
        Plataforma: ${os.platform()}
        Arquitectura: ${os.arch()}
        CPUs: ${os.cpus().length} núcleos
        Memoria Libre: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB
        Memoria Total: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB
    `.trim();

    message.reply(`🟢 **Velocidad**: ${latensi.toFixed(4)} _ms_\n\n\`\`\`${systemInfo}\`\`\`\n`);
};

handler.help = ['ping'];
handler.tags = ['main'];
handler.command = /^(ping|p)$/i;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
