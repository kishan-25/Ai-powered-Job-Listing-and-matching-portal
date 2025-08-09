import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, Target, Award, Briefcase } from "lucide-react";

const PlatformStats = ({ darkMode }) => {
  const stats = [
    {
      icon: <Users size={32} />,
      number: "Demo",
      label: "Personal Project",
      description: "Built for learning & portfolio"
    },
    {
      icon: <Briefcase size={32} />,
      number: "500+",
      label: "Job Listings",
      description: "Scraped from multiple sources"
    },
    {
      icon: <Target size={32} />,
      number: "AI-Powered",
      label: "Smart Matching",
      description: "Skills-based job matching"
    },
    {
      icon: <Award size={32} />,
      number: "Auto",
      label: "Cover Letters",
      description: "AI-generated personalized letters"
    }
  ];

  const features = [
    {
      icon: <Zap size={24} />,
      title: "AI-Powered Matching",
      description: "Our advanced AI analyzes your skills and matches you with the perfect job opportunities."
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Dynamic Cover Letters",
      description: "Generate personalized cover letters instantly with our AI assistant for each application."
    },
    {
      icon: <Target size={24} />,
      title: "Skill-Based Scoring",
      description: "See your compatibility percentage with each job posting based on your skills and experience."
    }
  ];
  

  
  return (
    <section 
      id="platform-stats" 
      className={`py-20 ${darkMode ? "bg-gray-800" : "bg-lime-300"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${darkMode ? "text-white" : "text-gray-900"}`}>
            TalentAlign Features
          </h2>
          <p className={`mt-4 text-xl ${darkMode ? "text-gray-300" : "text-black"}`}>  
            A personal project showcasing AI-powered job matching and application assistance capabilities.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`text-center p-6 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? "bg-lime-600" : "bg-lime-500"} text-white mb-4`}>
                {stat.icon}
              </div>
              <h3 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                {stat.number}
              </h3>
              <p className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                {stat.label}
              </p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${darkMode ? "bg-lime-600" : "bg-lime-500"} text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-3`}>
                {feature.title}
              </h3>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <motion.a
            href="/register"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors duration-200"
          >
            <Target size={20} className="mr-2" />
            Start Your Career Journey
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformStats;