'use client';

/**
 * Main UI Page for Content Generation
 *
 * This page provides the complete user interface for:
 * 1. Generating content ideas based on style and number
 * 2. Selecting ideas to expand into full articles
 * 3. Generating and displaying full articles
 * 4. Copying articles to clipboard
 */

import { useState } from 'react';
import { Idea, StyleType, GeneratedArticle } from '@/lib/types';

export default function Home() {
  // State for idea generation
  const [style, setStyle] = useState<StyleType>('blend');
  const [numIdeas, setNumIdeas] = useState<number>(10);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  // State for article generation
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // State for copy feedback
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);

  /**
   * Handle idea generation
   */
  const handleGenerateIdeas = async () => {
    setLoadingIdeas(true);
    setIdeasError(null);
    setIdeas([]);
    setSelectedIdeaIds(new Set());
    setArticles([]); // Clear previous articles

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, n: numIdeas }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);
    } catch (error) {
      console.error('Error generating ideas:', error);
      setIdeasError(
        error instanceof Error ? error.message : 'Failed to generate ideas'
      );
    } finally {
      setLoadingIdeas(false);
    }
  };

  /**
   * Toggle idea selection
   */
  const toggleIdeaSelection = (ideaId: string) => {
    const newSelection = new Set(selectedIdeaIds);
    if (newSelection.has(ideaId)) {
      newSelection.delete(ideaId);
    } else {
      newSelection.add(ideaId);
    }
    setSelectedIdeaIds(newSelection);
  };

  /**
   * Handle article generation from selected ideas
   */
  const handleGenerateArticles = async () => {
    const selectedIdeas = ideas.filter((idea) => selectedIdeaIds.has(idea.id));

    if (selectedIdeas.length === 0) {
      return;
    }

    setLoadingArticles(true);
    setArticlesError(null);
    setArticles([]);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideas: selectedIdeas }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate articles');
      }

      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error('Error generating articles:', error);
      setArticlesError(
        error instanceof Error ? error.message : 'Failed to generate articles'
      );
    } finally {
      setLoadingArticles(false);
    }
  };

  /**
   * Copy article text to clipboard
   */
  const handleCopyArticle = async (articleId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedArticleId(articleId);
      setTimeout(() => setCopiedArticleId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Kundra Content Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate sharp, original LinkedIn content ideas and articles
          </p>
        </div>

        {/* Idea Generation Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generate Ideas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Style Selector */}
            <div>
              <label
                htmlFor="style"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Style
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as StyleType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingIdeas}
              >
                <option value="blend">Blend (All Inspiration)</option>
                <option value="allison">Allison (Founder Story)</option>
                <option value="ines">Ines (Raw Honesty)</option>
                <option value="rita">Rita (Business Case)</option>
              </select>
            </div>

            {/* Number of Ideas */}
            <div>
              <label
                htmlFor="numIdeas"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number of Ideas
              </label>
              <input
                id="numIdeas"
                type="number"
                min="1"
                max="20"
                value={numIdeas}
                onChange={(e) => setNumIdeas(parseInt(e.target.value) || 10)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingIdeas}
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateIdeas}
            disabled={loadingIdeas}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingIdeas ? 'Generating Ideas...' : 'Generate Ideas'}
          </button>

          {/* Error Display */}
          {ideasError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{ideasError}</p>
            </div>
          )}
        </div>

        {/* Ideas Display */}
        {ideas.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Generated Ideas ({ideas.length})
              </h2>
              <button
                onClick={handleGenerateArticles}
                disabled={selectedIdeaIds.size === 0 || loadingArticles}
                className="bg-green-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingArticles
                  ? 'Generating Articles...'
                  : `Generate Articles (${selectedIdeaIds.size} selected)`}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer ${
                    selectedIdeaIds.has(idea.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => toggleIdeaSelection(idea.id)}
                >
                  {/* Selection Checkbox */}
                  <div className="flex items-start mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIdeaIds.has(idea.id)}
                      onChange={() => toggleIdeaSelection(idea.id)}
                      className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {idea.title}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-semibold text-gray-700 mr-2">
                        Style:
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium uppercase">
                        {idea.style}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Target Audience:
                      </span>
                      <span className="text-gray-600 ml-2">{idea.audience}</span>
                    </div>
                  </div>

                  {/* Angle */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Angle:
                    </p>
                    <p className="text-sm text-gray-600 italic">{idea.angle}</p>
                  </div>

                  {/* Hook Example */}
                  {idea.hookExample && (
                    <div className="mb-4 p-3 bg-gray-100 border-l-4 border-gray-400 rounded">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Hook:
                      </p>
                      <p className="text-sm text-gray-800">{idea.hookExample}</p>
                    </div>
                  )}

                  {/* Structure (Collapsed) */}
                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      4-Step Structure
                    </summary>
                    <ul className="mt-2 space-y-1 ml-4">
                      {idea.structure.map((step, index) => (
                        <li key={index} className="text-gray-600 text-xs">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>

            {/* Articles Error */}
            {articlesError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{articlesError}</p>
              </div>
            )}
          </div>
        )}

        {/* Articles Display */}
        {articles.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Generated Articles ({articles.length})
            </h2>

            <div className="space-y-6">
              {articles.map((article) => (
                <div
                  key={article.ideaId}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  {/* Article Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex-1">
                      {article.title}
                    </h3>
                    <button
                      onClick={() =>
                        handleCopyArticle(article.ideaId, article.text)
                      }
                      className={`ml-4 px-4 py-2 rounded-md font-semibold transition-colors ${
                        copiedArticleId === article.ideaId
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {copiedArticleId === article.ideaId ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Article Text */}
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {article.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
