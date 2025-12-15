import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

async function sendPreview({ message, canal, texto, embed }) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_send")
      .setLabel("✅ Confirmar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("cancel_send")
      .setLabel("❌ Cancelar")
      .setStyle(ButtonStyle.Danger)
  );

  const previewMsg = await message.reply({
    content: `📝 **Vista previa del comunicado**\n📢 Canal: ${canal}`,
    embeds: embed ? [embed] : [],
    components: [row],
    ephemeral: message.content?.startsWith("/") || false,
  });

  const collector = previewMsg.createMessageComponentCollector({
    time: 60_000,
  });

  collector.on("collect", async i => {
    if (i.user.id !== message.author.id) {
      return i.reply({ content: "❌ No sos el autor.", ephemeral: true });
    }

    await i.deferUpdate();

    if (i.customId === "cancel_send") {
      collector.stop();
      return i.editReply({
        content: "❌ Comunicado cancelado.",
        components: [],
        embeds: [],
      });
    }

    if (i.customId === "confirm_send") {
      await canal.send({
        content: texto,
        embeds: embed ? [embed] : [],
        allowedMentions: { parse: ["everyone", "users", "roles"] },
      });

      collector.stop();
      return i.editReply({
        content: "✅ Comunicado enviado correctamente.",
        components: [],
        embeds: [],
      });
    }
  });
}

let handler = async (message, { args, prefix }) => {
  try {
    /* ================= MENSAJE NORMAL ================= */
    if (message.mentions?.channels?.first()) {
      const canal = message.mentions.channels.first();

      const textoCompleto = message.content
        .replace(canal.toString(), "")
        .split(" ")
        .slice(1)
        .join(" ")
        .trim();

      if (!textoCompleto) {
        return message.reply("❌ Falta el mensaje.");
      }

      let texto = textoCompleto;
      let embed = null;

      if (textoCompleto.includes("|")) {
        const p = textoCompleto.split("|").map(x => x.trim());
        texto = p[0] || null;

        embed = new EmbedBuilder().setColor("#8A2BE2").setTimestamp();
        if (p[1]) embed.setTitle(p[1]);
        if (p[2]) embed.setDescription(p[2]);
        if (p[3]) embed.setFooter({ text: p[3] });
        if (p[4]?.startsWith("http")) embed.setImage(p[4]);
      }

      return sendPreview({ message, canal, texto, embed });
    }

    /* ================= SLASH ================= */
    if (!message.guild) {
      return message.reply("❌ Solo en servidores.");
    }

    const [
      canalArg,
      texto,
      titulo,
      descripcion,
      footer,
      imagen,
    ] = args;

    const canal =
      typeof canalArg === "string"
        ? message.guild.channels.cache.get(canalArg)
        : canalArg;

    if (!canal || !texto) {
      return message.reply("❌ Datos incompletos.");
    }

    let embed = null;
    if (titulo || descripcion || footer || imagen) {
      embed = new EmbedBuilder()
        .setColor("#8A2BE2")
        .setTimestamp();

      if (titulo) embed.setTitle(titulo);
      if (descripcion) embed.setDescription(descripcion);
      if (footer) embed.setFooter({ text: footer });
      if (imagen?.startsWith("http")) embed.setImage(imagen);
    }

    return sendPreview({ message, canal, texto, embed });

  } catch (e) {
    console.error("❌ Error comunicado:", e);
    return message.reply("❌ Error al enviar el comunicado.");
  }
};

handler.help = ["comunicado"];
handler.tags = ["owner"];
handler.command = /^comunicado$/i;
handler.rowner = true;

handler.slash = {
  name: "comunicado",
  description: "Enviar un comunicado con vista previa",
  options: [
    { name: "canal", type: 7, description: "Canal destino", required: true },
    { name: "texto", type: 3, description: "Texto del mensaje", required: true },
    { name: "titulo", type: 3, description: "Título del embed", required: false },
    { name: "descripcion", type: 3, description: "Descripción del embed", required: false },
    { name: "footer", type: 3, description: "Footer del embed", required: false },
    { name: "imagen", type: 3, description: "URL de imagen", required: false },
  ],
};

export default handler;
