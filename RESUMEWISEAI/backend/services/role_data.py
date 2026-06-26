"""
role_data.py — Single source of truth for all job role data.

Contains:
  SKILL_DATABASE   — required + preferred skills per role (used by ATSScoreCalculator)
  MARKET_DATABASE  — salary, demand, growth data per role (used by AdzunaService fallback)

Both ats_service.py and adzuna_service.py import from here.
Adding a new role means editing ONLY this file.
"""

from typing import Dict, List

# ---------------------------------------------------------------------------
# SKILL DATABASE
# Keys must exactly match user-facing role names.
# 'required'  → 10-20 mandatory skills for ATS scoring & gap analysis
# 'preferred' → 8-15 nice-to-have skills
# ---------------------------------------------------------------------------
SKILL_DATABASE: Dict[str, Dict[str, List[str]]] = {

    # ════════════════════════════════════════════════════════════════════════
    # AI & MACHINE LEARNING
    # ════════════════════════════════════════════════════════════════════════
    'AI Engineer': {
        'required': [
            'Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
            'Scikit-learn', 'SQL', 'REST API', 'Git', 'Linear Algebra',
            'Statistics', 'Data Preprocessing', 'Model Deployment', 'NumPy', 'Pandas',
        ],
        'preferred': [
            'LLM', 'Hugging Face', 'LangChain', 'Docker', 'AWS', 'FastAPI',
            'Kubernetes', 'MLflow', 'OpenAI API', 'CUDA', 'Vertex AI', 'SageMaker',
        ],
    },
    'Machine Learning Engineer': {
        'required': [
            'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Statistics',
            'NumPy', 'Pandas', 'Feature Engineering', 'Model Evaluation', 'Git',
            'Data Preprocessing', 'Probability', 'Regression', 'Classification',
        ],
        'preferred': [
            'Keras', 'Apache Spark', 'Docker', 'AWS', 'NLP', 'Computer Vision',
            'MLflow', 'Airflow', 'Kubernetes', 'XGBoost', 'LightGBM',
        ],
    },
    'Deep Learning Engineer': {
        'required': [
            'Python', 'PyTorch', 'TensorFlow', 'Neural Networks', 'CUDA',
            'Backpropagation', 'CNNs', 'RNNs', 'LSTMs', 'Transformers',
            'Git', 'Linear Algebra', 'Calculus', 'GPU Programming', 'Batch Normalization',
        ],
        'preferred': [
            'Keras', 'Computer Vision', 'NLP', 'GANs', 'Diffusion Models',
            'Docker', 'AWS', 'MLflow', 'ONNX', 'TensorRT', 'DeepSpeed',
        ],
    },
    'Generative AI Engineer': {
        'required': [
            'Python', 'LLM', 'Prompt Engineering', 'LangChain', 'OpenAI API',
            'Hugging Face', 'Fine-tuning', 'REST API', 'Embeddings', 'RAG',
            'Vector Databases', 'Transformers', 'Git', 'FastAPI', 'NLP',
        ],
        'preferred': [
            'LlamaIndex', 'Pinecone', 'Weaviate', 'ChromaDB', 'Docker', 'AWS',
            'Diffusion Models', 'Stable Diffusion', 'DALL-E', 'LoRA', 'RLHF',
        ],
    },
    'LLM Engineer': {
        'required': [
            'Python', 'LLM', 'Hugging Face', 'Fine-tuning', 'Prompt Engineering',
            'LangChain', 'Transformers', 'REST API', 'Embeddings', 'RAG',
            'Git', 'CUDA', 'Tokenization', 'Attention Mechanisms', 'RLHF',
        ],
        'preferred': [
            'LoRA', 'QLoRA', 'PEFT', 'Vector Databases', 'FastAPI', 'Docker',
            'OpenAI API', 'Pinecone', 'LlamaIndex', 'DeepSpeed', 'vLLM',
        ],
    },
    'Prompt Engineer': {
        'required': [
            'Prompt Engineering', 'LLM', 'OpenAI API', 'Python', 'NLP',
            'Chain-of-Thought', 'Few-shot Learning', 'Zero-shot Learning',
            'Context Management', 'Instruction Tuning', 'API Integration',
        ],
        'preferred': [
            'LangChain', 'LlamaIndex', 'RAG', 'Hugging Face', 'JavaScript',
            'REST API', 'Embeddings', 'Fine-tuning', 'Anthropic Claude', 'Gemini API',
        ],
    },
    'NLP Engineer': {
        'required': [
            'Python', 'NLP', 'Hugging Face', 'Transformers', 'NLTK', 'spaCy',
            'Text Classification', 'Named Entity Recognition', 'Sentiment Analysis',
            'Tokenization', 'Git', 'Scikit-learn', 'TF-IDF', 'Word Embeddings',
        ],
        'preferred': [
            'PyTorch', 'TensorFlow', 'BERT', 'GPT', 'T5', 'RoBERTa',
            'Docker', 'FastAPI', 'LangChain', 'Question Answering', 'Summarization',
        ],
    },
    'Computer Vision Engineer': {
        'required': [
            'Python', 'OpenCV', 'Deep Learning', 'CNNs', 'PyTorch', 'TensorFlow',
            'Image Processing', 'Object Detection', 'Image Classification', 'Git',
            'NumPy', 'Matplotlib', 'Data Augmentation', 'Transfer Learning',
        ],
        'preferred': [
            'YOLO', 'Segmentation', 'CUDA', 'TensorRT', 'Docker', 'AWS',
            'MLflow', 'GANs', 'Mediapipe', 'ONNX', '3D Vision', 'Pose Estimation',
        ],
    },
    'AI Research Engineer': {
        'required': [
            'Python', 'PyTorch', 'TensorFlow', 'Research Methodology', 'Mathematics',
            'Linear Algebra', 'Calculus', 'Probability', 'Statistics', 'Paper Implementation',
            'Experimental Design', 'Deep Learning', 'Git', 'LaTeX', 'Literature Review',
        ],
        'preferred': [
            'Reinforcement Learning', 'GANs', 'Diffusion Models', 'Transformers',
            'CUDA', 'HPC', 'Docker', 'Weights & Biases', 'Distributed Training',
        ],
    },
    'MLOps Engineer': {
        'required': [
            'Python', 'MLflow', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
            'AWS', 'Model Monitoring', 'Feature Stores', 'Model Registry',
            'Pipeline Automation', 'Linux', 'Terraform', 'Airflow',
        ],
        'preferred': [
            'Kubeflow', 'Feast', 'DVC', 'Grafana', 'Prometheus',
            'SageMaker', 'Vertex AI', 'Jenkins', 'ArgoCD', 'Seldon', 'BentoML',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # DATA
    # ════════════════════════════════════════════════════════════════════════
    'Data Scientist': {
        'required': [
            'Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Statistics',
            'Data Visualization', 'Matplotlib', 'Seaborn', 'Hypothesis Testing',
            'Feature Engineering', 'EDA', 'Git', 'Jupyter Notebooks',
        ],
        'preferred': [
            'TensorFlow', 'PyTorch', 'Apache Spark', 'R', 'Tableau', 'AWS',
            'Plotly', 'Databricks', 'BigQuery', 'Power BI', 'A/B Testing',
        ],
    },
    'Data Analyst': {
        'required': [
            'SQL', 'Python', 'Excel', 'Tableau', 'Data Visualization', 'Statistics',
            'Power BI', 'Data Cleaning', 'Reporting', 'KPI Analysis',
            'Business Intelligence', 'Dashboard Design', 'Pivot Tables',
        ],
        'preferred': [
            'R', 'Google Analytics', 'Looker', 'BigQuery', 'Pandas', 'NumPy',
            'Snowflake', 'dbt', 'Google Data Studio', 'Amplitude',
        ],
    },
    'Data Engineer': {
        'required': [
            'Python', 'SQL', 'Apache Spark', 'ETL', 'Data Warehousing',
            'Apache Kafka', 'Apache Airflow', 'Git', 'Linux', 'Data Modeling',
            'PostgreSQL', 'Data Pipeline', 'Hadoop', 'Schema Design',
        ],
        'preferred': [
            'Snowflake', 'dbt', 'Databricks', 'AWS', 'GCP', 'Docker',
            'Kubernetes', 'BigQuery', 'Amazon Redshift', 'Delta Lake', 'Flink',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # SOFTWARE DEVELOPMENT
    # ════════════════════════════════════════════════════════════════════════
    'Software Engineer': {
        'required': [
            'Data Structures', 'Algorithms', 'OOP', 'Design Patterns', 'Git',
            'SQL', 'REST API', 'Problem Solving', 'Code Review', 'Testing',
            'Linux', 'Agile', 'System Design', 'Debugging',
        ],
        'preferred': [
            'Docker', 'Kubernetes', 'CI/CD', 'Microservices', 'Cloud', 'AWS',
            'Redis', 'Message Queues', 'gRPC', 'Performance Optimization',
        ],
    },
    'Software Developer': {
        'required': [
            'Programming Languages', 'OOP', 'Data Structures', 'Git', 'SQL',
            'REST API', 'Unit Testing', 'Problem Solving', 'Debugging', 'Agile',
            'Code Review', 'Version Control', 'SDLC',
        ],
        'preferred': [
            'Docker', 'CI/CD', 'Cloud', 'Microservices', 'Design Patterns',
            'NoSQL', 'Message Queues', 'Performance Testing',
        ],
    },
    'Python Developer': {
        'required': [
            'Python', 'Django', 'Flask', 'FastAPI', 'SQL', 'Git', 'REST API',
            'OOP', 'Unit Testing', 'PostgreSQL', 'Linux', 'Pandas', 'NumPy',
        ],
        'preferred': [
            'Docker', 'MongoDB', 'AWS', 'CI/CD', 'Microservices', 'Redis',
            'Celery', 'GraphQL', 'WebSockets', 'SQLAlchemy', 'Pytest',
        ],
    },
    'Java Developer': {
        'required': [
            'Java', 'Spring Boot', 'Spring Framework', 'SQL', 'Maven', 'Git',
            'REST API', 'OOP', 'Hibernate', 'JUnit', 'Design Patterns',
            'Microservices', 'PostgreSQL', 'Multi-threading',
        ],
        'preferred': [
            'Docker', 'Kubernetes', 'AWS', 'Kafka', 'Redis', 'CI/CD',
            'Spring Security', 'Gradle', 'MongoDB', 'RabbitMQ', 'gRPC',
        ],
    },
    'C++ Developer': {
        'required': [
            'C++', 'STL', 'OOP', 'Memory Management', 'Pointers', 'Data Structures',
            'Algorithms', 'Multithreading', 'CMake', 'Git', 'Linux', 'Debugging',
            'Performance Optimization', 'RAII',
        ],
        'preferred': [
            'Boost', 'OpenMP', 'CUDA', 'Qt', 'Design Patterns', 'Assembly',
            'Real-time Systems', 'Embedded', 'OpenGL', 'gRPC',
        ],
    },
    'Full Stack Developer': {
        'required': [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'SQL',
            'Git', 'REST API', 'MongoDB', 'Express.js', 'Linux', 'Agile',
        ],
        'preferred': [
            'Docker', 'AWS', 'Testing', 'GraphQL', 'Redis', 'Nginx',
            'CI/CD', 'Next.js', 'Tailwind CSS', 'Microservices', 'WebSockets',
        ],
    },
    'Frontend Developer': {
        'required': [
            'JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Git',
            'REST API', 'Responsive Design', 'Cross-browser Compatibility',
            'CSS Frameworks', 'State Management', 'Unit Testing', 'Accessibility',
        ],
        'preferred': [
            'Vue.js', 'Angular', 'Next.js', 'Webpack', 'Testing Library',
            'Storybook', 'GraphQL', 'Tailwind CSS', 'Docker', 'Performance Optimization',
        ],
    },
    'Backend Developer': {
        'required': [
            'Python', 'Java', 'Node.js', 'SQL', 'REST API', 'Git', 'Docker',
            'Linux', 'Authentication', 'Authorization', 'Database Design',
            'Microservices', 'Message Queues', 'Caching',
        ],
        'preferred': [
            'Kubernetes', 'MongoDB', 'Redis', 'AWS', 'CI/CD', 'gRPC',
            'Kafka', 'PostgreSQL', 'Elasticsearch', 'GraphQL',
        ],
    },
    'MERN Stack Developer': {
        'required': [
            'MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'TypeScript',
            'REST API', 'Git', 'HTML', 'CSS', 'JWT', 'Mongoose', 'Redux',
        ],
        'preferred': [
            'Next.js', 'GraphQL', 'Docker', 'AWS', 'Testing Library', 'CI/CD',
            'WebSockets', 'Redis', 'Nginx', 'Tailwind CSS', 'React Query',
        ],
    },
    'MEAN Stack Developer': {
        'required': [
            'MongoDB', 'Express.js', 'Angular', 'Node.js', 'JavaScript', 'TypeScript',
            'REST API', 'Git', 'HTML', 'CSS', 'JWT', 'RxJS', 'Angular Material',
        ],
        'preferred': [
            'GraphQL', 'Docker', 'AWS', 'Testing', 'CI/CD', 'NgRx',
            'WebSockets', 'Redis', 'Nginx', 'Tailwind CSS',
        ],
    },
    'React Developer': {
        'required': [
            'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux',
            'REST API', 'Git', 'React Router', 'Hooks', 'Context API',
            'Component Design', 'Performance Optimization',
        ],
        'preferred': [
            'Next.js', 'Testing Library', 'Webpack', 'Tailwind CSS', 'GraphQL',
            'Docker', 'Storybook', 'React Query', 'Zustand', 'Vite', 'Cypress',
        ],
    },
    'Angular Developer': {
        'required': [
            'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'RxJS',
            'NgRx', 'Angular Material', 'REST API', 'Git', 'Karma', 'Jasmine',
            'Dependency Injection', 'Angular CLI',
        ],
        'preferred': [
            'Node.js', 'Docker', 'AWS', 'GraphQL', 'Testing', 'Webpack',
            'CI/CD', 'Tailwind CSS', 'PWA', 'WebSockets',
        ],
    },
    'Vue.js Developer': {
        'required': [
            'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vuex', 'Pinia',
            'Vue Router', 'REST API', 'Git', 'Nuxt.js', 'Component Design',
            'Composition API',
        ],
        'preferred': [
            'Docker', 'AWS', 'GraphQL', 'Testing', 'Vite', 'Tailwind CSS',
            'CI/CD', 'WebSockets', 'Quasar', 'Vuetify',
        ],
    },
    'Node.js Developer': {
        'required': [
            'Node.js', 'JavaScript', 'TypeScript', 'Express.js', 'REST API',
            'SQL', 'MongoDB', 'Git', 'Event Loop', 'npm', 'Async Programming',
            'Middleware', 'Authentication', 'Authorization',
        ],
        'preferred': [
            'Docker', 'AWS', 'Redis', 'Kafka', 'GraphQL', 'WebSockets',
            'CI/CD', 'NestJS', 'Fastify', 'Testing', 'Microservices',
        ],
    },
    'PHP Developer': {
        'required': [
            'PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'REST API', 'Git',
            'OOP', 'MVC', 'Composer', 'Linux', 'Laravel/Symfony',
            'Database Design', 'Security (CSRF, XSS)',
        ],
        'preferred': [
            'Docker', 'Redis', 'AWS', 'CI/CD', 'PHPUnit', 'GraphQL',
            'Vue.js', 'React', 'Microservices', 'WordPress',
        ],
    },
    'Laravel Developer': {
        'required': [
            'PHP', 'Laravel', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'Git',
            'Eloquent ORM', 'Blade Templates', 'Artisan CLI', 'REST API',
            'Composer', 'MVC', 'Authentication',
        ],
        'preferred': [
            'Vue.js', 'React', 'Redis', 'Docker', 'AWS', 'PHPUnit',
            'Queue Jobs', 'Horizon', 'Livewire', 'Inertia.js', 'CI/CD',
        ],
    },
    '.NET Developer': {
        'required': [
            'C#', '.NET', 'ASP.NET Core', 'SQL Server', 'REST API', 'Git',
            'OOP', 'Entity Framework', 'LINQ', 'MVC', 'NuGet',
            'Visual Studio', 'Authentication', 'Unit Testing',
        ],
        'preferred': [
            'Azure', 'Docker', 'Kubernetes', 'Microservices', 'gRPC',
            'Blazor', 'SignalR', 'CI/CD', 'Redis', 'RabbitMQ', 'CQRS',
        ],
    },
    'Spring Boot Developer': {
        'required': [
            'Java', 'Spring Boot', 'Spring MVC', 'Spring Security', 'Hibernate',
            'JPA', 'SQL', 'Maven', 'Git', 'REST API', 'Microservices',
            'JUnit', 'OOP', 'Design Patterns',
        ],
        'preferred': [
            'Docker', 'Kubernetes', 'AWS', 'Kafka', 'Redis', 'CI/CD',
            'Spring Cloud', 'Eureka', 'Config Server', 'Zipkin', 'Prometheus',
        ],
    },
    'Django Developer': {
        'required': [
            'Python', 'Django', 'Django REST Framework', 'SQL', 'PostgreSQL',
            'Git', 'ORM', 'Authentication', 'HTML', 'CSS', 'REST API',
            'Celery', 'Unit Testing', 'Linux',
        ],
        'preferred': [
            'Docker', 'Redis', 'AWS', 'CI/CD', 'GraphQL', 'Channels',
            'Elasticsearch', 'Nginx', 'gunicorn', 'Pytest',
        ],
    },
    'Flask Developer': {
        'required': [
            'Python', 'Flask', 'SQLAlchemy', 'SQL', 'REST API', 'Git',
            'Jinja2', 'Authentication', 'Blueprints', 'PostgreSQL',
            'Linux', 'Unit Testing', 'OOP',
        ],
        'preferred': [
            'Docker', 'Redis', 'AWS', 'CI/CD', 'Celery', 'GraphQL',
            'Marshmallow', 'Nginx', 'gunicorn', 'FastAPI', 'Pytest',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # MOBILE DEVELOPMENT
    # ════════════════════════════════════════════════════════════════════════
    'Android Developer': {
        'required': [
            'Java', 'Kotlin', 'Android SDK', 'Android Studio', 'XML Layouts',
            'REST API', 'Git', 'MVVM', 'LiveData', 'ViewModel',
            'Room Database', 'Material Design', 'Gradle', 'Jetpack Compose',
        ],
        'preferred': [
            'Dagger/Hilt', 'Retrofit', 'Coroutines', 'Firebase', 'Google Play',
            'Unit Testing', 'CI/CD', 'WorkManager', 'DataStore', 'Navigation Component',
        ],
    },
    'iOS Developer': {
        'required': [
            'Swift', 'SwiftUI', 'UIKit', 'Xcode', 'REST API', 'Git',
            'MVVM', 'Auto Layout', 'Core Data', 'CocoaPods/SPM',
            'App Store Deployment', 'Instruments', 'MVC', 'Combine',
        ],
        'preferred': [
            'Objective-C', 'RxSwift', 'Firebase', 'ARKit', 'CoreML',
            'Unit Testing', 'CI/CD', 'CloudKit', 'In-App Purchase', 'Fastlane',
        ],
    },
    'Flutter Developer': {
        'required': [
            'Dart', 'Flutter', 'REST API', 'Git', 'State Management',
            'Bloc/Cubit', 'Provider', 'Widgets', 'Material Design', 'Firebase',
            'Cross-platform Development', 'Responsive UI', 'Navigation',
        ],
        'preferred': [
            'GetX', 'Riverpod', 'SQLite', 'Hive', 'CI/CD', 'Unit Testing',
            'Play Store', 'App Store', 'Platform Channels', 'animations',
        ],
    },
    'React Native Developer': {
        'required': [
            'React Native', 'JavaScript', 'TypeScript', 'React', 'REST API',
            'Git', 'Redux', 'Navigation', 'Expo', 'Native Modules',
            'StyleSheet', 'Flexbox', 'Async Storage',
        ],
        'preferred': [
            'Firebase', 'Redux Toolkit', 'React Query', 'CI/CD', 'Testing',
            'Animations', 'Push Notifications', 'App Store', 'Play Store', 'Fastlane',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # DEVOPS & CLOUD
    # ════════════════════════════════════════════════════════════════════════
    'DevOps Engineer': {
        'required': [
            'Docker', 'Kubernetes', 'AWS', 'Git', 'Linux', 'CI/CD', 'Terraform',
            'Ansible', 'Jenkins', 'Bash Scripting', 'Monitoring', 'Networking',
            'Infrastructure as Code', 'Helm',
        ],
        'preferred': [
            'ArgoCD', 'Prometheus', 'Grafana', 'Python', 'Vault', 'Consul',
            'GitLab CI', 'GitHub Actions', 'EKS', 'Service Mesh', 'Istio',
        ],
    },
    'Cloud Engineer': {
        'required': [
            'AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes',
            'Linux', 'CI/CD', 'Networking', 'VPC', 'IAM', 'Cloud Security',
            'Auto Scaling', 'Load Balancing',
        ],
        'preferred': [
            'Python', 'Ansible', 'CloudFormation', 'Helm', 'Monitoring',
            'Cost Optimization', 'Multi-cloud', 'Jenkins', 'Pulumi',
        ],
    },
    'AWS Cloud Engineer': {
        'required': [
            'AWS EC2', 'AWS S3', 'AWS RDS', 'AWS Lambda', 'IAM', 'VPC',
            'CloudFormation', 'Terraform', 'Linux', 'Git', 'AWS CLI',
            'Route 53', 'CloudWatch', 'ELB',
        ],
        'preferred': [
            'EKS', 'ECS', 'SageMaker', 'SNS/SQS', 'Python', 'Docker',
            'CI/CD', 'Cost Optimization', 'AWS CDK', 'WAF', 'DynamoDB',
        ],
    },
    'Azure Cloud Engineer': {
        'required': [
            'Azure VMs', 'Azure Storage', 'Azure SQL', 'Azure DevOps',
            'ARM Templates', 'Terraform', 'Azure AD', 'Linux', 'Git',
            'Azure Networking', 'Azure Monitor', 'Resource Groups', 'RBAC',
        ],
        'preferred': [
            'AKS', 'Azure Functions', 'Power BI', 'Python', 'Docker', 'CI/CD',
            'Azure Databricks', 'Logic Apps', 'Service Bus', 'Azure Sentinel',
        ],
    },
    'Google Cloud Engineer': {
        'required': [
            'GCP Compute Engine', 'Cloud Storage', 'BigQuery', 'GKE',
            'Terraform', 'IAM', 'VPC', 'Linux', 'Git', 'Cloud SQL',
            'Cloud Run', 'Pub/Sub', 'gcloud CLI',
        ],
        'preferred': [
            'Cloud Functions', 'Dataflow', 'Vertex AI', 'Python', 'Docker',
            'CI/CD', 'Looker', 'Anthos', 'Cloud Armor', 'Spanner',
        ],
    },
    'Site Reliability Engineer': {
        'required': [
            'Linux', 'Python', 'Go', 'Kubernetes', 'Docker', 'Prometheus',
            'Grafana', 'CI/CD', 'Incident Management', 'SLO/SLA/SLI',
            'Terraform', 'Bash', 'On-call', 'Distributed Systems',
        ],
        'preferred': [
            'AWS', 'GCP', 'Istio', 'Chaos Engineering', 'Jaeger', 'OpenTelemetry',
            'PagerDuty', 'Elasticsearch', 'Kafka', 'Capacity Planning',
        ],
    },
    'Kubernetes Engineer': {
        'required': [
            'Kubernetes', 'Docker', 'Helm', 'kubectl', 'YAML', 'Linux',
            'CI/CD', 'Git', 'Networking (CNI)', 'Storage (PV/PVC)',
            'RBAC', 'Service Mesh', 'Monitoring', 'Terraform',
        ],
        'preferred': [
            'ArgoCD', 'Flux', 'Istio', 'Prometheus', 'Grafana', 'AWS EKS',
            'GKE', 'AKS', 'Kubeflow', 'Operators', 'Cluster Autoscaler',
        ],
    },
    'Docker Engineer': {
        'required': [
            'Docker', 'Docker Compose', 'Dockerfile', 'Container Networking',
            'Docker Hub', 'Linux', 'Git', 'CI/CD', 'YAML', 'Volumes',
            'Multi-stage Builds', 'Security Scanning', 'Registry',
        ],
        'preferred': [
            'Kubernetes', 'Helm', 'AWS ECR', 'GCR', 'Podman', 'BuildKit',
            'Docker Swarm', 'Trivy', 'Skopeo', 'Containerd',
        ],
    },
    'Platform Engineer': {
        'required': [
            'Kubernetes', 'Terraform', 'CI/CD', 'Git', 'Linux', 'Docker',
            'Python', 'Go', 'Internal Developer Platform', 'Service Mesh',
            'Helm', 'Monitoring', 'Incident Management', 'Cloud (AWS/GCP/Azure)',
        ],
        'preferred': [
            'Backstage', 'ArgoCD', 'Crossplane', 'Port', 'Vault', 'Consul',
            'Prometheus', 'Grafana', 'FinOps', 'Developer Experience',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # CYBER SECURITY
    # ════════════════════════════════════════════════════════════════════════
    'Cyber Security Engineer': {
        'required': [
            'Network Security', 'Firewalls', 'SIEM', 'IDS/IPS', 'Vulnerability Assessment',
            'Linux', 'Python', 'Risk Management', 'PKI', 'VPN', 'Access Control',
            'Security Policies', 'Incident Response', 'Patch Management',
        ],
        'preferred': [
            'CISSP', 'CEH', 'Penetration Testing', 'Cloud Security', 'SOAR',
            'Zero Trust', 'Splunk', 'Wireshark', 'Nessus', 'CrowdStrike',
        ],
    },
    'Cyber Security Analyst': {
        'required': [
            'SIEM', 'Log Analysis', 'Threat Intelligence', 'Incident Response',
            'Network Security', 'Vulnerability Scanning', 'Linux', 'Windows Security',
            'Malware Analysis', 'Security Monitoring', 'Firewall Management', 'Risk Assessment',
        ],
        'preferred': [
            'Splunk', 'QRadar', 'Wireshark', 'Python', 'MITRE ATT&CK',
            'SOAR', 'Endpoint Detection', 'Forensics', 'CEH', 'CompTIA Security+',
        ],
    },
    'Ethical Hacker': {
        'required': [
            'Penetration Testing', 'Kali Linux', 'Metasploit', 'Nmap', 'Burp Suite',
            'Network Security', 'Web Application Security', 'Python', 'Scripting',
            'OWASP Top 10', 'Reconnaissance', 'Exploitation', 'Reporting',
        ],
        'preferred': [
            'CEH', 'OSCP', 'SQL Injection', 'XSS', 'CSRF', 'Social Engineering',
            'Wireless Security', 'Reverse Engineering', 'Exploit Development', 'Immunity Debugger',
        ],
    },
    'Penetration Tester': {
        'required': [
            'Penetration Testing', 'Kali Linux', 'Metasploit', 'Burp Suite',
            'Nmap', 'OWASP', 'Scripting', 'Vulnerability Assessment', 'Report Writing',
            'Web App Testing', 'Network Exploitation', 'Active Directory Attacks',
        ],
        'preferred': [
            'OSCP', 'CEH', 'Social Engineering', 'Cobalt Strike', 'BloodHound',
            'PowerShell Empire', 'Mobile App Testing', 'API Security', 'Red Teaming',
        ],
    },
    'SOC Analyst': {
        'required': [
            'SIEM', 'Splunk', 'Log Analysis', 'Incident Response', 'Network Security',
            'Threat Intelligence', 'Linux', 'Malware Analysis', 'Triage',
            'Alert Investigation', 'Escalation Procedures', 'Windows Security',
        ],
        'preferred': [
            'QRadar', 'CrowdStrike', 'Wireshark', 'Python', 'SOAR',
            'Digital Forensics', 'MITRE ATT&CK', 'Endpoint Detection', 'CEH', 'Cortex XSOAR',
        ],
    },
    'Security Consultant': {
        'required': [
            'Risk Assessment', 'Security Auditing', 'Compliance', 'GDPR', 'ISO 27001',
            'Penetration Testing', 'Vulnerability Assessment', 'Security Architecture',
            'Report Writing', 'Client Communication', 'Policy Development', 'NIST Framework',
        ],
        'preferred': [
            'CISSP', 'CISM', 'Cloud Security', 'SOC 2', 'HIPAA', 'PCI DSS',
            'Zero Trust', 'DevSecOps', 'Threat Modeling', 'Business Continuity',
        ],
    },
    'Information Security Analyst': {
        'required': [
            'Security Monitoring', 'Risk Analysis', 'Incident Response', 'SIEM',
            'Vulnerability Management', 'Access Control', 'Compliance', 'Linux',
            'Windows Security', 'Security Policies', 'Data Protection', 'Firewall',
        ],
        'preferred': [
            'CISSP', 'CompTIA Security+', 'ISO 27001', 'GDPR', 'SOC 2',
            'Python', 'Splunk', 'Threat Intelligence', 'Cloud Security', 'IAM',
        ],
    },
    'Cloud Security Engineer': {
        'required': [
            'Cloud Security (AWS/Azure/GCP)', 'IAM', 'Zero Trust', 'SIEM',
            'Compliance (SOC 2, ISO 27001)', 'Container Security', 'Network Security',
            'Vulnerability Assessment', 'Linux', 'Terraform', 'Security Automation',
        ],
        'preferred': [
            'CSSP', 'CWSP', 'DevSecOps', 'CIS Benchmarks', 'GuardDuty',
            'Security Hub', 'Prisma Cloud', 'Aqua Security', 'Falco', 'OPA',
        ],
    },
    'Network Security Engineer': {
        'required': [
            'Firewalls', 'VPN', 'IDS/IPS', 'Network Protocols', 'SIEM',
            'Linux', 'Cisco', 'PKI', 'NAC', 'DDoS Mitigation',
            'Network Monitoring', 'Packet Analysis', 'Routing & Switching',
        ],
        'preferred': [
            'Wireshark', 'Palo Alto', 'Fortinet', 'Check Point', 'CCNA Security',
            'SD-WAN', 'Zero Trust', 'Python', 'Snort', 'Suricata',
        ],
    },
    'Digital Forensics Analyst': {
        'required': [
            'Digital Forensics', 'Evidence Collection', 'Chain of Custody', 'Disk Imaging',
            'Memory Forensics', 'Log Analysis', 'Malware Analysis', 'Linux',
            'Windows Forensics', 'File System Analysis', 'Report Writing',
        ],
        'preferred': [
            'Autopsy', 'FTK', 'Volatility', 'Wireshark', 'EnCase',
            'Network Forensics', 'Mobile Forensics', 'Python', 'Cellebrite', 'Sleuth Kit',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # DATABASE
    # ════════════════════════════════════════════════════════════════════════
    'SQL Developer': {
        'required': [
            'SQL', 'T-SQL', 'PostgreSQL', 'MySQL', 'Query Optimization',
            'Stored Procedures', 'Triggers', 'Indexes', 'Joins', 'Views',
            'Data Modeling', 'ETL', 'Report Writing', 'Git',
        ],
        'preferred': [
            'Oracle', 'SQL Server', 'Python', 'Power BI', 'Tableau',
            'Partitioning', 'Performance Tuning', 'SSRS', 'SSIS', 'dbt',
        ],
    },
    'Database Administrator': {
        'required': [
            'PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'Backup & Recovery',
            'Performance Tuning', 'Replication', 'High Availability', 'Security',
            'Linux', 'Query Optimization', 'Capacity Planning', 'Monitoring',
        ],
        'preferred': [
            'MongoDB', 'Redis', 'Cassandra', 'AWS RDS', 'Azure SQL',
            'Patroni', 'pgBouncer', 'ProxySQL', 'Percona', 'Automation',
        ],
    },
    'Database Engineer': {
        'required': [
            'SQL', 'Database Design', 'Normalization', 'PostgreSQL', 'MySQL',
            'Index Optimization', 'Stored Procedures', 'ETL', 'Data Modeling',
            'Git', 'Linux', 'Query Optimization', 'Schema Migration',
        ],
        'preferred': [
            'NoSQL', 'MongoDB', 'Redis', 'Cassandra', 'Elasticsearch',
            'Cloud Databases', 'Partitioning', 'Sharding', 'dbt', 'Liquibase',
        ],
    },
    'Data Warehouse Engineer': {
        'required': [
            'SQL', 'Data Warehousing', 'ETL', 'Dimensional Modeling', 'Star Schema',
            'Snowflake', 'Redshift', 'BigQuery', 'dbt', 'Apache Airflow',
            'Python', 'Git', 'Data Pipeline', 'Reporting',
        ],
        'preferred': [
            'Apache Spark', 'Databricks', 'Tableau', 'Power BI', 'Synapse Analytics',
            'Kimball Methodology', 'Kafka', 'Data Vault', 'SSIS', 'Azure Data Factory',
        ],
    },
    'Big Data Engineer': {
        'required': [
            'Apache Spark', 'Hadoop', 'Python', 'SQL', 'Kafka', 'HDFS',
            'Hive', 'HBase', 'Airflow', 'Scala', 'Git', 'Linux',
            'Distributed Computing', 'Data Lake',
        ],
        'preferred': [
            'Databricks', 'Flink', 'AWS EMR', 'Google Dataflow', 'Snowflake',
            'Delta Lake', 'Iceberg', 'Zookeeper', 'Presto', 'Druid',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # NETWORKING
    # ════════════════════════════════════════════════════════════════════════
    'Network Engineer': {
        'required': [
            'Routing & Switching', 'TCP/IP', 'OSPF', 'BGP', 'VLAN', 'Cisco',
            'Firewalls', 'VPN', 'Linux', 'Network Monitoring', 'Troubleshooting',
            'DNS', 'DHCP', 'MPLS',
        ],
        'preferred': [
            'CCNA', 'CCNP', 'SD-WAN', 'Python', 'Automation', 'Juniper',
            'Palo Alto', 'Wireshark', 'Network Security', 'Load Balancing',
        ],
    },
    'Linux Administrator': {
        'required': [
            'Linux', 'Bash Scripting', 'System Administration', 'File System Management',
            'Package Management', 'User Management', 'Networking', 'SSH',
            'Cron Jobs', 'Performance Monitoring', 'Security Hardening', 'Git',
        ],
        'preferred': [
            'Ansible', 'Terraform', 'Docker', 'Kubernetes', 'Python',
            'Nagios', 'Zabbix', 'RHEL/CentOS', 'Ubuntu', 'Automation',
        ],
    },
    'Windows Administrator': {
        'required': [
            'Windows Server', 'Active Directory', 'Group Policy', 'PowerShell',
            'DNS', 'DHCP', 'IIS', 'Hyper-V', 'Exchange Server',
            'Remote Desktop Services', 'Patch Management', 'Backup & Recovery',
        ],
        'preferred': [
            'Azure AD', 'Microsoft 365', 'SCCM', 'SCOM', 'Intune',
            'PowerShell Scripting', 'Automation', 'Security Hardening', 'VMware', 'SQL Server',
        ],
    },
    'System Administrator': {
        'required': [
            'Linux', 'Windows Server', 'Networking', 'Virtualization', 'Backup',
            'User Management', 'Security Hardening', 'Monitoring', 'Troubleshooting',
            'Scripting (Bash/PowerShell)', 'Storage', 'DNS/DHCP', 'Patch Management',
        ],
        'preferred': [
            'VMware', 'Hyper-V', 'Docker', 'Ansible', 'Cloud (AWS/Azure)',
            'Active Directory', 'Python', 'Nagios', 'ITIL', 'Zabbix',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # QA & TESTING
    # ════════════════════════════════════════════════════════════════════════
    'QA Engineer': {
        'required': [
            'Test Planning', 'Test Cases', 'Manual Testing', 'Bug Reporting',
            'Regression Testing', 'API Testing', 'SQL', 'Git', 'Agile/Scrum',
            'JIRA', 'Test Management', 'Functional Testing', 'UAT',
        ],
        'preferred': [
            'Selenium', 'Postman', 'Cypress', 'Python', 'ISTQB',
            'Performance Testing', 'Automation', 'CI/CD', 'JMeter', 'TestRail',
        ],
    },
    'Software Test Engineer': {
        'required': [
            'Test Planning', 'Test Cases', 'Functional Testing', 'API Testing',
            'SQL', 'Git', 'Bug Tracking', 'Agile', 'Regression Testing',
            'Integration Testing', 'System Testing', 'JIRA', 'Test Documentation',
        ],
        'preferred': [
            'Selenium', 'Postman', 'Python', 'Automation', 'CI/CD',
            'Performance Testing', 'Security Testing', 'TestNG', 'Cucumber', 'BDD',
        ],
    },
    'Automation Test Engineer': {
        'required': [
            'Selenium WebDriver', 'Python', 'Java', 'TestNG', 'JUnit',
            'CI/CD', 'Git', 'API Testing', 'Postman', 'Framework Design',
            'Page Object Model', 'Agile', 'SQL', 'Continuous Testing',
        ],
        'preferred': [
            'Cypress', 'Playwright', 'Appium', 'Robot Framework', 'BDD',
            'Cucumber', 'Jenkins', 'Docker', 'Allure Reports', 'JIRA',
        ],
    },
    'Manual Test Engineer': {
        'required': [
            'Manual Testing', 'Test Cases', 'Test Plans', 'Bug Reporting',
            'Functional Testing', 'Regression Testing', 'UAT', 'SQL',
            'API Testing', 'JIRA', 'Agile/Scrum', 'Cross-browser Testing',
        ],
        'preferred': [
            'Postman', 'Exploratory Testing', 'Mobile Testing', 'TestRail',
            'Zephyr', 'ISTQB', 'Security Testing', 'Usability Testing',
        ],
    },
    'Performance Test Engineer': {
        'required': [
            'JMeter', 'Load Testing', 'Stress Testing', 'Performance Analysis',
            'Grafana', 'Monitoring', 'Python', 'SQL', 'Git', 'CI/CD',
            'Bottleneck Analysis', 'Scalability Testing', 'Report Writing',
        ],
        'preferred': [
            'Gatling', 'Locust', 'k6', 'BlazeMeter', 'New Relic', 'Dynatrace',
            'AWS', 'Docker', 'APM Tools', 'Network Profiling', 'Chaos Engineering',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # UI/UX & DESIGN
    # ════════════════════════════════════════════════════════════════════════
    'UI Designer': {
        'required': [
            'Figma', 'UI Design', 'Typography', 'Color Theory', 'Visual Design',
            'Design Systems', 'Component Libraries', 'Responsive Design',
            'Prototyping', 'Iconography', 'Grid Systems', 'Accessibility',
        ],
        'preferred': [
            'Adobe XD', 'Sketch', 'Illustrator', 'Photoshop', 'HTML', 'CSS',
            'Motion Design', 'Brand Guidelines', 'Dark Mode Design', 'Framer',
        ],
    },
    'UX Designer': {
        'required': [
            'User Research', 'Usability Testing', 'Wireframing', 'Prototyping',
            'Information Architecture', 'Figma', 'UX Writing', 'Personas',
            'User Journey Mapping', 'A/B Testing', 'Design Thinking', 'Empathy Mapping',
        ],
        'preferred': [
            'Adobe XD', 'Hotjar', 'Maze', 'UserTesting', 'Miro',
            'Quantitative Research', 'Accessibility (WCAG)', 'Service Design', 'Interaction Design',
        ],
    },
    'UI/UX Designer': {
        'required': [
            'Figma', 'User Research', 'Wireframing', 'Prototyping', 'UI Design',
            'Design Systems', 'Usability Testing', 'Responsive Design', 'Typography',
            'Color Theory', 'User Journey Mapping', 'Accessibility', 'Visual Design',
        ],
        'preferred': [
            'Adobe XD', 'Sketch', 'Framer', 'HTML', 'CSS', 'Motion Design',
            'A/B Testing', 'Hotjar', 'Design Thinking', 'Interaction Design', 'Miro',
        ],
    },
    'Product Designer': {
        'required': [
            'Figma', 'Product Thinking', 'User Research', 'Prototyping', 'Design Systems',
            'Wireframing', 'Usability Testing', 'Data-driven Design', 'UX Writing',
            'Stakeholder Management', 'Cross-functional Collaboration', 'Accessibility',
        ],
        'preferred': [
            'SQL', 'Analytics', 'Mixpanel', 'Amplitude', 'A/B Testing',
            'Motion Design', 'Framer', 'Service Design', 'Roadmapping', 'OKRs',
        ],
    },
    'Graphic Designer': {
        'required': [
            'Adobe Photoshop', 'Adobe Illustrator', 'InDesign', 'Typography',
            'Color Theory', 'Branding', 'Logo Design', 'Print Design',
            'Digital Design', 'Layout Design', 'Visual Communication', 'Creativity',
        ],
        'preferred': [
            'Figma', 'After Effects', 'Motion Graphics', 'UI Design',
            'Social Media Design', 'Packaging Design', 'Photography', 'Canva',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # BLOCKCHAIN
    # ════════════════════════════════════════════════════════════════════════
    'Blockchain Developer': {
        'required': [
            'Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js', 'Ethers.js',
            'Hardhat', 'Truffle', 'JavaScript', 'Git', 'Cryptography',
            'DeFi', 'Blockchain Fundamentals', 'MetaMask', 'NFTs',
        ],
        'preferred': [
            'Rust', 'Solana', 'Polygon', 'IPFS', 'The Graph',
            'OpenZeppelin', 'Chainlink', 'Layer 2', 'Zero Knowledge Proofs', 'DAO',
        ],
    },
    'Solidity Developer': {
        'required': [
            'Solidity', 'Ethereum', 'Smart Contracts', 'EVM', 'Hardhat',
            'OpenZeppelin', 'Web3.js', 'Ethers.js', 'Git', 'Security Auditing',
            'Gas Optimization', 'ERC Standards', 'DeFi', 'Testing',
        ],
        'preferred': [
            'Foundry', 'Polygon', 'Layer 2', 'Chainlink', 'The Graph',
            'IPFS', 'Slither', 'MythX', 'Upgradeable Contracts', 'Assembly (Yul)',
        ],
    },
    'Smart Contract Developer': {
        'required': [
            'Solidity', 'Smart Contracts', 'Ethereum', 'Hardhat', 'OpenZeppelin',
            'Security Patterns', 'Gas Optimization', 'ERC Standards', 'Testing',
            'Git', 'Web3.js', 'DeFi Protocols', 'Auditing', 'Reentrancy Prevention',
        ],
        'preferred': [
            'Rust', 'Solana', 'Foundry', 'Slither', 'Echidna',
            'Formal Verification', 'Upgradeable Contracts', 'Chainlink', 'Layer 2',
        ],
    },
    'Web3 Developer': {
        'required': [
            'Web3.js', 'Ethers.js', 'JavaScript', 'TypeScript', 'React',
            'Solidity', 'Smart Contracts', 'MetaMask', 'IPFS', 'Git',
            'Wallet Integration', 'DApp Development', 'REST API', 'NFTs',
        ],
        'preferred': [
            'Next.js', 'Hardhat', 'Moralis', 'Alchemy', 'The Graph',
            'Wagmi', 'RainbowKit', 'DeFi', 'Layer 2', 'Chainlink',
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # IOT & EMBEDDED
    # ════════════════════════════════════════════════════════════════════════
    'Embedded Systems Engineer': {
        'required': [
            'C', 'C++', 'Microcontrollers', 'RTOS', 'Assembly', 'GPIO',
            'UART', 'SPI', 'I2C', 'Debugging (JTAG)', 'Embedded Linux',
            'Low-level Programming', 'Firmware Development', 'Git',
        ],
        'preferred': [
            'Python', 'FreeRTOS', 'Zephyr', 'ARM Cortex', 'STM32',
            'CAN Bus', 'Ethernet', 'Power Management', 'PCB Design', 'CI/CD',
        ],
    },
    'Firmware Engineer': {
        'required': [
            'C', 'C++', 'Embedded C', 'RTOS', 'Microcontrollers', 'Assembly',
            'Hardware Interfaces (UART, SPI, I2C, CAN)', 'Debugging', 'Git',
            'Bootloaders', 'Memory Management', 'Power Management', 'Linker Scripts',
        ],
        'preferred': [
            'Python', 'FreeRTOS', 'Zephyr', 'ARM Cortex-M', 'Yocto',
            'OTA Updates', 'Secure Boot', 'PCB Design', 'Static Analysis', 'CI/CD',
        ],
    },
    'IoT Engineer': {
        'required': [
            'Embedded C', 'C++', 'Python', 'MQTT', 'HTTP', 'REST API',
            'Microcontrollers', 'Sensors & Actuators', 'Cloud IoT Platforms',
            'WiFi/BLE/Zigbee', 'Git', 'Linux', 'Data Collection', 'Edge Computing',
        ],
        'preferred': [
            'AWS IoT', 'Azure IoT Hub', 'Google Cloud IoT', 'Raspberry Pi',
            'Arduino', 'FreeRTOS', 'LoRaWAN', 'OPC-UA', 'SCADA', 'TensorFlow Lite',
        ],
    },
    'Robotics Engineer': {
        'required': [
            'ROS/ROS2', 'C++', 'Python', 'Motion Planning', 'Kinematics',
            'Computer Vision', 'Sensor Fusion', 'Control Systems', 'SLAM',
            'Embedded Systems', 'Git', 'Linux', 'Simulation (Gazebo)', 'PCB',
        ],
        'preferred': [
            'Deep Learning', 'Reinforcement Learning', 'OpenCV', 'PyBullet',
            'MoveIt', 'RViz', 'MATLAB', 'PLC', 'FPGA', 'Docker',
        ],
    },
}


# ---------------------------------------------------------------------------
# MARKET DATABASE
# Keys must match SKILL_DATABASE keys exactly.
# ---------------------------------------------------------------------------
MARKET_DATABASE: Dict[str, Dict] = {
    # AI & ML
    'AI Engineer':                  {'total_jobs': 8500,  'salary_data': {'average_min': 100000, 'average_max': 200000, 'average_salary': 150000}, 'job_trends': {'growth': 'Explosive',  'demand': 8500,  'growth_pct': 45}},
    'Machine Learning Engineer':    {'total_jobs': 7000,  'salary_data': {'average_min': 95000,  'average_max': 185000, 'average_salary': 140000}, 'job_trends': {'growth': 'Explosive',  'demand': 7000,  'growth_pct': 40}},
    'Deep Learning Engineer':       {'total_jobs': 4500,  'salary_data': {'average_min': 100000, 'average_max': 190000, 'average_salary': 145000}, 'job_trends': {'growth': 'Very High',  'demand': 4500,  'growth_pct': 38}},
    'Generative AI Engineer':       {'total_jobs': 9500,  'salary_data': {'average_min': 115000, 'average_max': 220000, 'average_salary': 167500}, 'job_trends': {'growth': 'Explosive',  'demand': 9500,  'growth_pct': 80}},
    'LLM Engineer':                 {'total_jobs': 7500,  'salary_data': {'average_min': 110000, 'average_max': 210000, 'average_salary': 160000}, 'job_trends': {'growth': 'Explosive',  'demand': 7500,  'growth_pct': 75}},
    'Prompt Engineer':              {'total_jobs': 5000,  'salary_data': {'average_min': 90000,  'average_max': 175000, 'average_salary': 132500}, 'job_trends': {'growth': 'Very High',  'demand': 5000,  'growth_pct': 60}},
    'NLP Engineer':                 {'total_jobs': 4000,  'salary_data': {'average_min': 90000,  'average_max': 175000, 'average_salary': 132500}, 'job_trends': {'growth': 'Very High',  'demand': 4000,  'growth_pct': 35}},
    'Computer Vision Engineer':     {'total_jobs': 3500,  'salary_data': {'average_min': 95000,  'average_max': 185000, 'average_salary': 140000}, 'job_trends': {'growth': 'Very High',  'demand': 3500,  'growth_pct': 32}},
    'AI Research Engineer':         {'total_jobs': 2500,  'salary_data': {'average_min': 110000, 'average_max': 220000, 'average_salary': 165000}, 'job_trends': {'growth': 'High',       'demand': 2500,  'growth_pct': 28}},
    'MLOps Engineer':               {'total_jobs': 5500,  'salary_data': {'average_min': 95000,  'average_max': 185000, 'average_salary': 140000}, 'job_trends': {'growth': 'Very High',  'demand': 5500,  'growth_pct': 42}},

    # Data
    'Data Scientist':               {'total_jobs': 6000,  'salary_data': {'average_min': 80000,  'average_max': 155000, 'average_salary': 117500}, 'job_trends': {'growth': 'Very High',  'demand': 6000,  'growth_pct': 28}},
    'Data Analyst':                 {'total_jobs': 7500,  'salary_data': {'average_min': 55000,  'average_max': 110000, 'average_salary': 82500},  'job_trends': {'growth': 'High',       'demand': 7500,  'growth_pct': 20}},
    'Data Engineer':                {'total_jobs': 6500,  'salary_data': {'average_min': 85000,  'average_max': 165000, 'average_salary': 125000}, 'job_trends': {'growth': 'Very High',  'demand': 6500,  'growth_pct': 35}},

    # Software Development
    'Software Engineer':            {'total_jobs': 15000, 'salary_data': {'average_min': 80000,  'average_max': 160000, 'average_salary': 120000}, 'job_trends': {'growth': 'Very High',  'demand': 15000, 'growth_pct': 22}},
    'Software Developer':           {'total_jobs': 13000, 'salary_data': {'average_min': 70000,  'average_max': 145000, 'average_salary': 107500}, 'job_trends': {'growth': 'High',       'demand': 13000, 'growth_pct': 18}},
    'Python Developer':             {'total_jobs': 9000,  'salary_data': {'average_min': 75000,  'average_max': 150000, 'average_salary': 112500}, 'job_trends': {'growth': 'Very High',  'demand': 9000,  'growth_pct': 30}},
    'Java Developer':               {'total_jobs': 8500,  'salary_data': {'average_min': 75000,  'average_max': 150000, 'average_salary': 112500}, 'job_trends': {'growth': 'High',       'demand': 8500,  'growth_pct': 12}},
    'C++ Developer':                {'total_jobs': 4500,  'salary_data': {'average_min': 80000,  'average_max': 165000, 'average_salary': 122500}, 'job_trends': {'growth': 'Moderate',   'demand': 4500,  'growth_pct': 8}},
    'Full Stack Developer':         {'total_jobs': 10000, 'salary_data': {'average_min': 75000,  'average_max': 155000, 'average_salary': 115000}, 'job_trends': {'growth': 'Very High',  'demand': 10000, 'growth_pct': 25}},
    'Frontend Developer':           {'total_jobs': 9000,  'salary_data': {'average_min': 65000,  'average_max': 140000, 'average_salary': 102500}, 'job_trends': {'growth': 'High',       'demand': 9000,  'growth_pct': 15}},
    'Backend Developer':            {'total_jobs': 8500,  'salary_data': {'average_min': 70000,  'average_max': 150000, 'average_salary': 110000}, 'job_trends': {'growth': 'High',       'demand': 8500,  'growth_pct': 15}},
    'MERN Stack Developer':         {'total_jobs': 6000,  'salary_data': {'average_min': 70000,  'average_max': 145000, 'average_salary': 107500}, 'job_trends': {'growth': 'Very High',  'demand': 6000,  'growth_pct': 28}},
    'MEAN Stack Developer':         {'total_jobs': 4000,  'salary_data': {'average_min': 68000,  'average_max': 140000, 'average_salary': 104000}, 'job_trends': {'growth': 'High',       'demand': 4000,  'growth_pct': 18}},
    'React Developer':              {'total_jobs': 8000,  'salary_data': {'average_min': 70000,  'average_max': 145000, 'average_salary': 107500}, 'job_trends': {'growth': 'Very High',  'demand': 8000,  'growth_pct': 25}},
    'Angular Developer':            {'total_jobs': 4500,  'salary_data': {'average_min': 65000,  'average_max': 135000, 'average_salary': 100000}, 'job_trends': {'growth': 'Moderate',   'demand': 4500,  'growth_pct': 10}},
    'Vue.js Developer':             {'total_jobs': 3000,  'salary_data': {'average_min': 65000,  'average_max': 135000, 'average_salary': 100000}, 'job_trends': {'growth': 'Moderate',   'demand': 3000,  'growth_pct': 12}},
    'Node.js Developer':            {'total_jobs': 6000,  'salary_data': {'average_min': 68000,  'average_max': 140000, 'average_salary': 104000}, 'job_trends': {'growth': 'High',       'demand': 6000,  'growth_pct': 20}},
    'PHP Developer':                {'total_jobs': 5000,  'salary_data': {'average_min': 55000,  'average_max': 115000, 'average_salary': 85000},  'job_trends': {'growth': 'Moderate',   'demand': 5000,  'growth_pct': 5}},
    'Laravel Developer':            {'total_jobs': 3500,  'salary_data': {'average_min': 55000,  'average_max': 115000, 'average_salary': 85000},  'job_trends': {'growth': 'Moderate',   'demand': 3500,  'growth_pct': 8}},
    '.NET Developer':               {'total_jobs': 6000,  'salary_data': {'average_min': 75000,  'average_max': 150000, 'average_salary': 112500}, 'job_trends': {'growth': 'High',       'demand': 6000,  'growth_pct': 12}},
    'Spring Boot Developer':        {'total_jobs': 5500,  'salary_data': {'average_min': 75000,  'average_max': 150000, 'average_salary': 112500}, 'job_trends': {'growth': 'High',       'demand': 5500,  'growth_pct': 15}},
    'Django Developer':             {'total_jobs': 4000,  'salary_data': {'average_min': 70000,  'average_max': 140000, 'average_salary': 105000}, 'job_trends': {'growth': 'High',       'demand': 4000,  'growth_pct': 18}},
    'Flask Developer':              {'total_jobs': 3000,  'salary_data': {'average_min': 68000,  'average_max': 135000, 'average_salary': 101500}, 'job_trends': {'growth': 'High',       'demand': 3000,  'growth_pct': 15}},

    # Mobile
    'Android Developer':            {'total_jobs': 6000,  'salary_data': {'average_min': 70000,  'average_max': 145000, 'average_salary': 107500}, 'job_trends': {'growth': 'High',       'demand': 6000,  'growth_pct': 15}},
    'iOS Developer':                {'total_jobs': 5500,  'salary_data': {'average_min': 75000,  'average_max': 155000, 'average_salary': 115000}, 'job_trends': {'growth': 'High',       'demand': 5500,  'growth_pct': 15}},
    'Flutter Developer':            {'total_jobs': 4500,  'salary_data': {'average_min': 65000,  'average_max': 140000, 'average_salary': 102500}, 'job_trends': {'growth': 'Very High',  'demand': 4500,  'growth_pct': 35}},
    'React Native Developer':       {'total_jobs': 4000,  'salary_data': {'average_min': 65000,  'average_max': 140000, 'average_salary': 102500}, 'job_trends': {'growth': 'High',       'demand': 4000,  'growth_pct': 20}},

    # DevOps & Cloud
    'DevOps Engineer':              {'total_jobs': 8000,  'salary_data': {'average_min': 85000,  'average_max': 165000, 'average_salary': 125000}, 'job_trends': {'growth': 'Very High',  'demand': 8000,  'growth_pct': 28}},
    'Cloud Engineer':               {'total_jobs': 7000,  'salary_data': {'average_min': 85000,  'average_max': 170000, 'average_salary': 127500}, 'job_trends': {'growth': 'Very High',  'demand': 7000,  'growth_pct': 30}},
    'AWS Cloud Engineer':           {'total_jobs': 8500,  'salary_data': {'average_min': 90000,  'average_max': 175000, 'average_salary': 132500}, 'job_trends': {'growth': 'Very High',  'demand': 8500,  'growth_pct': 32}},
    'Azure Cloud Engineer':         {'total_jobs': 7000,  'salary_data': {'average_min': 88000,  'average_max': 172000, 'average_salary': 130000}, 'job_trends': {'growth': 'Very High',  'demand': 7000,  'growth_pct': 30}},
    'Google Cloud Engineer':        {'total_jobs': 5000,  'salary_data': {'average_min': 90000,  'average_max': 175000, 'average_salary': 132500}, 'job_trends': {'growth': 'Very High',  'demand': 5000,  'growth_pct': 28}},
    'Site Reliability Engineer':    {'total_jobs': 5500,  'salary_data': {'average_min': 100000, 'average_max': 195000, 'average_salary': 147500}, 'job_trends': {'growth': 'Very High',  'demand': 5500,  'growth_pct': 32}},
    'Kubernetes Engineer':          {'total_jobs': 4000,  'salary_data': {'average_min': 90000,  'average_max': 175000, 'average_salary': 132500}, 'job_trends': {'growth': 'Very High',  'demand': 4000,  'growth_pct': 30}},
    'Docker Engineer':              {'total_jobs': 3500,  'salary_data': {'average_min': 80000,  'average_max': 160000, 'average_salary': 120000}, 'job_trends': {'growth': 'High',       'demand': 3500,  'growth_pct': 22}},
    'Platform Engineer':            {'total_jobs': 4000,  'salary_data': {'average_min': 95000,  'average_max': 185000, 'average_salary': 140000}, 'job_trends': {'growth': 'Very High',  'demand': 4000,  'growth_pct': 35}},

    # Cyber Security
    'Cyber Security Engineer':      {'total_jobs': 6000,  'salary_data': {'average_min': 85000,  'average_max': 165000, 'average_salary': 125000}, 'job_trends': {'growth': 'Very High',  'demand': 6000,  'growth_pct': 33}},
    'Cyber Security Analyst':       {'total_jobs': 5500,  'salary_data': {'average_min': 70000,  'average_max': 135000, 'average_salary': 102500}, 'job_trends': {'growth': 'Very High',  'demand': 5500,  'growth_pct': 30}},
    'Ethical Hacker':               {'total_jobs': 3000,  'salary_data': {'average_min': 80000,  'average_max': 160000, 'average_salary': 120000}, 'job_trends': {'growth': 'High',       'demand': 3000,  'growth_pct': 25}},
    'Penetration Tester':           {'total_jobs': 3500,  'salary_data': {'average_min': 85000,  'average_max': 165000, 'average_salary': 125000}, 'job_trends': {'growth': 'Very High',  'demand': 3500,  'growth_pct': 28}},
    'SOC Analyst':                  {'total_jobs': 5000,  'salary_data': {'average_min': 65000,  'average_max': 120000, 'average_salary': 92500},  'job_trends': {'growth': 'Very High',  'demand': 5000,  'growth_pct': 30}},
    'Security Consultant':          {'total_jobs': 3000,  'salary_data': {'average_min': 90000,  'average_max': 175000, 'average_salary': 132500}, 'job_trends': {'growth': 'High',       'demand': 3000,  'growth_pct': 22}},
    'Information Security Analyst': {'total_jobs': 4500,  'salary_data': {'average_min': 70000,  'average_max': 135000, 'average_salary': 102500}, 'job_trends': {'growth': 'Very High',  'demand': 4500,  'growth_pct': 28}},
    'Cloud Security Engineer':      {'total_jobs': 4000,  'salary_data': {'average_min': 95000,  'average_max': 180000, 'average_salary': 137500}, 'job_trends': {'growth': 'Explosive',  'demand': 4000,  'growth_pct': 40}},
    'Network Security Engineer':    {'total_jobs': 3500,  'salary_data': {'average_min': 80000,  'average_max': 155000, 'average_salary': 117500}, 'job_trends': {'growth': 'High',       'demand': 3500,  'growth_pct': 20}},
    'Digital Forensics Analyst':    {'total_jobs': 2000,  'salary_data': {'average_min': 70000,  'average_max': 130000, 'average_salary': 100000}, 'job_trends': {'growth': 'Moderate',   'demand': 2000,  'growth_pct': 15}},

    # Database
    'SQL Developer':                {'total_jobs': 5000,  'salary_data': {'average_min': 60000,  'average_max': 120000, 'average_salary': 90000},  'job_trends': {'growth': 'Moderate',   'demand': 5000,  'growth_pct': 8}},
    'Database Administrator':       {'total_jobs': 4500,  'salary_data': {'average_min': 70000,  'average_max': 135000, 'average_salary': 102500}, 'job_trends': {'growth': 'Moderate',   'demand': 4500,  'growth_pct': 5}},
    'Database Engineer':            {'total_jobs': 4000,  'salary_data': {'average_min': 75000,  'average_max': 145000, 'average_salary': 110000}, 'job_trends': {'growth': 'High',       'demand': 4000,  'growth_pct': 12}},
    'Data Warehouse Engineer':      {'total_jobs': 3500,  'salary_data': {'average_min': 85000,  'average_max': 160000, 'average_salary': 122500}, 'job_trends': {'growth': 'Very High',  'demand': 3500,  'growth_pct': 25}},
    'Big Data Engineer':            {'total_jobs': 4000,  'salary_data': {'average_min': 90000,  'average_max': 170000, 'average_salary': 130000}, 'job_trends': {'growth': 'Very High',  'demand': 4000,  'growth_pct': 28}},

    # Networking
    'Network Engineer':             {'total_jobs': 5000,  'salary_data': {'average_min': 65000,  'average_max': 125000, 'average_salary': 95000},  'job_trends': {'growth': 'Moderate',   'demand': 5000,  'growth_pct': 8}},
    'Linux Administrator':          {'total_jobs': 4000,  'salary_data': {'average_min': 65000,  'average_max': 125000, 'average_salary': 95000},  'job_trends': {'growth': 'Moderate',   'demand': 4000,  'growth_pct': 10}},
    'Windows Administrator':        {'total_jobs': 4500,  'salary_data': {'average_min': 60000,  'average_max': 115000, 'average_salary': 87500},  'job_trends': {'growth': 'Moderate',   'demand': 4500,  'growth_pct': 5}},
    'System Administrator':         {'total_jobs': 5500,  'salary_data': {'average_min': 60000,  'average_max': 115000, 'average_salary': 87500},  'job_trends': {'growth': 'Moderate',   'demand': 5500,  'growth_pct': 5}},

    # QA & Testing
    'QA Engineer':                  {'total_jobs': 5500,  'salary_data': {'average_min': 55000,  'average_max': 115000, 'average_salary': 85000},  'job_trends': {'growth': 'High',       'demand': 5500,  'growth_pct': 15}},
    'Software Test Engineer':       {'total_jobs': 4500,  'salary_data': {'average_min': 55000,  'average_max': 115000, 'average_salary': 85000},  'job_trends': {'growth': 'High',       'demand': 4500,  'growth_pct': 12}},
    'Automation Test Engineer':     {'total_jobs': 5000,  'salary_data': {'average_min': 65000,  'average_max': 130000, 'average_salary': 97500},  'job_trends': {'growth': 'Very High',  'demand': 5000,  'growth_pct': 25}},
    'Manual Test Engineer':         {'total_jobs': 4000,  'salary_data': {'average_min': 45000,  'average_max': 90000,  'average_salary': 67500},  'job_trends': {'growth': 'Moderate',   'demand': 4000,  'growth_pct': 5}},
    'Performance Test Engineer':    {'total_jobs': 2500,  'salary_data': {'average_min': 70000,  'average_max': 135000, 'average_salary': 102500}, 'job_trends': {'growth': 'High',       'demand': 2500,  'growth_pct': 18}},

    # UI/UX
    'UI Designer':                  {'total_jobs': 4000,  'salary_data': {'average_min': 55000,  'average_max': 115000, 'average_salary': 85000},  'job_trends': {'growth': 'High',       'demand': 4000,  'growth_pct': 15}},
    'UX Designer':                  {'total_jobs': 4500,  'salary_data': {'average_min': 60000,  'average_max': 125000, 'average_salary': 92500},  'job_trends': {'growth': 'High',       'demand': 4500,  'growth_pct': 18}},
    'UI/UX Designer':               {'total_jobs': 6000,  'salary_data': {'average_min': 60000,  'average_max': 130000, 'average_salary': 95000},  'job_trends': {'growth': 'Very High',  'demand': 6000,  'growth_pct': 22}},
    'Product Designer':             {'total_jobs': 4000,  'salary_data': {'average_min': 75000,  'average_max': 150000, 'average_salary': 112500}, 'job_trends': {'growth': 'Very High',  'demand': 4000,  'growth_pct': 25}},
    'Graphic Designer':             {'total_jobs': 5000,  'salary_data': {'average_min': 40000,  'average_max': 90000,  'average_salary': 65000},  'job_trends': {'growth': 'Moderate',   'demand': 5000,  'growth_pct': 5}},

    # Blockchain
    'Blockchain Developer':         {'total_jobs': 3000,  'salary_data': {'average_min': 95000,  'average_max': 185000, 'average_salary': 140000}, 'job_trends': {'growth': 'Very High',  'demand': 3000,  'growth_pct': 30}},
    'Solidity Developer':           {'total_jobs': 2500,  'salary_data': {'average_min': 100000, 'average_max': 195000, 'average_salary': 147500}, 'job_trends': {'growth': 'Very High',  'demand': 2500,  'growth_pct': 35}},
    'Smart Contract Developer':     {'total_jobs': 2500,  'salary_data': {'average_min': 100000, 'average_max': 195000, 'average_salary': 147500}, 'job_trends': {'growth': 'Very High',  'demand': 2500,  'growth_pct': 35}},
    'Web3 Developer':               {'total_jobs': 3000,  'salary_data': {'average_min': 90000,  'average_max': 180000, 'average_salary': 135000}, 'job_trends': {'growth': 'Very High',  'demand': 3000,  'growth_pct': 30}},

    # IoT & Embedded
    'Embedded Systems Engineer':    {'total_jobs': 3500,  'salary_data': {'average_min': 75000,  'average_max': 150000, 'average_salary': 112500}, 'job_trends': {'growth': 'High',       'demand': 3500,  'growth_pct': 18}},
    'Firmware Engineer':            {'total_jobs': 3000,  'salary_data': {'average_min': 80000,  'average_max': 155000, 'average_salary': 117500}, 'job_trends': {'growth': 'High',       'demand': 3000,  'growth_pct': 18}},
    'IoT Engineer':                 {'total_jobs': 4000,  'salary_data': {'average_min': 80000,  'average_max': 155000, 'average_salary': 117500}, 'job_trends': {'growth': 'Very High',  'demand': 4000,  'growth_pct': 30}},
    'Robotics Engineer':            {'total_jobs': 2500,  'salary_data': {'average_min': 85000,  'average_max': 170000, 'average_salary': 127500}, 'job_trends': {'growth': 'Very High',  'demand': 2500,  'growth_pct': 28}},
}

# Convenience: sorted list of all role names for available_roles responses
ALL_ROLE_NAMES: List[str] = sorted(SKILL_DATABASE.keys())
