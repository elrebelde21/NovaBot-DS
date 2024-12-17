let handler = async (message, { args, db, prefix, command }) => {
    const channelMention = message.mentions.channels.first();

    let textoo = `**⚠️ Acción incorrecta**

Debes mencionar un canal válido.

**Ejemplo:**
\`${prefix + command} #canal\`

Tiene 2 opciones : Configurar el canal de bienvenida con un mensaje predeterminado usando:
\`${prefix + command} #canal\`

O personalizar el mensaje de bienvenida:
- **#user**: Nombre del usuario.
- **#tag**: Mención del usuario.
- **#guild**: Nombre del servidor.
- **#members**: Número total de miembros.

**Ejemplo personalizado:**
\`${prefix + command} #canal | título | descripción | footer | iconoDelFooter | mensaje personalizado\``;

if (!channelMention) return message.reply({content: textoo, files: ['https://qu.ax/OAwai.jpg'] });

const options = args.slice(1).join(' ');
    const [title, description, footer, footerIcon, welcomeMessage] = options.includes('|')
        ? options.split('|').map(str => str.trim()) // Usar separador `|`
        : options.split(',').map(str => str.trim()); // Usar separador `,`

const embedOptions = {
        title: title || null, 
        description: description || null,
        footerText: footer || null,
        footerIcon: footerIcon || null,
    };

const customizedMessage = welcomeMessage || null;
db.data.settings[message.guild.id] = {
        ...db.data.settings[message.guild.id],
        welcomeChannelId: channelMention.id,
        welcomeEmbed: embedOptions,
        welcomeMessage: customizedMessage,
    };
    await db.write();

let confirmationText = `✅ **Configuración actualizada**

📢 **Canal de bienvenida:** <#${channelMention.id}>
🖋️ **Título:** \`${embedOptions.title || "Predeterminado"}\`
📖 **Descripción:** \`${embedOptions.description || "Predeterminado"}\`
📝 **Footer:** \`${embedOptions.footerText || "Predeterminado"}\`
🔗 **Icono del footer:** ${embedOptions.footerIcon || "Predeterminado"}
📜 **Mensaje personalizado:** \`${customizedMessage || "Predeterminado"}\``;

message.reply(confirmationText);
};

handler.help = ['setwelcome'];
handler.tags = ['group'];
handler.command = /^setwelcome$/i;
handler.rowner = false;
handler.admin = true;
handler.botAdmin = true;

export default handler;
