
export interface SearchResult {
    id: string;
    title: string;
    url: string;
    description: string;
    source: string;
    timestamp: Date;
    fileType: 'pdf' | 'doc' | 'image' | 'html';
}

export const fetchSearchResults = async (query: string): Promise<SearchResult[]> => {
    // In a production app, you would call Google Custom Search API here.
    // For this immersive demo, we provide high-quality simulated results 
    // that demonstrate the "Glass Card" UI architecture.
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return [
        {
            id: '1',
            title: `${query} - Latest Insights & Trends`,
            url: `https://lumina.ai/search/${encodeURIComponent(query)}`,
            description: `Discover deep insights about ${query}. This guide explores advanced concepts, current trends, and future projections using Lumina's proprietary analysis engine.`,
            source: "Lumina Nexus",
            timestamp: now,
            fileType: 'html'
        },
        {
            id: '2',
            title: `Understanding ${query} in the Modern Era`,
            url: "https://wikipedia.org/wiki/Intelligence",
            description: "A comprehensive breakdown of structural patterns and core methodologies. Learn how professionals are adapting to these changes globally.",
            source: "Knowledge Base",
            timestamp: lastWeek,
            fileType: 'pdf'
        },
        {
            id: '3',
            title: `${query}: Top 10 Resources for 2026`,
            url: "https://tech-future.com/resources",
            description: "Master the art of information retrieval. We've curated the best tools and documentation to help you navigate this complex topic with ease.",
            source: "Tech Future",
            timestamp: lastMonth,
            fileType: 'doc'
        },
        {
            id: '4',
            title: `Visualizing ${query} Trends`,
            url: "https://dribbble.com/search/intelligence",
            description: "See how designers and visionaries are interpreting complex data. A gallery of high-fidelity prototypes and data visualizations.",
            source: "Design Hub",
            timestamp: lastYear,
            fileType: 'image'
        }
    ];
};
