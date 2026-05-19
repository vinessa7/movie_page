export default async function handler(request, response) {
try {
const apiKey = process.env.apiKey;

```
if (!apiKey) {
  return response.status(500).json({
    error: "Missing apiKey environment variable",
  });
}

const { endpoint, ...query } = request.query;

if (!endpoint) {
  return response.status(400).json({
    error: "Missing endpoint parameter",
  });
}

const params = new URLSearchParams(query);

const tmdbUrl =
  `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`;

const tmdbResponse = await fetch(tmdbUrl, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    accept: "application/json",
  },
});

const data = await tmdbResponse.json();

return response.status(tmdbResponse.status).json(data);
```

} catch (error) {
return response.status(500).json({
error: error.message,
});
}
}
