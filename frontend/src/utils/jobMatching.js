/**
 * Extract potential skills from a text using NLP techniques
 * @param {string} text - Text to extract skills from
 * @returns {Array<string>} - Array of potential skills
 */
function extractSkills(text) {
  if (!text) return [];
  
  const commonSkills = [
      'javascript', 'python', 'java', 'c#', 'ruby', 'php', 'swift', 'kotlin',
      'typescript', 'html', 'css', 'react', 'angular', 'vue', 'node', 'express',
      'django', 'flask', 'spring', 'hibernate', 'sql', 'mysql', 'postgresql', 'mongodb',
      'firebase', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'github',
      'gitlab', 'bitbucket', 'jira', 'agile', 'scrum', 'devops', 'ci/cd', 'jenkins',
      'travis', 'rest', 'graphql', 'redux', 'vuex', 'bootstrap', 'tailwind', 'sass',
      'less', 'webpack', 'babel', 'jest', 'mocha', 'chai', 'cypress', 'selenium',
      'linux', 'unix', 'bash', 'powershell', 'machine learning', 'ai', 'data science',
      'tensorflow', 'pytorch', 'pandas', 'numpy', 'r', 'tableau', 'power bi',
      'excel', 'word', 'powerpoint', 'photoshop', 'illustrator', 'figma', 'sketch',
      'xd', 'ui', 'ux', 'product management', 'project management', 'leadership',
      'communication', 'teamwork', 'problem solving', 'critical thinking', 'creativity',
      'time management', 'adaptability', 'analytics', 'storytelling', 'public speaking',
      'writing', 'ruby on rails', 'laravel', 'next.js', 'nuxt.js', 'gatsby',
      'svelte', 'backbone', 'jquery', 'dotnet', 'asp.net', 'mvc', 'soap', 'oauth',
      'jwt', 'sso', 'blockchain', 'ethereum', 'solidity', 'ios', 'android', 'flutter',
      'react native', 'xamarin', 'unity', 'unreal', 'threejs', 'd3', 'webgl',
      'webassembly', 'rust', 'go', 'scala', 'perl', 'haskell', 'erlang', 'elixir',
      'clojure', 'prolog', 'lisp', 'f#', 'vb', 'cobol', 'fortran', 'matlab',
      'r studio', 'spss', 'hadoop', 'spark', 'kafka', 'elasticsearch', 'solr',
      'redis', 'memcached', 'rabbitmq', 'activemq', 'nginx', 'apache', 'iis',
      'sharepoint', 'wordpress', 'drupal', 'magento', 'shopify', 'sap', 'salesforce',
      'servicenow', 'dynamics', 'oracle', 'netsuite', 'hubspot', 'marketo', 'mailchimp',
      'analytics', 'seo', 'sem', 'ppc', 'smm', 'crm', 'erp', 'cms', 'lms',
      'web development', 'mobile development', 'full stack', 'front end', 'back end',
      'devops', 'qa', 'testing', 'security', 'networking', 'database', 'cloud',
      'architecture', 'system design', 'microservices', 'api', 'iot', 'ar', 'vr',
      '3d modeling', 'animation', 'video editing', 'sound design', 'game development',
      'data analysis', 'big data', 'data mining', 'nlp', 'computer vision',
      'information security', 'penetration testing', 'ethical hacking', 'cryptography',
      'reverse engineering', 'firmware', 'embedded systems', 'robotics', 'automation',
      'shell scripting', 'mern', 'mean', 'lamp', 'jamstack', 'serverless',
      'progressive web apps', 'web components', 'design patterns', 'algorithms',
      'data structures', 'computational thinking', 'math', 'statistics', 'calculus',
      'linear algebra', 'discrete math', 'probability', 'physics', 'biology', 'chemistry',
      'multisim', 'octave', 'latex', 'markdown', 'json', 'xml', 'yaml', 'toml',
      'protobuf', 'grpc', 'websockets', 'webrtc', 'ipfs', 'web3', 'dapp',
      'smart contracts', 'distributed systems', 'parallel computing', 'high performance computing',
      'quantum computing', 'bioinformatics', 'computational biology', 'genomics',
      'proteomics', 'neuroscience', 'cognitive science', 'linguistics', 'nlp',
      'psycholinguistics', 'computational linguistics', 'information retrieval',
      'knowledge representation', 'expert systems', 'fuzzy logic', 'neural networks',
      'deep learning', 'reinforcement learning', 'supervised learning', 'unsupervised learning',
      'semi-supervised learning', 'transfer learning', 'federated learning', 'online learning',
      'meta-learning', 'multi-task learning', 'anomaly detection', 'recommendation systems',
      'ranking algorithms', 'computer graphics', 'image processing', 'signal processing',
      'natural language generation', 'speech recognition', 'speech synthesis',
      'optical character recognition', 'computer vision', 'image recognition',
      'object detection', 'semantic segmentation', 'pose estimation', 'face recognition',
      'fingerprint recognition', 'biometrics', 'cryptanalysis', 'steganography',
      'digital forensics', 'malware analysis', 'incident response', 'threat intelligence',
      'vulnerability assessment', 'network security', 'application security', 'cloud security',
      'devsecops', 'identity management', 'access control', 'authentication', 'authorization',
      'accounting', 'auditing', 'compliance', 'gdpr', 'hipaa', 'pci dss', 'iso 27001',
      'soc 2', 'nist', 'risk management', 'business continuity', 'disaster recovery',
      'high availability', 'fault tolerance', 'load balancing', 'caching', 'cdn',
      'serverless', 'edge computing', 'fog computing', 'grid computing', 'cluster computing',
      'virtualization', 'hypervisor', 'container orchestration', 'service mesh',
      'api gateway', 'message broker', 'event sourcing', 'cqrs', 'saga pattern',
      'circuit breaker', 'bulkhead', 'retry', 'timeout', 'fallback', 'throttling',
      'rate limiting', 'idempotency', 'eventual consistency', 'strong consistency',
      'acid', 'base', 'cap theorem', 'sharding', 'replication', 'partitioning',
      'indexing', 'query optimization', 'normalization', 'denormalization', 'orm',
      'odm', 'query builder', 'migrations', 'seeds', 'fixtures', 'mocking',
      'stubbing', 'test doubles', 'unit testing', 'integration testing',
      'end-to-end testing', 'acceptance testing', 'smoke testing', 'regression testing',
      'performance testing', 'load testing', 'stress testing', 'penetration testing',
      'security testing', 'usability testing', 'accessibility testing', 'a/b testing',
      'split testing', 'blue-green deployment', 'canary deployment', 'feature flags',
      'feature toggles', 'continuous integration', 'continuous delivery',
      'continuous deployment', 'infrastructure as code', 'configuration management',
      'ansible', 'puppet', 'chef', 'terraform', 'cloudformation', 'arm templates',
      'bicep', 'pulumi', 'crossplane', 'gitops', 'argocd', 'flux', 'drone',
      'circle ci', 'github actions', 'gitlab ci', 'teamcity', 'bamboo',
      'octopus deploy', 'spinnaker', 'opsgenie', 'pagerduty', 'datadog',
      'new relic', 'splunk', 'elk stack', 'grafana', 'prometheus', 'telegraf',
      'influxdb', 'graphite', 'statsd', 'collectd', 'nagios', 'zabbix', 'icinga',
      'sensu', 'monit', 'supervisor', 'pm2', 'forever', 'nodemon', 'webpack',
      'parcel', 'rollup', 'esbuild', 'swc', 'vite', 'snowpack', 'grunt', 'gulp',
      'nx', 'lerna', 'rush', 'turborepo', 'bazel', 'buck', 'pants', 'gradle',
      'maven', 'ant', 'make', 'cmake', 'ninja', 'xcode', 'android studio',
      'visual studio', 'vscode', 'intellij', 'webstorm', 'pycharm', 'rstudio',
      'eclipse', 'netbeans', 'sublime text', 'atom', 'emacs', 'vim', 'neovim',
      'jupyter', 'colab', 'kaggle', 'databricks', 'tableau', 'looker',
      'power bi', 'qlik', 'domo', 'metabase', 'superset', 'redash', 'mode',
      'snowflake', 'bigquery', 'redshift', 'synapse', 'mysql workbench',
      'dbeaver', 'squirrel', 'wireshark', 'postman', 'insomnia', 'sqlmap',
      'burp suite', 'metasploit', 'nmap', 'fiddler', 'charles', 'mitmproxy',
  ];
  
  // Normalize text for skill extraction
  const normalizedText = text.toLowerCase();
  
  // Find skills in the normalized text
  const foundSkills = [];
  
  commonSkills.forEach(skill => {
      // Check if skill is in the text as a whole word
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(normalizedText)) {
          foundSkills.push(skill);
      }
  });
  
  // Find multi-word skills like "machine learning"
  return foundSkills;
}

/**
* Calculate match percentage between user skills and job skills
* @param {Array<string>} userSkills - Array of user skills
* @param {string} jobText - Job description text
* @param {string} jobTitle - Job title
* @param {string} jobKeySkills - Job key skills text
* @returns {Object} - Match percentage and skills not matched
*/
export function calculateJobSkillMatch(userSkills, jobText, jobTitle, jobKeySkills) {
  // If user has no skills, return 0% match
  if (!userSkills || userSkills.length === 0) {
      return { matchPercentage: 0, skillsNotMatched: [] };
  }
  
  // Combine job title, text and key skills
  const combinedJobText = `${jobTitle} ${jobText} ${jobKeySkills}`;
  
  // Extract skills mentioned in the job description
  const jobSkills = extractSkills(combinedJobText);
  
  // If no job skills found, return 0% match
  if (jobSkills.length === 0) {
      return { matchPercentage: 0, skillsNotMatched: [] };
  }
  
  // Normalize user skills to lowercase for case-insensitive comparison
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  
  // Find skills that are mentioned in the job but not in user skills
  const skillsNotMatched = jobSkills.filter(skill => 
      !normalizedUserSkills.some(userSkill => 
          userSkill === skill || userSkill.includes(skill) || skill.includes(userSkill)
      )
  );
  
  // Calculate match percentage
  const matchedSkills = jobSkills.length - skillsNotMatched.length;
  const matchPercentage = Math.round((matchedSkills / jobSkills.length) * 100);
  
  return {
      matchPercentage: matchPercentage,
      skillsNotMatched: skillsNotMatched
  };
}

/**
* Get color class based on match percentage
* @param {number} percentage - Match percentage
* @returns {string} - Tailwind color class
*/
export function getMatchColor(percentage) {
  if (percentage >= 80) {
      return "text-green-600";
  } else if (percentage >= 60) {
      return "text-blue-600";
  } else if (percentage >= 40) {
      return "text-yellow-600";
  } else {
      return "text-red-600";
  }
}

/**
* Get match strength description based on percentage
* @param {number} percentage - Match percentage
* @returns {string} - Match strength description
*/
export function getMatchStrength(percentage) {
  if (percentage >= 80) {
      return "Excellent";
  } else if (percentage >= 60) {
      return "Good";
  } else if (percentage >= 40) {
      return "Fair";
  } else {
      return "Poor";
  }
}