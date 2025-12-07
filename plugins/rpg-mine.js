import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const handler = async (message) => {
    const userId = message.author.id;
    const user = global.db.data.users[userId];

    if (!user) return message.reply('✳️ El usuario no se encuentra en mi base de datos.');

    let cooldown = 400000;
    let time = user.lastmiming + cooldown;

    if (new Date() - user.lastmiming < cooldown)
        return message.reply(`⏳ 𝐄𝐬𝐩𝐞𝐫𝐚 *${msToTime(time - new Date())}* 𝐩𝐚𝐫𝐚 𝐯𝐨𝐥𝐯𝐞𝐫 𝐚 𝐦𝐢𝐧𝐚𝐫`);

    const minas = [
        { nombre: "⛏️ Penumbra [#1]", recom: [300, 700] },
        { nombre: "🪨 Caverna Mística [#2]", recom: [700, 1500] },
        { nombre: "⚡ Abismo [#3]", recom: [900, 2000] },
        { nombre: "❓ Zona Desconocida [#4]", recom: [1200, 2600] },
        { nombre: "🎁 Fábrica de Juguetes [#10]", recom: [1500, 3500] },
        { nombre: "🏜️ Arenas Doradas [#11]", recom: [2000, 4200] },
        { nombre: "❄️ Pico Nevado [#12]", recom: [2500, 5200] },
        { nombre: "🕳️ Cripta Olvidada [#13]", recom: [3000, 6000] },
        { nombre: "💠 Mina Prisma [#14]", recom: [3500, 7000] },
        { nombre: "🔥 Mina Infernal [#15]", recom: [4000, 7500] },
        { nombre: "⚙️ Mina Mecánica [#16]", recom: [3800, 7600] },
        { nombre: "🌌 Mina Estelar [#17]", recom: [4500, 8200] },
        { nombre: "❇️ Mina BioLuminiscente [#18]", recom: [4200, 7900] },
        { nombre: "⚡ Mina Volt [#19]", recom: [3300, 6800] },
        { nombre: "🧊 Mina Glacial [#20]", recom: [5000, 9500] },
        { nombre: "💎 Mina Real [L1]", recom: [9000, 14000] },
        { nombre: "🌠 Mina Divina [L2]", recom: [12000, 18000] }
    ];

    const zona = pickWeighted(minas);
    let base = Math.floor(Math.random() * (zona.recom[1] - zona.recom[0])) + zona.recom[0];

    const crit = Math.random() < 0.15;
    if (crit) base *= 2;

    let frases = [
        "✨ Impresionante extracción, ganas",
        "🌌 Energía resonante te otorgó",
        "⚡ Golpe perfecto, recibes",
        "🌀 Exploración avanzada, obtienes",
        "💎 Encontraste minerales raros:",
        "🔥 Dominio absoluto, consigues",
        "🎯 Impacto crítico, recuperas",
        "💫 Resonancia mineral te entrega",
        "🧭 Profundizaste y hallaste",
        "🏆 Movimiento maestro, logras",
        "🎆 Descubrimiento épico:",
        "🌈 La mina brilló y te dio",
        "📡 Sensor mineral detectó",
        "🧿 Suerte extrema te entregó",
        "🔮 Vibración arcana produce",
        "🌠 Hallazgo brillante:"
    ];

    user.exp += base;
    user.lastmiming = Date.now();

    const colores = [
        "#FF6AD5", "#6AE5FF", "#FFD36A", "#8AFF6A", "#FF6A6A",
        "#9C6AFF", "#6AFFF2", "#FF9E6A", "#6A9EFF", "#FF6ABB",
        "#6AFF8B", "#FFE36A", "#B56AFF", "#6AFFF7"
    ];

    const listado = minas
        .map(m => `> ${m.nombre}`)
        .join("\n");

    const embed = new EmbedBuilder()
        .setTitle("⛏️ Panel de Minas • NovaBot-DS")
        .setColor(pickRandom(colores))
        .setDescription(`
${listado}

———————————————

${pickRandom(frases)} **${base} XP**
${crit ? "🔥 **CRÍTICO x2!**" : ""}

> 🧭 Zona obtenida: **${zona.nombre}**  
> 👤 Minero: <@${userId}>
        `)
        .setFooter({ text: "Sistema de Minería NovaBot-DS" })
        .setTimestamp();

    return message.reply({ embeds: [embed] });
};

handler.help = ['minar'];
handler.tags = ['econ'];
handler.command = /^(minar|miming|mine)$/i;
handler.register = true;
export default handler;

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted(minas) {
    let normales = minas.slice(0, 14);
    let legendarias = minas.slice(14);
    return Math.random() < 0.85 ? pickRandom(normales) : pickRandom(legendarias);
}

function msToTime(ms) {
    let s = Math.floor((ms / 1000) % 60);
    let m = Math.floor((ms / 1000 / 60) % 60);
    return `${m} minuto(s) ${s} segundo(s)`;
}
