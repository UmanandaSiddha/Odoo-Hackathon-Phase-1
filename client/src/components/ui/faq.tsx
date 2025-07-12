import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  return (
    <div className="border-b border-border">
      <button
        className="w-full py-6 text-left flex items-center justify-between focus:outline-none"
        onClick={onToggle}
      >
        <span className="text-lg text-foreground">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-muted-foreground"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number>(0)

  const faqs = [
    {
      question: "How can AI automation help my business?",
      answer: "AI automation can transform your business by streamlining workflows, reducing manual tasks, and improving efficiency. It can handle repetitive processes, analyze data for insights, automate customer support, and help make data-driven decisions - all while reducing operational costs and freeing your team to focus on strategic work."
    },
    {
      question: "Is AI automation difficult to integrate?",
      answer: "No, our AI automation solutions are designed to be user-friendly and easily integrated with your existing systems. We provide comprehensive support and documentation to ensure a smooth implementation process, along with expert guidance every step of the way."
    },
    {
      question: "What industries can benefit from AI automation?",
      answer: "AI automation can benefit virtually any industry, including healthcare, finance, retail, manufacturing, customer service, and more. Any business with repetitive tasks, data analysis needs, or customer interactions can see significant improvements through AI automation."
    },
    {
      question: "Do I need technical knowledge to use AI automation?",
      answer: "No, our platform is designed to be accessible to users of all technical levels. While technical knowledge can be helpful, we provide user-friendly interfaces and comprehensive training to ensure everyone can effectively utilize our AI automation tools."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We offer comprehensive support including 24/7 technical assistance, detailed documentation, regular training sessions, and dedicated account managers. Our team is always available to help you maximize the benefits of our AI automation solutions."
    }
  ]

  return (
    <section className="w-full bg-background px-6 md:px-12 py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/5 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/10 mb-4">
            <span className="text-sm text-primary/80">FAQs</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            We've Got the Answers<br />You're Looking For
          </h2>
          <p className="text-lg text-muted-foreground">
            Quick answers to your AI automation questions.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={index === openIndex}
              onToggle={() => setOpenIndex(index === openIndex ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 