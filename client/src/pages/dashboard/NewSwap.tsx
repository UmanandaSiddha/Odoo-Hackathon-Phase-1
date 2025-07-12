import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function NewSwap() {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={stagger}
      className="container mx-auto p-6 max-w-3xl"
    >
      <motion.h1
        variants={fadeIn}
        className="text-3xl font-bold mb-8"
      >
        Create New Skill Swap
      </motion.h1>

      <motion.div
        variants={fadeIn}
        className="bg-card rounded-lg p-6 shadow-lg mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">What skills can you offer?</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              placeholder="Enter a skill you can teach"
              onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button onClick={handleAddSkill}>Add</Button>
          </div>
          
          <motion.div layout className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-primary/10 rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="text-sm hover:text-destructive"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="bg-card rounded-lg p-6 shadow-lg mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">What would you like to learn?</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Describe the skills you want to learn</Label>
            <textarea
              id="description"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={4}
              placeholder="I'm interested in learning..."
            />
          </div>
          
          <div>
            <Label htmlFor="time">Preferred Time Commitment</Label>
            <Input
              id="time"
              type="text"
              placeholder="e.g., 2 hours per week"
              className="mt-1"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="bg-card rounded-lg p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="experience">Your Experience Level</Label>
            <select
              id="experience"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Select your level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="preferences">Teaching Preferences</Label>
            <textarea
              id="preferences"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={3}
              placeholder="Any specific preferences for teaching/learning style..."
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="mt-8 flex justify-end gap-4"
      >
        <Button variant="outline">Cancel</Button>
        <Button>Create Swap Request</Button>
      </motion.div>
    </motion.div>
  );
} 