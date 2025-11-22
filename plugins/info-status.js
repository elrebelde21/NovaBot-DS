import { EmbedBuilder } from "discord.js";

let handler = async (message, { client }) => {
try {
let uptimeMs = process.uptime() * 1000;
let dias = Math.floor(uptimeMs / 86400000);
let horas = Math.floor(uptimeMs / 3600000) % 24;
let minutos = Math.floor(uptimeMs / 60000) % 60;
let segundos = Math.floor(uptimeMs / 1000) % 60;

let guilds = client.guilds.cache;
let totalMiembros = guilds.reduce((a, g) => a + (g.memberCount || 0), 0);
let usuariosUnicos = client.users.cache.size;
let canalesTexto = 0;
let canalesVoz = 0;
let canalesCategorias = 0;

guilds.forEach(g => {
g.channels.cache.forEach(ch => {
if (ch.type === 0) canalesTexto++;
else if (ch.type === 2) canalesVoz++;
else if (ch.type === 4) canalesCategorias++;
});
});

let totalEmojis = guilds.reduce((acc, g) => acc + g.emojis.cache.size, 0);

let topServidores = guilds
.sort((a, b) => b.memberCount - a.memberCount)
.first(3)
.map((g, i) => `
**${i + 1}. ${g.name}**
> 👥 Miembros: **${g.memberCount}**
> 🆔 ID: \`${g.id}\`
`).join("\n");

let avatar = client.user.displayAvatarURL({ size: 1024 });

const embed = new EmbedBuilder()
.setColor("#5865F2")
.setThumbnail(avatar)
.setTitle("📊 ESTADO DEL BOT — NovaBot-DS")
.setDescription(`NovaBot estas funcionando correctamente ✨️`)
.addFields({
name: "🕒 TIEMPO DE ACTIVIDAD",
value: `\`\`\`
Días:      ${dias}
Horas:     ${horas}
Minutos:   ${minutos}
Segundos:  ${segundos}
\`\`\``,
},
{
name: "\n☁️ ESTADÍSTICAS",
value: `\`\`\`
Servidores:     ${guilds.size}
Usuarios:       ${usuariosUnicos}
Miembros:       ${totalMiembros}
Emojis:         ${totalEmojis}
\`\`\``,
},
{
name: "\n📁 CANALES",
value: `\`\`\`
Texto:        ${canalesTexto}
Voz:          ${canalesVoz}
Categorías:   ${canalesCategorias}
Total:        ${canalesTexto + canalesVoz + canalesCategorias}
\`\`\``,
},
{
name: "\n👑 SERVIDORES MÁS GRANDES",
value: topServidores || "No hay datos disponibles",
})
.setFooter({text: `NovaBot-DS • SkyUltraPlus`,
iconURL: avatar,
});

return message.reply({ embeds: [embed] });

} catch (e) {
console.log("Error en status:", e);
message.reply("❌ Error al mostrar el estado del bot.");
}
};
handler.help = ["status"];
handler.desc = ["Muestra el estado global del bot"];
handler.tags = ["main"];
handler.command = /^status$/i;

export default handler;
