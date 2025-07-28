import React from "react";

const DownloadProfileButton = ({ userId }) => {
  const handleDownload = async () => {
    const response = await fetch(
      `http://localhost:9090/user/download_resume?id=${userId}`,
      {
        method: "GET",
        headers: {
          // Add auth headers if needed
        },
      }
    );
    if (!response.ok) {
      alert("Failed to download PDF");
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleDownload}>
      Download Profile PDF
    </button>
  );
};

export default DownloadProfileButton; 