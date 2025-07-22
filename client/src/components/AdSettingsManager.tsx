import { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AdSettings {
  headerScript: string;
  footerScript: string;
  bannerScript: string;
  popupScript: string;
  isEnabled: boolean;
}

export function AdSettingsManager() {
  const [adSettings, setAdSettings] = useState<AdSettings>({
    headerScript: '',
    footerScript: '',
    bannerScript: '',
    popupScript: '',
    isEnabled: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAdSettings();
  }, []);

  const loadAdSettings = async () => {
    try {
      const response = await fetch('/api/admin/ad-settings');
      if (response.ok) {
        const data = await response.json();
        setAdSettings(data.settings || {
          headerScript: '',
          footerScript: '',
          bannerScript: '',
          popupScript: '',
          isEnabled: false
        });
      }
    } catch (error) {
      console.error('Failed to load ad settings:', error);
    }
  };

  const saveAdSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/ad-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adSettings)
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Pengaturan iklan telah disimpan",
          className: "bg-success text-success-foreground"
        });
      } else {
        throw new Error('Failed to save ad settings');
      }
    } catch (error) {
      console.error('Failed to save ad settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan iklan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScriptChange = (type: keyof AdSettings, value: string) => {
    setAdSettings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const toggleAdsEnabled = () => {
    setAdSettings(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pengaturan Iklan Adsterra</h2>
            <p className="text-sm text-muted-foreground">Kelola script iklan untuk website</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={adSettings.isEnabled ? "default" : "outline"}
            onClick={toggleAdsEnabled}
            className={adSettings.isEnabled ? "bg-success hover:bg-success/90" : ""}
          >
            {adSettings.isEnabled ? "Iklan Aktif" : "Iklan Nonaktif"}
          </Button>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Sembunyikan" : "Preview"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="header" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="header">Header Script</TabsTrigger>
          <TabsTrigger value="footer">Footer Script</TabsTrigger>
          <TabsTrigger value="banner">Banner Ads</TabsTrigger>
          <TabsTrigger value="popup">Popup/Native</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <Label htmlFor="header-script" className="text-base font-medium">
                  Header Script (Dipasang di &lt;head&gt;)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Script yang akan dipasang di bagian header website. Biasanya untuk tracking atau meta ads.
              </p>
              <Textarea
                id="header-script"
                placeholder="Masukkan script Adsterra untuk header..."
                value={adSettings.headerScript}
                onChange={(e) => handleScriptChange('headerScript', e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              {showPreview && adSettings.headerScript && (
                <div className="bg-muted p-3 rounded-lg">
                  <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                  <pre className="text-xs mt-1 whitespace-pre-wrap break-all">
                    {adSettings.headerScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <Label htmlFor="footer-script" className="text-base font-medium">
                  Footer Script (Dipasang sebelum &lt;/body&gt;)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Script yang akan dipasang di bagian footer website. Biasanya untuk analytics atau ads tracking.
              </p>
              <Textarea
                id="footer-script"
                placeholder="Masukkan script Adsterra untuk footer..."
                value={adSettings.footerScript}
                onChange={(e) => handleScriptChange('footerScript', e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              {showPreview && adSettings.footerScript && (
                <div className="bg-muted p-3 rounded-lg">
                  <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                  <pre className="text-xs mt-1 whitespace-pre-wrap break-all">
                    {adSettings.footerScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="banner" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <Label htmlFor="banner-script" className="text-base font-medium">
                  Banner Ads Script
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Script untuk banner ads yang akan ditampilkan di halaman utama.
              </p>
              <Textarea
                id="banner-script"
                placeholder="Masukkan script banner ads Adsterra..."
                value={adSettings.bannerScript}
                onChange={(e) => handleScriptChange('bannerScript', e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              {showPreview && adSettings.bannerScript && (
                <div className="bg-muted p-3 rounded-lg">
                  <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                  <pre className="text-xs mt-1 whitespace-pre-wrap break-all">
                    {adSettings.bannerScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="popup" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <Label htmlFor="popup-script" className="text-base font-medium">
                  Popup/Native Ads Script
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Script untuk popup ads, native ads, atau push notifications.
              </p>
              <Textarea
                id="popup-script"
                placeholder="Masukkan script popup/native ads Adsterra..."
                value={adSettings.popupScript}
                onChange={(e) => handleScriptChange('popupScript', e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              {showPreview && adSettings.popupScript && (
                <div className="bg-muted p-3 rounded-lg">
                  <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                  <pre className="text-xs mt-1 whitespace-pre-wrap break-all">
                    {adSettings.popupScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={saveAdSettings}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>

      {/* Tips Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="space-y-3">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Tips Penggunaan:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Header Script: Untuk script tracking dan meta ads</li>
            <li>• Footer Script: Untuk analytics dan ads tracking</li>
            <li>• Banner Ads: Untuk iklan display yang muncul di halaman</li>
            <li>• Popup/Native: Untuk popup ads dan push notifications</li>
            <li>• Pastikan script valid sebelum menyimpan</li>
            <li>• Gunakan Preview untuk melihat script sebelum disimpan</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}