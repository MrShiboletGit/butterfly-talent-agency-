#!/usr/bin/env python3
"""Update campaigns.json with Instagram validation results"""

import json
import sys
import os
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def main():
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'src' / 'data'
    
    # Load Instagram validation results
    with open(script_dir / 'instagram_validation.json', 'r', encoding='utf-8') as f:
        ig_results = json.load(f)
    
    # Build lookup by URL
    ig_lookup = {}
    for r in ig_results:
        if 'error' not in r:
            # Normalize URL for matching
            url = r['url'].split('?')[0]
            if not url.endswith('/'):
                url += '/'
            ig_lookup[url] = r
    
    print(f"Loaded {len(ig_lookup)} valid Instagram results")
    
    # Load campaigns
    with open(data_dir / 'campaigns.json', 'r', encoding='utf-8') as f:
        campaigns = json.load(f)
    
    # Update campaigns
    updated = 0
    for campaign in campaigns:
        for content in campaign.get('content', []):
            if content.get('platform') == 'instagram':
                url = content.get('url', '').split('?')[0]
                if not url.endswith('/'):
                    url += '/'
                
                if url in ig_lookup:
                    result = ig_lookup[url]
                    
                    old_likes = content.get('likes', 0)
                    new_likes = result.get('live_likes')
                    
                    if new_likes and new_likes != old_likes:
                        content['likes'] = new_likes
                        updated += 1
                        print(f"Updated likes: {old_likes:,} -> {new_likes:,} ({url[:50]}...)")
                    
                    # Update views if available
                    new_views = result.get('live_views')
                    if new_views and new_views != content.get('views', 0):
                        content['views'] = new_views
    
    print(f"\nUpdated {updated} Instagram items")
    
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
    
    # Save
    with open(data_dir / 'campaigns.json', 'w', encoding='utf-8') as f:
        json.dump(campaigns, f, indent=2, ensure_ascii=False)
    
    print("Saved updated campaigns.json")


if __name__ == '__main__':
    main()
