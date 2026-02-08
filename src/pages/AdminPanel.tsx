import { useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, type Client, type Talent, type Campaign, type NewClient, type NewTalent, type NewCampaign, type ContentItem } from '@/lib/adminApi';

// Import JSON data for dev mode
import clientsData from '@/data/clients.json';
import talentsData from '@/data/talents.json';
import campaignsData from '@/data/campaigns.json';

const isDevelopment = import.meta.env.DEV;
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Plus, LogOut, User, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Google Client ID - this should be set in environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError('No credential received');
      return;
    }

    const result = await login(credentialResponse.credential);
    if (!result.success) {
      setError(result.error || 'Login failed');
      toast({
        title: 'Login Failed',
        description: result.error || 'Unable to authenticate',
        variant: 'destructive',
      });
    }
  };

  const handleError = () => {
    setError('Google login failed');
    toast({
      title: 'Login Error',
      description: 'Google login failed. Please try again.',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Sign in with your authorized Google account to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </div>
            ) : GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            ) : (
              <div className="text-center text-red-500 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Google Client ID not configured.</p>
                <p className="text-xs mt-1">Please set VITE_GOOGLE_CLIENT_ID in environment variables.</p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Only authorized email addresses can access this panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientForm({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewClient>({
    name: '',
    logoUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDevelopment) {
      toast({
        title: 'Development Mode',
        description: 'Adding data only works in production. Deploy to Vercel to enable this feature.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    const result = await adminApi.addClient(token, formData);
    
    if (result.success) {
      toast({
        title: 'Client Added',
        description: `${formData.name} has been added successfully.`,
      });
      setFormData({ name: '', logoUrl: '' });
      onSuccess();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add client',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name *</Label>
        <Input
          id="clientName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., סמסונג"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL *</Label>
        <Input
          id="logoUrl"
          type="url"
          value={formData.logoUrl}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
          required
        />
      </div>
      
      {formData.logoUrl && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">Preview:</p>
          <img 
            src={formData.logoUrl} 
            alt="Logo preview" 
            className="h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </>
        )}
      </Button>
    </form>
  );
}

function TalentForm({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewTalent>({
    name: '',
    category: '',
    bio: '',
    imageUrl: '',
    platformFollowers: { youtube: 0, instagram: 0, tiktok: 0 },
    audience: { age: '', gender: '' },
    socialMedia: { youtube: '', instagram: '', tiktok: '' },
    previousCollaborations: [],
    strengths: [],
  });
  const [collaborationsInput, setCollaborationsInput] = useState('');
  const [strengthsInput, setStrengthsInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDevelopment) {
      toast({
        title: 'Development Mode',
        description: 'Adding data only works in production. Deploy to Vercel to enable this feature.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    const talentData: NewTalent = {
      ...formData,
      previousCollaborations: collaborationsInput.split(',').map(s => s.trim()).filter(Boolean),
      strengths: strengthsInput.split(',').map(s => s.trim()).filter(Boolean),
    };

    const result = await adminApi.addTalent(token, talentData);
    
    if (result.success) {
      toast({
        title: 'Talent Added',
        description: `${formData.name} has been added successfully.`,
      });
      setFormData({
        name: '',
        category: '',
        bio: '',
        imageUrl: '',
        platformFollowers: { youtube: 0, instagram: 0, tiktok: 0 },
        audience: { age: '', gender: '' },
        socialMedia: { youtube: '', instagram: '', tiktok: '' },
        previousCollaborations: [],
        strengths: [],
      });
      setCollaborationsInput('');
      setStrengthsInput('');
      onSuccess();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add talent',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="talentName">Name *</Label>
          <Input
            id="talentName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., מיכל מצוב"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., גיימינג ותוכן"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="תיאור קצר על הטאלנט..."
          required
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL *</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="/talents/name.png or https://..."
          required
        />
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Platform Followers</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="youtubeFollowers">YouTube</Label>
            <Input
              id="youtubeFollowers"
              type="number"
              min="0"
              value={formData.platformFollowers.youtube || ''}
              onChange={(e) => setFormData({
                ...formData,
                platformFollowers: { ...formData.platformFollowers, youtube: parseInt(e.target.value) || 0 }
              })}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagramFollowers">Instagram</Label>
            <Input
              id="instagramFollowers"
              type="number"
              min="0"
              value={formData.platformFollowers.instagram || ''}
              onChange={(e) => setFormData({
                ...formData,
                platformFollowers: { ...formData.platformFollowers, instagram: parseInt(e.target.value) || 0 }
              })}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tiktokFollowers">TikTok</Label>
            <Input
              id="tiktokFollowers"
              type="number"
              min="0"
              value={formData.platformFollowers.tiktok || ''}
              onChange={(e) => setFormData({
                ...formData,
                platformFollowers: { ...formData.platformFollowers, tiktok: parseInt(e.target.value) || 0 }
              })}
              placeholder="0"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Audience</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="audienceAge">Age Range *</Label>
            <Input
              id="audienceAge"
              value={formData.audience.age}
              onChange={(e) => setFormData({
                ...formData,
                audience: { ...formData.audience, age: e.target.value }
              })}
              placeholder="e.g., 12-28"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audienceGender">Gender Distribution *</Label>
            <Input
              id="audienceGender"
              value={formData.audience.gender}
              onChange={(e) => setFormData({
                ...formData,
                audience: { ...formData.audience, gender: e.target.value }
              })}
              placeholder="e.g., 60% נשים, 40% גברים"
              required
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h4 className="font-medium">Social Media Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              type="url"
              value={formData.socialMedia.youtube || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, youtube: e.target.value }
              })}
              placeholder="https://youtube.com/@..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input
              id="instagramUrl"
              type="url"
              value={formData.socialMedia.instagram || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, instagram: e.target.value }
              })}
              placeholder="https://instagram.com/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">TikTok URL</Label>
            <Input
              id="tiktokUrl"
              type="url"
              value={formData.socialMedia.tiktok || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, tiktok: e.target.value }
              })}
              placeholder="https://tiktok.com/@..."
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="collaborations">Previous Collaborations</Label>
          <Input
            id="collaborations"
            value={collaborationsInput}
            onChange={(e) => setCollaborationsInput(e.target.value)}
            placeholder="Brand 1, Brand 2, Brand 3..."
          />
          <p className="text-xs text-gray-500">Separate with commas</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="strengths">Strengths/Tags</Label>
          <Input
            id="strengths"
            value={strengthsInput}
            onChange={(e) => setStrengthsInput(e.target.value)}
            placeholder="#GAMING, #LIFESTYLE, #TRAVEL..."
          />
          <p className="text-xs text-gray-500">Separate with commas</p>
        </div>
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Talent
          </>
        )}
      </Button>
    </form>
  );
}

function CampaignForm({ token, clients, talents, onSuccess }: { 
  token: string; 
  clients: Client[]; 
  talents: Talent[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<NewCampaign, 'content'>>({
    title: '',
    clientId: '',
    description: '',
    imageUrl: '',
    category: '',
    talents: [],
    platforms: [],
    startDate: '',
    endDate: '',
    details: { objective: '', strategy: '', results: '' },
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const addContentItem = () => {
    setContentItems([...contentItems, {
      url: '',
      type: 'short-form-video',
      description: '',
      platform: 'youtube',
      views: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      talent: '',
    }]);
  };

  const updateContentItem = (index: number, field: keyof ContentItem, value: string | number) => {
    const updated = [...contentItems];
    updated[index] = { ...updated[index], [field]: value };
    setContentItems(updated);
  };

  const removeContentItem = (index: number) => {
    setContentItems(contentItems.filter((_, i) => i !== index));
  };

  const toggleTalent = (talentId: string) => {
    setSelectedTalents(prev => 
      prev.includes(talentId) 
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDevelopment) {
      toast({
        title: 'Development Mode',
        description: 'Adding data only works in production. Deploy to Vercel to enable this feature.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    const campaignData: NewCampaign = {
      ...formData,
      talents: selectedTalents,
      platforms: selectedPlatforms,
      content: contentItems,
    };

    const result = await adminApi.addCampaign(token, campaignData);
    
    if (result.success) {
      toast({
        title: 'Campaign Added',
        description: `${formData.title} has been added successfully.`,
      });
      setFormData({
        title: '',
        clientId: '',
        description: '',
        imageUrl: '',
        category: '',
        talents: [],
        platforms: [],
        startDate: '',
        endDate: '',
        details: { objective: '', strategy: '', results: '' },
      });
      setContentItems([]);
      setSelectedTalents([]);
      setSelectedPlatforms([]);
      onSuccess();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add campaign',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignTitle">Title *</Label>
          <Input
            id="campaignTitle"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., קמפיין גיימינג לוג'יטק"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientId">Client *</Label>
          <Select 
            value={formData.clientId} 
            onValueChange={(value) => setFormData({ ...formData, clientId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaignDescription">Description *</Label>
        <Textarea
          id="campaignDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="תיאור הקמפיין..."
          required
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignImage">Image URL *</Label>
          <Input
            id="campaignImage"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="campaignCategory">Category *</Label>
          <Input
            id="campaignCategory"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., קמפיין גיימינג"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Select Talents *</h4>
        <div className="flex flex-wrap gap-2">
          {talents.map(talent => (
            <Badge
              key={talent.id}
              variant={selectedTalents.includes(talent.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTalent(talent.id)}
            >
              {talent.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Select Platforms *</h4>
        <div className="flex flex-wrap gap-2">
          {['youtube', 'instagram', 'tiktok'].map(platform => (
            <Badge
              key={platform}
              variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => togglePlatform(platform)}
            >
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Content Items</h4>
          <Button type="button" variant="outline" size="sm" onClick={addContentItem}>
            <Plus className="w-4 h-4 mr-1" /> Add Content
          </Button>
        </div>
        
        {contentItems.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Content #{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContentItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input
                    type="url"
                    value={item.url}
                    onChange={(e) => updateContentItem(index, 'url', e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select 
                    value={item.type} 
                    onValueChange={(value) => updateContentItem(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-form-video">Short-form Video</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform *</Label>
                  <Select 
                    value={item.platform} 
                    onValueChange={(value) => updateContentItem(index, 'platform', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Talent *</Label>
                  <Select 
                    value={item.talent} 
                    onValueChange={(value) => updateContentItem(index, 'talent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select talent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {talents.map(talent => (
                        <SelectItem key={talent.id} value={talent.id}>
                          {talent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description *</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateContentItem(index, 'description', e.target.value)}
                  placeholder="תיאור התוכן..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Views</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.views || ''}
                    onChange={(e) => updateContentItem(index, 'views', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Likes</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.likes || ''}
                    onChange={(e) => updateContentItem(index, 'likes', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.comments || ''}
                    onChange={(e) => updateContentItem(index, 'comments', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saves</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.saves || ''}
                    onChange={(e) => updateContentItem(index, 'saves', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shares</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.shares || ''}
                    onChange={(e) => updateContentItem(index, 'shares', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Campaign Details</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objective">Objective *</Label>
            <Textarea
              id="objective"
              value={formData.details.objective}
              onChange={(e) => setFormData({
                ...formData,
                details: { ...formData.details, objective: e.target.value }
              })}
              placeholder="מטרת הקמפיין..."
              required
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy *</Label>
            <Textarea
              id="strategy"
              value={formData.details.strategy}
              onChange={(e) => setFormData({
                ...formData,
                details: { ...formData.details, strategy: e.target.value }
              })}
              placeholder="אסטרטגיית הקמפיין..."
              required
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="results">Results *</Label>
            <Textarea
              id="results"
              value={formData.details.results}
              onChange={(e) => setFormData({
                ...formData,
                details: { ...formData.details, results: e.target.value }
              })}
              placeholder="תוצאות הקמפיין..."
              required
              rows={2}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Campaign
          </>
        )}
      </Button>
    </form>
  );
}

// Delete confirmation dialog component
function DeleteConfirmDialog({ 
  itemType, 
  itemName, 
  onConfirm, 
  isDeleting,
  children 
}: { 
  itemType: string;
  itemName: string;
  onConfirm: () => void;
  isDeleting: boolean;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            ⚠️ Delete {itemType}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>"{itemName}"</strong>?
            </p>
            <p className="text-red-500 font-medium">
              This action cannot be undone from the admin panel. 
              However, you can recover it by reverting to a previous deployment in Vercel or using git.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Manage section component for viewing and deleting items
function ManageSection({ 
  token, 
  clients, 
  talents, 
  campaigns,
  onDataChange 
}: { 
  token: string;
  clients: Client[];
  talents: Talent[];
  campaigns: Campaign[];
  onDataChange: () => void;
}) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clients' | 'talents' | 'campaigns'>('clients');

  const handleDelete = async (type: 'client' | 'talent' | 'campaign', id: string, name: string) => {
    if (isDevelopment) {
      toast({
        title: 'Development Mode',
        description: 'Deleting data only works in production. Deploy to Vercel to enable this feature.',
        variant: 'destructive',
      });
      return;
    }

    setDeletingId(id);

    let result;
    switch (type) {
      case 'client':
        result = await adminApi.deleteClient(token, id);
        break;
      case 'talent':
        result = await adminApi.deleteTalent(token, id);
        break;
      case 'campaign':
        result = await adminApi.deleteCampaign(token, id);
        break;
    }

    if (result.success) {
      toast({
        title: 'Deleted Successfully',
        description: `${name} has been deleted. You can recover it from Vercel deployments or git if needed.`,
      });
      onDataChange();
    } else {
      toast({
        title: 'Delete Failed',
        description: result.error || `Failed to delete ${type}`,
        variant: 'destructive',
      });
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === 'clients' ? 'default' : 'outline'}
          onClick={() => setActiveTab('clients')}
        >
          Clients ({clients.length})
        </Button>
        <Button
          variant={activeTab === 'talents' ? 'default' : 'outline'}
          onClick={() => setActiveTab('talents')}
        >
          Talents ({talents.length})
        </Button>
        <Button
          variant={activeTab === 'campaigns' ? 'default' : 'outline'}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns ({campaigns.length})
        </Button>
      </div>

      {/* Clients List */}
      {activeTab === 'clients' && (
        <div className="space-y-2">
          {clients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No clients found</p>
          ) : (
            clients.map(client => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-4">
                  {client.logoUrl && (
                    <img 
                      src={client.logoUrl} 
                      alt={client.name} 
                      className="w-10 h-10 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-gray-500">ID: {client.id}</p>
                  </div>
                </div>
                <DeleteConfirmDialog
                  itemType="Client"
                  itemName={client.name}
                  onConfirm={() => handleDelete('client', client.id, client.name)}
                  isDeleting={deletingId === client.id}
                >
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DeleteConfirmDialog>
              </div>
            ))
          )}
        </div>
      )}

      {/* Talents List */}
      {activeTab === 'talents' && (
        <div className="space-y-2">
          {talents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No talents found</p>
          ) : (
            talents.map(talent => (
              <div key={talent.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-4">
                  {talent.imageUrl && (
                    <img 
                      src={talent.imageUrl} 
                      alt={talent.name} 
                      className="w-10 h-10 object-cover rounded-full"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <p className="font-medium">{talent.name}</p>
                    <p className="text-xs text-gray-500">{talent.category} • {talent.totalFollowers?.toLocaleString() || 0} followers</p>
                  </div>
                </div>
                <DeleteConfirmDialog
                  itemType="Talent"
                  itemName={talent.name}
                  onConfirm={() => handleDelete('talent', talent.id, talent.name)}
                  isDeleting={deletingId === talent.id}
                >
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DeleteConfirmDialog>
              </div>
            ))
          )}
        </div>
      )}

      {/* Campaigns List */}
      {activeTab === 'campaigns' && (
        <div className="space-y-2">
          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No campaigns found</p>
          ) : (
            campaigns.map(campaign => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-4">
                  {campaign.imageUrl && (
                    <img 
                      src={campaign.imageUrl} 
                      alt={campaign.title} 
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-xs text-gray-500">
                      {campaign.category} • {campaign.platforms?.join(', ') || 'No platforms'}
                    </p>
                  </div>
                </div>
                <DeleteConfirmDialog
                  itemType="Campaign"
                  itemName={campaign.title}
                  onConfirm={() => handleDelete('campaign', campaign.id, campaign.title)}
                  isDeleting={deletingId === campaign.id}
                >
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DeleteConfirmDialog>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadData = async () => {
    if (!token) return;
    
    setIsLoadingData(true);
    
    // In development mode, load data directly from JSON files
    if (isDevelopment) {
      setClients(clientsData as Client[]);
      setTalents(talentsData as Talent[]);
      setCampaigns(campaignsData as Campaign[]);
      setIsLoadingData(false);
      return;
    }
    
    // Production mode: use API
    const [clientsResult, talentsResult, campaignsResult] = await Promise.all([
      adminApi.getClients(token),
      adminApi.getTalents(token),
      adminApi.getCampaigns(token),
    ]);
    
    // Check if any request has an auth error (token expired)
    const hasAuthError = clientsResult.isAuthError || talentsResult.isAuthError || campaignsResult.isAuthError;
    
    if (hasAuthError) {
      toast({
        title: 'Session Expired',
        description: 'Your login session has expired. Please sign in again.',
        variant: 'destructive',
      });
      logout();
      setIsLoadingData(false);
      return;
    }
    
    const errors: string[] = [];
    
    if (clientsResult.success && clientsResult.data) {
      setClients(clientsResult.data.clients);
    } else {
      errors.push(`Clients: ${clientsResult.error || 'Failed to load'}`);
    }
    
    if (talentsResult.success && talentsResult.data) {
      setTalents(talentsResult.data.talents);
    } else {
      errors.push(`Talents: ${talentsResult.error || 'Failed to load'}`);
    }
    
    if (campaignsResult.success && campaignsResult.data) {
      setCampaigns(campaignsResult.data.campaigns);
    } else {
      errors.push(`Campaigns: ${campaignsResult.error || 'Failed to load'}`);
    }
    
    if (errors.length > 0) {
      toast({
        title: 'Failed to load some data',
        description: errors.join(', '),
        variant: 'destructive',
      });
    }
    
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleRebuild = async () => {
    if (!token) return;
    
    if (isDevelopment) {
      toast({
        title: 'Development Mode',
        description: 'Rebuild only works in production. Deploy to Vercel to enable this feature.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsRebuilding(true);
    
    const result = await adminApi.triggerRebuild(token, 'all');
    
    if (result.success) {
      toast({
        title: 'Rebuild Triggered',
        description: 'Site rebuild and metrics update have been initiated.',
      });
    } else {
      toast({
        title: 'Rebuild Failed',
        description: result.error || 'Failed to trigger rebuild',
        variant: 'destructive',
      });
    }
    
    setIsRebuilding(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dev Mode Banner */}
      {isDevelopment && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm">
          <strong>Development Mode</strong> - Data viewing works, but adding/saving requires deployment to Vercel
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Butterfly Admin Panel</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleRebuild}
              disabled={isRebuilding}
            >
              {isRebuilding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rebuilding...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Data
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {user?.picture && (
                <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
              )}
              <span>{user?.email}</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clients">Add Client</TabsTrigger>
            <TabsTrigger value="talents">Add Talent</TabsTrigger>
            <TabsTrigger value="campaigns">Add Campaign</TabsTrigger>
            <TabsTrigger value="manage" className="text-red-600 data-[state=active]:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" /> Manage
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Add New Client</CardTitle>
                <CardDescription>
                  Add a new client to the clients list. The client will be available for campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {token && <ClientForm token={token} onSuccess={loadData} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="talents">
            <Card>
              <CardHeader>
                <CardTitle>Add New Talent</CardTitle>
                <CardDescription>
                  Add a new talent to the roster with their social media stats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {token && <TalentForm token={token} onSuccess={loadData} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Add New Campaign</CardTitle>
                <CardDescription>
                  Create a new campaign with content, talents, and KPIs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : token ? (
                  <CampaignForm 
                    token={token} 
                    clients={clients} 
                    talents={talents}
                    onSuccess={loadData}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  Manage & Delete Entries
                </CardTitle>
                <CardDescription>
                  View and delete existing entries. <strong className="text-amber-600">Deletions can be recovered</strong> by reverting to a previous Vercel deployment or using git history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : token ? (
                  <ManageSection
                    token={token}
                    clients={clients}
                    talents={talents}
                    campaigns={campaigns}
                    onDataChange={loadData}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminPanel() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-2" />
            <CardTitle>Configuration Required</CardTitle>
            <CardDescription>
              The admin panel requires a Google Client ID to be configured.
              Please set the VITE_GOOGLE_CLIENT_ID environment variable.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {isAuthenticated ? <AdminDashboard /> : <LoginScreen />}
    </GoogleOAuthProvider>
  );
}
