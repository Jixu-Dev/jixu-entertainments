import "server-only";
import { env } from "./env";

interface Target {
  region: string;
  categoryId: string;
}

export async function sendDiscordWebhook(payload: Record<string, unknown>): Promise<boolean> {
  const webhookUrl = env.DISCORD_WEBHOOK();
  if (!webhookUrl || !webhookUrl.startsWith("http")) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Jixu Entertainments",
        avatar_url: "https://raw.githubusercontent.com/Jixu-Dev/jixu-entertainments/main/public/logo.png",
        ...payload,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[Discord] Webhook send failed:", err);
    return false;
  }
}

export async function notifySiteSubmission(data: {
  siteName: string;
  siteUrl: string;
  siteFeature: string;
  targets: Target[];
  submitterIp: string;
}): Promise<void> {
  const targetSummary = data.targets
    .map((t) => `• **${t.region}** → \`${t.categoryId}\``)
    .join("\n");

  await sendDiscordWebhook({
    embeds: [
      {
        title: `🎬 New Platform Submission: ${data.siteName}`,
        url: data.siteUrl,
        color: 0x5b3df5, // Electric Indigo
        description: data.siteFeature || "No feature description provided.",
        fields: [
          {
            name: "🌐 URL",
            value: `[${data.siteUrl}](${data.siteUrl})`,
            inline: false,
          },
          {
            name: "📍 Target Catalogs",
            value: targetSummary || "General",
            inline: false,
          },
          {
            name: "🛡️ Review in Admin Panel",
            value: `[Open Site Requests Inbox](${env.SITE_URL()}/admin-panel/requests)`,
            inline: false,
          },
        ],
        footer: {
          text: `Jixu Entertainments Directory • Submitter IP: ${data.submitterIp}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

export async function notifyDmcaSubmission(data: {
  claimantName: string;
  organization?: string;
  email: string;
  infringingUrl: string;
  originalWorkDescription: string;
  digitalSignature: string;
  submitterIp: string;
}): Promise<void> {
  await sendDiscordWebhook({
    embeds: [
      {
        title: `⚠️ New DMCA Takedown Notice`,
        url: data.infringingUrl,
        color: 0xef4444, // Red
        description: `**Claimant:** ${data.claimantName} ${data.organization ? `(${data.organization})` : ""}\n**Email:** ${data.email}`,
        fields: [
          {
            name: "🎯 Target Infringing URL",
            value: `[${data.infringingUrl}](${data.infringingUrl})`,
            inline: false,
          },
          {
            name: "📝 Original Work Description",
            value: data.originalWorkDescription.slice(0, 1000),
            inline: false,
          },
          {
            name: "✍️ Digital Signature",
            value: data.digitalSignature,
            inline: true,
          },
          {
            name: "🛡️ Admin Inbox",
            value: `[Open DMCA Inbox](${env.SITE_URL()}/admin-panel/dmca)`,
            inline: true,
          },
        ],
        footer: {
          text: `Jixu DMCA Registry • Submitter IP: ${data.submitterIp}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

const MILESTONES = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

export async function notifyVisitorMilestone(totalVisits: number, onlineNow: number): Promise<void> {
  if (!MILESTONES.includes(totalVisits)) return;

  await sendDiscordWebhook({
    embeds: [
      {
        title: `🎉 Traffic Milestone Reached: ${totalVisits.toLocaleString()} Total Visits!`,
        color: 0x10b981, // Emerald Green
        description: `Jixu Entertainments has just reached **${totalVisits.toLocaleString()}** lifetime visits!\n\n🟢 **Currently Online:** \`${onlineNow} active user${onlineNow === 1 ? "" : "s"}\``,
        fields: [
          {
            name: "📊 Portal",
            value: `[Open Jixu Portal](${env.SITE_URL()})`,
            inline: true,
          },
          {
            name: "⚡ Admin Dashboard",
            value: `[View Studio Stats](${env.SITE_URL()}/admin-panel)`,
            inline: true,
          },
        ],
        footer: {
          text: "Jixu Entertainments Live Network Analytics",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
