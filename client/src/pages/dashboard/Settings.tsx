import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Bell,
  Mail,
  Lock,
  Globe,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react'

const SettingSection = ({
  title,
  description,
  icon: Icon,
  children,
  delay = 0
}: {
  title: string
  description: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        {children}
      </CardContent>
    </Card>
  </motion.div>
)

const Settings = () => {
  const [emailSettings, setEmailSettings] = useState({
    dailyDigest: true,
    swapRequests: true,
    messages: true,
    reviews: false
  })

  const [notificationSettings, setNotificationSettings] = useState({
    desktop: true,
    sound: true,
    browser: false
  })

  const [availabilitySettings, setAvailabilitySettings] = useState({
    weekdays: true,
    weekends: true,
    mornings: false,
    afternoons: true,
    evenings: true
  })

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showEmail: false,
    showAvailability: true
  })

  const handleSettingChange = <T extends Record<string, boolean>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T
  ) => (checked: boolean) => {
    setter(prev => ({ ...prev, [key]: checked }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email Notifications */}
        <SettingSection
          title="Email Notifications"
          description="Choose what types of email notifications you'd like to receive"
          icon={Mail}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dailyDigest">Daily Digest</Label>
              <Switch
                id="dailyDigest"
                checked={emailSettings.dailyDigest}
                onCheckedChange={handleSettingChange(setEmailSettings, 'dailyDigest')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="swapRequests">Swap Requests</Label>
              <Switch
                id="swapRequests"
                checked={emailSettings.swapRequests}
                onCheckedChange={handleSettingChange(setEmailSettings, 'swapRequests')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="messages">Messages</Label>
              <Switch
                id="messages"
                checked={emailSettings.messages}
                onCheckedChange={handleSettingChange(setEmailSettings, 'messages')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reviews">Reviews</Label>
              <Switch
                id="reviews"
                checked={emailSettings.reviews}
                onCheckedChange={handleSettingChange(setEmailSettings, 'reviews')}
              />
            </div>
          </div>
        </SettingSection>

        {/* Push Notifications */}
        <SettingSection
          title="Push Notifications"
          description="Configure your push notification preferences"
          icon={Bell}
          delay={0.1}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="desktop">Desktop Notifications</Label>
              <Switch
                id="desktop"
                checked={notificationSettings.desktop}
                onCheckedChange={handleSettingChange(setNotificationSettings, 'desktop')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Notification Sound</Label>
              <Switch
                id="sound"
                checked={notificationSettings.sound}
                onCheckedChange={handleSettingChange(setNotificationSettings, 'sound')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="browser">Browser Notifications</Label>
              <Switch
                id="browser"
                checked={notificationSettings.browser}
                onCheckedChange={handleSettingChange(setNotificationSettings, 'browser')}
              />
            </div>
          </div>
        </SettingSection>

        {/* Availability */}
        <SettingSection
          title="Availability"
          description="Set your general availability for skill swaps"
          icon={Clock}
          delay={0.2}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={availabilitySettings.weekdays ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setAvailabilitySettings(prev => ({
                    ...prev,
                    weekdays: !prev.weekdays
                  }))
                }
              >
                Weekdays
              </Badge>
              <Badge
                variant={availabilitySettings.weekends ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setAvailabilitySettings(prev => ({
                    ...prev,
                    weekends: !prev.weekends
                  }))
                }
              >
                Weekends
              </Badge>
              <Badge
                variant={availabilitySettings.mornings ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setAvailabilitySettings(prev => ({
                    ...prev,
                    mornings: !prev.mornings
                  }))
                }
              >
                Mornings
              </Badge>
              <Badge
                variant={availabilitySettings.afternoons ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setAvailabilitySettings(prev => ({
                    ...prev,
                    afternoons: !prev.afternoons
                  }))
                }
              >
                Afternoons
              </Badge>
              <Badge
                variant={availabilitySettings.evenings ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setAvailabilitySettings(prev => ({
                    ...prev,
                    evenings: !prev.evenings
                  }))
                }
              >
                Evenings
              </Badge>
            </div>
          </div>
        </SettingSection>

        {/* Privacy */}
        <SettingSection
          title="Privacy"
          description="Control your privacy settings and what others can see"
          icon={Globe}
          delay={0.3}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="publicProfile">Public Profile</Label>
              <Switch
                id="publicProfile"
                checked={privacySettings.publicProfile}
                onCheckedChange={handleSettingChange(setPrivacySettings, 'publicProfile')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showEmail">Show Email</Label>
              <Switch
                id="showEmail"
                checked={privacySettings.showEmail}
                onCheckedChange={handleSettingChange(setPrivacySettings, 'showEmail')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showAvailability">Show Availability</Label>
              <Switch
                id="showAvailability"
                checked={privacySettings.showAvailability}
                onCheckedChange={handleSettingChange(setPrivacySettings, 'showAvailability')}
              />
            </div>
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection
          title="Security"
          description="Manage your account security settings"
          icon={Lock}
          delay={0.4}
        >
          <div className="space-y-4">
            <Button variant="outline" className="w-full sm:w-auto">
              Change Password
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Enable Two-Factor Auth
            </Button>
          </div>
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection
          title="Danger Zone"
          description="Irreversible and destructive actions"
          icon={AlertCircle}
          delay={0.5}
        >
          <div className="space-y-4">
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </SettingSection>
      </div>
    </div>
  )
}

export default Settings 