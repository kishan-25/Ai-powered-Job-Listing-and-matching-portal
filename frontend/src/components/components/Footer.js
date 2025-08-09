import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin, Mail, PhoneCall, MapPin } from "lucide-react";

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: <Facebook size={20} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
    { icon: <Linkedin size={20} />, href: "#", label: "LinkedIn" },
  ];
  
  const contactInfo = [
    { 
      icon: <Mail size={16} />, 
      text: "bkbajpay0905@gmail.com", 
      href: "mailto:bkbajpay0905@gmail.com",
      ariaLabel: "Email us" 
    },
    { 
      icon: <PhoneCall size={16} />, 
      text: "+91-7877058098", 
      href: "tel:+917877058098",
      ariaLabel: "Call us" 
    },
    { 
      icon: <MapPin size={16} />, 
      text: "123, Sidh Nagar, Morena, MP", 
      href: "https://maps.google.com/?q=123,+Sidh+Nagar,+Morena,+MP",
      ariaLabel: "View on map" 
    },
  ];
  
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { text: "How It Works", href: "#how-it-works" },
        { text: "Features", href: "#why-choose-us" },
        { text: "Platform Stats", href: "#platform-stats" },
      ]
    },
    {
      title: "For Job Seekers",
      links: [
        { text: "Find Jobs", href: "/jobs" },
        { text: "Dashboard", href: "/dashboard" },
        { text: "Profile", href: "/dashboard/profile" },
        { text: "AI Cover Letters", href: "/dashboard/cover-letters" },
      ]
    }
  ];
  
  return (
    <footer className={`${darkMode ? "bg-gray-900 text-gray-300" : "bg-black text-gray-300"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Social Links */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-4">  
                <div className={ `w-10 h-10 rounded-full ${darkMode ? "bg-white" : "bg-black"  } flex items-center justify-center` } >
                  <span className= {`${darkMode ? "text-black" : "text-white"} font-bold text-xl`} >T</span>
                </div>
                <span className="ml-2 text-xl font-bold text-white">TalentAlign</span>
              </div>
              
              <p className="text-gray-400 mb-6">
                AI-powered job matching platform that centralizes opportunities from multiple sources and accelerates your career growth.
              </p>
              
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((section, sectionIndex) => (
            <div key={sectionIndex} className="lg:col-span-1 ml-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * sectionIndex }}
              >
                <h3 className="text-white font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
          
          {/* Contact Info */}
          <div className="lg:col-span-1 ml-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                {contactInfo.map((info, index) => (
                  <li key={index}>
                    <a 
                      href={info.href}
                      className="flex items-center space-x-2 group"
                      aria-label={info.ariaLabel}
                    >
                      <span className="text-white">{info.icon}</span>
                      <span className="text-gray-400 group-hover:text-white transition-colors">
                        {info.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} TalentAlign. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;