#!/usr/bin/env python3
"""Test Instagram oEmbed API for getting post data"""

import requests
import re
import sys
import os
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    os.system('chcp 65001 > nul 2>&1')

def test_oembed(url):
    """Test Instagram oEmbed endpoint"""
    print(f"\nTesting oEmbed for: {url}")
    
    # Instagram oEmbed endpoint
    oembed_url = f"https://api.instagram.com/oembed/?url={url}"
    
    try:
        response = requests.get(oembed_url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Title: {data.get('title', 'N/A')[:50]}")
            print(f"Author: {data.get('author_name', 'N/A')}")
            print(f"Type: {data.get('type', 'N/A')}")
            print(f"Full response: {json.dumps(data, indent=2)[:500]}")
            return data
        else:
            print(f"Error response: {response.text[:200]}")
            
    except Exception as e:
        print(f"Error: {e}")
    
    return None

def test_embed_html(url):
    """Try to get metrics from Instagram embed page"""
    print(f"\nTesting embed page for: {url}")
    
    # Extract shortcode
    match = re.search(r'instagram\.com/(?:p|reel)/([A-Za-z0-9_-]+)', url)
    if not match:
        print("Could not extract shortcode")
        return None
    
    shortcode = match.group(1)
    embed_url = f"https://www.instagram.com/p/{shortcode}/embed/"
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    })
    
    try:
        response = session.get(embed_url, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"HTML length: {len(response.text)}")
        
        html = response.text
        
        # Save for inspection
        with open(f'embed_{shortcode}.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Saved to embed_{shortcode}.html")
        
        # Look for like count in embed
        like_patterns = [
            r'"like_count"\s*:\s*(\d+)',
            r'(\d+)\s*likes?',
            r'"edge_liked_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
        ]
        
        for pattern in like_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                likes = int(match.group(1))
                print(f"Found likes: {likes:,}")
                return likes
        
        # Look for any numbers that might be metrics
        print("\nSearching for potential metrics...")
        for match in re.finditer(r'"(\w*count\w*)"\s*:\s*(\d+)', html):
            print(f"  {match.group(1)}: {match.group(2)}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    return None


if __name__ == '__main__':
    test_urls = [
        "https://www.instagram.com/p/DNiMuYVIL7C/",
        "https://www.instagram.com/reel/DM-I-75CDfa/",
    ]
    
    print("="*60)
    print("Testing oEmbed API")
    print("="*60)
    
    for url in test_urls:
        test_oembed(url)
    
    print("\n" + "="*60)
    print("Testing Embed HTML")
    print("="*60)
    
    for url in test_urls:
        test_embed_html(url)
