export default async function handler(req, res) {
const apiKey = process.env.apiKey;

try {
const { endpoint, ...query } = req.query;

```
const params = new URLSearchParams(query);

const url = `https://api.themoviedb.org/3/${endpoint}?${params}`;

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();

if (!response.ok) {
  return res.status(response.status).json(data);
}

res.status(200).json(data);
```

} catch (error) {
res.status(500).json({
error: error.message,
});
}
}
