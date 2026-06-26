"""
YouTube Learning Service
Fetches YouTube tutorial recommendations for skill development
"""

from googleapiclient.discovery import build
from typing import List, Dict
from flask import current_app


class YouTubeService:
    """Service for fetching YouTube learning resources"""
    
    def __init__(self):
        """Initialize YouTube API"""
        api_key = current_app.config.get('YOUTUBE_API_KEY', '')
        self.youtube = build('youtube', 'v3', developerKey=api_key) if api_key else None
    
    def search_skill_tutorials(self, skill: str, max_results: int = 10) -> List[Dict]:
        """
        Search for YouTube tutorials for a specific skill
        
        Args:
            skill: Skill name to search
            max_results: Maximum number of results to return
            
        Returns:
            List of video recommendations
        """
        if not self.youtube:
            return self._get_fallback_tutorials(skill)

        try:
            # Search for tutorials
            search_query = f'{skill} tutorial for beginners'

            request = self.youtube.search().list(
                q=search_query,
                part='snippet',
                type='video',
                maxResults=min(max_results, 50),
                order='relevance',
                videoCategoryId='27',  # Education category
                relevanceLanguage='en',
                safeSearch='strict'
            )

            response = request.execute()
            video_ids = [item['id']['videoId'] for item in response.get('items', []) if item.get('id', {}).get('videoId')]
            durations = self._get_video_durations(video_ids) if video_ids else {}

            tutorials = []
            for item in response.get('items', []):
                snippet = item['snippet']
                video_id = item.get('id', {}).get('videoId', '')
                tutorials.append({
                    'videoId': video_id,
                    'video_id': video_id,
                    'title': snippet.get('title', ''),
                    'description': snippet.get('description', '')[:200],
                    'channel': snippet.get('channelTitle', ''),
                    'url': f"https://www.youtube.com/watch?v={video_id}" if video_id else snippet.get('thumbnails', {}).get('default', {}).get('url', ''),
                    'thumbnail': snippet.get('thumbnails', {}).get('medium', {}).get('url') or snippet.get('thumbnails', {}).get('default', {}).get('url', ''),
                    'duration': durations.get(video_id),
                    'published_at': snippet.get('publishedAt', '')
                })

            return tutorials

        except Exception as e:
            print(f'Error searching YouTube: {str(e)}')
            return self._get_fallback_tutorials(skill)
    
    def _get_fallback_tutorials(self, skill: str) -> List[Dict]:
        """Return fallback tutorials when API is not available"""
        fallback_courses = {
            'Python': [
                {
                    'title': 'Python for Beginners by freeCodeCamp',
                    'channel': 'freeCodeCamp',
                    'url': 'https://www.youtube.com/watch?v=rfscVS0vtik',
                    'description': 'Complete Python tutorial for beginners'
                },
                {
                    'title': 'Python Full Course',
                    'channel': 'Traversy Media',
                    'url': 'https://www.youtube.com/watch?v=JJmcL1N2KQk',
                    'description': 'Learn Python from scratch'
                }
            ],
            'JavaScript': [
                {
                    'title': 'JavaScript Basics Tutorial',
                    'channel': 'freeCodeCamp',
                    'url': 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
                    'description': 'Complete JavaScript course'
                }
            ],
            'React': [
                {
                    'title': 'React Tutorial for Beginners',
                    'channel': 'freeCodeCamp',
                    'url': 'https://www.youtube.com/watch?v=SqcY0GlETPk',
                    'description': 'Learn React step by step'
                }
            ],
            'Docker': [
                {
                    'title': 'Docker Tutorial for Beginners',
                    'channel': 'freeCodeCamp',
                    'url': 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
                    'description': 'Complete Docker guide'
                }
            ],
            'AWS': [
                {
                    'title': 'AWS Tutorial for Beginners',
                    'channel': 'edureka!',
                    'url': 'https://www.youtube.com/watch?v=N9sWFuUT46c',
                    'description': 'Learn AWS from basics'
                }
            ],
            'SQL': [
                {
                    'title': 'SQL Tutorial for Beginners',
                    'channel': 'freeCodeCamp',
                    'url': 'https://www.youtube.com/watch?v=xiUTcAmreF0',
                    'description': 'Complete SQL course'
                }
            ]
        }
        
        # Return fallback tutorials if available, otherwise generic suggestion
        for key, courses in fallback_courses.items():
            if key.lower() in skill.lower():
                return [self._normalize_fallback_course(course) for course in courses]
        
        # Generic fallback
        return [self._normalize_fallback_course({
            'title': f'Learn {skill} Online',
            'channel': 'freeCodeCamp',
            'url': f'https://www.youtube.com/results?search_query=learn+{skill.replace(" ", "+")}',
            'description': f'Search YouTube for {skill} tutorials'
        })]

    def _extract_video_id(self, url: str) -> str:
        """Extract YouTube video ID from URL"""
        import re
        if not url:
            return ''
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)',
            r'youtu\.be\/([0-9A-Za-z_-]{11})(?:[&?]|$)'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return ''

    def _normalize_fallback_course(self, course: Dict) -> Dict:
        """Normalize fallback tutorial data to include video metadata fields"""
        url = course.get('url', '')
        video_id = self._extract_video_id(url)
        thumbnail = f'https://img.youtube.com/vi/{video_id}/mqdefault.jpg' if video_id else ''
        return {
            'videoId': video_id,
            'video_id': video_id,
            'title': course.get('title', ''),
            'description': course.get('description', ''),
            'channel': course.get('channel', ''),
            'url': url,
            'thumbnail': thumbnail,
            'duration': course.get('duration', ''),
            'published_at': course.get('published_at', '')
        }
    
    def get_skill_learning_playlist(self, skill: str) -> List[Dict]:
        """
        Get curated learning playlist for skill
        
        Args:
            skill: Skill to learn
            
        Returns:
            List of recommended courses/tutorials
        """
        tutorials = self.search_skill_tutorials(skill, max_results=15)
        
        if len(tutorials) == 0:
            return []
        
        # Curate top 5 most relevant
        return tutorials[:5]
    
    def get_multiple_skills_learning_plan(self, skills: List[str]) -> Dict:
        """
        Get learning plan for multiple skills
        
        Args:
            skills: List of skills to learn
            
        Returns:
            Dictionary with learning resources for each skill
        """
        learning_plan = {}
        
        for skill in skills[:5]:  # Limit to 5 skills
            learning_plan[skill] = self.get_skill_learning_playlist(skill)
        
        return learning_plan

    def _get_video_durations(self, video_ids: List[str]) -> Dict[str, str]:
        """
        Fetch video durations for a list of video IDs
        """
        if not self.youtube or not video_ids:
            return {}

        try:
            request = self.youtube.videos().list(
                part='contentDetails',
                id=','.join(video_ids[:50])
            )
            response = request.execute()

            durations = {}
            for item in response.get('items', []):
                vid = item.get('id')
                duration = item.get('contentDetails', {}).get('duration')
                durations[vid] = self._parse_youtube_duration(duration)

            return durations
        except Exception as e:
            print(f'Error fetching YouTube durations: {str(e)}')
            return {}

    def _parse_youtube_duration(self, iso_duration: str) -> str:
        """
        Convert ISO 8601 duration string to a human-readable format
        """
        if not iso_duration:
            return ''

        hours = minutes = seconds = 0
        import re
        time_parts = re.findall(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
        if time_parts:
            values = time_parts[0]
            hours = int(values[0]) if values[0] else 0
            minutes = int(values[1]) if values[1] else 0
            seconds = int(values[2]) if values[2] else 0

        if hours:
            return f'{hours}h {minutes}m {seconds}s' if seconds else f'{hours}h {minutes}m'
        if minutes:
            return f'{minutes}m {seconds}s' if seconds else f'{minutes}m'
        return f'{seconds}s'
