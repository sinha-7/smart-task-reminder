async function run() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  const data = await res.json();
  const freeGemini = data.data.filter(m => m.id.includes('free'));
  console.log(freeGemini.map(m => m.id));
}
run();
