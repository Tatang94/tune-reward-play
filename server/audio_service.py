#!/usr/bin/env python3
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import io
import asyncio
from typing import Generator

app = FastAPI(title="Audio Streaming Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_audio_stream(video_id: str) -> Generator[bytes, None, None]:
    """Generator to stream audio data from YouTube"""
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'extractaudio': True,
        'audioformat': 'mp3',
        'outtmpl': '-',
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # Get video info
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            # Get the best audio URL
            audio_url = None
            for format_info in info.get('formats', []):
                if format_info.get('acodec') != 'none':  # Has audio
                    audio_url = format_info.get('url')
                    break
            
            if not audio_url:
                raise HTTPException(status_code=404, detail="No audio stream found")
            
            # Stream the audio data
            import requests
            response = requests.get(audio_url, stream=True)
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    yield chunk
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to stream audio: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Audio Streaming Service", "status": "running"}

@app.get("/stream/{video_id}")
async def stream_audio(video_id: str):
    """Stream audio for a given YouTube video ID"""
    try:
        def generate():
            return get_audio_stream(video_id)
        
        return StreamingResponse(
            generate(), 
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=audio_{video_id}.mp3",
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/info/{video_id}")
async def get_audio_info(video_id: str):
    """Get audio information for a YouTube video"""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            return {
                "video_id": video_id,
                "title": info.get('title', 'Unknown'),
                "duration": info.get('duration', 0),
                "uploader": info.get('uploader', 'Unknown'),
                "stream_url": f"/stream/{video_id}",
                "youtube_url": f"https://www.youtube.com/watch?v={video_id}",
                "youtube_music_url": f"https://music.youtube.com/watch?v={video_id}"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get video info: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)