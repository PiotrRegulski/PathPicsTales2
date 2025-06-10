"use client";
import React, { useState } from "react";

export default function DeleteDatabaseButton() {
  const [message, setMessage] = useState("");

  const deleteDatabase = async () => {
    if (!confirm("Czy na pewno chcesz usunąć bazę danych? Ta operacja jest nieodwracalna.")) {
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase("TravelDB");
        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onblocked = () => alert("Usuwanie bazy jest zablokowane. Zamknij inne karty korzystające z aplikacji.");
      });
      setMessage("Baza danych została usunięta.");
      console.log("Baza TravelDB została usunięta.");
    } catch (error) {
      setMessage("Wystąpił błąd podczas usuwania bazy danych.");
      console.error("Błąd usuwania bazy:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-gray-100 text-gray-800">
      <button
        onClick={deleteDatabase}
        className="my-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-shadow duration-300 "
      >
        Usuń bazę danych
      </button>
      {message && (
        <p className="mt-2 text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
