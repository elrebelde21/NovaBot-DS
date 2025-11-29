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
  let pingStart = speed();
  let ping = (speed() - pingStart).toFixed(2);
  const cpuUsage = await getCpuUsage();
  const avgCPU = cpuUsage.reduce((a, b) => a + b) / cpuUsage.length;

  let cpuTemp = "N/A";
  try {
    cpuTemp = execSync("cat /sys/class/thermal/thermal_zone0/temp")
      .toString()
      .trim();
    cpuTemp = (cpuTemp / 1000).toFixed(1) + "°C";
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
    const diskInfo = execSync("df -h / | awk 'NR==2{print $2, $3, $4}'")
      .toString()
      .trim();
    const [t, u, f] = diskInfo.split(" ");
    diskTotal = t;
    diskUsed = u;
    diskFree = f;
  } catch {}

  let rx = "N/A",
    tx = "N/A";

  try {
    rx = execSync("cat /sys/class/net/eth0/statistics/rx_bytes")
      .toString()
      .trim();
    tx = execSync("cat /sys/class/net/eth0/statistics/tx_bytes")
      .toString()
      .trim();

    rx = formatBytes(parseInt(rx));
    tx = formatBytes(parseInt(tx));
  } catch {}

  const uptimeSeconds = os.uptime();
  const d = Math.floor(uptimeSeconds / 86400);
  const h = Math.floor((uptimeSeconds % 86400) / 3600);
  const m = Math.floor((uptimeSeconds % 3600) / 60);

  const uptime = `${d}d ${h}h ${m}m`;

  const embed = new EmbedBuilder()
    .setColor("#00F5FF")
    .setTitle("🖥️ ESTADO DEL SERVIDOR (Modo Ultra)")
    .setThumbnail("https://cdn.skyultraplus.com/uploads/u4/ced9cd73f8f62a72.jpg")
    .addFields(
      {
        name: "📡 Latencia",
        value: `\`${ping} ms\``,
        inline: true,
      },
      {
        name: "🧠 CPU",
        value: `**Modelo:** ${os.cpus()[0].model}
**Cores:** ${os.cpus().length}
**Temperatura:** ${cpuTemp}
**Carga Promedio:** \`${avgCPU.toFixed(1)}%\`
**Uso por Núcleo:**
${cpuUsage.map((x, i) => `> Core ${i + 1}: ${progressBar(x)} \`${x}%\``).join("\n")}
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
        name: "📦 Disco ( / )",
        value: `
**Total:** ${diskTotal}
**Usado:** ${diskUsed}
**Libre:** ${diskFree}
`,
        inline: false,
      },
      {
        name: "🌐 Red",
        value: `
**Descarga (RX):** ${rx}
**Subida (TX):** ${tx}
`,
        inline: false,
      },
      {
        name: "🧩 Sistema",
        value: `
**OS:** ${os.type()} ${os.release()}
**Plataforma:** ${os.platform()}
**Arquitectura:** ${os.arch()}
**Uptime:** ${uptime}
**Node.js:** \`${process.version}\`
**Discord.js:** \`${require("discord.js").version}\`
`,
        inline: false,
      }
    )
    .setTimestamp()
    .setFooter({
      text: `Solicitado por ${message.author.username}`,
      iconURL: message.author.displayAvatarURL(),
    });

  await message.reply({ embeds: [embed] });
};

handler.help = ["server"];
handler.tags = ["main"];
handler.command = /^(server)$/i;
handler.register = true;

export default handler;
