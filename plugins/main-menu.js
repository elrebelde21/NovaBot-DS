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
    group: { nombre: "Grupo", emoji: "⚙️💟" },
    nsfw: { nombre: "NSFW", emoji: "🔥😈" },
    owner: { nombre: "Owner", emoji: "👑💜" },
};

let handler = async (message, { client, prefix }) => {
try {
let user = message.author.username || "Usuario";

        let help = client.commands
            .filter(cmd => cmd && cmd.command)
            .map(cmd => ({
                help: Array.isArray(cmd.help)
                    ? cmd.help
                    : cmd.help
                    ? [cmd.help]
                    : [],
                desc: cmd.desc || "Sin descripción.",
                tags: Array.isArray(cmd.tags)
                    ? cmd.tags
                    : cmd.tags
                    ? [cmd.tags]
                    : [],
                premium: cmd.premium || false,
                limit: cmd.limit || false,
            }));

        const select = new StringSelectMenuBuilder()
            .setCustomId("menu_categorias")
            .setPlaceholder("👉 Selecciona una categoría…");

        Object.keys(categorias).forEach((tag) => {
            let cantidad = help.filter(cmd => cmd.tags.includes(tag)).length;

            select.addOptions({
                label: `${categorias[tag].emoji}  ${categorias[tag].nombre}`,
                value: tag,
                description: `${cantidad} comandos disponibles`,
            });
        });

        const row = new ActionRowBuilder().addComponents(select);

let imagenPP = "https://cdn.skyultraplus.com/uploads/u4/ced9cd73f8f62a72.jpg";

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

> Selecciona una categoría abajo para ver sus comandos.\n`
            )
            .setFooter({
                text: "NovaBot-DS • SkyUltraPlus",
                iconURL: imagenPP,
            });

        await message.channel.send({
            embeds: [embed],
            components: [row],
        });

        message.channel.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 90000,
        }).on("collect", async (i) => {
            if (i.customId !== "menu_categorias") return;

            const seleccion = i.values[0];
            const catInfo = categorias[seleccion];

            let comandosCategoria = help.filter(cmd =>
                cmd.tags.includes(seleccion)
            );

            if (comandosCategoria.length === 0) {
                return i.reply({
                    content: "❌ Esta categoría no tiene comandos aún.",
                    ephemeral: true,
                });
            }

            let texto = comandosCategoria
                .map(cmd =>
                    cmd.help
                        .map(
                            h =>
`• **${prefix}${h}**
> ${cmd.desc}`
                        )
                        .join("\n")
                )
                .join("\n\n");

            const embedCat = new EmbedBuilder()
                .setColor("#6A00FF")
                .setTitle(`${catInfo.emoji}  ${catInfo.nombre}`)
                .setThumbnail(imagenPP)
                .setDescription(
                    `**Comandos disponibles (${comandosCategoria.length}):**\n\n${texto}`
                )
                .setFooter({
                    text: "NovaBot-DS • Selección de categorías",
                });

            await i.reply({
                embeds: [embedCat],
                ephemeral: true,
            });
        });

    } catch (e) {
        console.log("Error en menú:", e);
        message.reply("❌ Hubo un error generando el menú.");
    }
};

handler.help = ["menu"];
handler.tags = ["main"];
handler.command = /^(menu|help|allmenu)$/i;

export default handler;
