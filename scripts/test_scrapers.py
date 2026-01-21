#!/usr/bin/env python3
"""Test and debug YouTube subscriber and Instagram scrapers"""

import requests
import re
import sys
import os
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    os.system('chcp 65001 > nul 2>&1')

try:
    import yt_dlp
except ImportError:
    yt_dlp = None
    print("yt-dlp not installed")


def test_youtube_subscribers_ytdlp(channel_url):
    """Test getting YouTube subscribers using yt-dlp"""
    print(f"\n{'='*60}")
    print(f"Testing YouTube channel: {channel_url}")
    print(f"{'='*60}")
    
    if yt_dlp is None:
        print("ERROR: yt-dlp not installed")
        return
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(channel_url, download=False)
            
            print(f"\nChannel info retrieved!")
            print(f"  Title: {info.get('title', 'N/A')}")
            print(f"  Channel: {info.get('channel', 'N/A')}")
            print(f"  Uploader: {info.get('uploader', 'N/A')}")
            print(f"  Channel ID: {info.get('channel_id', 'N/A')}")
            print(f"  Subscriber count: {info.get('channel_follower_count', 'N/A')}")
            print(f"  View count: {info.get('view_count', 'N/A')}")
            
            # Print all keys to see what's available
            print(f"\n  Available keys: {list(info.keys())[:20]}...")
            
            return info.get('channel_follower_count')
            
    except Exception as e:
        print(f"ERROR: {e}")
        return None


def test_youtube_subscribers_web(channel_url):
    """Test getting YouTube subscribers using web scraping"""
    print(f"\nTesting web scraping method...")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    })
    
    try:
        response = session.get(channel_url, timeout=10)
        print(f"  Status: {response.status_code}")
        print(f"  HTML length: {len(response.text)}")
        
        text = response.text
        
        # Try multiple patterns
        patterns = [
            (r'"subscriberCountText":\{"simpleText":"([^"]+)"\}', 'subscriberCountText simpleText'),
            (r'"subscriberCountText":\{[^}]*"label":"([^"]+)"', 'subscriberCountText label'),
            (r'(\d+(?:\.\d+)?[KMB]?)\s*subscribers', 'X subscribers'),
            (r'"channel_follower_count":(\d+)', 'channel_follower_count'),
        ]
        
        for pattern, name in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                print(f"  Found via '{name}': {match.group(1)}")
            else:
                print(f"  Not found: '{name}'")
        
    except Exception as e:
        print(f"  ERROR: {e}")


def test_instagram_embed(url):
    """Test Instagram embed endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing Instagram: {url}")
    print(f"{'='*60}")
    
    # Extract shortcode
    match = re.search(r'instagram\.com/(?:p|reel|tv)/([A-Za-z0-9_-]+)', url)
    if not match:
        match = re.search(r'instagram\.com/[^/]+/(?:p|reel)/([A-Za-z0-9_-]+)', url)
    
    if not match:
        print("ERROR: Could not extract shortcode")
        return
    
    shortcode = match.group(1)
    print(f"Shortcode: {shortcode}")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    })
    
    # Try embed endpoint
    embed_url = f"https://www.instagram.com/p/{shortcode}/embed/"
    print(f"\nTrying: {embed_url}")
    
    try:
        response = session.get(embed_url, timeout=15)
        print(f"Status: {response.status_code}")
        print(f"HTML length: {len(response.text)}")
        
        html = response.text
        
        # Save for debugging
        with open(f'debug_instagram_{shortcode}.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Saved to debug_instagram_{shortcode}.html")
        
        # Try to find likes
        like_patterns = [
            (r'"like_count"\s*:\s*(\d+)', 'like_count'),
            (r'"edge_liked_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)', 'edge_liked_by'),
            (r'"edge_media_preview_like"\s*:\s*\{\s*"count"\s*:\s*(\d+)', 'edge_media_preview_like'),
            (r'>(\d[\d,]*)<[^>]*>\s*likes?<', 'HTML likes'),
            (r'(\d[\d,]*)\s+likes?', 'X likes text'),
        ]
        
        print("\nSearching for likes:")
        for pattern, name in like_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                print(f"  [FOUND] {name}: {match.group(1)}")
            else:
                print(f"  [NOT FOUND] {name}")
        
        # Try to find views
        view_patterns = [
            (r'"video_view_count"\s*:\s*(\d+)', 'video_view_count'),
            (r'"play_count"\s*:\s*(\d+)', 'play_count'),
            (r'(\d[\d,]*)\s+views?', 'X views text'),
        ]
        
        print("\nSearching for views:")
        for pattern, name in view_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                print(f"  [FOUND] {name}: {match.group(1)}")
            else:
                print(f"  [NOT FOUND] {name}")
        
        # Look for any JSON data
        print("\nLooking for embedded JSON...")
        json_match = re.search(r'window\.__additionalDataLoaded\([^,]+,\s*(\{.+?\})\);', html)
        if json_match:
            print("  Found __additionalDataLoaded JSON!")
            try:
                data = json.loads(json_match.group(1))
                print(f"  Keys: {list(data.keys())}")
            except:
                print("  Could not parse JSON")
        
    except Exception as e:
        print(f"ERROR: {e}")


def test_instagram_ytdlp(url):
    """Test Instagram using yt-dlp"""
    print(f"\n{'='*60}")
    print(f"Testing Instagram with yt-dlp: {url}")
    print(f"{'='*60}")
    
    if yt_dlp is None:
        print("ERROR: yt-dlp not installed")
        return
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if info:
                print(f"  Title: {info.get('title', 'N/A')[:50] if info.get('title') else 'N/A'}")
                print(f"  Views: {info.get('view_count', 'N/A')}")
                print(f"  Likes: {info.get('like_count', 'N/A')}")
                print(f"  Comments: {info.get('comment_count', 'N/A')}")
                print(f"\n  Keys: {list(info.keys())[:15]}...")
                return info
            else:
                print("  No data returned")
                
    except Exception as e:
        print(f"  ERROR: {e}")
    
    return None


if __name__ == '__main__':
    # Test YouTube channels
    youtube_channels = [
        "https://www.youtube.com/@GalCohenOfficial",
        "https://www.youtube.com/@israelgalitsky", 
        "https://www.youtube.com/@2BOF",
        "https://www.youtube.com/@firewolff",
    ]
    
    print("\n" + "="*60)
    print("TESTING YOUTUBE SUBSCRIBER COUNT (yt-dlp)")
    print("="*60)
    
    for url in youtube_channels:
        test_youtube_subscribers_ytdlp(url)
    
    # Test Instagram with yt-dlp
    instagram_posts = [
        "https://www.instagram.com/p/DNiMuYVIL7C/",
        "https://www.instagram.com/mrshibolet/reel/DMIHafuNjBw/",
        "https://www.instagram.com/reel/DM-I-75CDfa/",
    ]
    
    print("\n" + "="*60)
    print("TESTING INSTAGRAM (yt-dlp)")
    print("="*60)
    
    for url in instagram_posts:
        test_instagram_ytdlp(url)
