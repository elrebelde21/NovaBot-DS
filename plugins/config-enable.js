import { EmbedBuilder } from "discord.js";

let handler = async (message, { args, db, prefix, command }) => {
  let settings = db.data.settings[message.guild?.id] || {};
  let chat = db.data.chats[message.channel.id] || {};
  const isSlash = command === "config";
  const accion = isSlash
    ? (args[0] || "").toLowerCase()
    : command.toLowerCase();

  const type = isSlash
    ? (args[1] || "").toLowerCase()
    : (args[0] || "").toLowerCase();

  const isEnable = /^(enable|on)$/i.test(accion);

  const estado = (v) => (v ? "🟢 Activado" : "🔴 Desactivado");
  if (!type) {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("⚙️ Estado de configuración del grupo")
      .setDescription(`
👋 **Welcome:** ${estado(settings.welcome)}
🔗 **AntiLink:** ${estado(chat.antiLink)}
🔗 **AntiLink2:** ${estado(chat.antiLink2)}
🆙 **AutoLevelUp:** ${estado(settings.levelupEnabled !== false)}

**Ejemplos:**
\`${prefix}enable welcome\`
\`${prefix}disable antilink\`
\`/config accion:enable opcion:welcome\`
\`/config accion:disable opcion:antilink\`
      `.trim())
      .setFooter({ text: "NovaBot-DS • Configuración" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  switch (type) {
    case "welcome":
      if (!message.guild) return message.reply("❌ Solo se puede usar en grupos.");
      settings.welcome = isEnable;
      db.data.settings[message.guild.id] = settings;
      break;

case "autolevelup": case "autonivel":
  if (!message.guild) return message.reply("❌ Solo se puede usar en grupos.");
  settings.levelupEnabled = isEnable;
  db.data.settings[message.guild.id] = settings;
  break;
      
    case "antilink":
    case "antidiscord":
      if (message.guild) chat.antiLink = isEnable;
      break;

    case "antilink2":
      if (!message.guild) return message.reply("❌ Solo se puede usar en grupos.");
      settings.antilink.enabled = isEnable;
      db.data.settings[message.guild.id] = settings;
      break;

    default:
      return message.reply("❌ Opción inválida.");
  }

  db.data.chats[message.channel.id] = chat;
  await db.write();

  const embed = new EmbedBuilder()
    .setColor(isEnable ? "#2ECC71" : "#E74C3C")
    .setTitle("✅ Configuración actualizada")
    .setDescription(`
La opción **${type}** fue **${isEnable ? "activada" : "desactivada"}**.

📊 **Estado actual:**
👋 Welcome: ${estado(settings.welcome)}
🔗 AntiLink: ${estado(chat.antiLink)}
🔗 AntiLink2: ${estado(chat.antiLink2)}
🆙 **AutoLevelUp:** ${estado(settings.levelupEnabled !== false)}
    `.trim())
    .setFooter({ text: "NovaBot-DS • Configuración" })
    .setTimestamp();

  return message.reply({ embeds: [embed] });
};

handler.help = ["enable [opción]", "disable [opción]"];
handler.tags = ["group"];
handler.command = /^(enable|disable|on|off)$/i;

handler.slash = {
  name: "config",
  description: "Ver o modificar configuraciones del grupo",
  options: [
    {
      name: "accion",
      description: "Acción a realizar",
      type: 3,
      required: false,
      choices: [
        { name: "Enable", value: "enable" },
        { name: "Disable", value: "disable" }
      ]
    },
    {
      name: "opcion",
      description: "Configuración a modificar",
      type: 3,
      required: false,
      choices: [
        { name: "Welcome", value: "welcome" },
        { name: "AntiLink", value: "antilink" },
        { name: "AntiLink2", value: "antilink2" },
        { name: "Autolevelup", value: "autolevelup" }
      ]
    }
  ]
};

handler.admin = false;
export default handler;
