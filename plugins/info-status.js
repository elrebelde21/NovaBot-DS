import { EmbedBuilder } from "discord.js";

let handler = async (message, { client }) => {
try {
let uptimeMs = process.uptime() * 1000;
let dias = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
let horas = Math.floor((uptimeMs / (60 * 60 * 1000)) % 24);
let minutos = Math.floor((uptimeMs / (60 * 1000)) % 60);
let segundos = Math.floor((uptimeMs / 1000) % 60);

let guilds = client.guilds.cache;
let totalMiembros = guilds.reduce((acc, g) => acc + (g.memberCount || 0), 0);
let usuariosUnicos = client.users.cache.size;
let canalesTexto = 0;
let canalesVoz = 0;
let canalesCategorias = 0;

guilds.forEach(g => {
g.channels.cache.forEach(ch => {
if (ch.type === 0) canalesTexto++;         // GuildText
else if (ch.type === 2) canalesVoz++;       // GuildVoice
else if (ch.type === 4) canalesCategorias++; // Category
});
});

let totalEmojis = guilds.reduce((acc, g) => acc + g.emojis.cache.size, 0);
let topServidores = guilds
.sort((a, b) => b.memberCount - a.memberCount)
.first(5)
.map((g, i) => `**${i + 1}.** ${g.name}  
> 👥 **Miembros:** ${g.memberCount}  
> 🆔 **ID:** \`${g.id}\``)
.join("\n\n");

let avatar = client.user.displayAvatarURL({ size: 1024 });

const embed = new EmbedBuilder()
.setColor("#9b59b6")
.setTitle("📊 Estado del Bot – NovaBot-DS")
.setThumbnail(avatar)
.setDescription(`🕒 **Tiempo activo:**
\`${dias} días\`
\`${horas} horas\`
\`${minutos} minutos\`
\`${segundos} segundos\`

📌 **Estadísticas generales**
• 🏘️ Servidores: **${guilds.size}**
• 👥 Miembros totales: **${totalMiembros}**
• 🧑 Usuarios únicos: **${usuariosUnicos}**
• 😃 Emojis totales: **${totalEmojis}**

📚 **Canales**
• 💬 Texto: **${canalesTexto}**
• 🔊 Voz: **${canalesVoz}**
• 📁 Categorías: **${canalesCategorias}**

🏆 **Servidores más grandes donde estoy:**

${topServidores || "No hay servidores suficientes"}
`)
.setFooter({ text: "|| NovaBot-DS • SkyUltraPlus ||",
iconURL: avatar,
});

return message.reply({ embeds: [embed] });

} catch (e) {
console.log("Error en status:", e);
message.reply("❌ Error al mostrar el estado del bot.");
}
};
handler.help = ["status"];
handler.desc = ["Estadísticas del bot"];
handler.tags = ["main"];
handler.command = /^status$/i;

export default handler;
