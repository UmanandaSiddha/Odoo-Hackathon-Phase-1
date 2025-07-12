import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendSwapRequest } from "@/services/api";
import { Loader2 } from "lucide-react";

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

interface SwapFormData {
  receiverId: string;
  skillOffered: string;
  skillWanted: string;
  duration: number;
  preferences: string;
  experience: string;
}

export default function NewSwap() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SwapFormData>({
    receiverId: "", // This would typically come from a user search/selection
    skillOffered: "",
    skillWanted: "",
    duration: 1,
    preferences: "",
    experience: "beginner"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await sendSwapRequest({
        receiverId: formData.receiverId,
        skillOffered: formData.skillOffered,
        skillWanted: formData.skillWanted,
        duration: formData.duration
      });

      if (response.success) {
        toast.success("Swap request sent successfully!");
        navigate("/swaps");
      }
    } catch (error) {
      console.error("Error sending swap request:", error);
      toast.error("Failed to send swap request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      <form onSubmit={handleSubmit}>
        <motion.div
          variants={fadeIn}
          className="bg-card rounded-lg p-6 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">What skills can you offer?</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="skillOffered">Skill to Teach</Label>
              <Input
                id="skillOffered"
                name="skillOffered"
                value={formData.skillOffered}
                onChange={handleInputChange}
                placeholder="Enter a skill you can teach"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="experience">Your Experience Level</Label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="bg-card rounded-lg p-6 shadow-lg mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">What would you like to learn?</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="skillWanted">Skill to Learn</Label>
              <Input
                id="skillWanted"
                name="skillWanted"
                value={formData.skillWanted}
                onChange={handleInputChange}
                placeholder="Enter a skill you want to learn"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Time Commitment (hours)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                max="8"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 2"
                required
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
              <Label htmlFor="preferences">Teaching/Learning Preferences</Label>
              <textarea
                id="preferences"
                name="preferences"
                value={formData.preferences}
                onChange={handleInputChange}
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
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/swaps")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Swap Request'
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
} 