export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { url } = req.query;

    if (url) {
      res.status(200).json({ redirectUrl: url });
    } else {
      res.status(400).json({ message: 'URL is required' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
