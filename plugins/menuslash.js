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
  buscadores: { nombre: "Buscadores", emoji: "🌺🍁" },
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
      select.addOptions({
        label: `${categorias[tag].emoji}  ${categorias[tag].nombre}`,
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
      .setDescription(`**Hola ${user} 👋**

👑 **Creator:** elrebelde21  
✨ **Versión:** 1.0.0 (Beta)  
📅 **Fecha:** ${fecha}  
🌙 **Prefijo:** \`${prefix || "/"}\`

> Selecciona una categoría abajo para ver sus comandos.`)
      .setFooter({ text: "NovaBot-DS • SkyUltraPlus", iconURL: imagenPP });

    const sent = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = sent.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 90_000,
    });

    collector.on("collect", async i => {
  if (i.customId !== "menu_categorias") return;

  await i.deferUpdate(); //

  const tag = i.values[0];
  const comandos = help.filter(c => c.tags.includes(tag));

  if (comandos.length === 0) {
    return message.reply("❌ No hay comandos en esta categoría.");
  }

  const texto = comandos
    .map(c =>
      c.help.map(h => `• **${prefix || "/"}${h}**\n> ${c.desc}`).join("\n")
    )
    .join("\n\n");

  const embedCat = new EmbedBuilder()
    .setColor("#6A00FF")
    .setTitle(`${categorias[tag].emoji}  ${categorias[tag].nombre}`)
    .setThumbnail(imagenPP)
    .setDescription(`**Comandos disponibles (${comandos.length}):**\n\n${texto}`)
    .setFooter({ text: "NovaBot-DS • Menú de categorías" });

  await message.channel.send({ embeds: [embedCat] });
});

  } catch (e) {
    console.error("Error en menú:", e);
    message.reply("❌ Error al mostrar el menú.");
  }
};

/* ===============================
   TEXTO
================================ */
handler.help = ["menu"];
handler.tags = ["main"];
handler.command = /^(menu|help|allmenu)$/i;

/* ===============================
   SLASH
================================ */
handler.slash = {
  name: "menu",
  description: "Mostrar el menú principal del bot",
};

export default handler;
