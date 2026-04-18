{
  "version": 2,
  "functions": {
    "api/*.js": {
      "runtime": "vercel-nodejs@20.x"
    },
    "index.js": {
      "runtime": "vercel-nodejs@20.x"
    }
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/$1" }
  ]
}