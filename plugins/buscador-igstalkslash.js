import fetch from "node-fetch";
import moment from "moment-timezone";
import fg from "api-dylux";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("igstalk")
  .setDescription("Obtiene información de un perfil de Instagram")
  .addStringOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario de Instagram (sin @)")
      .setRequired(true)
  );

export async function execute(interaction) {
  const username = interaction.options.getString("usuario");

  await interaction.deferReply();

  let profile = null;
  let source = "delirius";

  try {
    // ===== DELIRIUS =====
    const url = `https://api.delirius.store/tools/igstalk?username=${encodeURIComponent(username)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.data) throw new Error("Delirius vacío");

    const p = data.data;
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
      return interaction.editReply("❌ No se pudo obtener información del usuario.");
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
      text: `igstalk • Solicitado por ${interaction.user.username} | ${fecha}`,
      iconURL: interaction.user.displayAvatarURL({ size: 256 })
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("🔗 Abrir Instagram")
      .setURL(profile.url)
  );

  await interaction.editReply({
    embeds: [embed],
    components: [row]
  });
}
