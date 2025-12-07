import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, db, prefix, command }) => {
  const subcmd = args[0]?.toLowerCase() || "";
  const guildId = message.guild.id;
  if (!db.data.settings[guildId]) db.data.settings[guildId] = {};
  const settings = db.data.settings[guildId];

  if (subcmd === "list" && args[1] === "rol") {
    const roles = message.guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .map(r => `• <@&${r.id}> — \`${r.id}\``)
      .join("\n");

    const rolesEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🧩 Roles del Servidor')
      .setDescription(`Aquí tienes la lista de roles:\n\n${roles}`)
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Total de roles: ${message.guild.roles.cache.size}` });

    return message.reply({ embeds: [rolesEmbed] });
  }

  if (subcmd === "delete" && args[1] === "rol") {
    if (!settings.boostRoleId)
      return message.reply("⚠️ No hay rol configurado.");

    delete settings.boostRoleId;
    await db.write();

    return message.reply("🗑️ **Rol automático de booster eliminado correctamente.**");
  }

  if (subcmd === "rol") {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

    if (!role)
      return message.reply(`⚠️ Debes mencionar un rol válido.\nEj: \`${prefix + command} rol @Booster\``);

    settings.boostRoleId = role.id;
    await db.write();

    return message.reply(`🎯 **Rol Booster configurado:** <@&${role.id}>`);
  }

  const channelMention = message.mentions.channels.first();

  if (!channelMention) {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FF73FA')
      .setTitle('⚠️ Acción incorrecta')
      .setDescription(`Debes mencionar un **canal válido** para configurar el mensaje de BOOST.

### ⭐ Uso básico
\`${prefix + command} #canal\`

---

## 🎨 Variables disponibles:
- #user → Nombre del usuario  
- #tag → Mención  
- #guild → Nombre del servidor  
- #date → Fecha  
- #time → Hora  
- #id → ID usuario  
- #serverid → ID servidor  
- #boosts → Total de mejoras  
- #boostlevel → Nivel del servidor  

---

### 📝 Personalizar mensaje + embed
\`${prefix + command} #canal | título | descripción | footer | iconoFooter | mensaje superior\`

Ejemplo:
\`${prefix + command} #canal | Gracias #user! | Nivel #boostlevel | Eres increíble | https://url.jpg | #tag acaba de boostear! 💜\`

---

## 🧩 Configurar rol automático
\`${prefix + command} rol @Booster\`

## 📋 Listar roles
\`${prefix + command} list rol\`

## 🗑️ Eliminar rol
\`${prefix + command} delete rol\`
`)
     // .setImage("https://cdn.skyultraplus.com/uploads/u4/560eceb6f615dab3.jpg");

    return message.reply({ embeds: [helpEmbed] });
  }

  const options = args.slice(1).join(" ");

  const [title, description, footerText, footerIcon, superiorMsg] = (options.includes("|") ? options.split("|") : options.split(",")).map(s => s?.trim());
  settings.boostChannelId = channelMention.id;
  settings.boostMessage = superiorMsg || null;

  settings.boostEmbed = {
    title: title || null,
    description: description || null,
    footerText: footerText || null,
    footerIcon: footerIcon || null,
  };

  await db.write();

  const confirm = new EmbedBuilder()
    .setColor("#43B581")
    .setTitle("💜 Configuración de Boost actualizada")
    .addFields(
      { name: "📢 Canal", value: `<#${channelMention.id}>` },
      { name: "🖋️ Título", value: `\`${title || "Predeterminado"}\`` },
      { name: "📖 Descripción", value: `\`${description || "Predeterminado"}\`` },
      { name: "📝 Footer", value: `\`${footerText || "Predeterminado"}\`` },
      { name: "🔗 Icono del footer", value: footerIcon || "Predeterminado" },
      { name: "📜 Mensaje superior", value: `\`${superiorMsg || "Predeterminado"}\`` },
      { name: "🏅 Rol Booster", value: settings.boostRoleId ? `<@&${settings.boostRoleId}>` : "❌ Ninguno" }
    )

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("previewBoost")
      .setLabel("👀 Ver boost")
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await message.reply({ embeds: [confirm], components: [row] });

  const collector = msg.createMessageComponentCollector({ time: 60_000 });

  collector.on("collect", async (i) => {
    if (i.user.id !== message.author.id)
      return i.reply({
        content: "❌ Solo la persona que configuró puede ver la preview.",
        ephemeral: true
      });

    if (i.customId === "previewBoost") {
      const member = message.member;
      const avatar = member.user.displayAvatarURL({ dynamic: true, size: 1024 });

      // Variables
      function replaceVars(t) {
        if (!t) return t;

        const now = new Date();
        const boosts = message.guild.premiumSubscriptionCount || 0;
        const boostLevel = message.guild.premiumTier || 0;

        return t
          .replace(/#user/g, member.user.username)
          .replace(/#tag/g, `<@${member.user.id}>`)
          .replace(/#guild/g, message.guild.name)
          .replace(/#date/g, now.toLocaleDateString("es-AR"))
          .replace(/#time/g, now.toLocaleTimeString("es-AR"))
          .replace(/#id/g, member.user.id)
          .replace(/#serverid/g, message.guild.id)
          .replace(/#boosts/g, boosts.toString())
          .replace(/#boostlevel/g, boostLevel.toString());
      }

      const prevTitle = replaceVars(settings.boostEmbed.title || "💜 Gracias por tu mejora!");
      const prevDesc = replaceVars(settings.boostEmbed.description || "✨ Vista previa del mensaje.");
      const prevFooter = replaceVars(settings.boostEmbed.footerText || "Sistema Booster NovaBot");
      const prevMsg = replaceVars(settings.boostMessage || "💜 ¡Gracias #tag por boostear!");

      const embedPrev = new EmbedBuilder()
        .setColor("#FF73FA")
        .setTitle(prevTitle)
        .setDescription(prevDesc)
        .setThumbnail(avatar)
        .setFooter({ text: prevFooter, iconURL: settings.boostEmbed.footerIcon || avatar })
        .setTimestamp();

      return i.reply({
        content: "👀 **Vista previa del mensaje superior:**\n" + prevMsg,
        embeds: [embedPrev],
        ephemeral: true
      });
    }
  });
};

handler.help = ['setboost'];
handler.tags = ['group'];
handler.command = /^setboost$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;
