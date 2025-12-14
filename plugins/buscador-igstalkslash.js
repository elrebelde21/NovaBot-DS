import fetch from "node-fetch";
import moment from "moment-timezone";
import fg from "api-dylux";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, prefix, command }) => {
  const isSlash = message?.isChatInputCommand?.();

  // ⏳ Importante para evitar "Unknown interaction"
  if (isSlash && !message.deferred && !message.replied) {
    await message.deferReply();
  }

  // función universal de respuesta
  const reply = (data) => {
    return isSlash
      ? message.editReply(data)
      : message.reply(data);
  };

  try {
    const username = args.join(" ");
    if (!username) {
      return reply(
        `⚠️ **Ingresa un usuario de Instagram.**\nEj: \`${prefix}${command} skyultrapluss\``
      );
    }

    let profile = null;
    let source = "delirius";

    // ===== DELIRIUS =====
    try {
      const url = `https://api.delirius.store/tools/igstalk?username=${encodeURIComponent(username)}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json?.data) throw new Error("Sin datos");

      const p = json.data;
      profile = {
        username: p.username,
        full_name: p.full_name,
        biography: p.biography || "Sin descripción",
        verified: p.verified,
        private: p.private,
        followers: p.followers,
        following: p.following,
        posts: p.posts,
        picture: p.profile_picture,
        url: p.url
      };
    } catch {
      source = "dylux";
    }

    // ===== DYLUX (fallback) =====
    if (source === "dylux") {
      try {
        const res = await fg.igStalk(username);

        profile = {
          username: res.username.replace("@", ""),
          full_name: res.name,
          biography: res.description || "Sin descripción",
          verified: false,
          private: false,
          followers: res.followersH,
          following: res.followingH,
          posts: res.postsH,
          picture: res.profilePic,
          url: `https://instagram.com/${res.username.replace("@", "")}`
        };
      } catch {
        return reply("❌ No se pudo obtener información del usuario.");
      }
    }

    const fecha = moment()
      .tz("America/Argentina/Buenos_Aires")
      .format("DD/MM/YYYY");

    const embed = new EmbedBuilder()
      .setColor("#FF2D95")
      .setTitle("📸 Perfil de Instagram")
      .setImage(profile.picture)
      .setDescription(`
**👤 Usuario:** ${profile.username}
**📛 Nombre completo:** ${profile.full_name}
**📝 Biografía:** ${profile.biography}

**✔ Verificado:** ${profile.verified ? "Sí" : "No"}
**🔒 Privado:** ${profile.private ? "Sí" : "No"}

**👥 Seguidores:** ${profile.followers}
**🔄 Seguidos:** ${profile.following}
**🖼 Publicaciones:** ${profile.posts}

🔗 **[URL del perfil](${profile.url})**
`)
      .setFooter({
        text: `igstalk • Solicitado por ${isSlash ? message.user.username : message.author.username} | ${fecha}`,
        iconURL: (isSlash
          ? message.user.displayAvatarURL({ size: 256 })
          : message.author.displayAvatarURL({ size: 256 }))
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir Instagram")
        .setURL(profile.url)
    );

    return reply({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.error("Error IG:", err);
    return reply("❌ Error al procesar la solicitud.");
  }
};

/* ===============================
   METADATA TEXTO
================================ */
handler.help = ["igstalk <usuario>"];
handler.desc = ["Obtiene información de un perfil de Instagram"];
handler.tags = ["buscadores"];
handler.command = /^igstalk|igsearch|instagramsearch$/i;

/* ===============================
   METADATA SLASH
================================ */
handler.slash = {
  name: "igstalk",
  description: "Obtener información de un perfil de Instagram",
  options: [
    {
      name: "usuario",
      description: "Usuario de Instagram (sin @)",
      required: true
    }
  ]
};

export default handler;
