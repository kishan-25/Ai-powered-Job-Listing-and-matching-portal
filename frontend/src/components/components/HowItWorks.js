import { motion } from "framer-motion";
import { FileText, Target, Bot, TrendingUp } from "lucide-react";

const HowItWorks = ({ darkMode }) => {
  const steps = [
    {
      title: "Upload Resume",
      description: "Upload your resume and let our AI analyze your skills and experience",
      icon: <FileText size={36} />,
      color: darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black",
    },
    {
      title: "Get Matched",
      description: "Our AI finds jobs from multiple platforms and shows matching percentages",
      icon: <Target size={36} />,
      color: darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black",
    },
    {
      title: "Apply Smart",
      description: "Generate personalized cover letters and track your application progress",
      icon: <Bot size={36} />,
      color: darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      id="how-it-works" 
      className={`py-20 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-4xl md:text-5xl font-extrabold ${darkMode ? "text-white" : "text-gray-800"}`}
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-6 max-w-3xl mx-auto text-xl md:text-2xl font-medium ${darkMode ? "text-gray-200" : "text-gray-600"}`}
          >
Transform your job search with AI-powered matching and personalized application assistance
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 gap-y-12 gap-x-10 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="relative"
            >
              {/* Connecting line between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 right-0 w-full h-1 bg-gray-200 dark:bg-gray-700 transform translate-x-1/2">
                  <div className={`absolute top-0 left-0 h-full w-1/2 ${darkMode ? "bg-white" : "bg-black"}`}></div>
                </div>
              )}
              
              <div className="flow-root rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className={`inline-flex items-center justify-center rounded-md ${step.color} p-4 shadow-lg`}>
                      {step.icon}
                    </span>
                  </div>
                  <h3 className={`mt-8 text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {step.title}
                  </h3>
                  <p className={`mt-5 text-lg leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <a 
            href="/register" 
            className={`inline-flex items-center px-8 py-4 border border-transparent text-xl font-medium rounded-md shadow-sm ${
              darkMode 
                ? "bg-white hover:bg-gray-100 text-black" 
                : "bg-black hover:bg-gray-800 text-white"
            } transition-colors`}
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;