export default async function handler(req, res) {
  const apiKey = process.env.apiKey;

  const endpoint = req.query.endpoint || "movie/popular";

  try {
    const response = await fetch(`https://api.themoviedb.org/3/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    ```
const data = await response.json();

res.status(200).json(data);
```;
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch TMDB data",
    });
  }
}
