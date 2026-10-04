export type Language = 'en' | 'hi' | 'mr';

export interface TranslationSchema {
  brandName: string;
  tagline: string;
  subTagline: string;
  heroDescription: string;
  launchMission: string;
  viewLiveDemo: string;
  exploreHowItWorks: string;
  runFlagshipDemo: string;
  hackathonDemoMode: string;
  nav: {
    dashboard: string;
    missions: string;
    digitalTwin?: string;
    planner: string;
    agents?: string;
    predictive?: string;
    execution: string;
    resources: string;
    simulator: string;
    memory?: string;
    tools: string;
    tacticalMap: string;
    documents: string;
    analytics: string;
    audit: string;
    aiChat: string;
    settings: string;
    sectionCommand?: string;
    sectionIntelligence?: string;
    sectionExecution?: string;
    sectionMemoryGovernance?: string;
    sectionSystem?: string;
  };
  landing: {
    badge: string;
    previewTitle: string;
    missionName: string;
    adaptiveStatus: string;
    tasks: string;
    completed: string;
    inProgress: string;
    waitingAppr: string;
    replanned: string;
    system: string;
    operational: string;
    progressText: string;
    etaText: string;
    disruptionHandled: string;
    inspectConsole: string;
    pipelineTitle: string;
    pipelineSub: string;
    domainsTitle: string;
    domainsSubtitle: string;
    domainsDesc: string;
    footerTag: string;
    footerSub: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    interactiveGraph: string;
    launchNew: string;
    humanApprovalReq: string;
    reviewAuthorize: string;
    resourceStrainTitle: string;
    viewAllResources: string;
    auditEventsTitle: string;
    fullLedger: string;
    injectR2: string;
    injectFleet: string;
    activeMissionKicker: string;
  };
  status: {
    operational: string;
    degraded: string;
    maintenance: string;
    offline: string;
    draft: string;
    planning: string;
    executing: string;
    paused: string;
    replanning: string;
    awaiting_approval: string;
    completed: string;
    failed: string;
    pending: string;
    planned: string;
    ready: string;
    in_progress: string;
    waiting_approval: string;
    verified: string;
  };
  metrics: {
    activeMissions: string;
    completedMissions: string;
    tasksExecuting: string;
    tasksWaitingApproval: string;
    replanningEvents: string;
    systemHealth: string;
    successRate: string;
    avgReplanningTime: string;
  };
  missionCard: {
    priority: string;
    location: string;
    progress: string;
    eta: string;
    activeAgents: string;
    planVersion: string;
    viewMission: string;
    quickActions: string;
  };
  missionsList: {
    kicker: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allDomains: string;
    missionsLoaded: string;
    inspectPlan: string;
  };
  planner: {
    kicker: string;
    title: string;
    version: string;
    diffToggle: string;
    graphView: string;
    listView: string;
    tasksTotal: string;
    criticalPath: string;
    disruptionsHandled: string;
  };
  execution: {
    kicker: string;
    title: string;
    downloadReport: string;
    missionAccomplished: string;
    autonomousVerified: string;
    downloadDossier: string;
    tasksVerified: string;
    evacuated: string;
    shocksOvercome: string;
    filterAll: string;
    searchTasks: string;
  };
  resources: {
    kicker: string;
    title: string;
    subtitle: string;
    ambulances: string;
    shelters: string;
    personnel: string;
    supplies: string;
    strainLevel: string;
  };
  simulator: {
    kicker: string;
    title: string;
    subtitle: string;
    injectButton: string;
    calculating: string;
    impactDetected: string;
    resetScenario: string;
  };
  tools: {
    kicker: string;
    title: string;
    subtitle: string;
    activeTools: string;
    testTool: string;
    invocations: string;
    successRate: string;
  };
  tacticalMap: {
    kicker: string;
    title: string;
    subtitle: string;
    satelliteLive: string;
    googleMapsMode: string;
    radarTacticalMode: string;
    sheltersSummary: string;
    fleetLive: string;
  };
  analytics: {
    kicker: string;
    title: string;
    subtitle: string;
    latency: string;
    efficiency: string;
  };
  audit: {
    kicker: string;
    title: string;
    subtitle: string;
    immutableLedger: string;
    exportCSV: string;
    verifiedSignature: string;
  };
  aiChat: {
    kicker: string;
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    suggestedPrompts: string;
  };
  demoSteps: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
    step7: string;
    step8: string;
    step9: string;
  };
  approval: {
    title: string;
    subtitle: string;
    action: string;
    reason: string;
    impact: string;
    aiConfidence: string;
    evidence: string;
    approve: string;
    reject: string;
    requestChanges: string;
  };
  whatIf: {
    title: string;
    description: string;
    simulate: string;
    applyPlan: string;
    discard: string;
    affectedTasks: string;
    timelineDelta: string;
    resourceStrain: string;
  };
  domains: {
    emergency: string;
    disaster: string;
    agriculture: string;
    government: string;
    healthcare: string;
    accident: string;
    logistics: string;
    industrial: string;
    career: string;
    project: string;
  };
  common: {
    search: string;
    notifications: string;
    profile: string;
    logout: string;
    role: string;
    admin: string;
    operator: string;
    viewer: string;
    lightMode: string;
    darkMode: string;
    filter: string;
    exportReport: string;
    refresh: string;
    close: string;
    confirm: string;
    cancel: string;
    all: string;
    whyThisPlan: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    brandName: 'PLANOVA AI',
    tagline: 'Plan. Execute. Adapt.',
    subTagline: 'From complex goals to verified real-world outcomes.',
    heroDescription:
      'An enterprise agentic AI platform that transforms complex real-world goals into executable, continuously monitored, and dynamically adaptive missions.',
    launchMission: 'Launch Mission',
    viewLiveDemo: 'View Live Demo',
    exploreHowItWorks: 'Explore How It Works',
    runFlagshipDemo: '⚡ Run Flagship Demo',
    hackathonDemoMode: '⚡ Hackathon Demo Mode',
    nav: {
      dashboard: 'Dashboard',
      missions: 'Missions',
      digitalTwin: 'Mission Digital Twin',
      planner: 'Mission Planner & Graph',
      agents: 'Multi-Agent Collaboration',
      predictive: 'Predictive Failure',
      execution: 'Execution Center',
      resources: 'Resource Center',
      simulator: 'What-If Simulator',
      memory: 'Mission Memory',
      tools: 'Tool Orchestrator',
      tacticalMap: 'Tactical Map',
      documents: 'Document Center',
      analytics: 'Analytics',
      audit: 'Audit Log',
      aiChat: 'Tactical AI Co-Pilot',
      settings: 'Settings & Auth',
      sectionCommand: 'COMMAND',
      sectionIntelligence: 'INTELLIGENCE',
      sectionExecution: 'EXECUTION',
      sectionMemoryGovernance: 'MEMORY & GOVERNANCE',
      sectionSystem: 'SYSTEM',
    },
    landing: {
      badge: 'PS2-4: Autonomous AI Planning & Real-World Execution',
      previewTitle: 'LIVE MISSION PREVIEW',
      missionName: 'Mission: Flood Evacuation (Sector 4 Riverbank)',
      adaptiveStatus: 'Status: Adaptive Execution (v2)',
      tasks: 'Tasks',
      completed: 'Completed',
      inProgress: 'In Progress',
      waitingAppr: 'Waiting Appr.',
      replanned: 'Replanned',
      system: 'System',
      operational: 'Operational',
      progressText: 'Objective Clearance: 58% completed',
      etaText: 'Active ETA: 45 mins',
      disruptionHandled: 'Disruption Handled: Route R2 Submerged → Rerouted to Elevated Bypass R4',
      inspectConsole: 'Inspect Live Console →',
      pipelineTitle: 'Universal Agentic Execution Pipeline',
      pipelineSub: 'Goal → Plan → Execute → Monitor → Adapt → Verify',
      domainsTitle: 'One Engine. Universal Domains.',
      domainsSubtitle: 'Real-World High-Stakes Operations',
      domainsDesc:
        'Not ten disconnected apps. PLANOVA AI applies one autonomous planning and replanning kernel across 10 operational verticals.',
      footerTag: 'PLANOVA AI — From complex goals to verified real-world outcomes.',
      footerSub: 'Government & Enterprise Grade Agentic Architecture · National Hackathon Edition',
    },
    dashboard: {
      title: 'Operational Mission Control',
      subtitle: 'Real-time autonomous task orchestration, telemetry monitoring, and dynamic re-planning.',
      interactiveGraph: 'Interactive Graph',
      launchNew: 'Launch New Mission',
      humanApprovalReq: 'HUMAN-IN-THE-LOOP APPROVAL REQUIRED',
      reviewAuthorize: 'Review & Authorize Action',
      resourceStrainTitle: 'Resource Allocation & Strain',
      viewAllResources: 'View All Resources →',
      auditEventsTitle: 'Live Audit & Replanning Events',
      fullLedger: 'Full Ledger →',
      injectR2: 'Inject Route R2 Submergence',
      injectFleet: 'Inject Fleet Scarcity (8 → 5)',
      activeMissionKicker: 'ACTIVE MISSION · LIVE TELEMETRY',
    },
    status: {
      operational: 'Operational',
      degraded: 'Degraded',
      maintenance: 'Maintenance',
      offline: 'Offline',
      draft: 'Draft',
      planning: 'Planning',
      executing: 'Executing',
      paused: 'Paused',
      replanning: 'Replanning',
      awaiting_approval: 'Awaiting Approval',
      completed: 'Completed',
      failed: 'Failed',
      pending: 'Pending',
      planned: 'Planned',
      ready: 'Ready',
      in_progress: 'In Progress',
      waiting_approval: 'Waiting Approval',
      verified: 'Verified',
    },
    metrics: {
      activeMissions: 'Active Missions',
      completedMissions: 'Completed Missions',
      tasksExecuting: 'Tasks Executing',
      tasksWaitingApproval: 'Tasks Awaiting Approval',
      replanningEvents: 'Re-planning Events',
      systemHealth: 'System Health',
      successRate: 'Execution Success Rate',
      avgReplanningTime: 'Avg Re-plan Latency',
    },
    missionCard: {
      priority: 'Priority',
      location: 'Location',
      progress: 'Progress',
      eta: 'ETA',
      activeAgents: 'Active Agents',
      planVersion: 'Plan Version',
      viewMission: 'Inspect Mission',
      quickActions: 'Autonomous Operations',
    },
    missionsList: {
      kicker: 'UNIVERSAL MISSION ENGINE · 10 DOMAIN TEMPLATES',
      title: 'Operational Missions & Domain Catalog',
      subtitle: 'Browse active and staged missions. Each operational template shares the same autonomous decomposition, monitoring, re-planning, and governance core.',
      searchPlaceholder: 'Search missions, locations, objectives...',
      allDomains: 'All 10 Domains',
      missionsLoaded: 'Missions Active',
      inspectPlan: 'Inspect Plan',
    },
    planner: {
      kicker: 'PLAN ARCHITECTURE & DEPENDENCY GRAPH',
      title: 'Autonomous Mission Plan & Task Decomposition',
      version: 'Plan Version',
      diffToggle: 'Plan Diff Comparison (v1 vs v2)',
      graphView: 'Interactive Node Canvas',
      listView: 'Decomposed Task Breakdown',
      tasksTotal: 'Total Tasks',
      criticalPath: 'Critical Path Tasks',
      disruptionsHandled: 'Disruptions Handled',
    },
    execution: {
      kicker: 'REAL-TIME AGENTIC DISPATCH & MONITORING',
      title: 'Execution Center & Telemetry Stream',
      downloadReport: 'Download Mission Dossier',
      missionAccomplished: 'MISSION ACCOMPLISHED',
      autonomousVerified: 'AUTONOMOUS VERIFICATION COMPLETE',
      downloadDossier: 'Download Executive Report',
      tasksVerified: 'Tasks Verified',
      evacuated: 'Evacuated Citizens',
      shocksOvercome: 'Disruptions Overcome',
      filterAll: 'All Execution States',
      searchTasks: 'Search active tasks...',
    },
    resources: {
      kicker: 'LIVE LOGISTICS & CAPACITY TELEMETRY',
      title: 'Resource Allocation & Strain Center',
      subtitle: 'Dynamic monitoring of fleets, field shelters, specialized equipment, and operational reserves.',
      ambulances: 'Emergency Ambulances',
      shelters: 'Designated Relief Shelters',
      personnel: 'Tactical First Responders',
      supplies: 'Emergency Provisions & Kits',
      strainLevel: 'Current Strain Level',
    },
    simulator: {
      kicker: 'PROACTIVE RESILIENCE & SCENARIO TESTING',
      title: 'What-If Mission Scenario Simulator',
      subtitle: 'Stress-test operational plans by injecting environmental disruptions and resource shocks before or during live execution.',
      injectButton: 'Inject Shock Condition',
      calculating: 'Analyzing Cascading Impacts...',
      impactDetected: 'Impact Detected & Alternative Route Synthesized',
      resetScenario: 'Reset Baseline Scenario',
    },
    tools: {
      kicker: 'DYNAMIC TOOL ORCHESTRATION & APIS',
      title: 'Tool & Service Integration Hub',
      subtitle: 'Autonomous agents choose and invoke specialized tools based on task requirements, environmental data, and security policies.',
      activeTools: 'Connected Operational Tools',
      testTool: 'Execute Live Test',
      invocations: 'Total Invocations',
      successRate: 'Tool Success Rate',
    },
    tacticalMap: {
      kicker: 'GEOSPATIAL INTELLIGENCE & SATELLITE TELEMETRY',
      title: 'Tactical Operations Map',
      subtitle: 'Live visual tracking of affected sectors, evacuation corridors, submerged routes, and ambulance convoys.',
      satelliteLive: 'Live Google Maps Platform Integration',
      googleMapsMode: 'Google Maps View',
      radarTacticalMode: 'Tactical Grid View',
      sheltersSummary: 'Designated Shelters',
      fleetLive: 'Active Ambulance Convoys',
    },
    analytics: {
      kicker: 'PERFORMANCE TELEMETRY & EFFICIENCY AUDIT',
      title: 'Mission Intelligence & Operational Analytics',
      subtitle: 'Real-time telemetry measuring replanning latency, tool execution success, and human approval response time.',
      latency: 'Average Re-plan Latency',
      efficiency: 'Autonomous Execution Efficiency',
    },
    audit: {
      kicker: 'TAMPER-PROOF COMPLIANCE & EXPLAINABILITY',
      title: 'Cryptographic Audit Ledger',
      subtitle: 'Immutable, chronological record of every decision, tool call, disruption detection, and human approval.',
      immutableLedger: 'Cryptographically Verified Hash Chain',
      exportCSV: 'Export Audit Log (JSON/CSV)',
      verifiedSignature: 'SHA-256 Verified',
    },
    aiChat: {
      kicker: 'GEMINI INTELLIGENCE COMMAND INTERFACE',
      title: 'Tactical AI Co-Pilot',
      subtitle: 'Direct high-thinking strategic guidance grounded in current mission state, constraints, and live telemetry.',
      placeholder: 'Ask tactical questions or request operational recommendations...',
      send: 'Transmit Order',
      suggestedPrompts: 'Tactical Briefings & Inquiries',
    },
    demoSteps: {
      step1: '1. Goal & Mission Understanding',
      step2: '2. Plan v1 Decomposed (24 Tasks)',
      step3: '3. Autonomous Execution & Telemetry',
      step4: '4. Shock Event: Route R2 Blocked',
      step5: '5. Impact Analysis & Adaptive Plan v2',
      step6: '6. Resource Shock: Ambulances 8 → 5',
      step7: '7. Human-In-The-Loop Approval',
      step8: '8. Resumed Execution & Verification',
      step9: '9. Mission Completed & Audit Trail',
    },
    approval: {
      title: 'Action Requiring Human Approval',
      subtitle: 'High-impact autonomous recommendation requires manual authorization.',
      action: 'Proposed Action',
      reason: 'Trigger / Root Cause',
      impact: 'Cascade Impact',
      aiConfidence: 'AI Confidence Score',
      evidence: 'Verification Evidence',
      approve: 'Authorize & Execute',
      reject: 'Reject Action',
      requestChanges: 'Request Modifications',
    },
    whatIf: {
      title: 'What-If Mission Scenario Simulator',
      description: 'Stress-test operational plans by injecting real-world disruptions before or during live execution.',
      simulate: 'Simulate Operational Impact',
      applyPlan: 'Apply Adaptive Plan',
      discard: 'Discard Scenario',
      affectedTasks: 'Affected Tasks',
      timelineDelta: 'Timeline Shift',
      resourceStrain: 'Resource Utilization Impact',
    },
    domains: {
      emergency: 'Emergency Response',
      disaster: 'Disaster Relief',
      agriculture: 'Farmer Assistance',
      government: 'Government Services',
      healthcare: 'Healthcare Administration',
      accident: 'Accident Assistance',
      logistics: 'Logistics & Supply Chain',
      industrial: 'Industrial Maintenance',
      career: 'Student & Career Execution',
      project: 'General Project Execution',
    },
    common: {
      search: 'Search missions, tasks, agents, tools...',
      notifications: 'Notifications',
      profile: 'User Profile',
      logout: 'Sign Out',
      role: 'Role',
      admin: 'Administrator',
      operator: 'Mission Operator',
      viewer: 'Auditor / Viewer',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      filter: 'Filter',
      exportReport: 'Export Dossier',
      refresh: 'Synchronize',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
      all: 'All',
      whyThisPlan: 'Why this plan?',
    },
  },
  hi: {
    brandName: 'प्लानोवा एआई',
    tagline: 'योजना। निष्पादन। अनुकूलन।',
    subTagline: 'जटिल लक्ष्यों से सत्यापित वास्तविक परिणामों तक।',
    heroDescription:
      'एक स्वायत्त उद्यम एआई प्लेटफॉर्म जो जटिल वास्तविक लक्ष्यों को निष्पादन योग्य, निरंतर निगरानी वाले और गतिशील रूप से अनुकूलनीय मिशनों में बदलता है।',
    launchMission: 'मिशन शुरू करें',
    viewLiveDemo: 'लाइव डेमो देखें',
    exploreHowItWorks: 'कार्यप्रणाली देखें',
    runFlagshipDemo: '⚡ फ्लैगशिप डेमो चलाएं',
    hackathonDemoMode: '⚡ हैकाथॉन डेमो मोड',
    nav: {
      dashboard: 'डैशबोर्ड',
      missions: 'मिशन सूची',
      digitalTwin: 'मिशन डिजिटल ट्विन',
      planner: 'मिशन योजनाकार एवं ग्राफ',
      agents: 'बहु-एजेंट समन्वय',
      predictive: 'भविष्यवाणी विफलता विश्लेषण',
      execution: 'निष्पादन केंद्र',
      resources: 'संसाधन केंद्र',
      simulator: 'व्हाट-इफ सिम्युलेटर',
      memory: 'मिशन मेमोरी',
      tools: 'टूल ऑर्केस्ट्रेटर',
      tacticalMap: 'सामरिक मानचित्र',
      documents: 'दस्तावेज़ केंद्र',
      analytics: 'विश्लेषिकी',
      audit: 'ऑडिट लॉग',
      aiChat: 'सामरिक एआई सहायक',
      settings: 'सेटिंग्स एवं प्रमाणीकरण',
      sectionCommand: 'नियंत्रण (COMMAND)',
      sectionIntelligence: 'बुद्धिमत्ता (INTELLIGENCE)',
      sectionExecution: 'निष्पादन (EXECUTION)',
      sectionMemoryGovernance: 'मेमोरी एवं प्रशासन',
      sectionSystem: 'प्रणाली (SYSTEM)',
    },
    landing: {
      badge: 'PS2-4: स्वायत्त एआई योजना एवं वास्तविक निष्पादन',
      previewTitle: 'लाइव मिशन पूर्वावलोकन',
      missionName: 'मिशन: बाढ़ निकासी (सेक्टर 4 रिवरबैंक)',
      adaptiveStatus: 'स्थिति: अनुकूलित निष्पादन (v2)',
      tasks: 'कुल कार्य',
      completed: 'पूर्ण',
      inProgress: 'प्रगति पर',
      waitingAppr: 'स्वीकृति प्रतीक्षित',
      replanned: 'पुनर्नियोजित',
      system: 'प्रणाली स्थिति',
      operational: 'सक्रिय एवं सामान्य',
      progressText: 'उद्देश्य निकासी: 58% पूर्ण',
      etaText: 'अनुमानित समय: 45 मिनट शेष',
      disruptionHandled: 'व्यवधान समाधान: मार्ग R2 जलमग्न → एलिवेटेड बाईपास R4 पर पुनः निर्देशित',
      inspectConsole: 'लाइव कंसोल खोलें →',
      pipelineTitle: 'सार्वभौमिक एजेंटिक निष्पादन पाइपलाइन',
      pipelineSub: 'लक्ष्य → योजना → निष्पादन → निगरानी → अनुकूलन → सत्यापन',
      domainsTitle: 'एक इंजन। सार्वभौमिक कार्यक्षेत्र।',
      domainsSubtitle: 'वास्तविक जीवन की उच्च-स्तरीय कार्यप्रणाली',
      domainsDesc:
        'दस अलग-अलग ऐप्स नहीं। प्लानोवा एआई एक ही स्वायत्त कोर का उपयोग दस रणनीतिक क्षेत्रों में करता है।',
      footerTag: 'प्लानोवा एआई — जटिल लक्ष्यों से सत्यापित वास्तविक परिणामों तक।',
      footerSub: 'सरकारी एवं उद्यम श्रेणी स्वायत्त एआई वास्तुकला · राष्ट्रीय हैकाथॉन संस्करण',
    },
    dashboard: {
      title: 'ऑपरेशनल मिशन नियंत्रण केंद्र',
      subtitle: 'रीयल-टाइम स्वायत्त कार्य समन्वय, टेलीमेट्री निगरानी और गतिशील पुनर्योजना।',
      interactiveGraph: 'इंटरैक्टिव ग्राफ',
      launchNew: 'नया मिशन बनाएं',
      humanApprovalReq: 'मानव अनुमोदन की आवश्यकता',
      reviewAuthorize: 'समीक्षा करें और अधिकृत करें',
      resourceStrainTitle: 'संसाधन आवंटन एवं भार',
      viewAllResources: 'सभी संसाधन देखें →',
      auditEventsTitle: 'लाइव ऑडिट एवं पुनर्योजना घटनाएं',
      fullLedger: 'पूर्ण खाता देखें →',
      injectR2: 'मार्ग R2 जलमग्नता अनुकरण',
      injectFleet: 'एम्बुलेंस कमी अनुकरण (8 → 5)',
      activeMissionKicker: 'सक्रिय मिशन · लाइव टेलीमेट्री',
    },
    status: {
      operational: 'सक्रिय',
      degraded: 'आंशिक बाधित',
      maintenance: 'रखरखाव',
      offline: 'ऑफलाइन',
      draft: 'प्रारूप',
      planning: 'योजना जारी',
      executing: 'निष्पादन जारी',
      paused: 'रोका गया',
      replanning: 'पुनर्योजना जारी',
      awaiting_approval: 'स्वीकृति प्रतीक्षित',
      completed: 'सफलतापूर्वक पूर्ण',
      failed: 'असफल',
      pending: 'लंबित',
      planned: 'नियोजित',
      ready: 'तैयार',
      in_progress: 'प्रगति पर',
      waiting_approval: 'अनुमोदन प्रतीक्षित',
      verified: 'सत्यापित',
    },
    metrics: {
      activeMissions: 'सक्रिय मिशन',
      completedMissions: 'पूर्ण मिशन',
      tasksExecuting: 'सक्रिय कार्य',
      tasksWaitingApproval: 'अनुमोदन प्रतीक्षित',
      replanningEvents: 'पुनर्योजना घटनाएं',
      systemHealth: 'सिस्टम स्वास्थ्य',
      successRate: 'सफलता दर',
      avgReplanningTime: 'औसत पुनर्योजना गति',
    },
    missionCard: {
      priority: 'प्राथमिकता',
      location: 'स्थान',
      progress: 'प्रगति',
      eta: 'अनुमानित समय',
      activeAgents: 'सक्रिय एजेंट्स',
      planVersion: 'योजना संस्करण',
      viewMission: 'मिशन का निरीक्षण करें',
      quickActions: 'स्वायत्त संचालन',
    },
    missionsList: {
      kicker: 'सार्वभौमिक मिशन इंजन · 10 डोमेन टेम्पलेट्स',
      title: 'ऑपरेशनल मिशन एवं डोमेन कैटलॉग',
      subtitle: 'सक्रिय और निर्धारित मिशन देखें। प्रत्येक टेम्पलेट स्वायत्त कार्य विभाजन, निगरानी और पुनर्नियोजन कोर साझा करता है।',
      searchPlaceholder: 'मिशन, स्थान, उद्देश्य खोजें...',
      allDomains: 'सभी 10 क्षेत्र',
      missionsLoaded: 'सक्रिय मिशन',
      inspectPlan: 'योजना देखें',
    },
    planner: {
      kicker: 'योजना वास्तुकला एवं निर्भरता ग्राफ',
      title: 'स्वायत्त मिशन योजना एवं कार्य विभाजन',
      version: 'योजना संस्करण',
      diffToggle: 'संस्करण तुलना (v1 बनाम v2)',
      graphView: 'इंटरैक्टिव नोड ग्राफ',
      listView: 'कार्य विभाजन सूची',
      tasksTotal: 'कुल कार्य',
      criticalPath: 'महत्वपूर्ण पथ कार्य',
      disruptionsHandled: 'व्यवधान समाधान',
    },
    execution: {
      kicker: 'रीयल-टाइम एजेंट प्रेषण एवं निगरानी',
      title: 'निष्पादन केंद्र एवं टेलीमेट्री स्ट्रीम',
      downloadReport: 'मिशन रिपोर्ट डाउनलोड करें',
      missionAccomplished: 'मिशन पूर्ण घोषित',
      autonomousVerified: 'स्वायत्त सत्यापन पूर्ण',
      downloadDossier: 'अंतिम रिपोर्ट डाउनलोड करें',
      tasksVerified: 'सत्यापित कार्य',
      evacuated: 'सुरक्षित नागरिक',
      shocksOvercome: 'समाधित व्यवधान',
      filterAll: 'सभी कार्य स्थितियां',
      searchTasks: 'कार्य खोजें...',
    },
    resources: {
      kicker: 'लाइव लॉजिस्टिक्स एवं क्षमता टेलीमेट्री',
      title: 'संसाधन आवंटन एवं भार केंद्र',
      subtitle: 'वाहनों, आश्रय स्थलों, विशेष उपकरणों और आपातकालीन भंडारों की वास्तविक समय में निगरानी।',
      ambulances: 'आपातकालीन एम्बुलेंस',
      shelters: 'नामित राहत आश्रय',
      personnel: 'फील्ड फर्स्ट रिस्पॉन्डर्स',
      supplies: 'आपातकालीन राशन एवं दवाएं',
      strainLevel: 'वर्तमान संसाधन भार',
    },
    simulator: {
      kicker: 'सक्रिय लचीलापन एवं परिदृश्य परीक्षण',
      title: 'व्हाट-इफ मिशन परिदृश्य सिम्युलेटर',
      subtitle: 'जीवंत निष्पादन से पहले या उसके दौरान पर्यावरणीय व्यवधानों को डालकर परिचालन योजनाओं का तनाव-परीक्षण करें।',
      injectButton: 'व्यवधान लागू करें',
      calculating: 'प्रभाव का विश्लेषण किया जा रहा है...',
      impactDetected: 'प्रभाव चिह्नित एवं वैकल्पिक मार्ग तैयार',
      resetScenario: 'मूल स्थिति पुनः स्थापित करें',
    },
    tools: {
      kicker: 'गतिशील उपकरण ऑर्केस्ट्रेशन एवं एपीआई',
      title: 'टूल एवं सेवा एकीकरण केंद्र',
      subtitle: 'स्वायत्त एजेंट कार्य आवश्यकताओं, सेंसर डेटा और सुरक्षा नीतियों के आधार पर उपयुक्त उपकरण चुनते हैं।',
      activeTools: 'सक्रिय परिचालन उपकरण',
      testTool: 'लाइव परीक्षण चलाएं',
      invocations: 'कुल निष्पादन',
      successRate: 'टूल सफलता दर',
    },
    tacticalMap: {
      kicker: 'भू-स्थानिक बुद्धिमत्ता एवं उपग्रह टेलीमेट्री',
      title: 'सामरिक परिचालन मानचित्र',
      subtitle: 'प्रभावित क्षेत्रों, सुरक्षित गलियारों, जलमग्न मार्गों और एम्बुलेंस काफिले की लाइव ट्रैकिंग।',
      satelliteLive: 'गूगल मैप्स प्लेटफॉर्म लाइव एकीकरण',
      googleMapsMode: 'गूगल मैप्स दृश्य',
      radarTacticalMode: 'सामरिक ग्रिड दृश्य',
      sheltersSummary: 'नामित आश्रय स्थल',
      fleetLive: 'सक्रिय एम्बुलेंस बेड़ा',
    },
    analytics: {
      kicker: 'प्रदर्शन टेलीमेट्री एवं दक्षता ऑडिट',
      title: 'मिशन बुद्धिमत्ता एवं परिचालन विश्लेषण',
      subtitle: 'पुनर्योजना में लगने वाला समय, उपकरण सफलता और मानव अनुमोदन गति का सांख्यिकी विवरण।',
      latency: 'औसत पुनर्योजना विलंबता',
      efficiency: 'स्वायत्त निष्पादन दक्षता',
    },
    audit: {
      kicker: 'छेड़छाड़-मुक्त अनुपालन एवं व्याख्या',
      title: 'क्रिप्टोग्राफिक ऑडिट लेजर',
      subtitle: 'प्रत्येक निर्णय, उपकरण कॉल, व्यवधान पहचान और मानव अनुमोदन का अपरिवर्तनीय कालानुक्रमिक रिकॉर्ड।',
      immutableLedger: 'क्रिप्टोग्राफिक रूप से सत्यापित हैश श्रृंखला',
      exportCSV: 'ऑडिट लॉग निर्यात (JSON/CSV)',
      verifiedSignature: 'SHA-256 सत्यापित',
    },
    aiChat: {
      kicker: 'जेमिनी बुद्धिमत्ता सामरिक इंटरफेस',
      title: 'सामरिक एआई सहायक',
      subtitle: 'वर्तमान मिशन स्थिति, सीमाओं और लाइव टेलीमेट्री पर आधारित रणनीतिक मार्गदर्शन प्राप्त करें।',
      placeholder: 'सामरिक प्रश्न पूछें या सिफारिशें प्राप्त करें...',
      send: 'निर्देश भेजें',
      suggestedPrompts: 'त्वरित सामरिक निर्देश',
    },
    demoSteps: {
      step1: '१. लक्ष्य एवं मिशन समझना',
      step2: '२. योजना v1 तैयार (२४ कार्य)',
      step3: '३. स्वायत्त निष्पादन एवं टेलीमेट्री',
      step4: '४. बाधा घटना: मार्ग R2 जलमग्न',
      step5: '५. प्रभाव विश्लेषण एवं अनुकूलित योजना v2',
      step6: '६. संसाधन संकट: एम्बुलेंस ८ से घटकर ५',
      step7: '७. मानव अनुमोदन एवं स्वीकृति द्वार',
      step8: '८. पुनः निष्पादन एवं अंतिम सत्यापन',
      step9: '९. मिशन पूर्ण एवं अपरिवर्तनीय ऑडिट',
    },
    approval: {
      title: 'मानव अनुमोदन की आवश्यकता',
      subtitle: 'उच्च-प्रभाव स्वायत्त सिफारिश के लिए मानव स्वीकृति आवश्यक है।',
      action: 'प्रस्तावित कार्रवाई',
      reason: 'मूल कारण / ट्रिगर',
      impact: 'प्रणालीगत प्रभाव',
      aiConfidence: 'एआई विश्वास स्कोर',
      evidence: 'सत्यापन साक्ष्य',
      approve: 'अधिकृत करें और चलाएं',
      reject: 'अस्वीकार करें',
      requestChanges: 'संशोधन का अनुरोध करें',
    },
    whatIf: {
      title: 'व्हाट-इफ मिशन परिदृश्य सिम्युलेटर',
      description: 'वास्तविक जीवन के व्यवधानों को डालकर योजना की मजबूती का परीक्षण करें।',
      simulate: 'प्रभाव का अनुकरण करें',
      applyPlan: 'अनुकूलित योजना लागू करें',
      discard: 'परिदृश्य रद्द करें',
      affectedTasks: 'प्रभावित कार्य',
      timelineDelta: 'समय बदलाव',
      resourceStrain: 'संसाधन उपयोग प्रभाव',
    },
    domains: {
      emergency: 'आपातकालीन प्रतिक्रिया',
      disaster: 'आपदा राहत',
      agriculture: 'किसान सहायता',
      government: 'सरकारी सेवाएं',
      healthcare: 'स्वास्थ्य सेवा प्रशासन',
      accident: 'दुर्घटना सहायता',
      logistics: 'आपूर्ति श्रृंखला एवं रसद',
      industrial: 'औद्योगिक रखरखाव',
      career: 'छात्र व करियर निष्पादन',
      project: 'सामान्य परियोजना निष्पादन',
    },
    common: {
      search: 'खोजें: मिशन, कार्य, एजेंट्स, टूल्स...',
      notifications: 'सूचनाएं',
      profile: 'उपयोगकर्ता प्रोफ़ाइल',
      logout: 'साइन आउट',
      role: 'भूमिका',
      admin: 'प्रशासक',
      operator: 'मिशन ऑपरेटर',
      viewer: 'ऑडिटर / दर्शक',
      lightMode: 'लाइट मोड',
      darkMode: 'डार्क मोड',
      filter: 'फ़िल्टर',
      exportReport: 'रिपोर्ट निर्यात करें',
      refresh: 'ताज़ा करें',
      close: 'बंद करें',
      confirm: 'पुष्टि करें',
      cancel: 'रद्द करें',
      all: 'सभी',
      whyThisPlan: 'यह योजना क्यों?',
    },
  },
  mr: {
    brandName: 'प्लानोव्हा एआय',
    tagline: 'योजना। अंमलबजावणी। अनुकूलन।',
    subTagline: 'जटिल ध्येयांपासून सत्यापित वास्तविक परिणामांपर्यंत.',
    heroDescription:
      'एक स्वायत्त एंटरप्राइझ एआय प्लॅटफॉर्म जो वास्तविक आव्हानांना कृतीयोग्य, सतत देखरेख असलेल्या आणि अनुकूलनक्षम मोहिमांमध्ये रूपांतरित करतो.',
    launchMission: 'मोहीम सुरू करा',
    viewLiveDemo: 'थेट डेमो पहा',
    exploreHowItWorks: 'कार्यपद्धती पहा',
    runFlagshipDemo: '⚡ फ्लॅगशिप डेमो चालवा',
    hackathonDemoMode: '⚡ हॅकाथॉन डेमो मोड',
    nav: {
      dashboard: 'डॅशबोर्ड',
      missions: 'मोहिमांची यादी',
      digitalTwin: 'मोहीम डिजिटल ट्विन',
      planner: 'मोहीम नियोजक आणि आलेख',
      agents: 'बहु-एजंट समन्वय',
      predictive: 'संभाव्य अडथळा अंदाज',
      execution: 'अंमलबजावणी केंद्र',
      resources: 'संसाधन केंद्र',
      simulator: 'व्हॉट-इफ सिम्युलेटर',
      memory: 'मोहीम स्मृती (मेमरी)',
      tools: 'टूल ऑर्केस्ट्रेटर',
      tacticalMap: 'नकाशा नियंत्रण',
      documents: 'दस्तऐवज केंद्र',
      analytics: 'विश्लेषण व आकडेवारी',
      audit: 'ऑडिट नोंदवही',
      aiChat: 'रणनीतिक एआय सहाय्यक',
      settings: 'सेटिंग्ज व प्रमाणीकरण',
      sectionCommand: 'नियंत्रण (COMMAND)',
      sectionIntelligence: 'बुद्धिमत्ता (INTELLIGENCE)',
      sectionExecution: 'अंमलबजावणी (EXECUTION)',
      sectionMemoryGovernance: 'स्मृती आणि प्रशासन',
      sectionSystem: 'प्रणाली (SYSTEM)',
    },
    landing: {
      badge: 'PS2-4: स्वायत्त एआय नियोजन आणि प्रत्यक्ष अंमलबजावणी',
      previewTitle: 'थेट मोहीम पूर्वदृश्य',
      missionName: 'मोहीम: पूर निष्कासन (सेक्टर ४ नदीकाठ)',
      adaptiveStatus: 'स्थिती: अनुकूलनक्षम अंमलबजावणी (v2)',
      tasks: 'एकूण कामे',
      completed: 'पूर्ण',
      inProgress: 'प्रगतीत',
      waitingAppr: 'मंजुरी प्रतीक्षेत',
      replanned: 'पुनर्नियोजित',
      system: 'प्रणाली स्थिती',
      operational: 'सक्रिय व कार्यरत',
      progressText: 'उद्दिष्ट पूर्णता: ५८% पूर्ण',
      etaText: 'अंदाजे वेळ: ४५ मिनिटे बाकी',
      disruptionHandled: 'अडथळा निवारण: मार्ग R2 पाण्याखाली बंद → उन्नत बायपास R4 वर वळवला',
      inspectConsole: 'थेट नियंत्रण कक्ष उघडा →',
      pipelineTitle: 'सार्वभौमिक एजंटिक अंमलबजावणी रचना',
      pipelineSub: 'ध्येय → योजना → अंमलबजावणी → देखरेख → अनुकूलन → पडताळणी',
      domainsTitle: 'एकच इंजिन. सर्व क्षेत्रांसाठी.',
      domainsSubtitle: 'प्रत्यक्ष जगतातील संवेदनशील मोहिमा',
      domainsDesc:
        'दहा वेगवेगळे ॲप्स नाहीत. प्लानोव्हा एआय एकाच स्वायत्त नियोजन कर्नलचा वापर १० वेगवेगळ्या क्षेत्रांमध्ये करते.',
      footerTag: 'प्लानोव्हा एआय — जटिल ध्येयांपासून सत्यापित वास्तविक परिणामांपर्यंत.',
      footerSub: 'शासकीय व संस्थात्मक स्वायत्त एआय रचना · राष्ट्रीय हॅकाथॉन आवृत्ती',
    },
    dashboard: {
      title: 'ऑपरेशनल मोहीम नियंत्रण कक्ष',
      subtitle: 'रीयल-टाइम स्वायत्त कार्य समन्वय, टेलिमेट्री देखरेख आणि लवचिक पुनर्नियोजन.',
      interactiveGraph: 'परस्परसंवादी आलेख',
      launchNew: 'नवीन मोहीम सुरू करा',
      humanApprovalReq: 'मानवी मंजुरी आवश्यक',
      reviewAuthorize: 'पडताळणी करा आणि मंजूर करा',
      resourceStrainTitle: 'संसाधन वाटप आणि ताण',
      viewAllResources: 'सर्व संसाधने पहा →',
      auditEventsTitle: 'थेट ऑडिट आणि पुनर्नियोजन घटना',
      fullLedger: 'संपूर्ण नोंदवही पहा →',
      injectR2: 'मार्ग R2 जलमय अडथळा सिम्युलेशन',
      injectFleet: 'रुग्णवाहिका तुटवडा सिम्युलेशन (८ → ५)',
      activeMissionKicker: 'सक्रिय मोहीम · थेट टेलिमेट्री',
    },
    status: {
      operational: 'कार्यरत',
      degraded: 'मर्यादित',
      maintenance: 'देखभाल',
      offline: 'ऑफलाईन',
      draft: 'मसुदा',
      planning: 'नियोजन चालू',
      executing: 'अंमलबजावणी चालू',
      paused: 'थांबवले',
      replanning: 'पुनर्नियोजन चालू',
      awaiting_approval: 'मंजुरी प्रतीक्षेत',
      completed: 'यशस्वीरीत्या पूर्ण',
      failed: 'अयशस्वी',
      pending: 'प्रलंबित',
      planned: 'नियोजित',
      ready: 'तयार',
      in_progress: 'प्रगतीत',
      waiting_approval: 'मंजुरीची वाट पाहत आहे',
      verified: 'पडताळणी पूर्ण',
    },
    metrics: {
      activeMissions: 'सक्रिय मोहिमा',
      completedMissions: 'पूर्ण मोहिमा',
      tasksExecuting: 'सक्रिय कामे',
      tasksWaitingApproval: 'मंजुरी प्रतीक्षेत कामे',
      replanningEvents: 'पुनर्नियोजन घटना',
      systemHealth: 'प्रणाली स्थिती',
      successRate: 'यशस्वी दर',
      avgReplanningTime: 'सरासरी पुनर्नियोजन वेग',
    },
    missionCard: {
      priority: 'प्राधान्य',
      location: 'स्थान',
      progress: 'प्रगती',
      eta: 'अंदाजे वेळ',
      activeAgents: 'सक्रिय एजंट्स',
      planVersion: 'योजना आवृत्ती',
      viewMission: 'मोहीम तपासा',
      quickActions: 'स्वायत्त ऑपरेशन्स',
    },
    missionsList: {
      kicker: 'सार्वभौमिक मोहीम इंजिन · १० डोमेन टेम्पलेट्स',
      title: 'ऑपरेशनल मोहिमा आणि डोमेन कॅटलॉग',
      subtitle: 'सक्रिय आणि नियोजित मोहिमा पहा. प्रत्येक टेम्पलेट स्वायत्त कार्य विभाजन, देखरेख आणि पुनर्नियोजन कोर वापरते.',
      searchPlaceholder: 'मोहिमा, ठिकाण, उद्दिष्ट शोधा...',
      allDomains: 'सर्व १० क्षेत्रे',
      missionsLoaded: 'सक्रिय मोहिमा',
      inspectPlan: 'योजना पहा',
    },
    planner: {
      kicker: 'योजना रचना आणि अवलंबित्व आलेख',
      title: 'स्वायत्त मोहीम नियोजन आणि कार्य विभाजन',
      version: 'योजना आवृत्ती',
      diffToggle: 'योजना तुलना (v1 विरुद्ध v2)',
      graphView: 'परस्परसंवादी नोड आलेख',
      listView: 'कार्य तपशील यादी',
      tasksTotal: 'एकूण कामे',
      criticalPath: 'महत्त्वाचा मार्ग',
      disruptionsHandled: 'निवारलेले अडथळे',
    },
    execution: {
      kicker: 'थेट एजंट पाठवणे आणि देखरेख',
      title: 'अंमलबजावणी केंद्र आणि टेलिमेट्री फीड',
      downloadReport: 'मोहीम अहवाल डाउनलोड करा',
      missionAccomplished: 'मोहीम यशस्वी घोषित',
      autonomousVerified: 'स्वायत्त पडताळणी पूर्ण',
      downloadDossier: 'अंतिम अहवाल मिळवा',
      tasksVerified: 'सत्यापित कामे',
      evacuated: 'सुरक्षित नागरिक',
      shocksOvercome: 'निवारलेले अडथळे',
      filterAll: 'सर्व स्थिती',
      searchTasks: 'कामे शोधा...',
    },
    resources: {
      kicker: 'थेट लॉजिस्टिक्स आणि क्षमता टेलिमेट्री',
      title: 'संसाधन वाटप आणि ताण केंद्र',
      subtitle: 'वाहने, निवारा केंद्रे, उपकरणे आणि राखीव साठ्याची रीअल-टाइम देखरेख.',
      ambulances: 'तातडीच्या रुग्णवाहिका',
      shelters: 'नियुक्त मदत निवारे',
      personnel: 'फील्ड मदत पथक',
      supplies: 'अन्नधान्य व औषध साठा',
      strainLevel: 'सध्याचा साधन ताण',
    },
    simulator: {
      kicker: 'सक्रिय लवचिकता आणि प्रसंग चाचणी',
      title: 'व्हॉट-इफ मोहीम सिम्युलेटर',
      subtitle: 'प्रत्यक्ष अंमलबजावणीपूर्वी किंवा दरम्यान पर्यावरणीय अडथळे आणून योजनांची ताण-चाचणी घ्या.',
      injectButton: 'अडथळा लागू करा',
      calculating: 'परिणामांचे विश्लेषण चालू आहे...',
      impactDetected: 'अडथळा शोधला आणि पर्यायी मार्ग तयार',
      resetScenario: 'मूळ स्थिती आणा',
    },
    tools: {
      kicker: 'गतिशील साधन ऑर्केस्ट्रेशन आणि एपीआय',
      title: 'साधने आणि सेवा केंद्र',
      subtitle: 'स्वायत्त एजंट्स कामाची गरज, सेन्सॉर डेटा आणि सुरक्षिततेनुसार योग्य साधने निवडतात.',
      activeTools: 'जोडलेली साधने',
      testTool: 'थेट चाचणी घ्या',
      invocations: 'एकूण वापर',
      successRate: 'यशस्वी दर',
    },
    tacticalMap: {
      kicker: 'भौगोलिक बुद्धिमत्ता आणि उपग्रह टेलिमेट्री',
      title: 'नकाशा आणि दिशा नियंत्रण',
      subtitle: 'बाधित क्षेत्रे, सुरक्षित मार्ग, जलमय रस्ते आणि रुग्णवाहिकांच्या हालचालींचे थेट ट्रॅकिंग.',
      satelliteLive: 'गूगल मॅप्स प्लॅटफॉर्म थेट जोडणी',
      googleMapsMode: 'गूगल मॅप्स दृश्य',
      radarTacticalMode: 'सामरिक ग्रिड दृश्य',
      sheltersSummary: 'नियुक्त निवारे',
      fleetLive: 'सक्रिय रुग्णवाहिका ताफा',
    },
    analytics: {
      kicker: 'कामगिरी टेलिमेट्री आणि कार्यक्षमता ऑडिट',
      title: 'मोहीम बुद्धिमत्ता आणि विश्लेषण',
      subtitle: 'पुनर्नियोजन वेग, साधन यश आणि मानवी मंजुरी वेळेचे थेट विश्लेषण.',
      latency: 'सरासरी पुनर्नियोजन वेग',
      efficiency: 'स्वायत्त अंमलबजावणी कार्यक्षमता',
    },
    audit: {
      kicker: 'छेडछाड-मुक्त पारदर्शकता आणि स्पष्टीकरण',
      title: 'क्रिप्टोग्राफिक ऑडिट नोंदवही',
      subtitle: 'प्रत्येक निर्णय, टूल कॉल, अडथळा नोंद आणि मानवी मंजुरीची सुरक्षित नोंदवही.',
      immutableLedger: 'क्रिप्टोग्राफिकरित्या सत्यापित हॅश साखळी',
      exportCSV: 'नोंदवही निर्यात करा (JSON/CSV)',
      verifiedSignature: 'SHA-256 सत्यापित',
    },
    aiChat: {
      kicker: 'जेमिनी बुद्धिमत्ता नियंत्रण कक्ष',
      title: 'रणनीतिक एआय सहाय्यक',
      subtitle: 'सध्याची मोहीम, मर्यादा आणि टेलिमेट्रीवर आधारित थेट रणनीतिक सल्ला मिळवा.',
      placeholder: 'रणनीतिक प्रश्न विचारा किंवा शिफारशी मागा...',
      send: 'आदेश पाठवा',
      suggestedPrompts: 'त्वरित रणनीतिक सूचना',
    },
    demoSteps: {
      step1: '१. ध्येय आणि मोहीम समजून घेणे',
      step2: '२. योजना v1 तयार (२४ कामे)',
      step3: '३. स्वायत्त अंमलबजावणी व टेलिमेट्री',
      step4: '४. अडथळा घटना: मार्ग R2 पाण्याखाली',
      step5: '५. परिणाम विश्लेषण व नवीन योजना v2',
      step6: '६. साधन तुटवडा: रुग्णवाहिका ८ वरून ५',
      step7: '७. मानवी मंजुरी व परवानगी द्वार',
      step8: '८. पुनर्प्रारंभ व अंतिम पडताळणी',
      step9: '९. मोहीम पूर्ण व सुरक्षित नोंदवही',
    },
    approval: {
      title: 'मानवी मंजुरी आवश्यक',
      subtitle: 'महत्त्वाच्या स्वायत्त शिफारशीसाठी मानवी परवानगी आवश्यक आहे.',
      action: 'प्रस्तावित कृती',
      reason: 'मूळ कारण / ट्रिगर',
      impact: 'एकूण परिणाम',
      aiConfidence: 'एआय आत्मविश्वास निर्देशांक',
      evidence: 'पडताळणी पुरावे',
      approve: 'मंजूर करा व चालवा',
      reject: 'नाकारा',
      requestChanges: 'बदलांची मागणी करा',
    },
    whatIf: {
      title: 'व्हॉट-इफ मोहीम सिम्युलेटर',
      description: 'अडथळे निर्माण करून योजनेच्या लवचिकतेची चाचणी घ्या.',
      simulate: 'परिणामांची चाचणी घ्या',
      applyPlan: 'नवीन योजना लागू करा',
      discard: 'चाचणी रद्द करा',
      affectedTasks: 'बाधित कामे',
      timelineDelta: 'वेळेतील बदल',
      resourceStrain: 'साधन ताण परिणाम',
    },
    domains: {
      emergency: 'आपत्कालीन प्रतिसाद',
      disaster: 'आपत्ती निवारण',
      agriculture: 'शेतकरी सहाय्य',
      government: 'शासकीय सेवा',
      healthcare: 'आरोग्य प्रशासन',
      accident: 'अपघात मदत',
      logistics: 'पुरवठा साखळी व रसद',
      industrial: 'औद्योगिक देखभाल',
      career: 'विद्यार्थी व करिअर नियोजन',
      project: 'प्रकल्प अंमलबजावणी',
    },
    common: {
      search: 'शोधा: मोहिमा, कामे, एजंट्स, साधने...',
      notifications: 'सूचना',
      profile: 'वापरकर्ता प्रोफाइल',
      logout: 'बाहेर पडा',
      role: 'भूमिका',
      admin: 'प्रशासक',
      operator: 'मोहीम ऑपरेटर',
      viewer: 'तपासनीस / प्रेक्षक',
      lightMode: 'लाईट मोड',
      darkMode: 'डार्क मोड',
      filter: 'फिल्टर',
      exportReport: 'अहवाल मिळवा',
      refresh: 'ताजे करा',
      close: 'बंद करा',
      confirm: 'नक्की करा',
      cancel: 'रद्द करा',
      all: 'सर्व',
      whyThisPlan: 'ही योजना का?',
    },
  },
};

export const UI_PHRASES: Record<string, { hi: string; mr: string }> = {
  // Navigation & Shell
  'COMMAND': { hi: 'नियंत्रण', mr: 'नियंत्रण' },
  'INTELLIGENCE': { hi: 'बुद्धिमत्ता', mr: 'बुद्धिमत्ता' },
  'EXECUTION': { hi: 'निष्पादन', mr: 'अंमलबजावणी' },
  'MEMORY & GOVERNANCE': { hi: 'मेमोरी एवं प्रशासन', mr: 'स्मृती आणि प्रशासन' },
  'SYSTEM': { hi: 'प्रणाली', mr: 'प्रणाली' },
  'PLAN • EXECUTE • ADAPT': { hi: 'योजना • निष्पादन • अनुकूलन', mr: 'योजना • अंमलबजावणी • अनुकूलन' },
  'Plan. Execute. Adapt.': { hi: 'योजना। निष्पादन। अनुकूलन।', mr: 'योजना। अंमलबजावणी। अनुकूलन।' },
  'Mission Autopilot': { hi: 'मिशन ऑटोपायलट', mr: 'मोहीम ऑटोपायलट' },
  'Why this plan? AI': { hi: 'यह योजना क्यों? AI', mr: 'ही योजना का? AI' },
  'OPERATIONAL': { hi: 'सक्रिय व कार्यरत', mr: 'सक्रिय व कार्यरत' },
  'Active Mission': { hi: 'सक्रिय मिशन', mr: 'सक्रिय मोहीम' },
  'ACTIVE MISSION': { hi: 'सक्रिय मिशन', mr: 'सक्रिय मोहीम' },
  'New Mission': { hi: 'नया मिशन', mr: 'नवीन मोहीम' },
  'Launch New Mission': { hi: 'नया मिशन शुरू करें', mr: 'नवीन मोहीम सुरू करा' },
  'Profile & Governance Settings': { hi: 'प्रोफ़ाइल एवं प्रशासन सेटिंग्स', mr: 'प्रोफाइल आणि प्रशासन सेटिंग्ज' },
  'Sign Out Session': { hi: 'सत्र से बाहर निकलें', mr: 'सत्रातून बाहेर पडा' },
  'Mark all read': { hi: 'सभी पठित चिह्नित करें', mr: 'सर्व वाचल्याचे चिन्हांकित करा' },
  'No operational alerts': { hi: 'कोई परिचालन अलर्ट नहीं', mr: 'कोणत्याही सूचना नाहीत' },
  'No matching missions, tasks, or tools found.': {
    hi: 'कोई मेल खाने वाला मिशन, कार्य या टूल नहीं मिला।',
    mr: 'जुळणारी कोणतीही मोहीम, काम किंवा साधन सापडले नाही.',
  },
  'Missions': { hi: 'मिशन सूची', mr: 'मोहिमांची यादी' },
  'Active Mission Tasks': { hi: 'सक्रिय मिशन कार्य', mr: 'सक्रिय मोहीम कामे' },
  'Orchestrated Tools': { hi: 'समन्वित उपकरण', mr: 'समन्वित साधने' },
  'Gate Pending': { hi: 'अनुमोदन लंबित', mr: 'मंजुरी प्रलंबित' },

  // Dashboard & Telemetry Pipeline (Screenshot specific items)
  'GOOD MORNING': { hi: 'सुप्रभात', mr: 'शुभ सकाळ' },
  'GOOD AFTERNOON': { hi: 'नमस्कार', mr: 'शुभ दुपार' },
  'GOOD EVENING': { hi: 'शुभ संध्या', mr: 'शुभ संध्याकाळ' },
  'MISSION OPERATIONS CENTER': { hi: 'मिशन संचालन नियंत्रण केंद्र', mr: 'मोहीम संचालन नियंत्रण केंद्र' },
  'Monitor, plan and execute intelligent missions in real time.': {
    hi: 'रीयल-टाइम में बुद्धिमान मिशनों की निगरानी, योजना और निष्पादन करें।',
    mr: 'रीयल-टाइममध्ये बुद्धिमान मोहिमांची देखरेख, नियोजन आणि अंमलबजावणी करा.',
  },
  'HUMAN-IN-THE-LOOP GATEWAY': { hi: 'मानव-नियंत्रित अनुमोदन द्वार', mr: 'मानवी-नियंत्रित मंजुरी द्वार' },
  'AI Confidence': { hi: 'एआई विश्वास स्कोर', mr: 'एआय आत्मविश्वास निर्देशांक' },
  'AI AGENTS ACTIVE': { hi: 'सक्रिय एआई एजेंट्स', mr: 'सक्रिय एआय एजंट्स' },
  'Multi-Agent Bus': { hi: 'बहु-एजेंट बस', mr: 'बहु-एजंट बस' },
  'Synced': { hi: 'सिंक्रनाइज़्ड', mr: 'समक्रमित (Synced)' },
  'AT-RISK / GATED TASKS': { hi: 'जोखिम / अनुमोदन कार्य', mr: 'धोकादायक / मंजुरी प्रतीक्षेत कामे' },
  'Approval Gate': { hi: 'अनुमोदन द्वार', mr: 'मंजुरी द्वार' },
  'Blocked': { hi: 'बाधित', mr: 'अडथळा (Blocked)' },
  'BLOCKED': { hi: 'बाधित', mr: 'अडथळा' },
  'MISSION HEALTH': { hi: 'मिशन स्वास्थ्य', mr: 'मोहीम आरोग्य' },
  'SLA Integrity': { hi: 'SLA अखंडता', mr: 'SLA अखंडता' },
  'Optimal': { hi: 'उत्कृष्ट', mr: 'उत्तम (Optimal)' },
  'Completed': { hi: 'पूर्ण', mr: 'पूर्ण' },
  'COMPLETED': { hi: 'पूर्ण', mr: 'पूर्ण' },
  '10 Domains': { hi: '10 क्षेत्र', mr: '१० क्षेत्रे' },
  'Done': { hi: 'पूर्ण', mr: 'पूर्ण' },
  'Execution Console': { hi: 'निष्पादन कंसोल', mr: 'अंमलबजावणी कक्ष' },
  'Tasks Resolved': { hi: 'कार्य पूर्ण', mr: 'कामे पूर्ण' },
  'Agents Active': { hi: 'सक्रिय एजेंट्स', mr: 'सक्रिय एजंट्स' },
  'Resources Allocated': { hi: 'संसाधन आवंटित', mr: 'संसाधने वाटप' },
  'MISSION FLOW PIPELINE': { hi: 'मिशन प्रवाह प्रक्रिया', mr: 'मोहीम प्रवाह प्रक्रिया' },
  'AUTONOMOUS EXECUTION PIPELINE': { hi: 'मिशन प्रवाह प्रक्रिया', mr: 'मोहीम प्रवाह प्रक्रिया' },
  'DAG Dependency Connected': { hi: 'DAG निर्भरता जुड़ी हुई', mr: 'DAG अवलंबित्व जोडलेले' },
  'DAG Connected': { hi: 'DAG निर्भरता जुड़ी हुई', mr: 'DAG अवलंबित्व जोडलेले' },
  'LIVE AGENT TELEMETRY STATES': { hi: 'लाइव एजेंट टेलीमेट्री स्थिति', mr: 'थेट एजंट टेलिमेट्री स्थिती' },
  'MULTI-AGENT ORCHESTRATION TELEMETRY': { hi: 'लाइव एजेंट टेलीमेट्री स्थिति', mr: 'थेट एजंट टेलिमेट्री स्थिती' },
  '● Sub-Second Sync': { hi: '● सब-सेकंड सिंक', mr: '● सब-सेकंद सिंक' },
  'Sub-Second Sync': { hi: 'सब-सेकंड सिंक', mr: 'सब-सेकंद सिंक' },
  'INPUT': { hi: 'इनपुट', mr: 'इनपुट' },
  'Ingested': { hi: 'ग्रहित', mr: 'स्वीकारले' },
  'INGESTED': { hi: 'ग्रहित', mr: 'स्वीकारले' },
  'ANALYZE': { hi: 'विश्लेषण', mr: 'विश्लेषण' },
  'AI Parsed': { hi: 'एआई विश्लेषित', mr: 'एआय विश्लेषित' },
  'AI PARSED': { hi: 'एआई विश्लेषित', mr: 'एआय विश्लेषित' },
  'PLAN': { hi: 'योजना', mr: 'योजना' },
  'EXECUTE': { hi: 'निष्पादन', mr: 'अंमलबजावणी' },
  'Active': { hi: 'सक्रिय', mr: 'सक्रिय' },
  'ACTIVE': { hi: 'सक्रिय', mr: 'सक्रिय' },
  'MONITOR': { hi: 'निगरानी', mr: 'देखरेख' },
  'Live Sync': { hi: 'लाइव सिंक', mr: 'थेट सिंक' },
  'TELEMETRY': { hi: 'टेलीमेट्री', mr: 'टेलिमेट्री' },
  'ADAPT': { hi: 'अनुकूलन', mr: 'अनुकूलन' },
  'Rerouted': { hi: 'पुनः निर्देशित', mr: 'पुनर्नियोजित' },
  'REPLAN': { hi: 'पुनर्योजना', mr: 'पुनर्नियोजन' },
  'Standby': { hi: 'स्टैंडबाय', mr: 'सज्ज (Standby)' },
  'VERIFY': { hi: 'सत्यापन', mr: 'पडताळणी' },
  'VERIFIED': { hi: 'सत्यापित', mr: 'सत्यापित' },
  'Verified': { hi: 'सत्यापित', mr: 'सत्यापित' },
  'Planning': { hi: 'योजना', mr: 'नियोजन' },
  'PLANNING': { hi: 'योजना', mr: 'नियोजन' },
  'Execution': { hi: 'निष्पादन', mr: 'अंमलबजावणी' },
  'Monitoring': { hi: 'निगरानी', mr: 'देखरेख' },
  'MONITORING': { hi: 'निगरानी', mr: 'देखरेख' },
  'Resource': { hi: 'संसाधन', mr: 'संसाधन' },
  'Risk & Route Gate': { hi: 'जोखिम एवं मार्ग द्वार', mr: 'धोका व मार्ग द्वार' },
  'Verification': { hi: 'सत्यापन', mr: 'पडताळणी' },
  'VERIFICATION': { hi: 'सत्यापन', mr: 'पडताळणी' },
  'Planning Agent': { hi: 'योजना एजेंट', mr: 'नियोजन एजंट' },
  'Execution Agent': { hi: 'निष्पादन एजेंट', mr: 'अंमलबजावणी एजंट' },
  'Monitoring Agent': { hi: 'निगरानी एजेंट', mr: 'देखरेख एजंट' },
  'Resource Agent': { hi: 'संसाधन एजेंट', mr: 'संसाधन एजंट' },
  'Verification Agent': { hi: 'सत्यापन एजेंट', mr: 'पडताळणी एजंट' },
  'Mission Analyst Agent': { hi: 'मिशन विश्लेषक एजेंट', mr: 'मोहीम विश्लेषक एजंट' },
  'Tool Orchestrator Agent': { hi: 'टूल समन्वयक एजेंट', mr: 'साधन समन्वयक एजंट' },
  'Replanning Agent': { hi: 'पुनर्योजना एजेंट', mr: 'पुनर्नियोजन एजंट' },
  'Executing': { hi: 'निष्पादन जारी', mr: 'अंमलबजावणी चालू' },
  'EXECUTING': { hi: 'निष्पादन जारी', mr: 'अंमलबजावणी चालू' },
  'Gated': { hi: 'अनुमोदन प्रतीक्षित', mr: 'मंजुरी प्रतीक्षेत' },
  'Nominal': { hi: 'सामान्य', mr: 'सामान्य' },
  'Utilized': { hi: 'उपयोगित', mr: 'वापरलेले' },
  'Allocated': { hi: 'आवंटित', mr: 'वाटप केलेले' },
  'ALLOCATED': { hi: 'आवंटित', mr: 'वाटप केलेले' },
  'Corridors Clear': { hi: 'मार्ग सुरक्षित', mr: 'मार्ग सुरक्षित' },
  'Alert': { hi: 'चेतावनी', mr: 'धोका सूचना' },
  'ALERT': { hi: 'चेतावनी', mr: 'धोका सूचना' },
  'WATCHING': { hi: 'निगरानी जारी', mr: 'देखरेख चालू' },
  'ORCHESTRATING': { hi: 'समन्वय जारी', mr: 'समन्वय चालू' },
  'REMAINING': { hi: 'शेष', mr: 'उर्वरित' },
  'TASKS COMPLETED': { hi: 'पूर्ण कार्य', mr: 'पूर्ण झालेली कामे' },
  'LIVE DISRUPTION & RE-PLANNING CONTROLS:': {
    hi: 'लाइव व्यवधान एवं पुनर्योजना नियंत्रण:',
    mr: 'थेट अडथळा आणि पुनर्नियोजन नियंत्रण:',
  },
  'LIVE OPERATIONS & TELEMETRY STREAM': {
    hi: 'लाइव संचालन एवं टेलीमेट्री स्ट्रीम',
    mr: 'थेट संचालन आणि टेलिमेट्री प्रवास',
  },
  'Real-time autonomous agent actions, route detours, and task state transitions': {
    hi: 'रीयल-टाइम स्वायत्त एजेंट कार्रवाई, मार्ग परिवर्तन और कार्य स्थिति बदलाव',
    mr: 'रीयल-टाइम स्वायत्त एजंट कृती, पर्यायी मार्ग आणि कार्य स्थितीतील बदल',
  },
  'ACTIVE TASK EXECUTION QUEUE': {
    hi: 'सक्रिय कार्य निष्पादन कतार',
    mr: 'सक्रिय कार्य अंमलबजावणी रांग',
  },
  'Inspect All →': { hi: 'सभी देखें →', mr: 'सर्व तपासा →' },

  // Priority & Statuses
  'CRITICAL': { hi: 'अति-महत्वपूर्ण', mr: 'अति-महत्त्वाचे' },
  'CRITICAL PRIORITY': { hi: 'अति-महत्वपूर्ण प्राथमिकता', mr: 'अति-महत्त्वाचे प्राधान्य' },
  'HIGH': { hi: 'उच्च', mr: 'उच्च' },
  'HIGH PRIORITY': { hi: 'उच्च प्राथमिकता', mr: 'उच्च प्राधान्य' },
  'MEDIUM': { hi: 'मध्यम', mr: 'मध्यम' },
  'LOW': { hi: 'निम्न', mr: 'कमी' },
  'IN PROGRESS': { hi: 'प्रगति पर', mr: 'प्रगतीत' },
  'WAITING GATE': { hi: 'अनुमोदन प्रतीक्षित', mr: 'मंजुरी प्रतीक्षेत' },
  'WAITING': { hi: 'प्रतीक्षित', mr: 'प्रतीक्षेत' },
  'RE-PLANNING': { hi: 'पुनर्योजना जारी', mr: 'पुनर्नियोजन चालू' },
  'REPLANNING': { hi: 'पुनर्योजना जारी', mr: 'पुनर्नियोजन चालू' },
  'FAILED': { hi: 'असफल', mr: 'अयशस्वी' },
  'READY': { hi: 'तैयार', mr: 'तयार' },
  'TASKS': { hi: 'कार्य', mr: 'कामे' },
  'AGENTS': { hi: 'एजेंट्स', mr: 'एजंट्स' },
  'STATUS': { hi: 'स्थिति', mr: 'स्थिती' },
  'LOCATION': { hi: 'स्थान', mr: 'स्थान' },
  'PROGRESS': { hi: 'प्रगति', mr: 'प्रगती' },
  'ETA': { hi: 'अनुमानित समय', mr: 'अंदाजे वेळ' },
  'PRIORITY': { hi: 'प्राथमिकता', mr: 'प्राधान्य' },
  'PREVIEW': { hi: 'पूर्वावलोकन', mr: 'पूर्वदृश्य' },
  'INSPECT': { hi: 'निरीक्षण करें', mr: 'तपासा' },
  '● ACTIVE COMMAND': { hi: '● सक्रिय मिशन', mr: '● सक्रिय मोहीम' },
  'Mission Health & Completion': { hi: 'मिशन स्वास्थ्य एवं पूर्णता', mr: 'मोहीम आरोग्य आणि पूर्णता' },
  'Health': { hi: 'स्वास्थ्य', mr: 'आरोग्य' },
  'MISSION OBJECTIVE': { hi: 'मिशन का उद्देश्य', mr: 'मोहिमेचे उद्दिष्ट' },
  'AI Analyst Synthesis': { hi: 'एआई विश्लेषक सारांश', mr: 'एआय विश्लेषक निष्कर्ष' },
  'Close Preview': { hi: 'पूर्वावलोकन बंद करें', mr: 'पूर्वदृश्य बंद करा' },
  'Open Interactive Mission Planner': {
    hi: 'इंटरैक्टिव मिशन प्लानर खोलें',
    mr: 'परस्परसंवादी मोहीम नियोजक उघडा',
  },

  // Planner & Graph
  '01. ASSESSMENT & INTEL': { hi: '01. मूल्यांकन एवं खुफिया जानकारी', mr: '०१. मूल्यांकन आणि माहिती संकलन' },
  'Ingestion & Hazard Mapping': { hi: 'डेटा संग्रहण एवं जोखिम मानचित्रण', mr: 'डेटा संकलन आणि धोका नकाशा' },
  '02. RESOURCE MOBILIZATION': { hi: '02. संसाधन जुटाना', mr: '०२. संसाधन एकत्रीकरण' },
  'Staging & Fleet Dispatch': { hi: 'तैयारी एवं बेड़ा प्रेषण', mr: 'पूर्वतयारी आणि वाहन पाठवणे' },
  '03. ADAPTIVE EXECUTION': { hi: '03. अनुकूलित निष्पादन', mr: '०३. अनुकूलनक्षम अंमलबजावणी' },
  'Field Operations & Detours': { hi: 'फील्ड संचालन एवं वैकल्पिक मार्ग', mr: 'प्रत्यक्ष कार्यवाही आणि पर्यायी मार्ग' },
  '04. OUTCOME VERIFICATION': { hi: '04. परिणाम सत्यापन', mr: '०४. परिणाम पडताळणी' },
  'Audit & Closure Proofs': { hi: 'ऑडिट एवं समापन प्रमाण', mr: 'ऑडिट आणि अंतिम पुरावे' },
  'Add Task Node': { hi: 'कार्य नोड जोड़ें', mr: 'नवीन कार्य नोड जोडा' },
  'Trigger Re-Plan': { hi: 'पुनर्योजना ट्रिगर करें', mr: 'पुनर्नियोजन सुरू करा' },
  'Re-Planning...': { hi: 'पुनर्योजना जारी...', mr: 'पुनर्नियोजन चालू...' },
  'Saving Plan...': { hi: 'योजना सहेजी जा रही है...', mr: 'योजना जतन होत आहे...' },
  'Connected Nodes': { hi: 'जुड़े हुए नोड्स', mr: 'जोडलेले नोड्स' },
  'Click any task node to inspect telemetry, dependencies, or execute state transitions directly.': {
    hi: 'टेलीमेट्री, निर्भरता देखने या स्थिति बदलने के लिए किसी भी कार्य नोड पर क्लिक करें।',
    mr: 'टेलिमेट्री, अवलंबित्व पाहण्यासाठी किंवा स्थिती बदलण्यासाठी कोणत्याही कार्य नोडवर क्लिक करा.',
  },
  'Start': { hi: 'शुरू करें', mr: 'सुरू करा' },
  'Complete': { hi: 'पूर्ण करें', mr: 'पूर्ण करा' },
  'Pause': { hi: 'रोकें', mr: 'थांबवा' },
  'Approve': { hi: 'स्वीकृत करें', mr: 'मंजूर करा' },
  'Approve Gate': { hi: 'द्वार स्वीकृत करें', mr: 'द्वार मंजूर करा' },
  'Resume': { hi: 'पुनः शुरू करें', mr: 'पुन्हा सुरू करा' },
  'Fail': { hi: 'विफल चिह्नित करें', mr: 'अयशस्वी करा' },
  'Inspect': { hi: 'निरीक्षण', mr: 'तपासा' },
  'Inspect →': { hi: 'निरीक्षण →', mr: 'तपासा →' },
  'Root': { hi: 'मूल नोड', mr: 'मूळ नोड' },

  // Execution Center
  'Advance Next Task': { hi: 'अगला कार्य आगे बढ़ाएं', mr: 'पुढील काम पुढे न्या' },
  'Dispatch Task': { hi: 'कार्य भेजें', mr: 'नवीन काम पाठवा' },
  'LIVE PROGRESS': { hi: 'लाइव प्रगति', mr: 'थेट प्रगती' },
  'ACTIVE TASKS': { hi: 'सक्रिय कार्य', mr: 'सक्रिय कामे' },
  'AGENT STATUS': { hi: 'एजेंट स्थिति', mr: 'एजंट स्थिती' },
  'RESOURCE UTIL': { hi: 'संसाधन उपयोग', mr: 'संसाधन वापर' },
  'CURRENT RISKS': { hi: 'वर्तमान जोखिम', mr: 'सध्याचे धोके' },
  'MISSION ETA': { hi: 'अनुमानित समय', mr: 'अंदाजे वेळ' },
  'LIVE EXECUTION TIMELINE': { hi: 'लाइव निष्पादन समयरेखा', mr: 'थेट अंमलबजावणी कालरेषा' },
  'STREAMING': { hi: 'लाइव स्ट्रीमिंग', mr: 'थेट प्रक्षेपण' },
  'RESOURCE UTILIZATION': { hi: 'संसाधन उपयोग', mr: 'संसाधन वापर' },

  // Task Inspector Drawer
  'OVERVIEW': { hi: 'अवलोकन', mr: 'आढावा' },
  'EXECUTION STATE CONTROLS': { hi: 'निष्पादन स्थिति नियंत्रण', mr: 'अंमलबजावणी स्थिती नियंत्रण' },
  '● Persisted to Database': { hi: '● डेटाबेस में सुरक्षित', mr: '● डेटाबेसमध्ये जतन' },
  'Start Task': { hi: 'कार्य शुरू करें', mr: 'काम सुरू करा' },
  'Pause / Hold': { hi: 'रोकें / होल्ड', mr: 'थांबवा / होल्ड' },
  'Mark Failed': { hi: 'असफल चिह्नित करें', mr: 'अयशस्वी चिन्हांकित करा' },
  'Trigger Adaptive Re-Plan': { hi: 'अनुकूलित पुनर्योजना शुरू करें', mr: 'अनुकूल पुनर्नियोजन सुरू करा' },
  'AGENT & RESOURCE ASSIGNMENT': { hi: 'एजेंट एवं संसाधन आवंटन', mr: 'एजंट आणि संसाधन वाटप' },
  'Save Changes': { hi: 'परिवर्तन सहेजें', mr: 'बदल जतन करा' },
  'DEPENDENCIES & DAG TOPOLOGY': { hi: 'निर्भरता एवं DAG संरचना', mr: 'अवलंबित्व आणि DAG रचना' },
  'STATE HISTORY & PROGRESSION': { hi: 'स्थिति इतिहास एवं प्रगति', mr: 'स्थिती इतिहास आणि प्रगती' },
  'TELEMETRY & EXECUTION LOGS': { hi: 'टेलीमेट्री एवं निष्पादन लॉग', mr: 'टेलिमेट्री आणि अंमलबजावणी लॉग' },
};

export function tr(text: string, lang: Language): string {
  if (lang === 'en' || !text) return text;
  const trimmed = text.trim();
  if (UI_PHRASES[trimmed]) {
    return UI_PHRASES[trimmed][lang];
  }
  return text;
}

