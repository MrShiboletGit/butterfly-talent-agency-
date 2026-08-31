#!/usr/bin/env python3
"""
Social Media Metrics Validator
Validates views, likes, and follower counts from campaigns.json and talents.json
against live data from YouTube, TikTok, and Instagram.
"""

import json
import re
import time
import sys
import os
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

# Fix Windows console encoding for Unicode output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    os.system('chcp 65001 > nul 2>&1')

def log(msg: str):
    """Print with timestamp and flush immediately"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}", flush=True)

# Third-party imports - install with: pip install requests yt-dlp beautifulsoup4 instaloader
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install requests beautifulsoup4 yt-dlp instaloader")
    sys.exit(1)

try:
    import yt_dlp
except ImportError:
    yt_dlp = None
    print("Warning: yt-dlp not installed. YouTube validation will be limited.")
    print("  Install with: pip install yt-dlp")

try:
    import instaloader
except ImportError:
    instaloader = None
    print("Warning: instaloader not installed. Instagram validation will be limited.")
    print("  Install with: pip install instaloader")


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class VideoMetrics:
    """Metrics for a single video"""
    url: str
    platform: str
    stored_views: int
    stored_likes: int
    live_views: Optional[int] = None
    live_likes: Optional[int] = None
    error: Optional[str] = None


@dataclass
class ChannelMetrics:
    """Metrics for a talent's channel"""
    talent_name: str
    platform: str
    url: str
    stored_followers: int
    live_followers: Optional[int] = None
    error: Optional[str] = None


# ============================================================================
# YouTube Scraper
# ============================================================================

class YouTubeScraper:
    """Scrapes YouTube video and channel statistics using yt-dlp"""
    
    def __init__(self):
        pass
    
    def get_video_stats(self, url: str) -> dict:
        """Get video views and likes using yt-dlp"""
        if yt_dlp is None:
            return {'error': 'yt-dlp not installed'}
        
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'skip_download': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    'views': info.get('view_count'),
                    'likes': info.get('like_count'),
                    'title': info.get('title'),
                }
        except Exception as e:
            return {'error': str(e)[:50]}
    
    @staticmethod
    def _expected_identity(url: str) -> tuple:
        """Identify which channel a URL is *supposed* to resolve to.

        Returns ('handle', 'benkeysar') / ('channel_id', 'UC...') / (None, None).
        Bare vanity URLs (youtube.com/rainbowqueen) carry no verifiable
        identity, so they return (None, None) and skip the check.
        """
        match = re.search(r'youtube\.com/@([A-Za-z0-9._-]+)', url)
        if match:
            return ('handle', match.group(1).lower())

        match = re.search(r'youtube\.com/channel/(UC[\w-]+)', url)
        if match:
            return ('channel_id', match.group(1))

        return (None, None)

    def get_channel_subscribers(self, url: str) -> dict:
        """Get channel subscriber count using yt-dlp.

        Creators often run several channels (e.g. @BenKeysar vs @TechKeysar).
        We verify the channel yt-dlp resolved is the one the URL asked for, so a
        redirect or edited URL can never silently write another channel's count
        over a correct one. On mismatch we return an error, which makes
        update_metrics.py skip the talent and keep the stored value.
        """
        if yt_dlp is None:
            return {'error': 'yt-dlp not installed'}

        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,  # Don't download videos, just get channel info
                'skip_download': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                kind, expected = self._expected_identity(url)
                if kind == 'handle':
                    actual = (info.get('uploader_id') or '').lstrip('@').lower()
                    if actual and actual != expected:
                        return {'error': f'channel mismatch: want @{expected}, got @{actual}'}
                elif kind == 'channel_id':
                    actual = info.get('channel_id') or ''
                    if actual and actual != expected:
                        return {'error': f'channel mismatch: want {expected}, got {actual}'}

                subscriber_count = info.get('channel_follower_count')
                if subscriber_count:
                    return {
                        'subscribers': subscriber_count,
                        'channel_name': info.get('channel') or info.get('uploader'),
                    }

                return {'error': 'No subscriber count found'}

        except Exception as e:
            return {'error': str(e)[:50]}


# ============================================================================
# TikTok Scraper
# ============================================================================

class TikTokScraper:
    """Scrapes TikTok video and profile statistics"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        })
    
    def get_video_stats(self, url: str) -> dict:
        """Get TikTok video views and likes"""
        # TikTok requires special handling due to dynamic content
        # Using yt-dlp which supports TikTok
        if yt_dlp is None:
            return {'error': 'yt-dlp not installed (required for TikTok)'}
        
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'skip_download': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    'views': info.get('view_count'),
                    'likes': info.get('like_count'),
                    'title': info.get('title'),
                }
        except Exception as e:
            return {'error': str(e)}
    
    def get_profile_followers(self, url: str) -> dict:
        """Get TikTok profile follower count"""
        try:
            # Extract username from URL
            username = self._extract_username(url)
            if not username:
                return {'error': 'Could not extract username from URL'}
            
            profile_url = f'https://www.tiktok.com/@{username}'
            
            response = self.session.get(profile_url)
            response.raise_for_status()
            
            # Try to find follower count in page
            text = response.text
            
            # Look for follower count patterns
            patterns = [
                r'"followerCount":(\d+)',
                r'"stats":\{[^}]*"followerCount":(\d+)',
                r'(\d+(?:[.,]\d+)?[KMB]?)\s*Followers',
            ]
            
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    count_str = match.group(1)
                    return {'followers': self._parse_count(count_str)}
            
            return {'error': 'Could not find follower count'}
            
        except Exception as e:
            return {'error': str(e)}
    
    def _extract_username(self, url: str) -> Optional[str]:
        """Extract username from TikTok URL"""
        match = re.search(r'tiktok\.com/@([^/\?]+)', url)
        return match.group(1) if match else None
    
    def _parse_count(self, count_str: str) -> int:
        """Parse count string to integer"""
        count_str = str(count_str).replace(',', '').strip()
        multiplier = 1
        
        if 'B' in count_str.upper():
            multiplier = 1_000_000_000
            count_str = count_str.upper().replace('B', '')
        elif 'M' in count_str.upper():
            multiplier = 1_000_000
            count_str = count_str.upper().replace('M', '')
        elif 'K' in count_str.upper():
            multiplier = 1_000
            count_str = count_str.upper().replace('K', '')
        
        try:
            return int(float(count_str) * multiplier)
        except ValueError:
            return 0


# ============================================================================
# Instagram Scraper (using yt-dlp)
# ============================================================================

class InstagramScraper:
    """Scrapes Instagram post statistics using yt-dlp"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        })
    
    def get_post_stats(self, url: str) -> dict:
        """Get Instagram post/reel stats using yt-dlp"""
        if yt_dlp is None:
            return {'error': 'yt-dlp not installed'}
        
        # First try yt-dlp
        result = self._get_stats_ytdlp(url)
        if 'error' not in result or result.get('likes') is not None:
            return result
        
        # Fallback to embed scraping
        return self._get_stats_embed(url)
    
    def _get_stats_ytdlp(self, url: str) -> dict:
        """Try to get stats using yt-dlp"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'skip_download': True,
                'ignoreerrors': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if info:
                    return {
                        'views': info.get('view_count'),
                        'likes': info.get('like_count'),
                        'title': info.get('title', '')[:50] if info.get('title') else None,
                    }
                return {'error': 'No data returned'}
                
        except Exception as e:
            error_msg = str(e)[:50]
            # Check if it's a login required error
            if 'login' in error_msg.lower() or '401' in error_msg:
                return {'error': 'Login required'}
            return {'error': error_msg}
    
    def _get_stats_embed(self, url: str) -> dict:
        """Fallback: try embed endpoint"""
        try:
            shortcode = self._extract_shortcode(url)
            if not shortcode:
                return {'error': 'Could not extract shortcode'}
            
            embed_url = f"https://www.instagram.com/p/{shortcode}/embed/"
            response = self.session.get(embed_url, timeout=15)
            
            if response.status_code != 200:
                return {'error': f'HTTP {response.status_code}'}
            
            html = response.text
            likes = None
            views = None
            
            # Try to find likes
            like_patterns = [
                r'"like_count"\s*:\s*(\d+)',
                r'"edge_liked_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
            ]
            
            for pattern in like_patterns:
                match = re.search(pattern, html)
                if match:
                    likes = int(match.group(1))
                    break
            
            # Try to find views
            view_patterns = [
                r'"video_view_count"\s*:\s*(\d+)',
                r'"play_count"\s*:\s*(\d+)',
            ]
            
            for pattern in view_patterns:
                match = re.search(pattern, html)
                if match:
                    views = int(match.group(1))
                    break
            
            if likes is not None:
                return {'views': views, 'likes': likes}
            
            return {'error': 'No metrics found in embed'}
            
        except Exception as e:
            return {'error': str(e)[:50]}
    
    def get_profile_followers(self, url: str) -> dict:
        """Get Instagram profile follower count"""
        return {'error': 'Profile followers require login'}
    
    def _extract_shortcode(self, url: str) -> Optional[str]:
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


# ============================================================================
# Main Validator
# ============================================================================

class MetricsValidator:
    """Main validator that coordinates scraping and comparison"""
    
    def __init__(self, campaigns_path: str, talents_path: str):
        self.campaigns_path = Path(campaigns_path)
        self.talents_path = Path(talents_path)
        
        self.youtube = YouTubeScraper()
        self.tiktok = TikTokScraper()
        self.instagram = InstagramScraper()
        
        self.video_results: list[VideoMetrics] = []
        self.channel_results: list[ChannelMetrics] = []
        
        # Rate limiting delay (seconds between requests)
        # Higher delay to avoid rate limiting from social media platforms
        self.delay = 5
    
    def load_data(self) -> tuple[list, list]:
        """Load campaigns and talents JSON files"""
        with open(self.campaigns_path, 'r', encoding='utf-8') as f:
            campaigns = json.load(f)
        
        with open(self.talents_path, 'r', encoding='utf-8') as f:
            talents = json.load(f)
        
        return campaigns, talents
    
    def validate_campaigns(self, campaigns: list):
        """Validate all video content from campaigns"""
        log("="*60)
        log("VALIDATING CAMPAIGN CONTENT")
        log("="*60)
        
        total_content = sum(len(c.get('content', [])) for c in campaigns)
        log(f"Found {total_content} content items to validate")
        
        item_count = 0
        for campaign in campaigns:
            campaign_title = campaign.get('title', 'Unknown')
            content_items = campaign.get('content', [])
            
            if not content_items:
                continue
            
            log(f"")
            log(f"[CAMPAIGN] {campaign_title}")
            log("-" * 40)
            
            for item in content_items:
                item_count += 1
                url = item.get('url', '')
                platform = item.get('platform', '').lower()
                stored_views = item.get('views', 0)
                stored_likes = item.get('likes', 0)
                
                # Skip stories (not accessible)
                if '/stories/' in url:
                    log(f"  [{item_count}/{total_content}] [SKIP] Story: {url[:40]}...")
                    continue
                
                log(f"  [{item_count}/{total_content}] Fetching {platform}...")
                
                # Get live stats based on platform
                fetch_start = time.time()
                stats = self._get_video_stats(url, platform)
                fetch_time = time.time() - fetch_start
                
                metric = VideoMetrics(
                    url=url,
                    platform=platform,
                    stored_views=stored_views,
                    stored_likes=stored_likes,
                    live_views=stats.get('views'),
                    live_likes=stats.get('likes'),
                    error=stats.get('error'),
                )
                self.video_results.append(metric)
                
                self._print_video_result(metric, fetch_time)
                log(f"      Waiting {self.delay}s before next request...")
                time.sleep(self.delay)
    
    def validate_talents(self, talents: list):
        """Validate follower counts for all talents"""
        log("")
        log("="*60)
        log("VALIDATING TALENT FOLLOWERS")
        log("="*60)
        
        talent_count = 0
        total_talents = len(talents)
        
        for talent in talents:
            talent_count += 1
            name = talent.get('name', 'Unknown')
            social_media = talent.get('socialMedia', {})
            platform_followers = talent.get('platformFollowers', {})
            
            log(f"")
            log(f"[TALENT {talent_count}/{total_talents}] {name}")
            log("-" * 40)
            
            for platform, url in social_media.items():
                # Skip secondary channels (youtube2, etc.)
                if '2' in platform:
                    continue
                
                platform_key = platform.lower()
                stored_followers = platform_followers.get(platform_key, 0)
                
                if not url or not stored_followers:
                    continue
                
                log(f"  Fetching {platform}...")
                
                fetch_start = time.time()
                stats = self._get_channel_stats(url, platform_key)
                fetch_time = time.time() - fetch_start
                
                metric = ChannelMetrics(
                    talent_name=name,
                    platform=platform_key,
                    url=url,
                    stored_followers=stored_followers,
                    live_followers=stats.get('followers') or stats.get('subscribers'),
                    error=stats.get('error'),
                )
                self.channel_results.append(metric)
                
                self._print_channel_result(metric, fetch_time)
                log(f"      Waiting {self.delay}s...")
                time.sleep(self.delay)
    
    def _get_video_stats(self, url: str, platform: str) -> dict:
        """Get video stats based on platform"""
        if platform == 'youtube':
            return self.youtube.get_video_stats(url)
        elif platform == 'tiktok':
            return self.tiktok.get_video_stats(url)
        elif platform == 'instagram':
            return self.instagram.get_post_stats(url)
        else:
            return {'error': f'Unknown platform: {platform}'}
    
    def _get_channel_stats(self, url: str, platform: str) -> dict:
        """Get channel/profile stats based on platform"""
        if platform == 'youtube':
            return self.youtube.get_channel_subscribers(url)
        elif platform == 'tiktok':
            return self.tiktok.get_profile_followers(url)
        elif platform == 'instagram':
            return self.instagram.get_profile_followers(url)
        else:
            return {'error': f'Unknown platform: {platform}'}
    
    def _print_video_result(self, metric: VideoMetrics, fetch_time: float = 0):
        """Print video validation result"""
        time_str = f" ({fetch_time:.1f}s)" if fetch_time > 0 else ""
        
        if metric.error:
            log(f"      [X] Error{time_str}: {metric.error[:50]}...")
            return
        
        if metric.live_views is None:
            log(f"      [?] Could not retrieve live data{time_str}")
            return
        
        views_diff = self._calculate_diff(metric.stored_views, metric.live_views)
        likes_diff = self._calculate_diff(metric.stored_likes, metric.live_likes)
        
        status = "[OK]" if abs(views_diff) < 20 else "[!!]"
        
        log(f"      {status} Views: {metric.stored_views:,} -> {metric.live_views:,} ({views_diff:+.1f}%){time_str}")
        if metric.live_likes:
            log(f"           Likes: {metric.stored_likes:,} -> {metric.live_likes:,} ({likes_diff:+.1f}%)")
    
    def _print_channel_result(self, metric: ChannelMetrics, fetch_time: float = 0):
        """Print channel validation result"""
        time_str = f" ({fetch_time:.1f}s)" if fetch_time > 0 else ""
        
        if metric.error:
            log(f"      [X] Error{time_str}: {metric.error[:50]}...")
            return
        
        if metric.live_followers is None:
            log(f"      [?] Could not retrieve live data{time_str}")
            return
        
        diff = self._calculate_diff(metric.stored_followers, metric.live_followers)
        status = "[OK]" if abs(diff) < 20 else "[!!]"
        
        log(f"      {status} Followers: {metric.stored_followers:,} -> {metric.live_followers:,} ({diff:+.1f}%){time_str}")
    
    def _calculate_diff(self, stored: int, live: Optional[int]) -> float:
        """Calculate percentage difference"""
        if live is None or stored == 0:
            return 0.0
        return ((live - stored) / stored) * 100
    
    def generate_report(self) -> str:
        """Generate a summary report"""
        report = []
        report.append("\n" + "="*60)
        report.append("VALIDATION SUMMARY REPORT")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("="*60)
        
        # Video stats summary
        report.append("\nVIDEO CONTENT SUMMARY")
        report.append("-"*40)
        
        video_errors = [v for v in self.video_results if v.error]
        video_success = [v for v in self.video_results if not v.error]
        
        report.append(f"  Total checked: {len(self.video_results)}")
        report.append(f"  Successful: {len(video_success)}")
        report.append(f"  Errors: {len(video_errors)}")
        
        if video_success:
            # Find significant discrepancies
            discrepancies = []
            for v in video_success:
                if v.live_views:
                    diff = self._calculate_diff(v.stored_views, v.live_views)
                    if abs(diff) > 20:
                        discrepancies.append((v, diff))
            
            if discrepancies:
                report.append(f"\n  [!] Significant discrepancies (>20%):")
                for v, diff in sorted(discrepancies, key=lambda x: abs(x[1]), reverse=True)[:10]:
                    report.append(f"    - {v.platform}: {v.stored_views:,} vs {v.live_views:,} ({diff:+.1f}%)")
                    report.append(f"      URL: {v.url[:60]}...")
        
        # Channel stats summary
        report.append("\n\nTALENT FOLLOWERS SUMMARY")
        report.append("-"*40)
        
        channel_errors = [c for c in self.channel_results if c.error]
        channel_success = [c for c in self.channel_results if not c.error]
        
        report.append(f"  Total checked: {len(self.channel_results)}")
        report.append(f"  Successful: {len(channel_success)}")
        report.append(f"  Errors: {len(channel_errors)}")
        
        if channel_success:
            discrepancies = []
            for c in channel_success:
                if c.live_followers:
                    diff = self._calculate_diff(c.stored_followers, c.live_followers)
                    if abs(diff) > 10:
                        discrepancies.append((c, diff))
            
            if discrepancies:
                report.append(f"\n  [!] Significant discrepancies (>10%):")
                for c, diff in sorted(discrepancies, key=lambda x: abs(x[1]), reverse=True):
                    report.append(f"    - {c.talent_name} ({c.platform}): {c.stored_followers:,} vs {c.live_followers:,} ({diff:+.1f}%)")
        
        return "\n".join(report)
    
    def save_detailed_report(self, output_path: str):
        """Save detailed JSON report"""
        report_data = {
            'generated_at': datetime.now().isoformat(),
            'video_results': [
                {
                    'url': v.url,
                    'platform': v.platform,
                    'stored_views': v.stored_views,
                    'stored_likes': v.stored_likes,
                    'live_views': v.live_views,
                    'live_likes': v.live_likes,
                    'error': v.error,
                    'views_diff_pct': self._calculate_diff(v.stored_views, v.live_views) if v.live_views else None,
                }
                for v in self.video_results
            ],
            'channel_results': [
                {
                    'talent_name': c.talent_name,
                    'platform': c.platform,
                    'url': c.url,
                    'stored_followers': c.stored_followers,
                    'live_followers': c.live_followers,
                    'error': c.error,
                    'diff_pct': self._calculate_diff(c.stored_followers, c.live_followers) if c.live_followers else None,
                }
                for c in self.channel_results
            ]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        log(f"Detailed report saved to: {output_path}")


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate social media metrics')
    parser.add_argument('--talents-only', action='store_true', help='Only validate talent followers')
    parser.add_argument('--campaigns-only', action='store_true', help='Only validate campaign content')
    args = parser.parse_args()
    
    # Determine paths relative to this script
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'src' / 'data'
    
    campaigns_path = data_dir / 'campaigns.json'
    talents_path = data_dir / 'talents.json'
    
    # Check files exist
    if not campaigns_path.exists():
        log(f"[ERROR] Campaigns file not found: {campaigns_path}")
        sys.exit(1)
    
    if not talents_path.exists():
        log(f"[ERROR] Talents file not found: {talents_path}")
        sys.exit(1)
    
    mode = "TALENTS ONLY" if args.talents_only else ("CAMPAIGNS ONLY" if args.campaigns_only else "FULL")
    log(f"Social Media Metrics Validator - {mode}")
    log("="*60)
    log(f"Campaigns: {campaigns_path}")
    log(f"Talents: {talents_path}")
    log(f"Delay between requests: 5 seconds")
    
    # Initialize validator
    validator = MetricsValidator(str(campaigns_path), str(talents_path))
    
    # Load data
    log("Loading JSON files...")
    campaigns, talents = validator.load_data()
    log(f"Loaded {len(campaigns)} campaigns and {len(talents)} talents")
    
    if args.talents_only:
        estimated_time = len(talents) * 3 * 2
    elif args.campaigns_only:
        total_content = sum(len(c.get('content', [])) for c in campaigns)
        estimated_time = total_content * 2
    else:
        total_content = sum(len(c.get('content', [])) for c in campaigns)
        estimated_time = total_content * 2 + len(talents) * 3 * 2
    log(f"Estimated time: ~{estimated_time // 60} min {estimated_time % 60} sec")
    
    # Validate
    start_time = time.time()
    
    if not args.talents_only:
        validator.validate_campaigns(campaigns)
    
    if not args.campaigns_only:
        validator.validate_talents(talents)
    
    total_time = time.time() - start_time
    
    log(f"")
    log(f"Validation completed in {total_time:.1f} seconds")
    
    # Generate and print summary
    report = validator.generate_report()
    print(report, flush=True)
    
    # Save detailed JSON report
    output_path = script_dir / 'validation_report.json'
    validator.save_detailed_report(str(output_path))


if __name__ == '__main__':
    main()
