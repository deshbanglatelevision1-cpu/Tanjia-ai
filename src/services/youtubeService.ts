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

export async function fetchCinemaVideos(query: string = 'cinema masterclass cinematography'): Promise<any[]> {
  try {
    const searchResponse = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCaption=closedCaption&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();
    
    if (!searchData.items) return [];

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    const statsResponse = await fetch(
      `${BASE_URL}/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
    );
    const statsData = await statsResponse.json();

    return statsData.items.map((item: any) => {
      const isShort = item.snippet.title.toLowerCase().includes('#shorts') || 
                      item.snippet.description.toLowerCase().includes('#shorts');
      
      return {
        id: item.id,
        type: isShort ? 'short' : 'long',
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
        durationLabel: item.contentDetails.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', ''),
        stats: {
          views: formatViews(item.statistics.viewCount || '0'),
          likes: formatViews(item.statistics.likeCount || '0'),
          comments: formatViews(item.statistics.commentCount || '0')
        },
        tags: item.snippet.tags ? item.snippet.tags.slice(0, 3) : ['cinema', 'neural', 'tanjia']
      };
    });
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return [];
  }
}
