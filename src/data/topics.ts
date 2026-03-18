import { DailyTopic } from '../types';

export const TOPICS: Record<number, DailyTopic> = {
  1: {
    day: 1,
    title: 'Introduction to Modern Web Architecture',
    description: 'Learn about the core components of modern web applications and how they interact.',
    difficulty: 'easy',
    content: `
# Modern Web Architecture

Modern web applications are built using a multi-layered approach. The primary components include:

1. **The Client (Frontend)**: The user interface built with HTML, CSS, and JavaScript (often using frameworks like React).
2. **The Server (Backend)**: Handles business logic, authentication, and data processing.
3. **The Database**: Stores persistent data.
4. **APIs**: The communication bridge between the client and server.

### Key Concepts
- **SPA (Single Page Application)**: Loads a single HTML page and dynamically updates content.
- **Microservices**: Breaking down a large application into smaller, independent services.
- **Serverless**: Running code without managing servers (e.g., AWS Lambda).
    `,
    examples: [
      'A React application fetching data from a Node.js API.',
      'Using Firebase for real-time data synchronization.',
      'Deploying a static site on Vercel or Netlify.'
    ],
    resources: [
      { type: 'video', title: 'Web Architecture Explained', url: 'https://example.com/video1', duration: '10:00' },
      { type: 'doc', title: 'MDN Web Docs: How the web works', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_web_works' }
    ],
    quiz: [
      {
        id: 'q1_1',
        question: 'What is the primary role of an API in web architecture?',
        options: [
          'To store data permanently',
          'To act as a communication bridge between client and server',
          'To render the user interface',
          'To manage server hardware'
        ],
        correctAnswer: 'To act as a communication bridge between client and server',
        explanation: 'APIs (Application Programming Interfaces) allow different software components to communicate with each other.'
      },
      {
        id: 'q1_2',
        question: 'Which component is responsible for the User Interface?',
        options: ['Backend', 'Database', 'Frontend', 'Middleware'],
        correctAnswer: 'Frontend',
        explanation: 'The Frontend is the part of the application that users interact with directly.'
      },
      {
        id: 'q1_3',
        question: 'What does SPA stand for?',
        options: [
          'Single Page Application',
          'Server Side Application',
          'Simple Process Architecture',
          'Static Page Asset'
        ],
        correctAnswer: 'Single Page Application',
        explanation: 'SPA stands for Single Page Application, where the app interacts with the user by dynamically rewriting the current page.'
      }
    ]
  },
  2: {
    day: 2,
    title: 'Advanced State Management',
    description: 'Master the art of managing complex application state efficiently.',
    difficulty: 'medium',
    content: `
# Advanced State Management

As applications grow, managing state becomes challenging. We explore:

1. **Context API**: Built-in React feature for sharing state globally.
2. **Redux / Toolkit**: Predictable state container for large-scale apps.
3. **Zustand / Recoil**: Modern, lightweight alternatives.
4. **Server State**: Managing data from APIs using React Query or SWR.

### When to use what?
- Use **useState** for local component state.
- Use **Context** for low-frequency updates (e.g., theme, user auth).
- Use **Redux** for complex, high-frequency global state.
    `,
    examples: [
      'Implementing a global theme switcher using Context.',
      'Managing a shopping cart with Redux Toolkit.',
      'Caching API responses with React Query.'
    ],
    resources: [
      { type: 'video', title: 'React State Management in 2024', url: 'https://example.com/video2', duration: '15:00' },
      { type: 'doc', title: 'Redux Toolkit Documentation', url: 'https://redux-toolkit.js.org/' }
    ],
    quiz: [
      {
        id: 'q2_1',
        question: 'When is the Context API most suitable?',
        options: [
          'For high-frequency state updates',
          'For local component state only',
          'For low-frequency global state like themes or auth',
          'To replace all databases'
        ],
        correctAnswer: 'For low-frequency global state like themes or auth',
        explanation: 'Context is great for data that doesn\'t change often but needs to be accessed by many components.'
      }
    ]
  },
  3: {
    day: 3,
    title: 'Performance Optimization',
    description: 'Learn how to build lightning-fast web applications.',
    difficulty: 'hard',
    content: `
# Performance Optimization

Performance is a feature. We cover:

1. **Memoization**: Using React.memo, useMemo, and useCallback.
2. **Code Splitting**: Dynamic imports and React.lazy.
3. **Virtualization**: Rendering large lists efficiently.
4. **Image Optimization**: Lazy loading and modern formats.

### Core Metrics
- **LCP (Largest Contentful Paint)**: Measures loading performance.
- **FID (First Input Delay)**: Measures interactivity.
- **CLS (Cumulative Layout Shift)**: Measures visual stability.
    `,
    examples: [
      'Using React.memo to prevent unnecessary re-renders.',
      'Implementing windowing for a list of 10,000 items.',
      'Optimizing images with next/image or similar tools.'
    ],
    resources: [
      { type: 'video', title: 'Web Vitals Explained', url: 'https://example.com/video3', duration: '12:00' },
      { type: 'doc', title: 'React Docs: Performance', url: 'https://react.dev/learn/render-and-commit' }
    ],
    quiz: [
      {
        id: 'q3_1',
        question: 'What is the primary purpose of React.memo?',
        options: [
          'To store data in a database',
          'To prevent unnecessary re-renders of a component',
          'To fetch data from an API',
          'To style components'
        ],
        correctAnswer: 'To prevent unnecessary re-renders of a component',
        explanation: 'React.memo is a higher-order component that skips re-rendering a component if its props haven\'t changed.'
      }
    ]
  },
  4: {
    day: 4,
    title: 'Testing and Quality Assurance',
    description: 'Ensure your code works as expected with automated tests.',
    difficulty: 'medium',
    content: `
# Testing and QA

Writing tests saves time in the long run. We explore:

1. **Unit Testing**: Testing individual functions or components (Jest, Vitest).
2. **Integration Testing**: Testing how different parts of the app work together.
3. **E2E Testing**: Testing the entire user flow (Cypress, Playwright).
4. **TDD (Test Driven Development)**: Writing tests before code.

### Why Test?
- Catch bugs early.
- Refactor with confidence.
- Document expected behavior.
    `,
    examples: [
      'Writing a unit test for a utility function.',
      'Testing a React component with React Testing Library.',
      'Creating an E2E test for a login flow.'
    ],
    resources: [
      { type: 'video', title: 'Testing React Apps', url: 'https://example.com/video4', duration: '18:00' },
      { type: 'doc', title: 'Vitest Documentation', url: 'https://vitest.dev/' }
    ],
    quiz: [
      {
        id: 'q4_1',
        question: 'Which type of test checks the entire user flow from start to finish?',
        options: ['Unit Test', 'Integration Test', 'E2E Test', 'Static Analysis'],
        correctAnswer: 'E2E Test',
        explanation: 'End-to-End (E2E) tests simulate real user interactions to ensure the whole system works correctly.'
      }
    ]
  },
  5: {
    day: 5,
    title: 'Security Best Practices',
    description: 'Protect your application and user data from common threats.',
    difficulty: 'hard',
    content: `
# Security Best Practices

Security should never be an afterthought. We cover:

1. **XSS (Cross-Site Scripting)**: Preventing malicious scripts.
2. **CSRF (Cross-Site Request Forgery)**: Protecting against unauthorized actions.
3. **Authentication & Authorization**: Securely managing user access.
4. **Data Sanitization**: Cleaning user input.

### Key Principles
- **Least Privilege**: Grant only necessary permissions.
- **Defense in Depth**: Multiple layers of security.
- **Never Trust User Input**: Always validate and sanitize.
    `,
    examples: [
      'Sanitizing user-generated HTML.',
      'Implementing secure HTTP-only cookies.',
      'Using JWT for stateless authentication.'
    ],
    resources: [
      { type: 'video', title: 'Web Security for Developers', url: 'https://example.com/video5', duration: '20:00' },
      { type: 'doc', title: 'OWASP Top Ten', url: 'https://owasp.org/www-project-top-ten/' }
    ],
    quiz: [
      {
        id: 'q5_1',
        question: 'What does XSS stand for?',
        options: ['X-linked Secret Service', 'Cross-Site Scripting', 'XML Style Sheets', 'Xtra Secure Socket'],
        correctAnswer: 'Cross-Site Scripting',
        explanation: 'XSS is a security vulnerability where an attacker injects malicious scripts into a web page.'
      }
    ]
  },
  6: {
    day: 6,
    title: 'Deployment and CI/CD',
    description: 'Automate your release process and deploy with confidence.',
    difficulty: 'medium',
    content: `
# Deployment and CI/CD

Get your code into the hands of users efficiently. We explore:

1. **CI (Continuous Integration)**: Automatically building and testing code.
2. **CD (Continuous Deployment)**: Automatically releasing to production.
3. **Cloud Providers**: AWS, Google Cloud, Azure.
4. **Containerization**: Using Docker for consistent environments.

### Benefits of CI/CD
- Faster release cycles.
- Reduced manual errors.
- Improved code quality.
    `,
    examples: [
      'Setting up a GitHub Action for automated testing.',
      'Deploying a containerized app to Cloud Run.',
      'Configuring a staging environment.'
    ],
    resources: [
      { type: 'video', title: 'CI/CD Pipeline Explained', url: 'https://example.com/video6', duration: '14:00' },
      { type: 'doc', title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions' }
    ],
    quiz: [
      {
        id: 'q6_1',
        question: 'What is the main goal of Continuous Integration (CI)?',
        options: [
          'To manually deploy code',
          'To automatically build and test code changes',
          'To write documentation',
          'To design user interfaces'
        ],
        correctAnswer: 'To automatically build and test code changes',
        explanation: 'CI ensures that new code changes are integrated and tested frequently to catch issues early.'
      }
    ]
  },
  7: {
    day: 7,
    title: 'Building for the Future',
    description: 'Explore emerging trends and prepare for the next wave of web tech.',
    difficulty: 'medium',
    content: `
# Building for the Future

The web is always evolving. We look at:

1. **WebAssembly (Wasm)**: High-performance code in the browser.
2. **Web3 and Decentralization**: Blockchain and peer-to-peer tech.
3. **AI Integration**: Using LLMs and AI tools in web apps.
4. **Edge Computing**: Running code closer to the user.

### Staying Current
- Follow industry leaders.
- Experiment with new tools.
- Contribute to open source.
    `,
    examples: [
      'Integrating a Gemini AI chatbot into a React app.',
      'Using WebAssembly for heavy image processing.',
      'Deploying edge functions for low-latency APIs.'
    ],
    resources: [
      { type: 'video', title: 'The Future of Web Development', url: 'https://example.com/video7', duration: '25:00' },
      { type: 'doc', title: 'WebAssembly.org', url: 'https://webassembly.org/' }
    ],
    quiz: [
      {
        id: 'q7_1',
        question: 'Which technology allows high-performance code to run in the browser?',
        options: ['HTML5', 'WebAssembly', 'jQuery', 'Flash'],
        correctAnswer: 'WebAssembly',
        explanation: 'WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine, designed as a portable compilation target for programming languages like C, C++, and Rust.'
      }
    ]
  }
};
