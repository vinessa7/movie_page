export default async function handler(req, res) {
  try {
    const { endpoint, ...query } = req.query;

    const params = new URLSearchParams(query);

    const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.apiKey}&${params}`;

    const response = await fetch(url);

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
