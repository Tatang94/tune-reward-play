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

      <Tabs defaultValue="header" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12 p-1">
          <TabsTrigger value="header" className="text-sm px-4">Header Script</TabsTrigger>
          <TabsTrigger value="footer" className="text-sm px-4">Footer Script</TabsTrigger>
          <TabsTrigger value="banner" className="text-sm px-4">Banner Ads</TabsTrigger>
          <TabsTrigger value="popup" className="text-sm px-4">Popup/Native</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <Label htmlFor="header-script" className="text-lg font-semibold">
                  Header Script (Dipasang di &lt;head&gt;)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Script yang akan dipasang di bagian header website. Biasanya untuk tracking atau meta ads.
              </p>
              <Textarea
                id="header-script"
                placeholder="Masukkan script Adsterra untuk header..."
                value={adSettings.headerScript}
                onChange={(e) => handleScriptChange('headerScript', e.target.value)}
                className="min-h-[140px] font-mono text-sm p-4"
              />
              {showPreview && adSettings.headerScript && (
                <div className="bg-muted p-4 rounded-lg border">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Preview:</Label>
                  <pre className="text-xs mt-2 whitespace-pre-wrap break-all leading-relaxed">
                    {adSettings.headerScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <Label htmlFor="footer-script" className="text-lg font-semibold">
                  Footer Script (Dipasang sebelum &lt;/body&gt;)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Script yang akan dipasang di bagian footer website. Biasanya untuk analytics atau ads tracking.
              </p>
              <Textarea
                id="footer-script"
                placeholder="Masukkan script Adsterra untuk footer..."
                value={adSettings.footerScript}
                onChange={(e) => handleScriptChange('footerScript', e.target.value)}
                className="min-h-[140px] font-mono text-sm p-4"
              />
              {showPreview && adSettings.footerScript && (
                <div className="bg-muted p-4 rounded-lg border">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Preview:</Label>
                  <pre className="text-xs mt-2 whitespace-pre-wrap break-all leading-relaxed">
                    {adSettings.footerScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="banner" className="space-y-6">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <Label htmlFor="banner-script" className="text-lg font-semibold">
                  Banner Ads Script
                </Label>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Script untuk banner ads yang akan ditampilkan di halaman utama.
              </p>
              <Textarea
                id="banner-script"
                placeholder="Masukkan script banner ads Adsterra..."
                value={adSettings.bannerScript}
                onChange={(e) => handleScriptChange('bannerScript', e.target.value)}
                className="min-h-[140px] font-mono text-sm p-4"
              />
              {showPreview && adSettings.bannerScript && (
                <div className="bg-muted p-4 rounded-lg border">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Preview:</Label>
                  <pre className="text-xs mt-2 whitespace-pre-wrap break-all leading-relaxed">
                    {adSettings.bannerScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="popup" className="space-y-6">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <Label htmlFor="popup-script" className="text-lg font-semibold">
                  Popup/Native Ads Script
                </Label>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Script untuk popup ads, native ads, atau push notifications.
              </p>
              <Textarea
                id="popup-script"
                placeholder="Masukkan script popup/native ads Adsterra..."
                value={adSettings.popupScript}
                onChange={(e) => handleScriptChange('popupScript', e.target.value)}
                className="min-h-[140px] font-mono text-sm p-4"
              />
              {showPreview && adSettings.popupScript && (
                <div className="bg-muted p-4 rounded-lg border">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Preview:</Label>
                  <pre className="text-xs mt-2 whitespace-pre-wrap break-all leading-relaxed">
                    {adSettings.popupScript}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={saveAdSettings}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 px-8 py-3"
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>

      {/* Tips Card */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 mt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Tips Penggunaan:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 leading-relaxed">
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