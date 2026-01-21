#!/usr/bin/env python3
"""Quick validation for Instagram links only"""

import json
import re
import sys
import os
import time
from pathlib import Path
import requests

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    os.system('chcp 65001 > nul 2>&1')


def extract_shortcode(url):
    """Extract shortcode from Instagram URL"""
    patterns = [
        r'instagram\.com/(?:p|reel|tv)/([A-Za-z0-9_-]+)',
        r'instagram\.com/[^/]+/(?:p|reel|tv)/([A-Za-z0-9_-]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_instagram_stats(url):
    """Get Instagram post stats using embed endpoint"""
    shortcode = extract_shortcode(url)
    if not shortcode:
        return None, None, 'Could not extract shortcode'
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    })
    
    try:
        embed_url = f"https://www.instagram.com/p/{shortcode}/embed/"
        response = session.get(embed_url, timeout=15)
        
        if response.status_code != 200:
            return None, None, f'HTTP {response.status_code}'
        
        html = response.text
        
        # Find likes - multiple patterns
        likes = None
        like_patterns = [
            r'"like_count"\s*:\s*(\d+)',
            r'"edge_liked_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
            r'"edge_media_preview_like"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
            r'(\d[\d,]*)\s+likes?(?:\s|<)',  # "1,234 likes"
        ]
        
        for pattern in like_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                likes_str = match.group(1).replace(',', '')
                likes = int(likes_str)
                break
        
        # Find views - multiple patterns
        views = None
        view_patterns = [
            r'"video_view_count"\s*:\s*(\d+)',
            r'"play_count"\s*:\s*(\d+)',
            r'(\d[\d,]*)\s+views?(?:\s|<)',  # "1,234 views"
        ]
        
        for pattern in view_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                views_str = match.group(1).replace(',', '')
                views = int(views_str)
                break
        
        return views, likes, None
        
    except Exception as e:
        return None, None, str(e)[:40]


def main():
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'src' / 'data'
    
    with open(data_dir / 'campaigns.json', 'r', encoding='utf-8') as f:
        campaigns = json.load(f)
    
    # Collect all Instagram URLs
    instagram_items = []
    for campaign in campaigns:
        for content in campaign.get('content', []):
            if content.get('platform') == 'instagram':
                url = content.get('url', '')
                if '/stories/' not in url:  # Skip stories
                    instagram_items.append({
                        'url': url,
                        'stored_views': content.get('views', 0),
                        'stored_likes': content.get('likes', 0),
                        'campaign': campaign.get('title', 'Unknown'),
                    })
    
    print(f"Found {len(instagram_items)} Instagram items to validate\n")
    print("-" * 80)
    
    results = []
    for i, item in enumerate(instagram_items, 1):
        url = item['url']
        print(f"[{i}/{len(instagram_items)}] {url[:60]}...")
        
        views, likes, error = get_instagram_stats(url)
        
        if error:
            print(f"  [X] Error: {error}")
            results.append({'url': url, 'error': error})
        elif likes is None:
            print(f"  [?] Could not get likes")
            results.append({'url': url, 'error': 'No likes found'})
        else:
            stored_likes = item['stored_likes']
            diff = ((likes - stored_likes) / stored_likes * 100) if stored_likes > 0 else 0
            
            status = "[OK]" if abs(diff) < 20 else "[!!]"
            print(f"  {status} Likes: {stored_likes:,} -> {likes:,} ({diff:+.1f}%)")
            if views:
                print(f"       Views: {item['stored_views']:,} -> {views:,}")
            
            results.append({
                'url': url,
                'stored_likes': stored_likes,
                'live_likes': likes,
                'stored_views': item['stored_views'],
                'live_views': views,
            })
        
        time.sleep(1)  # Rate limiting
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    success = [r for r in results if 'error' not in r]
    errors = [r for r in results if 'error' in r]
    
    print(f"Successful: {len(success)}/{len(results)}")
    print(f"Errors: {len(errors)}/{len(results)}")
    
    # Save results
    with open(script_dir / 'instagram_validation.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nResults saved to instagram_validation.json")


if __name__ == '__main__':
    main()
