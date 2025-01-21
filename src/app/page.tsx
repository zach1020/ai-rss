"use client";
import React, { useState, useEffect } from "react";
import Parser from "rss-parser";

// We'll just store the feed URLs in localStorage. 
// Article data is fetched dynamically each time a feed is selected.
const parser = new Parser();

export default function Home() {
  const [rssFeeds, setRssFeeds] = useState<string[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [newFeed, setNewFeed] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [summary, setSummary] = useState<string>("");

  //
  // Load any saved RSS feeds from localStorage on initial render
  //
  useEffect(() => {
    const storedFeeds = localStorage.getItem("rssFeeds");
    if (storedFeeds) {
      setRssFeeds(JSON.parse(storedFeeds));
    }
  }, []);

  //
  // Whenever rssFeeds changes, save it to localStorage
  //
  useEffect(() => {
    localStorage.setItem("rssFeeds", JSON.stringify(rssFeeds));
  }, [rssFeeds]);

  //
  // Add a new feed, fetch its articles
  //
  const handleAddFeed = async () => {
    if (newFeed.trim()) {
      try {
        // Add the new feed URL to our local list immediately
        setRssFeeds((prev) => [...prev, newFeed.trim()]);
        
        // Fetch articles for the newly added feed (optional step)
        const feed = await parser.parseURL(newFeed.trim());
        const latestArticles = feed.items.slice(0, 10);
        setArticles(latestArticles);
        
        setNewFeed(""); // clear input
      } catch (error) {
        console.error("Failed to fetch RSS feed:", error);
        alert("Invalid RSS feed URL. Please try again.");
      }
    }
  };

  //
  // When an article is clicked
  //
  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
    setSummary(""); // Clear summary for a new article
  };

  //
  // Suppose you have a server route (/api/summarize) that 
  // generates an AI summary. We'll illustrate a fetch call:
  //
  const generateSummary = async () => {
    if (!selectedArticle) {
      alert("Please select an article first.");
      return;
    }
    const articleText = selectedArticle.content || selectedArticle.contentSnippet || "";
    if (!articleText.trim()) {
      alert("No article content available to summarize.");
      return;
    }

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to summarize text.");
      }

      const data = await res.json();
      setSummary(data.summary);
    } catch (error: any) {
      console.error("Error generating summary:", error);
      alert("Failed to generate AI summary. Please try again.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Top Pane */}
      <div style={styles.topPane}>
        <h1>RSS Reader</h1>
        <div style={styles.addFeedContainer}>
          <input
            type="text"
            placeholder="Enter RSS feed URL"
            value={newFeed}
            onChange={(e) => setNewFeed(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddFeed} style={styles.addButton}>
            +
          </button>
        </div>
      </div>

      {/* Main Content (Three Panes) */}
      <div style={styles.mainContent}>
        {/* Articles View */}
        <div style={styles.articlesView}>
          <h2>Articles</h2>
          {articles.length === 0 ? (
            <p>No articles to display. Add an RSS feed to see articles.</p>
          ) : (
            <div style={styles.articleCards}>
              {articles.map((article, index) => (
                <div
                  key={index}
                  style={styles.articleCard}
                  onClick={() => handleArticleClick(article)}
                >
                  <h3 style={styles.articleTitle}>{article.title}</h3>
                  <p style={styles.articleDescription}>
                    {article.contentSnippet || "No description available."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reader View */}
        <div style={styles.readerView}>
          <h2>Reader</h2>
          {selectedArticle ? (
            <div>
              <h3>{selectedArticle.title}</h3>
              <p>
                {selectedArticle.content ||
                  selectedArticle.contentSnippet ||
                  "No content available."}
              </p>
              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.articleLink}
              >
                Read Full Article
              </a>
            </div>
          ) : (
            <p>Select an article to read.</p>
          )}
        </div>

        {/* AI Summary */}
        <div style={styles.summaryView}>
          <h2>AI Summary</h2>
          <button onClick={generateSummary} style={styles.summaryButton}>
            Generate AI Summary
          </button>
          <p>{summary || "The AI-generated summary will appear here."}</p>
        </div>
      </div>
    </div>
  );
}

/* ======================
       CSS Styles
====================== */
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  topPane: {
    flex: "0 0 60px",
    backgroundColor: "#000000",
    borderBottom: "1px solid #ccc",
    padding: "0.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  addFeedContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    marginRight: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  addButton: {
    backgroundColor: "#007BFF",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
  mainContent: {
    display: "flex",
    flex: 1,
  },
  articlesView: {
    flex: 1,
    borderRight: "1px solid #ccc",
    padding: "1rem",
    overflowY: "auto",
  },
  articleCards: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  articleCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#000000",
    cursor: "pointer",
  },
  articleTitle: {
    fontSize: "1.2rem",
    margin: "0 0 0.5rem 0",
  },
  articleDescription: {
    fontSize: "0.9rem",
    margin: "0 0 0.5rem 0",
    color: "#555",
  },
  articleLink: {
    fontSize: "0.9rem",
    color: "#007BFF",
    textDecoration: "none",
  },
  readerView: {
    flex: 2,
    borderRight: "1px solid #ccc",
    padding: "1rem",
    overflowY: "auto",
  },
  summaryView: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
  },
  summaryButton: {
    backgroundColor: "#007BFF",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    marginBottom: "1rem",
    cursor: "pointer",
  },
};