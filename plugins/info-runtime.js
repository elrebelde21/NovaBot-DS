const handler = async (message) => {
    let _muptime = process.uptime() * 1000; 
    let muptime = clockString(_muptime);

    await message.reply(`🏮 **Bot activo durante**:\n\n${muptime}`);
};

handler.help = ['runtime'];
handler.tags = ['main'];
handler.command = /^(runtime|uptime)$/i; 
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}
