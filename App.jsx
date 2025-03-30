import React, { useState } from "react";
import "./App.css";

const API_KEY =
  "live_yoLETwtgsuylfYgHs1ZF5xzUc10mfmekhcxjxHuUqPrTWrQlT7r5WqtlGQEij5aa";
const API_URL = "https://api.thecatapi.com/v1/images/search?has_breeds=1";

function App() {
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banList, setBanList] = useState({
    breeds: [],
    origins: [],
    temperaments: [],
  });

  const fetchCat = async () => {
    setLoading(true);
    setError(null);
    const lastImage = cat?.image;
    setCat(null);

    try {
      let validCat = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!validCat && attempts < maxAttempts) {
        attempts++;
        const res = await fetch(API_URL, {
          headers: {
            "x-api-key": API_KEY,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const catData = data[0];

        if (!catData || !catData.breeds || catData.breeds.length === 0)
          continue;

        const breedName = catData.breeds[0].name;
        const origin = catData.breeds[0].origin;
        const temperamentList = catData.breeds[0].temperament
          .split(",")
          .map((t) => t.trim());

        const isBanned =
          banList.breeds.includes(breedName) ||
          banList.origins.includes(origin) ||
          temperamentList.some((temp) => banList.temperaments.includes(temp)) ||
          catData.url === lastImage;

        if (!isBanned) {
          validCat = {
            image: catData.url,
            breed: breedName,
            origin,
            temperamentList,
          };
        }
      }

      if (!validCat) {
        setError("😿 No suitable cats found. Try unbanning some items.");
        return;
      }

      setCat(validCat);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Oops! Something went wrong while fetching a cat.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = (type, value) => {
    setBanList((prev) => {
      const currentList = prev[type];
      const updatedList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];

      return { ...prev, [type]: updatedList };
    });
  };

  return (
    <div className="app">
      <h1>🐱 Random Cat Viewer</h1>
      <button onClick={fetchCat}>Show Me a Cat</button>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {cat && (
        <div className="card">
          <img src={cat.image} alt="A random cat" />
          <p>
            <strong>Breed:</strong>{" "}
            <span
              className="clickable"
              onClick={() => toggleBan("breeds", cat.breed)}
            >
              {cat.breed}
            </span>
          </p>
          <p>
            <strong>Origin:</strong>{" "}
            <span
              className="clickable"
              onClick={() => toggleBan("origins", cat.origin)}
            >
              {cat.origin}
            </span>
          </p>
          <p>
            <strong>Temperament:</strong>{" "}
            {cat.temperamentList.map((temp) => (
              <span
                key={temp}
                className="clickable"
                onClick={() => toggleBan("temperaments", temp)}
                style={{ marginRight: "10px" }}
              >
                {temp}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="banlist">
        <p className="instruction">
          Click any value above to ban or unban it from results
        </p>

        <h3> Banned Breeds:</h3>
        {banList.breeds.length === 0 ? (
          <p></p>
        ) : (
          <ul>
            {banList.breeds.map((b) => (
              <li key={b} onClick={() => toggleBan("breeds", b)}>
                {b}
              </li>
            ))}
          </ul>
        )}

        <h3> Banned Origins:</h3>
        {banList.origins.length === 0 ? (
          <p></p>
        ) : (
          <ul>
            {banList.origins.map((o) => (
              <li key={o} onClick={() => toggleBan("origins", o)}>
                {o}
              </li>
            ))}
          </ul>
        )}

        <h3> Banned Temperaments:</h3>
        {banList.temperaments.length === 0 ? (
          <p></p>
        ) : (
          <ul>
            {banList.temperaments.map((t) => (
              <li key={t} onClick={() => toggleBan("temperaments", t)}>
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
