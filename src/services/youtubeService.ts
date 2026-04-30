const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  type: 'short' | 'long';
}

function formatViews(views: string): string {
  const count = parseInt(views);
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
  return count.toString();
}

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function fetchCinemaVideos(query: string = 'cinema masterclass cinematography', pageToken?: string): Promise<{ videos: any[], nextPageToken?: string }> {
  try {
    const url = new URL(`${BASE_URL}/search`);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('maxResults', '20');
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'video');
    url.searchParams.append('key', API_KEY);
    if (pageToken) url.searchParams.append('pageToken', pageToken);

    const searchResponse = await fetch(url.toString());
    const searchData = await searchResponse.json();
    
    if (!searchData.items) return { videos: [] };

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    const statsResponse = await fetch(
      `${BASE_URL}/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
    );
    const statsData = await statsResponse.json();

    const videos = statsData.items.map((item: any) => {
      const duration = item.contentDetails.duration;
      const durationLabel = parseDuration(duration);
      
      // Better shorts detection: #shorts tag OR duration < 61 seconds
      const isShort = item.snippet.title.toLowerCase().includes('#shorts') || 
                      item.snippet.description.toLowerCase().includes('#shorts') ||
                      (duration.startsWith('PT') && !duration.includes('H') && !duration.includes('M')) || // Only seconds
                      (duration.startsWith('PT') && duration.includes('M') && duration.split('M')[0] === 'PT1' && duration.endsWith('M')); // Exactly 1m
      
      // More accurate: if duration in seconds is < 61
      const totalSeconds = (parseInt(duration.match(/PT(?:(\d+)H)?/)?.[1] || '0') * 3600) + 
                           (parseInt(duration.match(/(?:(\d+)M)?/)?.[1] || '0') * 60) + 
                           (parseInt(duration.match(/(?:(\d+)S)?/)?.[1] || '0'));
      
      const isReallyShort = isShort || totalSeconds < 61;

      return {
        id: item.id,
        type: isReallyShort ? 'short' : 'long',
        creator: {
          id: item.snippet.channelId,
          name: item.snippet.channelTitle,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.snippet.channelId}`
        },
        url: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        title: item.snippet.title,
        description: item.snippet.description,
        qualityLabel: item.contentDetails.definition === 'hd' ? '4K' : 'HD',
        durationLabel,
        stats: {
          views: formatViews(item.statistics.viewCount || '0'),
          likes: formatViews(item.statistics.likeCount || '0'),
          comments: formatViews(item.statistics.commentCount || '0')
        },
        tags: item.snippet.tags ? item.snippet.tags.slice(0, 3) : ['cinema', 'neural', 'tanjia']
      };
    });

    return {
      videos,
      nextPageToken: searchData.nextPageToken
    };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return { videos: [] };
  }
}
