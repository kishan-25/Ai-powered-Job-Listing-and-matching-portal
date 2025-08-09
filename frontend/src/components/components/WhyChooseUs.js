import { motion } from "framer-motion";
import { Target, Users, TrendingUp, Zap } from "lucide-react";

const WhyChooseUs = ({ darkMode }) => {
  const features = [
    {
      name: "Smart Skill Matching",
      description: "Our AI analyzes your skills and matches you with jobs showing compatibility percentages",
      icon: <Target size={36} />,
    },
    {
      name: "Centralized Job Search",
      description: "Access jobs from multiple platforms including Telegram channels and web portals in one place",
      icon: <Users size={36} />,
    },
    {
      name: "Progress Tracking",
      description: "Monitor your application status and career progress with personalized dashboard analytics",
      icon: <TrendingUp size={36} />,
    },
    {
      name: "AI Cover Letters",
      description: "Generate dynamic, personalized cover letters tailored to each job application instantly",
      icon: <Zap size={36} />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section 
      id="why-choose-us" 
      className={`py-24 ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-xl md:text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}
          >
            Why Choose Us
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-3 text-4xl md:text-5xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}
          >
Transform your job search with AI
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className= {`mt-6 max-w-3xl mx-auto text-xl md:text-2xl font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
Discover why thousands of job seekers trust TalentAlign's AI-powered platform to accelerate their careers
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className={`flex ${darkMode ? "bg-gray-800" : "bg-gray-50"} p-8 rounded-lg shadow-lg`}
              >
                <div className={`flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}>
                  {feature.icon}
                </div>
                <div className="ml-5">
                  <h3 className={`text-xl md:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {feature.name}
                  </h3>
                  <p className= {`mt-3 text-lg leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"}`} >
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;