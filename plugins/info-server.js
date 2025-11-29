import os from "os";
import speed from "performance-now";
import { EmbedBuilder } from "discord.js";
import fs from "fs";
import { execSync } from "child_process";

const formatBytes = (bytes) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const progressBar = (value) => {
    const totalBars = 10;
    const filled = Math.round((value / 100) * totalBars);
    return "█".repeat(filled) + "░".repeat(totalBars - filled);
};

const getCpuUsage = async () => {
    const start = os.cpus();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const end = os.cpus();

    return start.map((cpu, i) => {
        const idleDiff = end[i].times.idle - cpu.times.idle;
        const totalDiff =
            Object.values(end[i].times).reduce((a, b) => a + b) -
            Object.values(cpu.times).reduce((a, b) => a + b);

        return 100 - Math.round((idleDiff / totalDiff) * 100);
    });
};

const handler = async (message) => {
    const start = Date.now();
const sent = await message.reply("🚀 Cargando...");
const latency = Date.now() - start;
    const cpuUsage = await getCpuUsage();
    const avgCPU = cpuUsage.reduce((a, b) => a + b) / cpuUsage.length;

    let cpuTemp = "No disponible";
    try {
        if (fs.existsSync("/sys/class/thermal/thermal_zone0/temp")) {
            let t = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp").toString().trim();
            cpuTemp = (parseInt(t) / 1000).toFixed(1) + "°C";
        }
    } catch {
        cpuTemp = "No disponible";
    }

    const totalRAM = os.totalmem();
    const freeRAM = os.freemem();
    const usedRAM = totalRAM - freeRAM;
    const ramPercent = ((usedRAM / totalRAM) * 100).toFixed(1);

    let diskTotal = "N/A",
        diskUsed = "N/A",
        diskFree = "N/A";

    try {
        const df = execSync("df -h / | awk 'NR==2{print $2, $3, $4}'")
            .toString()
            .trim();
        const [t, u, f] = df.split(" ");
        diskTotal = t;
        diskUsed = u;
        diskFree = f;
    } catch {}

    let rx = "N/A",
        tx = "N/A";

    const net = fs.existsSync("/sys/class/net/eth0/statistics/rx_bytes")
        ? "eth0"
        : fs.existsSync("/sys/class/net/ens18/statistics/rx_bytes")
        ? "ens18"
        : null;

    if (net) {
        try {
            rx = formatBytes(parseInt(fs.readFileSync(`/sys/class/net/${net}/statistics/rx_bytes`).toString()));
            tx = formatBytes(parseInt(fs.readFileSync(`/sys/class/net/${net}/statistics/tx_bytes`).toString()));
        } catch {}
    }

    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    const embed = new EmbedBuilder()
        .setColor("#00F5FF")
        .setTitle("🖥️ ESTADO DEL SERVIDOR 🖥️")
        .setThumbnail("https://cdn.skyultraplus.com/uploads/u4/ced9cd73f8f62a72.jpg")
        .addFields(
            {
                name: "📡 Latencia",
                value: `\`${latency} ms\``,
                inline: true,
            },
            {
                name: "🧠 CPU",
                value: `**Modelo:** ${os.cpus()[0].model}
**Núcleos:** ${os.cpus().length}
**Promedio:** \`${avgCPU.toFixed(1)}%\`
**Temperatura:** ${cpuTemp}

${cpuUsage
    .map((x, i) => `> Core ${i + 1}: ${progressBar(x)} \`${x}%\``)
    .join("\n")}
`,
            },
            {
                name: "💾 RAM",
                value: `
**Total:** ${formatBytes(totalRAM)}
**Usada:** ${formatBytes(usedRAM)} (\`${ramPercent}%\`)
**Libre:** ${formatBytes(freeRAM)}
**Uso:** ${progressBar(ramPercent)} \`${ramPercent}%\`
`,
            },
            {
                name: "📦 Disco",
                value: `
**Total:** ${diskTotal}
**Usado:** ${diskUsed}
**Libre:** ${diskFree}
`,
            },
            {
                name: "🌐 Red",
                value: `
**Descarga (RX):** ${rx}
**Subida (TX):** ${tx}
`,
            },
            {
                name: "🧩 Sistema",
                value: `
**OS:** ${os.type()} ${os.release()}
**Plataforma:** ${os.platform()}
**Arquitectura:** ${os.arch()}
**Uptime:** ${days}d ${hours}h ${mins}m
**Node.js:** \`${process.version}\`
**Discord.js:** \`v14\`
`,
            }
        )
        .setTimestamp()
        .setFooter({
            text: `Solicitado por ${message.author.username}`,
            iconURL: message.author.displayAvatarURL(),
        });

await sent.edit({ content: null, embeds: [embed] });
    //await message.reply({ embeds: [embed] });
};

handler.help = ["server"];
handler.tags = ["main"];
handler.command = /^(server)$/i;
handler.register = true;

export default handler;
