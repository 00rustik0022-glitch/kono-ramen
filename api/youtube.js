export default async function handler(req, res) {
  const KEY = process.env.YOUTUBE_API_KEY;
  if (!KEY) {
    return res.status(500).json({ error: 'no key' });
  }
  const CHANNEL_ID = 'UCj6Fq5QqWh2s8awtVXYCSkg';
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items || !data.items[0]) {
      return res.status(404).json({ error: 'channel not found' });
    }
    const stats = data.items[0].statistics;
    const subs = parseInt(stats.subscriberCount, 10);
    const views = parseInt(stats.viewCount, 10);
    const subsShort = subs >= 1000 ? (subs / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(subs);
    const viewsShort = views >= 1000000 ? (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M' : views >= 1000 ? (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(views);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ subscribers: subs, subscribersShort: subsShort, views: views, viewsShort: viewsShort });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}