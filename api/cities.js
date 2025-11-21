import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db.json");

export default function handler(req, res) {
  const jsonData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  let { cities } = jsonData;

  const id = req.query.id;

  // GET /api/cities or GET /api/cities?id=123
  if (req.method === "GET") {
    if (id) {
      const city = cities.find((c) => +c.id === +id);
      if (!city) return res.status(404).json({ message: "City not found" });
      return res.status(200).json(city);
    } else {
      return res.status(200).json(cities);
    }
  }

  // POST /api/cities
  if (req.method === "POST") {
    const newCity = { ...req.body, id: Date.now() };
    cities.push(newCity);
    fs.writeFileSync(dbPath, JSON.stringify({ cities }, null, 2));
    return res.status(201).json(newCity);
  }

  // PUT /api/cities?id=123
  if (req.method === "PUT") {
    if (!id) return res.status(400).json({ message: "ID is required" });
    const index = cities.findIndex((c) => +c.id === +id);
    if (index === -1)
      return res.status(404).json({ message: "City not found" });
    cities[index] = { ...cities[index], ...req.body };
    fs.writeFileSync(dbPath, JSON.stringify({ cities }, null, 2));
    return res.status(200).json(cities[index]);
  }

  // DELETE /api/cities?id=123
  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ message: "ID is required" });
    const index = cities.findIndex((c) => +c.id === +id);
    if (index === -1)
      return res.status(404).json({ message: "City not found" });
    cities.splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify({ cities }, null, 2));
    return res.status(200).json({});
  }

  return res.status(405).json({ message: "Method not allowed" });
}
