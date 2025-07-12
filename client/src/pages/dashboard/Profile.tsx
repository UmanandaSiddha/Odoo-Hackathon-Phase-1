import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthContext'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Edit2, 
  Plus, 
  X, 
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  BookOpen,
  Users,
  Sparkles,
  CheckCircle,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { updateUserProfile, updateSkills, type UserProfile } from '@/services/api'
import { toast } from 'sonner'

const SkillBadge = ({
  skill,
  onRemove,
  isEditing,
  level
}: {
  skill: string
  onRemove?: () => void
  isEditing?: boolean
  level?: string
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    whileHover={{ scale: 1.05 }}
    className="inline-flex"
  >
    <Badge 
      variant="secondary" 
      className="text-sm py-1 px-3 flex items-center gap-2 group"
    >
      <span>{skill}</span>
      {level && (
        <span className="text-xs text-muted-foreground">• {level}</span>
      )}
      {isEditing && onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
        >
          <X className="h-3 w-3" />
        </motion.button>
      )}
    </Badge>
  </motion.div>
)

const AchievementCard = ({
  title,
  description,
  icon: Icon,
  date,
  delay
}: {
  title: string
  description: string
  icon: React.ElementType
  date: string
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className="p-4 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="font-medium group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
    </Card>
  </motion.div>
)

interface Achievement {
  title: string;
  description: string;
  icon: React.ElementType;
  date: string;
}

interface ExtendedUserProfile extends UserProfile {
  location: string;
  email: string;
  rating?: number;
  reviews?: number;
  totalSwaps?: number;
  hoursSpent?: number;
  completionRate?: number;
  achievements: Achievement[];
}

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [profileData, setProfileData] = useState<ExtendedUserProfile>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    bio: '',
    location: '',
    email: user?.email || '',
    phone: '',
    website: '',
    profilePicture: '',
    isPublic: true,
    skillsOffered: [],
    skillsWanted: [],
    achievements: []
  })

  useEffect(() => {
    // Fetch initial profile data
    const fetchProfile = async () => {
      try {
        const response = await updateUserProfile({});
        setProfileData({
          ...response.user,
          location: [
            response.user.address?.city,
            response.user.address?.state,
            response.user.address?.country
          ].filter(Boolean).join(', ')
        });
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Error loading profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = async (type: 'skills' | 'interests') => {
    if (!newSkill.trim()) return;

    try {
      const skillType = type === 'skills' ? 'offered' : 'wanted';
      const updatedSkills = type === 'skills' 
        ? [...profileData.skillsOffered, { name: newSkill.trim() }]
        : [...profileData.skillsWanted, { name: newSkill.trim() }];

      const response = await updateSkills(
        updatedSkills.map(s => ({ 
          name: s.name, 
          level: 'skillProgress' in s ? s.skillProgress?.level : undefined 
        })),
        skillType
      );

      setProfileData(prev => ({
        ...prev,
        [type === 'skills' ? 'skillsOffered' : 'skillsWanted']: response.user[type === 'skills' ? 'skillsOffered' : 'skillsWanted']
      }));

      setNewSkill('');
      toast.success(`${newSkill} added to your ${type}`);
    } catch (error) {
      toast.error('Failed to add skill');
      console.error('Error adding skill:', error);
    }
  }

  const handleRemoveSkill = async (type: 'skills' | 'interests', skillToRemove: string) => {
    try {
      const skillType = type === 'skills' ? 'offered' : 'wanted';
      const updatedSkills = type === 'skills'
        ? profileData.skillsOffered.filter(skill => skill.name !== skillToRemove)
        : profileData.skillsWanted.filter(skill => skill.name !== skillToRemove);

      const response = await updateSkills(
        updatedSkills.map(s => ({ 
          name: s.name, 
          level: 'skillProgress' in s ? s.skillProgress?.level : undefined 
        })),
        skillType
      );

      setProfileData(prev => ({
        ...prev,
        [type === 'skills' ? 'skillsOffered' : 'skillsWanted']: response.user[type === 'skills' ? 'skillsOffered' : 'skillsWanted']
      }));

      toast.success(`${skillToRemove} removed from your ${type}`);
    } catch (error) {
      toast.error('Failed to remove skill');
      console.error('Error removing skill:', error);
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const [city, state, country] = profileData.location.split(',').map(s => s.trim());
      
      const response = await updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        website: profileData.website,
        phone: profileData.phone,
        isPublic: profileData.isPublic,
        address: {
          city,
          state,
          country
        }
      });

      setProfileData({
        ...response.user,
        location: [
          response.user.address?.city,
          response.user.address?.state,
          response.user.address?.country
        ].filter(Boolean).join(', ')
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            'Save Changes'
          ) : (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={profileData.firstName}
                  onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-transparent text-sm disabled:opacity-50"
                  value={profileData.bio}
                  onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Location
                  </label>
                  <Input
                    value={profileData.location}
                    onChange={e => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </label>
                  <Input
                    value={profileData.email}
                    onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Website
                  </label>
                  <Input
                    value={profileData.website}
                    onChange={e => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Stats & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Star className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{profileData.rating}</span>
                      <span className="text-muted-foreground">
                        ({profileData.reviews} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Rating</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profileData.totalSwaps}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Swaps</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profileData.hoursSpent}h</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Hours Spent</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{profileData.completionRate}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Top 10%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Platform Rank</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Skills I Can Teach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddSkill('skills')}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddSkill('skills')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {profileData.skillsOffered.map(skill => (
                      <SkillBadge
                        key={skill.name}
                        skill={skill.name}
                        level={skill.skillProgress?.level}
                        isEditing={isEditing}
                        onRemove={() => handleRemoveSkill('skills', skill.name)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Skills I Want to Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest..."
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleAddSkill('interests')}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleAddSkill('interests')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {profileData.skillsWanted.map(interest => (
                      <SkillBadge
                        key={interest.name}
                        skill={interest.name}
                        level={interest.skillProgress?.level}
                        isEditing={isEditing}
                        onRemove={() => handleRemoveSkill('interests', interest.name)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {profileData.achievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.title}
                  {...achievement}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Profile 