#!/usr/bin/env python3
"""
Update campaigns.json and talents.json with live metrics from validation_report.json
"""

import json
import sys
import os
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    os.system('chcp 65001 > nul 2>&1')

def main():
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'src' / 'data'
    
    # Load files
    with open(script_dir / 'validation_report.json', 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    with open(data_dir / 'campaigns.json', 'r', encoding='utf-8') as f:
        campaigns = json.load(f)
    
    with open(data_dir / 'talents.json', 'r', encoding='utf-8') as f:
        talents = json.load(f)
    
    # Build lookup for video results (only YouTube and TikTok with valid data)
    video_updates = {}
    for v in report['video_results']:
        if v['live_views'] is not None and v['platform'] in ['youtube', 'tiktok']:
            # Normalize URL (remove tracking params for matching)
            url = v['url'].split('?')[0] if '?' in v['url'] and 'shorts' not in v['url'] else v['url']
            video_updates[v['url']] = {
                'views': v['live_views'],
                'likes': v['live_likes']
            }
    
    # Build lookup for channel results (only YouTube and TikTok with valid data)
    channel_updates = {}
    for c in report['channel_results']:
        if c['live_followers'] is not None and c['live_followers'] > 0 and c['platform'] in ['youtube', 'tiktok']:
            key = (c['talent_name'], c['platform'])
            channel_updates[key] = c['live_followers']
    
    # Update campaigns
    campaigns_updated = 0
    for campaign in campaigns:
        for content in campaign.get('content', []):
            url = content.get('url', '')
            if url in video_updates:
                old_views = content.get('views', 0)
                old_likes = content.get('likes', 0)
                new_views = video_updates[url]['views']
                new_likes = video_updates[url]['likes']
                
                if new_views and new_views != old_views:
                    content['views'] = new_views
                    campaigns_updated += 1
                if new_likes and new_likes != old_likes:
                    content['likes'] = new_likes
    
    print(f"Updated {campaigns_updated} content items in campaigns.json")
    
    # Fix YouTube URLs and update follower counts in talents
    youtube_url_fixes = {
        "ישראל גליצקי": "https://www.youtube.com/@israelgalitsky",
        "גל כהן": "https://www.youtube.com/@GalCohenOfficial",
        "דוד ששון (2BOF)": "https://www.youtube.com/@2BOF",
    }
    
    talents_updated = 0
    for talent in talents:
        name = talent.get('name', '')
        
        # Fix YouTube URLs
        if name in youtube_url_fixes:
            if 'socialMedia' in talent and 'youtube' in talent['socialMedia']:
                old_url = talent['socialMedia']['youtube']
                new_url = youtube_url_fixes[name]
                if old_url != new_url:
                    talent['socialMedia']['youtube'] = new_url
                    print(f"Fixed YouTube URL for {name}: {old_url} -> {new_url}")
        
        # Update follower counts
        platform_followers = talent.get('platformFollowers', {})
        
        # Update TikTok followers
        key_tiktok = (name, 'tiktok')
        if key_tiktok in channel_updates:
            old_count = platform_followers.get('tiktok', 0)
            new_count = channel_updates[key_tiktok]
            if new_count != old_count:
                platform_followers['tiktok'] = new_count
                talents_updated += 1
                print(f"Updated {name} TikTok: {old_count:,} -> {new_count:,}")
        
        # Update YouTube followers
        key_youtube = (name, 'youtube')
        if key_youtube in channel_updates:
            old_count = platform_followers.get('youtube', 0)
            new_count = channel_updates[key_youtube]
            if new_count != old_count:
                platform_followers['youtube'] = new_count
                talents_updated += 1
                print(f"Updated {name} YouTube: {old_count:,} -> {new_count:,}")
    
    # Special case: Update ישראל גליצקי YouTube followers (was wrong channel)
    for talent in talents:
        if talent['name'] == 'ישראל גליצקי':
            # The 212,000 was from wrong channel detection, need to verify manually
            # For now, keeping the value from the validation which detected the correct channel
            pass
    
    print(f"Updated {talents_updated} follower counts in talents.json")
    
    # Recalculate campaign KPIs
    for campaign in campaigns:
        content_items = campaign.get('content', [])
        if content_items:
            total_views = sum(c.get('views', 0) for c in content_items)
            total_engagement = sum(
                c.get('likes', 0) + c.get('comments', 0) + c.get('saves', 0)
                for c in content_items
            )
            total_shares = sum(c.get('shares', 0) for c in content_items)
            
            campaign['kpis']['views'] = total_views
            campaign['kpis']['engagement'] = total_engagement
            campaign['kpis']['shares'] = total_shares
            campaign['kpis']['reach'] = total_views
            campaign['kpis']['impressions'] = total_views
    
    # Recalculate total followers for talents
    for talent in talents:
        platform_followers = talent.get('platformFollowers', {})
        total = sum(platform_followers.values())
        talent['totalFollowers'] = total
    
    # Save updated files
    with open(data_dir / 'campaigns.json', 'w', encoding='utf-8') as f:
        json.dump(campaigns, f, indent=2, ensure_ascii=False)
    print(f"\nSaved updated campaigns.json")
    
    with open(data_dir / 'talents.json', 'w', encoding='utf-8') as f:
        json.dump(talents, f, indent=2, ensure_ascii=False)
    print(f"Saved updated talents.json")


if __name__ == '__main__':
    main()
