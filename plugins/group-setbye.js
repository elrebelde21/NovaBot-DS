let handler = async (message, { args, db, prefix, command }) => {
    const farewellChannelMention = message.mentions.channels.first(); 
const textoo = `**⚠️ Acción incorrecta**

Debes mencionar un canal válido.

**Ejemplo:**
\`${prefix + command} #canal\`

Tiene 2 opciones : Configurar el canal de despedida con un mensaje predeterminado usando:
\`${prefix + command} #canal\`

O personalizar el mensaje de despedida:
- **#user**: Nombre del usuario.
- **#tag**: Mención del usuario.
- **#guild**: Nombre del servidor.
- **#members**: Número total de miembros.

**Ejemplo personalizado:**
\`${prefix + command} #canal | título | descripción | footer | iconoDelFooter | mensaje personalizado\`

**Parte personalizada explicada:**
- **#canal**: Menciona el canal donde se enviará el mensaje de despedida.
- **título**: El título del mensaje de despedida.
- **descripción**: La descripción del mensaje de despedida.
- **footer**: El pie de página del mensaje de despedida.
- **iconoDelFooter**: El icono que aparecerá en el pie de página.
- **mensaje personalizado**: El cuerpo del mensaje donde puedes usar los reemplazos (#user, #tag, #guild, #members)`;

    if (!farewellChannelMention) return message.reply({content: textoo, files: ['https://qu.ax/OAwai.jpg'] });

    const options = args.slice(1).join(' ');
    const [title, description, footer, footerIcon, farewellMessage] = options.includes('|') 
        ? options.split('|').map(str => str.trim()) 
        : options.split(',').map(str => str.trim());

    const embedOptions = {
        title: title || null,
        description: description || null,
        footerText: footer || null,
        footerIcon: footerIcon || null,
    };

    db.data.settings[message.guild.id] = {
        ...db.data.settings[message.guild.id], 
        farewellChannelId: farewellChannelMention.id, 
        farewellEmbed: embedOptions, 
        farewellMessage: farewellMessage || null, 
    };
    await db.write();

const responseText = `✅ **Configuración actualizada**

📢 **Canal de despedida:** <#${farewellChannelMention.id}>
🖋️ **Título:** \`${embedOptions.title || "Predeterminado"}\`
📖 **Descripción:** \`${embedOptions.description || "Predeterminado"}\`
📝 **Footer:** \`${embedOptions.footerText || "Predeterminado"}\`
🔗 **Icono del footer:** ${embedOptions.footerIcon || "Ninguno"}
📜 **Mensaje personalizado:** \`${farewellMessage || "Usará el predeterminado"}\``;

    message.reply(responseText);
};

handler.help = ['setbye'];
handler.tags = ['group'];
handler.command = /^setbye$/i;
handler.rowner = false; 
handler.admin = true; 
handler.botAdmin = true; 

export default handler;
