const handler = async (message) => {
    const userId = message.author.id;
    const user = global.db.data.users[userId];

    if (!user) {
        return message.reply('✳️ El usuario no se encuentra en mi base de datos.');
    }

    let hasil = Math.floor(Math.random() * 6000);
    let time = user.lastmiming + 400000;

    // Si el tiempo de espera no ha pasado
    if (new Date() - user.lastmiming < 400000) {
        return message.reply(`⏳ 𝐄𝐬𝐩𝐞𝐫𝐚 *${msToTime(time - new Date())}* 𝐏𝐚𝐫𝐚 𝐯𝐨𝐥𝐯𝐞𝐫 𝐚 𝐦𝐢𝐧𝐚𝐫`);
    }

    // Mensaje de minería aleatorio
    let minar = `${pickRandom([
        'Que pro 😎 has minado',
        '🌟✨ Genial!! Obtienes',
        'WOW!! eres un(a) gran Minero(a) ⛏️ Obtienes',
        'Has Minado!!',
        '😲 Lograste Minar la cantidad de',
        'Tus Ingresos subiran gracias a que minaste',
        '⛏️⛏️⛏️⛏️⛏️ Minando',
        '🤩 SII!!! AHORA TIENES',
        'La minaria esta de tu lado, por ello obtienes',
        '😻 La suerte de Minar',
        '♻️ Tu Mision se ha cumplido, lograste minar',
        '⛏️ La Mineria te ha beneficiado con',
        '🛣️ Has encontrado un Lugar y por minar dicho lugar Obtienes',
        '👾 Gracias a que has minado tus ingresos suman',
        'Felicidades!! Ahora tienes',
        '⛏️⛏️⛏️ Obtienes'
    ])}`;

    // Incremento de experiencia
    user.exp += hasil;

    // Responder al usuario
    message.reply(`${minar} *${hasil} XP*`);

    // Actualizar el último tiempo de minería
    user.lastmiming = new Date().getTime();
};

handler.help = ['minar'];
handler.tags = ['econ'];
handler.command = /^(minar|miming|mine)$/i;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;

// Función para seleccionar un mensaje aleatorio
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Función para convertir milisegundos a tiempo legible
function msToTime(duration) {
    const milliseconds = parseInt((duration % 1000) / 100);
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);

    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return `${minutes} minuto(s) ${seconds} segundo(s)`;
}
