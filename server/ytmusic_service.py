#!/usr/bin/env python3
"""
YouTube Music API Service
Provides RESTful endpoints for YouTube Music data using ytmusicapi
"""

import json
import sys
from typing import Dict, List, Any
from ytmusicapi import YTMusic

class YTMusicService:
    def __init__(self):
        self.ytmusic = YTMusic()
    
    def search_songs(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search for songs on YouTube Music"""
        try:
            results = self.ytmusic.search(query, filter="songs", limit=limit)
            songs = []
            
            for result in results:
                song_data = self._format_song_data(result)
                if song_data:
                    songs.append(song_data)
            
            return songs
        except Exception as e:
            print(f"Error searching songs: {e}", file=sys.stderr)
            return []
    
    def _format_song_data(self, song: Dict[str, Any]) -> Dict[str, Any] | None:
        """Format song data from ytmusicapi response"""
        if not song or not song.get("videoId"):
            return None
        
        return {
            "id": song.get("videoId", ""),
            "title": song.get("title", ""),
            "artist": self._get_artist_name(song.get("artists", [])),
            "duration": self._get_duration_seconds(song.get("duration")),
            "thumbnail": self._get_thumbnail_url(song.get("thumbnails", [])),
            "audioUrl": f"https://www.youtube.com/watch?v={song.get('videoId', '')}"
        }
    
    def get_charts(self, country: str = "ID") -> List[Dict[str, Any]]:
        """Get trending/chart songs"""
        try:
            # Try to get charts, but fallback to search for popular songs if charts fail
            try:
                charts = self.ytmusic.get_charts(country=country)
                trending_songs = []
                
                # Try different chart structures
                if charts:
                    # Check for trending songs
                    if isinstance(charts, dict) and "trending" in charts:
                        trending = charts["trending"]
                        if "songs" in trending and trending["songs"]:
                            for song in trending["songs"][:6]:
                                song_data = self._format_song_data(song)
                                if song_data:
                                    trending_songs.append(song_data)
                    
                    # If no trending songs found, try other chart sections
                    if not trending_songs and isinstance(charts, dict):
                        for section_key in ["trending", "videos", "artists"]:
                            if section_key in charts:
                                section = charts[section_key]
                                if isinstance(section, dict) and "songs" in section:
                                    for song in section["songs"][:6]:
                                        song_data = self._format_song_data(song)
                                        if song_data:
                                            trending_songs.append(song_data)
                                    if trending_songs:
                                        break
                
                if trending_songs:
                    return trending_songs
            except Exception as chart_error:
                print(f"Charts API failed: {chart_error}", file=sys.stderr)
            
            # Fallback: search for popular songs in Indonesian
            popular_queries = ["lagu indonesia terpopuler", "hits indonesia", "lagu trending"]
            for query in popular_queries:
                try:
                    results = self.search_songs(query, 6)
                    if results:
                        return results
                except:
                    continue
            
            return []
        except Exception as e:
            print(f"Error getting charts: {e}", file=sys.stderr)
            return []
    
    def get_song_details(self, video_id: str) -> Dict[str, Any] | None:
        """Get detailed information about a specific song"""
        try:
            song = self.ytmusic.get_song(video_id)
            if song:
                return {
                    "id": video_id,
                    "title": song.get("title", ""),
                    "artist": self._get_artist_name(song.get("artists", [])),
                    "duration": self._get_duration_seconds(song.get("duration")),
                    "thumbnail": self._get_thumbnail_url(song.get("thumbnails", [])),
                    "audioUrl": f"https://music.youtube.com/watch?v={video_id}"
                }
            return None
        except Exception as e:
            print(f"Error getting song details: {e}", file=sys.stderr)
            return None
    
    def _get_artist_name(self, artists: List[Dict]) -> str:
        """Extract artist name from artists array"""
        if artists and len(artists) > 0:
            return artists[0].get("name", "Unknown Artist")
        return "Unknown Artist"
    
    def _get_duration_seconds(self, duration: str | None) -> int:
        """Convert duration string (MM:SS) to seconds"""
        if not duration:
            return 0
        try:
            parts = duration.split(":")
            if len(parts) == 2:
                minutes, seconds = parts
                return int(minutes) * 60 + int(seconds)
            elif len(parts) == 3:
                hours, minutes, seconds = parts
                return int(hours) * 3600 + int(minutes) * 60 + int(seconds)
        except (ValueError, IndexError):
            pass
        return 0
    
    def _get_thumbnail_url(self, thumbnails: List[Dict]) -> str:
        """Get the best quality thumbnail URL"""
        if thumbnails and len(thumbnails) > 0:
            # Get the highest quality thumbnail
            return thumbnails[-1].get("url", "")
        return ""

def main():
    """Main CLI interface for the YTMusic service"""
    if len(sys.argv) < 2:
        print("Usage: python ytmusic_service.py <command> [args...]")
        sys.exit(1)
    
    service = YTMusicService()
    command = sys.argv[1]
    
    try:
        if command == "search":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Query required"}))
                sys.exit(1)
            query = sys.argv[2]
            limit = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            result = service.search_songs(query, limit)
            print(json.dumps({"songs": result}))
        
        elif command == "charts":
            country = sys.argv[2] if len(sys.argv) > 2 else "ID"
            result = service.get_charts(country)
            print(json.dumps({"songs": result}))
        
        elif command == "song":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Video ID required"}))
                sys.exit(1)
            video_id = sys.argv[2]
            result = service.get_song_details(video_id)
            print(json.dumps({"song": result}))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()