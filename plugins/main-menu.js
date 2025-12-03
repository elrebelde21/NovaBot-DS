import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
} from "discord.js";
import moment from "moment-timezone";

const fecha = moment.tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");

const categorias = {
    main: { nombre: "Información", emoji: "🌙✨" },
    downloader: { nombre: "Descargas", emoji: "📥💮" },
    tools: { nombre: "Herramientas", emoji: "🛠️🐰" },
    buscadores: { nombre: "buscadores", emoji: "🌺🍁" },
    rg: { nombre: "Registro", emoji: "🟢🌸" },
    econ: { nombre: "RPG", emoji: "🛠🔵" },
    group: { nombre: "Grupo", emoji: "⚙️💟" },
    nsfw: { nombre: "NSFW", emoji: "🔥😈" },
    owner: { nombre: "Owner", emoji: "👑💜" },
};

let handler = async (message, { prefix }) => {
try {
const user = message.author.username || "Usuario";
const plugins = Object.values(global.plugins || {});

const help = plugins.map(cmd => ({
help: Array.isArray(cmd.help) ? cmd.help : cmd.help ? [cmd.help] : [],
desc: cmd.desc || "Sin descripción.",
tags: Array.isArray(cmd.tags) ? cmd.tags : cmd.tags ? [cmd.tags] : [],
}));

const select = new StringSelectMenuBuilder()
.setCustomId("menu_categorias")
.setPlaceholder("👉 Selecciona una categoría…");

Object.keys(categorias).forEach(tag => {
const cantidad = help.filter(cmd => cmd.tags.includes(tag)).length;
select.addOptions({ label: `${categorias[tag].emoji}  ${categorias[tag].nombre}`,
value: tag,
description: `${cantidad} comandos disponibles`,
});
});

const row = new ActionRowBuilder().addComponents(select);
const imagenPP = "https://cdn.skyultraplus.com/uploads/u4/ced9cd73f8f62a72.jpg";

const embed = new EmbedBuilder()
.setColor("#2B2D31")
.setTitle("🌟 MENÚ PRINCIPAL 🌟")
.setThumbnail(imagenPP)
.setDescription(`**<:IMG20251122WA0068:1441935536737615954>Hola ${user} 👋**

👑 **Creator:** [elrebelde21](https://discord.com/users/1008834879858946170)
✨️ **Versión:** 1.0.0 (Beta)
📅 **Fecha:** ${fecha}  
🌙 **Prefijo:** \`${prefix}\`

El bot se encuentra en desarrollo, por lo que puede presentar errores o fallos de comandos. Puedes reportarlo con el comando '.report'. También puedes dar ideas o sugerencias sobre comandos o cosas que te gustaría que agregáramos al bot. Escríbele a mis dueños [aqui](https://discord.com/users/1008834879858946170).

> Selecciona una categoría abajo para ver sus comandos.\n`)
.setFooter({ text: "NovaBot-DS • SkyUltraPlus", iconURL: imagenPP });

const sent = await message.channel.send({ embeds: [embed], components: [row] });

const collector = sent.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 90000 });

collector.on("collect", async i => {
if (i.customId !== "menu_categorias") return;

const tag = i.values[0];
const comandos = help.filter(c => c.tags.includes(tag));

if (comandos.length === 0) {
return i.reply({ content: "❌ No hay comandos en esta categoría aún.", ephemeral: true });
}

const texto = comandos.map(c => c.help.map(h => `• **${prefix}${h}**\n> ${c.desc}`).join("\n")).join("\n\n");

const embedCat = new EmbedBuilder()
.setColor("#6A00FF")
.setTitle(`${categorias[tag].emoji}  ${categorias[tag].nombre}`)
.setThumbnail(imagenPP)
.setDescription(`**Comandos disponibles (${comandos.length}):**\n\n${texto}`)
.setFooter({ text: "NovaBot-DS • Selección de categorías" });

await i.reply({ embeds: [embedCat], ephemeral: true });
});

} catch (e) {
console.error("Error en menú:", e);
message.reply("❌ Error al mostrar el menú.");
}
};
handler.help = ["menu"];
handler.tags = ["main"];
handler.command = /^(menu|help|allmenu)$/i;

export default handler;