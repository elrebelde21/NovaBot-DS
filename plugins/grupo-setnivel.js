import { EmbedBuilder } from "discord.js";

const handler = async (message, { db, args }) => {
 if (!db.data.settings[message.guild.id]) db.data.settings[message.guild.id] = {};

const settings = db.data.settings[message.guild.id];

  if (!args.length) {
    const canal = settings.levelupChannel ? `<#${settings.levelupChannel}>` : "Ninguno";
    const msg = settings.levelupMessage ? "Personalizado" : "Por defecto";
    const rol = settings.levelupRole ? `<@&${settings.levelupRole}>` : "Ninguno";
    return message.reply(`**Configuración nivelación**\nCanal: ${canal}\nMensaje: ${msg}\nRol recompensa: ${rol}\nUso: .setnivel canal/rol/msg`);
  }

  if (args[0] === "canal" || message.mentions.channels.size > 0) {
    const canal = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    if (!canal) return message.reply("Menciona un canal válido");
    settings.levelupChannel = canal.id;
    await db.write();
    return message.reply(`✅ Canal de subidas de nivel: ${canal}`);
  }

  if (args[0] === "rol" || message.mentions.roles.size > 0) {
    const rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!rol) return message.reply("Menciona un rol válido");
    settings.levelupRole = rol.id;
    await db.write();
    return message.reply(`✅ Rol recompensa al subir nivel: ${rol}`);
  }

  if (args[0] === "msg" || args[0] === "mensaje") {
    const texto = message.content.split(" ").slice(2).join(" ");
    if (!texto) return message.reply("Escribe el mensaje\nVariables: {user}, {level}, {exp}");
    settings.levelupMessage = texto;
    await db.write();
    return message.reply("✅ Mensaje personalizado guardado");
  }

  message.reply("Opción no válida. Usa: canal / rol / msg");
};

handler.help = ["setnivel"];
handler.tags = ["group"];
handler.command = /^setnivel$/i;
handler.admin = true;
export default handler;