import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Star, Edit2, Plus, X } from 'lucide-react'

const SkillBadge = ({
  skill,
  onRemove,
  isEditing
}: {
  skill: string
  onRemove?: () => void
  isEditing?: boolean
}) => (
  <Badge variant="secondary" className="text-sm py-1 px-3">
    {skill}
    {isEditing && onRemove && (
      <button
        onClick={onRemove}
        className="ml-2 hover:text-destructive transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </Badge>
)

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: 'Full-stack developer passionate about building user-friendly applications.',
    location: 'San Francisco, CA',
    skills: [
      'React',
      'TypeScript',
      'Node.js',
      'GraphQL',
      'UI/UX Design'
    ],
    interests: [
      'Machine Learning',
      'Cloud Architecture',
      'Mobile Development',
      'DevOps'
    ],
    availability: {
      weekdays: true,
      weekends: true,
      mornings: false,
      afternoons: true,
      evenings: true
    }
  })

  const handleAddSkill = (type: 'skills' | 'interests') => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        [type]: [...prev[type], newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (type: 'skills' | 'interests', skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSave = () => {
    // TODO: Save profile data to backend
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={profileData.name}
                  onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={profileData.location}
                  onChange={e => setProfileData(prev => ({ ...prev, location: e.target.value }))}
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
              <CardTitle>Stats & Ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">4.8</span>
                <span className="text-muted-foreground">(18 reviews)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Swaps</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hours Taught</span>
                  <span className="font-medium">48</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hours Learned</span>
                  <span className="font-medium">36</span>
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
              <CardTitle>Skills I Can Teach</CardTitle>
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
                  {profileData.skills.map(skill => (
                    <SkillBadge
                      key={skill}
                      skill={skill}
                      isEditing={isEditing}
                      onRemove={() => handleRemoveSkill('skills', skill)}
                    />
                  ))}
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
              <CardTitle>Skills I Want to Learn</CardTitle>
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
                  {profileData.interests.map(interest => (
                    <SkillBadge
                      key={interest}
                      skill={interest}
                      isEditing={isEditing}
                      onRemove={() => handleRemoveSkill('interests', interest)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile 