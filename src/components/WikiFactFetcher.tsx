"use client";
import React, { useState } from "react";

type WikiFactFetcherProps = {
  initialKeyword?: string;
  onSave: (fact: string) => void;
};

export default function WikiFactFetcher({ initialKeyword = "", onSave }: WikiFactFetcherProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [fact, setFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setFact(null);
    setError(null);
    try {
      const res = await fetch(`/api/wiki?q=${encodeURIComponent(keyword.trim())}`);
      if (!res.ok) {
        setError("Nie znaleziono ciekawostki.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFact(data.extract || "Brak opisu w Wikipedii.");
    } catch (error:unknown) {
      setError(error instanceof Error ? error.message : "Wystąpił błąd podczas pobierania danych.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-2 p-2 border rounded bg-gray-50">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Słowo kluczowe do Wikipedii:
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="flex-1 border p-1 rounded"
          placeholder="np. Pałac Kultury i Nauki"
          onKeyDown={e => e.key === "Enter" && handleFetch()}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={handleFetch}
          disabled={loading}
        >
          Szukaj
        </button>
      </div>
      {loading && <p className="text-blue-600 text-sm">Szukam ciekawostki…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {fact && !error && (
        <div className="mt-2">
          <div className="bg-white p-2 rounded shadow text-gray-800 text-sm">{fact}</div>
          <button
            className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
            onClick={() => onSave(fact)}
          >
            Zapisz ciekawostkę do opisu
          </button>
        </div>
      )}
    </div>
  );
}
