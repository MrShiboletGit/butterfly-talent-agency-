#!/usr/bin/env python3
"""Quick test for Instagram scraping"""

import requests
import re
import sys
import os

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    os.system('chcp 65001 > nul 2>&1')

def test_instagram_post(url):
    """Test scraping an Instagram post"""
    print(f"Testing URL: {url}")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    })
    
    try:
        clean_url = url.split('?')[0]
        if not clean_url.endswith('/'):
            clean_url += '/'
        
        print(f"Fetching: {clean_url}")
        response = session.get(clean_url, timeout=15)
        print(f"Status: {response.status_code}")
        
        html = response.text
        print(f"HTML length: {len(html)} chars")
        
        # Save HTML for inspection
        with open('instagram_test.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("Saved HTML to instagram_test.html")
        
        # Try to find metrics
        views = None
        likes = None
        
        # View patterns
        view_patterns = [
            (r'"video_view_count"\s*:\s*(\d+)', 'video_view_count'),
            (r'"play_count"\s*:\s*(\d+)', 'play_count'),
            (r'"view_count"\s*:\s*(\d+)', 'view_count'),
        ]
        
        for pattern, name in view_patterns:
            match = re.search(pattern, html)
            if match:
                views = int(match.group(1))
                print(f"Found views via {name}: {views:,}")
                break
        
        # Like patterns
        like_patterns = [
            (r'"like_count"\s*:\s*(\d+)', 'like_count'),
            (r'"edge_media_preview_like"\s*:\s*\{\s*"count"\s*:\s*(\d+)', 'edge_media_preview_like'),
        ]
        
        for pattern, name in like_patterns:
            match = re.search(pattern, html)
            if match:
                likes = int(match.group(1))
                print(f"Found likes via {name}: {likes:,}")
                break
        
        # Check for login requirement
        if 'login' in html.lower() and ('required' in html.lower() or 'sign in' in html.lower()):
            print("WARNING: Page may require login")
        
        print(f"\nResult: views={views}, likes={likes}")
        return views, likes
        
    except Exception as e:
        print(f"Error: {e}")
        return None, None

if __name__ == '__main__':
    # Test with a real Instagram URL from the campaigns
    test_urls = [
        "https://www.instagram.com/p/DNiMuYVIL7C/",
        "https://www.instagram.com/reel/DM-I-75CDfa/",
    ]
    
    for url in test_urls:
        print("\n" + "="*60)
        test_instagram_post(url)
        print("="*60)
