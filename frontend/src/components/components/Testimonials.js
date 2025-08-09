import { motion } from "framer-motion";
import { Star } from "lucide-react";

const Testimonials = ({ darkMode }) => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO",
      company: "TechFusion Inc.",
      content: "SoftSell helped us recover over $45,000 from unused Adobe licenses. The process was seamless and secure. I highly recommend their platform for any company looking to optimize their software expenses.",
      stars: 5,
    },
    {
      name: "Michael Chen",
      role: "IT Director",
      company: "GlobalTech Solutions",
      content: "As a growing startup, we were able to purchase enterprise-grade software at 60% off retail through SoftSell. The verification process gave us confidence that everything was legitimate and properly transferred.",
      stars: 5,
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
      id="testimonials" 
      className={`py-20 ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-black"} sm:text-4xl`}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={ `mt-4 max-w-2xl mx-auto text-xl ${darkMode ? "text-gray-300" : "text-black"}`}
          >
            Don't just take our word for it — hear from the companies that have used our platform
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 md:grid-cols-2"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className={`rounded-lg p-8 shadow-lg ${darkMode ? "bg-gray-800" : "bg-lime-100"}`}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`mb-4 text-lg italic ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className={`h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-lime-300"}`}>
                  <span className="text-lg font-bold">{testimonial.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h4 className={`text-lg font-bold ${darkMode ? "text-white" : "text-black"}`}>
                    {testimonial.name}
                  </h4>
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;