import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Lock,
  Mail,
  Moon,
  Sun,
  User,
  Shield,
  Globe,
  Clock,
  AlertTriangle,
  Trash2,
  ChevronRight,
  CheckCircle2,
  X,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
  BellRing,
  Languages,
  Palette,
  Calendar,
  MessageSquare,
  Repeat2,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { updateUserProfile, updateUserStatus, changePassword, deleteUserAccount } from '@/services/api';
import { toast } from 'sonner';

interface SettingSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

const SettingSection = ({
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
}: SettingSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{title}</h2>
            <p className="text-muted-foreground mb-4">{description}</p>
            {children}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState({
    swapRequests: true,
    messages: true,
    reminders: true,
    marketing: false,
  });
  const [pushNotifications, setPushNotifications] = useState({
    swapRequests: true,
    messages: true,
    reminders: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    showLastSeen: false,
    allowMessages: true,
  });
  const [languagePreference, setLanguagePreference] = useState('en');
  const [timeZone, setTimeZone] = useState('UTC');
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Update profile visibility and online status
      await updateUserProfile({
        isPublic: privacySettings.profileVisible
      });

      // Update user status settings
      await updateUserStatus({
        isOnline: privacySettings.showOnlineStatus
      });

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    try {
      setIsSaving(true);
      await changePassword({
        currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Error changing password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUserAccount();
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to delete account');
      console.error('Error deleting account:', error);
      setIsDeleting(false);
    }
  };

  const NotificationToggle = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </motion.div>

      <div className="grid gap-6">
        {/* Theme & Appearance */}
        <SettingSection
          title="Theme & Appearance"
          description="Customize how Skill Swap looks and feels"
          icon={Palette}
          delay={0.1}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleTheme}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleTheme}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Email Notifications */}
        <SettingSection
          title="Email Notifications"
          description="Choose what emails you'd like to receive"
          icon={Mail}
          delay={0.2}
        >
          <div className="space-y-2">
            <NotificationToggle
              label="Swap Requests"
              checked={emailNotifications.swapRequests}
              onChange={(checked) =>
                setEmailNotifications((prev) => ({ ...prev, swapRequests: checked }))
              }
            />
            <NotificationToggle
              label="New Messages"
              checked={emailNotifications.messages}
              onChange={(checked) =>
                setEmailNotifications((prev) => ({ ...prev, messages: checked }))
              }
            />
            <NotificationToggle
              label="Session Reminders"
              checked={emailNotifications.reminders}
              onChange={(checked) =>
                setEmailNotifications((prev) => ({ ...prev, reminders: checked }))
              }
            />
            <NotificationToggle
              label="Marketing Updates"
              checked={emailNotifications.marketing}
              onChange={(checked) =>
                setEmailNotifications((prev) => ({ ...prev, marketing: checked }))
              }
            />
          </div>
        </SettingSection>

        {/* Push Notifications */}
        <SettingSection
          title="Push Notifications"
          description="Manage your mobile and desktop notifications"
          icon={BellRing}
          delay={0.3}
        >
          <div className="space-y-2">
            <NotificationToggle
              label="Swap Requests"
              checked={pushNotifications.swapRequests}
              onChange={(checked) =>
                setPushNotifications((prev) => ({ ...prev, swapRequests: checked }))
              }
            />
            <NotificationToggle
              label="New Messages"
              checked={pushNotifications.messages}
              onChange={(checked) =>
                setPushNotifications((prev) => ({ ...prev, messages: checked }))
              }
            />
            <NotificationToggle
              label="Session Reminders"
              checked={pushNotifications.reminders}
              onChange={(checked) =>
                setPushNotifications((prev) => ({ ...prev, reminders: checked }))
              }
            />
          </div>
        </SettingSection>

        {/* Privacy */}
        <SettingSection
          title="Privacy"
          description="Control your profile visibility and communication preferences"
          icon={Eye}
          delay={0.4}
        >
          <div className="space-y-2">
            <NotificationToggle
              label="Public Profile"
              checked={privacySettings.profileVisible}
              onChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, profileVisible: checked }))
              }
            />
            <NotificationToggle
              label="Show Online Status"
              checked={privacySettings.showOnlineStatus}
              onChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, showOnlineStatus: checked }))
              }
            />
            <NotificationToggle
              label="Show Last Seen"
              checked={privacySettings.showLastSeen}
              onChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, showLastSeen: checked }))
              }
            />
            <NotificationToggle
              label="Allow Direct Messages"
              checked={privacySettings.allowMessages}
              onChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, allowMessages: checked }))
              }
            />
          </div>
        </SettingSection>

        {/* Language & Region */}
        <SettingSection
          title="Language & Region"
          description="Set your preferred language and time zone"
          icon={Globe}
          delay={0.5}
        >
          <div className="space-y-4">
            <div>
              <Label>Language</Label>
              <select
                value={languagePreference}
                onChange={(e) => setLanguagePreference(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <Label>Time Zone</Label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="IST">India Standard Time</option>
              </select>
            </div>
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection
          title="Security"
          description="Manage your account security settings"
          icon={Shield}
          delay={0.6}
        >
          <div className="space-y-4">
            <div>
              <Label>Session Timeout (minutes)</Label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handlePasswordChange}
                disabled={isSaving || !currentPassword || !newPassword}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection
          title="Danger Zone"
          description="Irreversible and destructive actions"
          icon={AlertTriangle}
          delay={0.7}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
              <div>
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Confirm Delete
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              )}
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings; 