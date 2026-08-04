import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { youtubeSearch, getAnalysis, generateRoadmap } from '../../services/api'
import PremiumVideoModal from '../../components/PremiumVideoModal'
import { useAuth } from '../../context/AuthContext'

const TRACKS = {
  'Full Stack': {
    color: '#6366F1',
    nodes: [
      { id: 'root', title: 'Full Stack Dev', icon: 'code', col: 4, row: 0, status: 'done', desc: 'The complete path from zero to a production-ready full-stack engineer.', topics: ['HTML', 'CSS', 'JavaScript', 'Git'], category: 'Start Here' },
      { id: 'internet', title: 'How the Internet Works', icon: 'wifi', col: 1, row: 1, status: 'done', desc: 'TCP/IP, DNS, HTTP, HTTPS, SSL/TLS and how browsers render pages.', topics: ['HTTP/HTTPS', 'DNS', 'TCP/IP'], category: 'Fundamentals' },
      { id: 'html', title: 'HTML & CSS', icon: 'language', col: 3, row: 1, status: 'done', desc: 'Semantic HTML, accessibility, responsive design, Flexbox, Grid.', topics: ['HTML5', 'CSS3', 'Flexbox', 'Grid', 'Accessibility'], category: 'Fundamentals' },
      { id: 'js', title: 'JavaScript', icon: 'terminal', col: 5, row: 1, status: 'done', desc: 'ES6+, DOM, async/await, fetch API, event loop.', topics: ['ES6+', 'DOM', 'Async', 'Fetch', 'Promises'], category: 'Fundamentals' },
      { id: 'git', title: 'Version Control', icon: 'history', col: 7, row: 1, status: 'done', desc: 'Git, GitHub, branching strategies, PR workflow.', topics: ['Git', 'GitHub', 'Branching', 'PRs'], category: 'Fundamentals' },
      { id: 'react', title: 'React / Vue / Angular', icon: 'hub', col: 2, row: 2, status: 'doing', desc: 'Component architecture, state management, hooks, routing.', topics: ['React', 'Hooks', 'Redux', 'Vue', 'Router'], category: 'Frontend' },
      { id: 'ts', title: 'TypeScript', icon: 'data_object', col: 5, row: 2, status: 'doing', desc: 'Static typing, interfaces, generics, strict mode.', topics: ['Types', 'Interfaces', 'Generics'], category: 'Frontend' },
      { id: 'node', title: 'Node.js', icon: 'deployed_code', col: 7, row: 2, status: 'todo', desc: 'Event-driven, non-blocking I/O, npm ecosystem.', topics: ['Express', 'npm', 'EventLoop', 'Streams'], category: 'Backend' },
      { id: 'rest', title: 'REST APIs', icon: 'api', col: 2, row: 3, status: 'done', desc: 'HTTP methods, status codes, API design best practices.', topics: ['REST', 'CRUD', 'Status Codes', 'Swagger'], category: 'Backend' },
      { id: 'db-rel', title: 'SQL / PostgreSQL', icon: 'database', col: 5, row: 3, status: 'doing', desc: 'Relational databases, joins, indexes, transactions, ORMs.', topics: ['SQL', 'Joins', 'Indexes', 'Prisma', 'Drizzle'], category: 'Backend' },
      { id: 'db-nosql', title: 'NoSQL — MongoDB', icon: 'storage', col: 7, row: 3, status: 'todo', desc: 'Document model, aggregations, Atlas, Redis caching.', topics: ['MongoDB', 'Redis', 'Atlas', 'Aggregation'], category: 'Backend' },
      { id: 'auth', title: 'Auth & Security', icon: 'lock', col: 1, row: 4, status: 'todo', desc: 'JWT, OAuth2, RBAC, hashing, XSS/CSRF protection.', topics: ['JWT', 'OAuth2', 'RBAC', 'Bcrypt', 'HTTPS'], category: 'Security' },
      { id: 'docker', title: 'Docker', icon: 'inventory_2', col: 3, row: 4, status: 'todo', desc: 'Containerisation, Docker Compose, multi-stage builds.', topics: ['Containers', 'Dockerfile', 'Compose'], category: 'DevOps' },
      { id: 'cloud', title: 'AWS / GCP / Azure', icon: 'cloud', col: 6, row: 4, status: 'todo', desc: 'EC2, S3, Lambda, RDS, CDN, IAM roles.', topics: ['EC2', 'S3', 'Lambda', 'IAM', 'CloudFront'], category: 'Cloud' },
      { id: 'ci', title: 'CI / CD Pipelines', icon: 'loop', col: 8, row: 4, status: 'optional', desc: 'GitHub Actions, Jenkins, automated testing & deployment.', topics: ['GitHub Actions', 'Docker Hub', 'Helm'], category: 'DevOps' },
      { id: 'test', title: 'Testing', icon: 'bug_report', col: 2, row: 5, status: 'todo', desc: 'Unit, integration, E2E testing with Jest, Vitest, Playwright.', topics: ['Jest', 'Vitest', 'Playwright', 'TDD'], category: 'Quality' },
      { id: 'perf', title: 'Performance', icon: 'speed', col: 5, row: 5, status: 'optional', desc: 'Core Web Vitals, lazy loading, code splitting, CDN, caching.', topics: ['LCP', 'FID', 'CLS', 'Lighthouse'], category: 'Quality' },
      { id: 'k8s', title: 'Kubernetes', icon: 'account_tree', col: 7, row: 5, status: 'optional', desc: 'Orchestration, pods, services, ingress, Helm charts.', topics: ['Pods', 'Services', 'Ingress', 'Helm', 'HPA'], category: 'DevOps' },
    ],
    edges: [
      ['root', 'internet'], ['root', 'html'], ['root', 'js'], ['root', 'git'],
      ['js', 'react'], ['js', 'ts'], ['js', 'node'],
      ['node', 'rest'], ['rest', 'db-rel'], ['db-rel', 'db-nosql'],
      ['rest', 'auth'], ['node', 'docker'], ['cloud', 'ci'], ['docker', 'cloud'],
      ['react', 'test'], ['node', 'test'], ['react', 'perf'], ['docker', 'k8s'],
    ]
  },
  'Frontend': {
    color: '#a78bfa',
    nodes: [
      { id: 'root', title: 'Frontend Dev', icon: 'web', col: 4, row: 0, status: 'done', desc: 'Build beautiful, performant user interfaces.', topics: ['HTML', 'CSS', 'JS'], category: 'Start' },
      { id: 'html', title: 'HTML Semantics', icon: 'language', col: 2, row: 1, status: 'done', desc: 'Accessible, semantic HTML5 structure.', topics: ['HTML5', 'ARIA', 'SEO'], category: 'Foundation' },
      { id: 'css', title: 'CSS Mastery', icon: 'brush', col: 6, row: 1, status: 'done', desc: 'Flexbox, Grid, animations, CSS variables, SASS.', topics: ['Flexbox', 'Grid', 'SASS', 'Animations'], category: 'Foundation' },
      { id: 'js', title: 'JavaScript ES6+', icon: 'terminal', col: 4, row: 2, status: 'doing', desc: 'Modern JS — promises, modules, closures, event loop.', topics: ['ES6+', 'Modules', 'Closures', 'Fetch'], category: 'Core' },
      { id: 'react', title: 'React', icon: 'hub', col: 2, row: 3, status: 'doing', desc: 'Hooks, context, suspense, server components.', topics: ['Hooks', 'Context', 'RSC'], category: 'Framework' },
      { id: 'next', title: 'Next.js', icon: 'deployed_code', col: 2, row: 4, status: 'todo', desc: 'SSR, SSG, ISR, App Router, server actions.', topics: ['SSR', 'SSG', 'AppRouter', 'Edge'], category: 'Framework' },
      { id: 'ts', title: 'TypeScript', icon: 'data_object', col: 6, row: 3, status: 'doing', desc: 'Strong typing, interfaces, generics, utility types.', topics: ['Types', 'Generics', 'Zod'], category: 'Core' },
      { id: 'test', title: 'Testing', icon: 'bug_report', col: 4, row: 4, status: 'todo', desc: 'Jest, React Testing Library, Playwright.', topics: ['Jest', 'RTL', 'Playwright'], category: 'Quality' },
      { id: 'perf', title: 'Web Performance', icon: 'speed', col: 6, row: 4, status: 'optional', desc: 'Vitals, bundling, code splitting, tree shaking.', topics: ['LCP', 'CLS', 'Parcel', 'Vite'], category: 'Advanced' },
      { id: 'a11y', title: 'Accessibility', icon: 'accessibility', col: 2, row: 5, status: 'optional', desc: 'WCAG, screen readers, focus management, ARIA.', topics: ['WCAG', 'ARIA', 'Tab focus'], category: 'Advanced' },
      { id: 'anim', title: 'Animations & 3D', icon: 'animation', col: 6, row: 5, status: 'optional', desc: 'Framer Motion, GSAP, Three.js, WebGL.', topics: ['Framer', 'GSAP', 'Three.js', 'WebGL'], category: 'Advanced' },
    ],
    edges: [
      ['root', 'html'], ['root', 'css'], ['root', 'js'],
      ['js', 'react'], ['js', 'ts'],
      ['react', 'next'], ['react', 'test'],
      ['ts', 'test'], ['ts', 'perf'],
      ['next', 'a11y'], ['perf', 'anim'],
    ]
  },
  'Backend': {
    color: '#34d399',
    nodes: [
      { id: 'root', title: 'Backend Dev', icon: 'dns', col: 4, row: 0, status: 'done', desc: 'Build scalable, secure server-side systems.', topics: ['APIs', 'Databases', 'Auth'], category: 'Start' },
      { id: 'lang', title: 'Python / Node / Go', icon: 'code', col: 4, row: 1, status: 'done', desc: 'Pick your primary backend language.', topics: ['Python', 'Node.js', 'Go', 'Java'], category: 'Language' },
      { id: 'rest', title: 'REST API Design', icon: 'api', col: 2, row: 2, status: 'done', desc: 'Resource naming, versioning, pagination, status codes.', topics: ['REST', 'OpenAPI', 'Swagger'], category: 'APIs' },
      { id: 'gql', title: 'GraphQL', icon: 'hub', col: 6, row: 2, status: 'doing', desc: 'Schema, resolvers, mutations, subscriptions.', topics: ['Schema', 'Resolvers', 'Apollo', 'Relay'], category: 'APIs' },
      { id: 'db', title: 'Databases', icon: 'database', col: 4, row: 3, status: 'doing', desc: 'SQL vs NoSQL — PostgreSQL, MongoDB, Redis.', topics: ['PostgreSQL', 'MongoDB', 'Redis'], category: 'Data' },
      { id: 'auth', title: 'Auth & Sessions', icon: 'lock', col: 2, row: 4, status: 'todo', desc: 'JWT, sessions, OAuth2, refresh tokens, MFA.', topics: ['JWT', 'OAuth2', 'Sessions', 'MFA'], category: 'Security' },
      { id: 'cache', title: 'Caching Strategies', icon: 'memory', col: 6, row: 4, status: 'todo', desc: 'Redis, CDN, cache invalidation, cache-aside pattern.', topics: ['Redis', 'CDN', 'TTL', 'Cache-Aside'], category: 'Performance' },
      { id: 'msg', title: 'Message Queues', icon: 'queue', col: 4, row: 4, status: 'optional', desc: 'Kafka, RabbitMQ, SQS — event-driven architecture.', topics: ['Kafka', 'RabbitMQ', 'SQS', 'Pub/Sub'], category: 'Architecture' },
      { id: 'micro', title: 'Microservices', icon: 'account_tree', col: 2, row: 5, status: 'optional', desc: 'Service decomposition, gRPC, service mesh, circuit breaker.', topics: ['gRPC', 'Istio', 'CircuitBreaker'], category: 'Architecture' },
      { id: 'test', title: 'Testing Strategies', icon: 'bug_report', col: 6, row: 5, status: 'todo', desc: 'Unit, integration, contract tests. TDD & BDD.', topics: ['Pytest', 'Jest', 'Contract Tests', 'TDD'], category: 'Quality' },
    ],
    edges: [
      ['root', 'lang'], ['lang', 'rest'], ['lang', 'gql'],
      ['rest', 'db'], ['gql', 'db'],
      ['db', 'auth'], ['db', 'cache'], ['db', 'msg'],
      ['auth', 'micro'], ['cache', 'test'], ['msg', 'micro'],
    ]
  },
  'DevOps': {
    color: '#60a5fa',
    nodes: [
      { id: 'root', title: 'DevOps Engineer', icon: 'settings', col: 4, row: 0, status: 'done', desc: 'Bridge development and operations for fast, reliable delivery.', topics: ['CI/CD', 'Cloud', 'IaC'], category: 'Start' },
      { id: 'linux', title: 'Linux & Shell', icon: 'terminal', col: 2, row: 1, status: 'done', desc: 'Bash scripting, file system, process management, SSH.', topics: ['Bash', 'Cron', 'Systemd', 'SSH'], category: 'Foundation' },
      { id: 'net', title: 'Networking', icon: 'wifi', col: 6, row: 1, status: 'done', desc: 'TCP/IP, DNS, load balancers, firewalls, VPNs.', topics: ['TCP/IP', 'DNS', 'NAT', 'Firewall'], category: 'Foundation' },
      { id: 'git', title: 'Git & GitOps', icon: 'history', col: 4, row: 2, status: 'done', desc: 'Advanced Git, GitFlow, GitHub Actions, ArgoCD.', topics: ['GitFlow', 'ArgoCD', 'Flux'], category: 'VCS' },
      { id: 'docker', title: 'Docker', icon: 'inventory_2', col: 2, row: 3, status: 'doing', desc: 'Images, containers, networking, volumes, Compose.', topics: ['Dockerfile', 'Compose', 'Registry'], category: 'Containers' },
      { id: 'k8s', title: 'Kubernetes', icon: 'account_tree', col: 5, row: 3, status: 'doing', desc: 'Pods, deployments, services, ingress, HPA.', topics: ['Pods', 'Services', 'Helm', 'HPA', 'RBAC'], category: 'Orchestration' },
      { id: 'cloud', title: 'Cloud (AWS/GCP)', icon: 'cloud', col: 4, row: 4, status: 'todo', desc: 'Compute, storage, networking, IAM, managed services.', topics: ['EC2', 'S3', 'VPC', 'IAM', 'GKE'], category: 'Cloud' },
      { id: 'iac', title: 'IaC — Terraform', icon: 'construction', col: 2, row: 4, status: 'todo', desc: 'Infrastructure as code, state management, modules.', topics: ['Terraform', 'Pulumi', 'CDK', 'Ansible'], category: 'IaC' },
      { id: 'ci', title: 'CI/CD Pipelines', icon: 'loop', col: 6, row: 4, status: 'todo', desc: 'GitHub Actions, Jenkins, automated testing.', topics: ['GH Actions', 'Jenkins', 'Tekton'], category: 'CI/CD' },
      { id: 'obs', title: 'Observability', icon: 'monitoring', col: 4, row: 5, status: 'todo', desc: 'Metrics, logs, traces — Prometheus, Grafana, OpenTelemetry.', topics: ['Prometheus', 'Grafana', 'Jaeger', 'OTel'], category: 'Operations' },
      { id: 'sec', title: 'DevSecOps', icon: 'security', col: 2, row: 5, status: 'optional', desc: 'SAST, DAST, container scanning, secret management.', topics: ['Trivy', 'Vault', 'Snyk', 'OWASP'], category: 'Security' },
    ],
    edges: [
      ['root', 'linux'], ['root', 'net'],
      ['linux', 'git'], ['net', 'git'],
      ['git', 'docker'], ['docker', 'k8s'],
      ['k8s', 'cloud'], ['cloud', 'iac'], ['cloud', 'ci'],
      ['ci', 'obs'], ['iac', 'sec'], ['obs', 'sec'],
    ]
  },
  'AI / ML': {
    color: '#f472b6',
    nodes: [
      { id: 'root', title: 'AI / ML Engineer', icon: 'psychology', col: 4, row: 0, status: 'done', desc: 'Build intelligent systems that learn from data.', topics: ['Math', 'Python', 'Statistics'], category: 'Start' },
      { id: 'math', title: 'Math Foundations', icon: 'calculate', col: 2, row: 1, status: 'done', desc: 'Linear algebra, calculus, probability, statistics.', topics: ['Linear Algebra', 'Calculus', 'Probability'], category: 'Math' },
      { id: 'py', title: 'Python + Libraries', icon: 'terminal', col: 6, row: 1, status: 'done', desc: 'NumPy, Pandas, Matplotlib — data manipulation.', topics: ['NumPy', 'Pandas', 'Matplotlib', 'SciPy'], category: 'Tools' },
      { id: 'ml', title: 'Machine Learning', icon: 'auto_graph', col: 4, row: 2, status: 'doing', desc: 'Supervised, unsupervised, reinforcement learning.', topics: ['Scikit-learn', 'XGBoost', 'SVMs', 'KNN'], category: 'ML' },
      { id: 'dl', title: 'Deep Learning', icon: 'hub', col: 4, row: 3, status: 'doing', desc: 'Neural networks, CNNs, RNNs, transformers.', topics: ['TensorFlow', 'PyTorch', 'CNNs', 'Transformers'], category: 'DL' },
      { id: 'nlp', title: 'NLP & LLMs', icon: 'chat', col: 2, row: 4, status: 'todo', desc: 'Text processing, embeddings, fine-tuning, RAG.', topics: ['Hugging Face', 'LangChain', 'RAG', 'RLHF'], category: 'NLP' },
      { id: 'cv', title: 'Computer Vision', icon: 'image_search', col: 6, row: 4, status: 'optional', desc: 'Image classification, object detection, segmentation.', topics: ['OpenCV', 'YOLO', 'ResNet', 'ViT'], category: 'CV' },
      { id: 'mlops', title: 'MLOps', icon: 'loop', col: 4, row: 4, status: 'todo', desc: 'Model deployment, monitoring, drift detection, CI/CD for ML.', topics: ['MLflow', 'Kubeflow', 'Seldon', 'DVC'], category: 'Ops' },
      { id: 'prod', title: 'Production AI', icon: 'rocket_launch', col: 4, row: 5, status: 'optional', desc: 'Latency, quantisation, ONNX, serving, A/B testing.', topics: ['ONNX', 'TensorRT', 'Triton', 'vLLM'], category: 'Advanced' },
    ],
    edges: [
      ['root', 'math'], ['root', 'py'],
      ['math', 'ml'], ['py', 'ml'],
      ['ml', 'dl'],
      ['dl', 'nlp'], ['dl', 'cv'], ['dl', 'mlops'],
      ['nlp', 'prod'], ['mlops', 'prod'],
    ]
  }
}

const COL_W = 230
const ROW_H = 170
const CANVAS_PAD = 60


export default function CareerRoadmap() {
  const { authenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTrack, setActiveTrack] = useState('Full Stack')
  const [scale, setScale] = useState(1)
  const [selectedNode, setSelectedNode] = useState(null)
  const [statusMap, setStatusMap] = useState({})
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', desc: '' })
  
  const [aiRoadmap, setAiRoadmap] = useState(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [viewMode, setViewMode] = useState('tree') // 'tree' or 'timeline'
  const [activeVideo, setActiveVideo] = useState(null)

  const canvasRef = useRef(null)

  // Fetch AI Roadmap from backend based on resume
  useEffect(() => {
    async function fetchAiRoadmap() {
      const resumeId = localStorage.getItem('rw_last_analyzed_id')
      if (!resumeId) return
      
      setLoadingRoadmap(true)
      try {
        const analysisRes = await getAnalysis(resumeId)
        if (analysisRes.success && analysisRes.data) {
          const analysis = analysisRes.data.analysis || analysisRes.data
          const matching = analysis.skills?.matching || analysis.matchingSkills || []
          const role = analysis.detected_track || analysis.targetRole || 'Software Developer'
          
          const roadmapRes = await generateRoadmap(matching, role, 12)
          if (roadmapRes.success && roadmapRes.data?.roadmap) {
            setAiRoadmap(roadmapRes.data.roadmap)
          }
        }
      } catch (err) {
        console.error('Error generating AI roadmap:', err)
      } finally {
        setLoadingRoadmap(false)
      }
    }
    
    if (authenticated) {
      fetchAiRoadmap()
    }
  }, [authenticated])

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authenticated) {
      navigate('/signin')
    }
  }, [authenticated, navigate])

  // Get track from search params
  useEffect(() => {
    const rawTrack = searchParams.get('track')
    if (rawTrack) {
      const t = rawTrack.toLowerCase()
      if (t.includes('frontend')) setActiveTrack('Frontend')
      else if (t.includes('backend') || t.includes('python')) setActiveTrack('Backend')
      else if (t.includes('devops')) setActiveTrack('DevOps')
      else if (t.includes('data') || t.includes('ai') || t.includes('ml')) setActiveTrack('AI / ML')
      else if (t.includes('web') || t.includes('full stack') || t.includes('full-stack')) setActiveTrack('Full Stack')
    }
  }, [searchParams])

  // Load status map from local storage
  useEffect(() => {
    const data = localStorage.getItem('rw_roadmap_status')
    if (data) {
      try {
        setStatusMap(JSON.parse(data))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Fetch YouTube Videos for selected node
  useEffect(() => {
    if (!selectedNode) return
    
    async function getVideos() {
      setLoadingVideos(true)
      try {
        const res = await youtubeSearch(selectedNode.title + ' tutorial', 4)
        if (res.success && res.data?.videos) {
          setVideos(res.data.videos)
        } else {
          setVideos([])
        }
      } catch (err) {
        console.error(err)
        setVideos([])
      } finally {
        setLoadingVideos(false)
      }
    }

    getVideos()
  }, [selectedNode])

  const setNodeStatus = (nodeId, newStatus) => {
    const key = `${activeTrack}_${nodeId}`
    const updated = { ...statusMap, [key]: newStatus }
    setStatusMap(updated)
    localStorage.setItem('rw_roadmap_status', JSON.stringify(updated))
  }

  const track = TRACKS[activeTrack]
  const nodes = track.nodes
  const edges = track.edges

  // Calculate canvas dimensions
  const maxCol = Math.max(...nodes.map(n => n.col))
  const maxRow = Math.max(...nodes.map(n => n.row))
  const canvasWidth = (maxCol + 1) * COL_W + CANVAS_PAD * 2
  const canvasHeight = (maxRow + 1) * ROW_H + CANVAS_PAD * 2

  // Map nodes to layout coordinates
  const pos = {}
  nodes.forEach(n => {
    pos[n.id] = {
      x: CANVAS_PAD + n.col * COL_W,
      y: CANVAS_PAD + n.row * ROW_H
    }
  })

  // Calculate progress
  const totalNodes = nodes.length
  const doneNodes = nodes.filter(n => (statusMap[`${activeTrack}_${n.id}`] || n.status) === 'done').length
  const progressPercent = totalNodes > 0 ? (doneNodes / totalNodes) * 100 : 0

  return (
    <div className="flex flex-1 h-[calc(100vh-65px)] relative" style={{ background: '#050505' }}>
      
      {/* Sidebar navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0A0A0A]/50 flex flex-col overflow-hidden relative z-20">
        <div className="p-6 border-b border-white/10">
          <div className="vanguard-heading text-xl font-bold text-white mb-1">Career Roadmap</div>
          <p className="text-xs text-gray-400 leading-relaxed">Interactive path — click any node to explore</p>
        </div>

        {/* Tracks List */}
        <div className="p-4 border-b border-white/10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Career Tracks</div>
          <div className="space-y-1">
            {Object.keys(TRACKS).map((k) => (
              <button
                key={k}
                onClick={() => {
                  setActiveTrack(k)
                  setSelectedNode(null)
                  setSearchParams({ track: k })
                }}
                className={`w-full text-left padding px-3 py-2 rounded-lg text-xs font-semibold tracking-wider font-mono transition-all border ${
                  k === activeTrack
                    ? 'bg-[#6366F1]/10 border-[#6366F1]/30 text-[#6366F1]'
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-b border-white/10 space-y-2 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Legend</div>
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> Completed
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> In Progress
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" /> To Learn
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Optional
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="p-4 mt-auto">
          <div className="rounded-xl border border-white/10 p-4 space-y-2 bg-[#0A0A0A]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progress</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#6366F1] rounded-full transition-all duration-700" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{doneNodes} done</span>
              <span>{totalNodes} total</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Roadmap Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-[#0A0A0A]/30 relative z-20">
          {viewMode === 'tree' && (
            <>
              <button 
                onClick={() => setScale(prev => Math.min(prev + 0.15, 2))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
              <button 
                onClick={() => setScale(prev => Math.max(prev - 0.15, 0.4))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <button 
                onClick={() => setScale(1)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                title="Reset"
              >
                <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
              </button>
              <div className="w-px h-5 bg-white/10 mx-1"></div>
            </>
          )}
          <span className="text-xs text-gray-400 font-mono">{activeTrack} Developer</span>
          
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'tree' ? 'timeline' : 'tree')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] text-[10px] font-bold uppercase tracking-widest hover:bg-[#a78bfa]/20 transition-all mr-2"
            >
              <span className="material-symbols-outlined text-[14px]">timeline</span>
              {viewMode === 'tree' ? 'AI Timeline' : 'Interactive Tree'}
            </button>
            <Link 
              to="/resources"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-[10px] font-bold uppercase tracking-widest hover:bg-[#6366F1]/20 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">play_circle</span>Resources
            </Link>
          </div>
        </div>

        {viewMode === 'timeline' ? (
          <div className="flex-1 overflow-auto p-8 bg-[#050505] relative z-10">
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
              <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
                <div>
                  <h2 className="vanguard-heading text-3xl font-bold text-white">Dynamic AI Timeline</h2>
                  <p className="text-sm text-gray-400">12-Month personalized trajectory calculated for your target profile.</p>
                </div>
              </div>

              {loadingRoadmap ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(n => <div key={n} className="skeleton h-32 rounded-2xl" />)}
                </div>
              ) : !aiRoadmap || Object.keys(aiRoadmap).length === 0 ? (
                <div className="text-center py-16 bg-[#0a0a0a] rounded-2xl p-8 border border-white/10 text-gray-500 text-sm font-mono">
                  <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">pending_actions</span>
                  No AI Roadmap generated. Upload a resume to generate a target roadmap.
                </div>
              ) : (
                <div className="relative border-l border-white/10 pl-8 ml-4 space-y-12">
                  {Object.entries(aiRoadmap).map(([monthKey, mData], idx) => {
                    const focus = mData?.focus || 'Skill focus'
                    const resources = mData?.resources || []
                    const project = mData?.project || ''
                    const milestone = mData?.milestone || ''
                    
                    return (
                      <div key={monthKey} className="relative group">
                        <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#050505] border border-[#6366F1] flex items-center justify-center text-[10px] text-[#6366F1] font-bold font-mono">
                          {idx + 1}
                        </div>
                        
                        <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-[#6366F1]/20 transition-all">
                          <div className="bg-[#0A0A0A] rounded-[calc(2rem-0.375rem)] p-6 border border-white/10">
                            <span className="text-[10px] text-[#6366F1] font-bold uppercase tracking-widest font-mono block mb-1">
                              {monthKey.replace('_', ' ')}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-3">{focus}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                              <div>
                                <strong className="text-white block mb-1 font-mono uppercase tracking-wider text-[10px]">Projects</strong>
                                <span className="leading-relaxed">{project || 'Build training assignments.'}</span>
                              </div>
                              <div>
                                <strong className="text-white block mb-1 font-mono uppercase tracking-wider text-[10px]">Milestones</strong>
                                <span className="leading-relaxed">{milestone || 'Verify milestone requirements.'}</span>
                              </div>
                            </div>

                            {resources.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-white/5">
                                <strong className="text-white block mb-2 font-mono uppercase tracking-wider text-[10px]">Recommended Resources</strong>
                                <div className="flex flex-wrap gap-2">
                                  {resources.map((r, i) => (
                                    <button
                                      key={i}
                                      onClick={async () => {
                                        setLoadingVideos(true);
                                        try {
                                          const searchRes = await youtubeSearch(r + ' tutorial', 1);
                                          if (searchRes.success && searchRes.data?.videos?.length > 0) {
                                            setActiveVideo(searchRes.data.videos[0]);
                                          } else {
                                            alert(`No video resources found for: ${r}`);
                                          }
                                        } catch (e) {
                                          console.error(e);
                                        } finally {
                                          setLoadingVideos(false);
                                        }
                                      }}
                                      className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#6366F1]/10 hover:text-[#6366F1] border border-white/10 text-[10px] text-gray-300 font-semibold uppercase tracking-wider transition-all"
                                    >
                                      📽 {r}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Scrollable canvas wrap */
          <div 
            className="flex-1 overflow-auto relative cursor-grab active:cursor-grabbing bg-[#050505]"
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                setScale(prev => Math.min(Math.max(prev - e.deltaY * 0.001, 0.4), 2))
              }
            }}
          >
            <div 
              ref={canvasRef}
              className="relative origin-top-left transition-transform duration-100 ease-out"
              style={{ 
                width: `${canvasWidth}px`, 
                height: `${canvasHeight}px`,
                transform: `scale(${scale})`
              }}
            >
            {/* Connection SVG Paths */}
            <svg 
              className="absolute inset-0 pointer-events-none z-0" 
              style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            >
              {edges.map(([a, b], idx) => {
                const pa = pos[a]
                const pb = pos[b]
                if (!pa || !pb) return null
                const x1 = pa.x + 95
                const y1 = pa.y + 40
                const x2 = pb.x + 95
                const y2 = pb.y + 4
                const cy = (y1 + y2) / 2
                return (
                  <path 
                    key={idx}
                    d={`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`}
                    fill="none" 
                    stroke={`${track.color}40`} 
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                )
              })}
            </svg>

            {/* Nodes Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {nodes.map(n => {
                const p = pos[n.id]
                const status = statusMap[`${activeTrack}_${n.id}`] || n.status
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        show: true,
                        x: e.clientX + 14,
                        y: e.clientY + 14,
                        title: n.title,
                        desc: n.desc
                      })
                    }}
                    onMouseMove={(e) => {
                      setTooltip(prev => ({ ...prev, x: e.clientX + 14, y: e.clientY + 14 }))
                    }}
                    onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                    className={`rnode absolute pointer-events-auto bg-[#0a0a0a]/95 border rounded-[14px] px-[18px] py-[14px] cursor-pointer transition-all duration-300 text-center min-w-[190px] max-w-[220px] select-none ${
                      status === 'done' 
                        ? 'border-[#6366F1]/50 shadow-[0_0_20px_rgba(99, 102, 241,0.15)]' 
                        : status === 'doing' 
                          ? 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.12)]' 
                          : status === 'optional'
                            ? 'border-purple-400/35 opacity-75'
                            : 'border-white/10'
                    }`}
                    style={{ left: `${p.x}px`, top: `${p.y}px` }}
                  >
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full absolute top-2 right-2.5 ${
                      status === 'done' 
                        ? 'bg-[#6366F1]' 
                        : status === 'doing' 
                          ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                          : status === 'optional'
                            ? 'bg-purple-400'
                            : 'bg-white/20'
                    }`} />
                    
                    <span 
                      className="material-symbols-outlined rnode-icon text-2xl mb-1.5 block"
                      style={{ color: track.color }}
                    >
                      {n.icon}
                    </span>
                    <div className="rnode-title text-xs font-semibold text-white tracking-wide">{n.title}</div>
                    <div className="rnode-sub text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{n.category}</div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
        )}
      </div>

      {/* Detail Panel Drawer */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-[420px] bg-[#0a0a0a] border-l border-white/10 z-50 transition-transform duration-300 p-8 overflow-y-auto ${
          selectedNode ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedNode && (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-[#6366F1] text-[10px] font-bold uppercase tracking-widest mb-1">
                  {selectedNode.category || activeTrack}
                </div>
                <h2 className="vanguard-heading text-2xl text-white font-bold">{selectedNode.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Status Selectors */}
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setNodeStatus(selectedNode.id, 'done')}
                className={`flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  (statusMap[`${activeTrack}_${selectedNode.id}`] || selectedNode.status) === 'done'
                    ? 'border-[#6366F1]/50 text-[#6366F1] bg-[#6366F1]/10'
                    : 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                ✓ Done
              </button>
              <button 
                onClick={() => setNodeStatus(selectedNode.id, 'doing')}
                className={`flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  (statusMap[`${activeTrack}_${selectedNode.id}`] || selectedNode.status) === 'doing'
                    ? 'border-amber-400/50 text-amber-400 bg-amber-400/10'
                    : 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                ⟳ Doing
              </button>
              <button 
                onClick={() => setNodeStatus(selectedNode.id, 'todo')}
                className={`flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  (statusMap[`${activeTrack}_${selectedNode.id}`] || selectedNode.status) === 'todo'
                    ? 'border-white/20 text-white bg-white/10'
                    : 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                ○ Todo
              </button>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">{selectedNode.desc}</p>

            {/* Topics tags */}
            <div className="mb-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Key Topics</div>
              <div className="flex flex-wrap gap-2">
                {(selectedNode.topics || []).map((t, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#6366F1] uppercase tracking-wider"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* YouTube resources */}
            <div className="mb-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Learning Resources</div>
              
              {loadingVideos ? (
                <div className="text-xs text-gray-400 animate-pulse font-mono">Fetching YouTube resources…</div>
              ) : videos.length === 0 ? (
                <Link 
                  to={`/resources?q=${encodeURIComponent(selectedNode.title)}`}
                  className="text-xs text-[#6366F1] hover:underline"
                >
                  Search in Resource Hub →
                </Link>
              ) : (
                <div className="space-y-3">
                  {videos.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveVideo(v)}
                      className="flex gap-3 items-start p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#6366F1]/25 transition-colors group cursor-pointer"
                    >
                      <img 
                        src={v.thumbnail || `https://i.ytimg.com/vi/${v.video_id}/mqdefault.jpg`} 
                        alt="" 
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0 group-hover:opacity-90 transition-opacity"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white line-clamp-2 group-hover:text-[#6366F1] transition-colors">
                          {v.title}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">{v.channel || 'YouTube'}</div>
                        <div className="text-[10px] text-[#6366F1] mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">play_circle</span>
                          Watch In-App
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Premium Video Modal Player */}
      <PremiumVideoModal 
        activeVideo={activeVideo} 
        setActiveVideo={setActiveVideo}
        videosList={videos}
      />

      {/* Hover Node Tooltip */}
      {tooltip.show && (
        <div 
          className="fixed pointer-events-none z-[100] bg-[#111] border border-[#6366F1]/30 rounded-lg p-3 text-xs text-white max-w-[240px] shadow-[0_8px_30px_rgba(0,0,0,.5)] transition-opacity duration-200"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <strong className="block mb-1 text-white">{tooltip.title}</strong>
          <span className="text-gray-400 leading-normal">{tooltip.desc.slice(0, 80)}…</span>
        </div>
      )}

    </div>
  )
}


