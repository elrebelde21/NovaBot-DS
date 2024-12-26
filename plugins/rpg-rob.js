const ro = 3000;

const handler = async (message, { args, prefix }) => {
    const userId = message.author.id;
    const user = global.db.data.users[userId];

    if (!user) return message.reply('✳️ El usuario no se encuentra en mi base de datos.');
    const timeLeft = user.lastrob + 1800000 - Date.now(); // 30 minutos
    if (timeLeft > 0) {
        return message.reply(`🚓 La policía está vigilando, vuelve en: ${msToTime(timeLeft)}`);
    }

    let who;
    if (message.mentions.users.size > 0) {
        who = message.mentions.users.first();
    } else if (message.reference) {
        const quotedMessage = await message.channel.messages.fetch(message.reference.messageId);
        who = quotedMessage.author;
    } else {
        return message.reply({embeds: [{title: "⚠️ Etiqueta a un usuario boludo", description: "Menciona a alguien con el @tag.", color: 0xff0000, thumbnail: { url: "https://qu.ax/Zgqq.jpg"},  footer: { text: wm }}]});
    }

    if (!who || !(who.id in global.db.data.users)) {
        return message.reply(`*⚠️ No se pudo encontrar al usuario en la base de datos.*`);
    }

    const targetUser = global.db.data.users[who.id];
    const rob = Math.floor(Math.random() * ro);
    
    if (targetUser.exp < rob) return message.reply(`@${who.tag} Este usuario tiene menos de ${ro} XP\n> No robes a un pobre.`);
    user.exp += rob;
    targetUser.exp -= rob;
    user.lastrob = Date.now();
    message.reply(`*Robaste ${rob} XP a <@${who.tag}>*`);
};
handler.help = ['rob'];
handler.tags = ['econ'];
handler.command = /^(robar|rob)$/i;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;

function msToTime(duration) {
    let milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " Hora(s) " + minutes + " Minuto(s)";
}

function pickRandom(list) {return list[Math.floor(list.length * Math.random())]}     