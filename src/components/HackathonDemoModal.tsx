import React, { useState, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Pause,
  ExternalLink,
  Zap,
  Sliders,
  X,
} from 'lucide-react';

export const HackathonDemoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    isDemoRunning,
    demoStep,
    startHackathonDemo,
    stepDemoForward,
    resetDemo,
    t,
    language,
    setSelectedPlanVersion,
    triggerDisruption,
  } = useMission();

  const [autoPlay, setAutoPlay] = useState(false);

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPlay && isDemoRunning && demoStep < 9) {
      interval = setInterval(() => {
        stepDemoForward();
      }, 4500);
    } else if (demoStep >= 9) {
      setAutoPlay(false);
    }
    return () => clearInterval(interval);
  }, [autoPlay, isDemoRunning, demoStep, stepDemoForward]);

  if (!isOpen) return null;

  const demoStepsInfo = [
    {
      step: 1,
      name: t.demoSteps.step1,
      agent: 'Mission Analyst Agent',
      desc: language === 'hi' 
        ? 'प्राकृतिक भाषा उद्देश्य का विश्लेषण: "3 आश्रयों और सीमित एम्बुलेंस के साथ बाढ़ प्रभावित क्षेत्र में निकासी का समन्वय करें"। 6 कठोर सीमाएं और 4,200 नागरिक निकाले गए।'
        : language === 'mr'
        ? 'नैसर्गिक भाषा उद्दिष्टाचे विश्लेषण: "३ निवारे आणि मर्यादित रुग्णवाहिकांसह पूरग्रस्त भागात मदत कार्य करा". ६ अटी आणि ४,२०० नागरिकांची नोंद.'
        : 'Natural language objective ingested: "Coordinate evacuation for flood-affected zone with 3 shelters and limited ambulances". Extracted 6 hard constraints and 4,200 vulnerable citizens.',
    },
    {
      step: 2,
      name: t.demoSteps.step2,
      agent: 'Planning Agent',
      desc: language === 'hi'
        ? 'उद्देश्य को 24 निष्पादन योग्य कार्यों में विभाजित किया गया। प्राथमिक मार्ग R2 सेतु पर 8 ALS एम्बुलेंस आवंटित की गईं।'
        : language === 'mr'
        ? 'उद्दिष्ट २४ अंमलबजावणीयोग्य कामांमध्ये विभागले गेले. मुख्य मार्ग R2 पुलावर ८ रुग्णवाहिका नियुक्त केल्या.'
        : 'Decomposed goal into 24 executable tasks with multi-echelon dependency graph. Assigned 8 ALS ambulances across primary Route R2 causeway.',
    },
    {
      step: 3,
      name: t.demoSteps.step3,
      agent: 'Execution & Tool Agents',
      desc: language === 'hi'
        ? 'ट्राइएज प्वाइंट स्थापित। प्राथमिक मरीज काफिला रवाना। आईओटी पुल और जल स्तर सेंसर 1-सेकंड टेलीमेट्री पर सक्रिय।'
        : language === 'mr'
        ? 'मदत केंद्र सुरू. रुग्णवाहिका रवाना. आयओटी सेन्सर्स आणि पाणी पातळी १ सेकंदाच्या अंतराने ट्रॅक केली जात आहे.'
        : 'Triage Point Alpha established. Initial patient convoys dispatched. IoT bridge stress and water level sensors polling at 1-second telemetry intervals.',
    },
    {
      step: 4,
      name: t.demoSteps.step4,
      agent: 'Monitoring Agent',
      desc: language === 'hi'
        ? 'हाइड्रो-सेंसर #12 चेतावनी: सेतु डेक पर 0.92 मीटर पानी। एम्बुलेंस A-1 और A-2 का मार्ग अवरुद्ध। 6 कार्य रुके।'
        : language === 'mr'
        ? 'हायड्रो सेन्सर इशारा: पुलावर ०.९२ मीटर पाणी साचले. रुग्णवाहिका A-1 व A-2 चा मार्ग बंद. ६ कामे प्रभावित.'
        : 'Hydro-sensor #12 alerts water depth cresting past 0.9m over causeway deck. Ambulance A-1 and A-2 transit halted. 6 downstream transit tasks paralyzed.',
    },
    {
      step: 5,
      name: t.demoSteps.step5,
      agent: 'Replanning Agent',
      desc: language === 'hi'
        ? 'स्वायत्त पुनर्योजना: जलमग्न R2 के स्थान पर एलिवेटेड बाईपास R4 पर काफिला पुनः निर्देशित। योजना v2 संश्लेषित।'
        : language === 'mr'
        ? 'स्वायत्त पुनर्नियोजन: जलमय R2 ऐवजी उन्नत बायपास R4 मार्गावर ताफा वळवला. नवीन योजना v2 तयार.'
        : 'Dependency cascade computed: Reroutes medical convoy via Elevated Bypass R4. Restricts delay to +9 mins instead of +45 mins. Plan v2 synthesized.',
    },
    {
      step: 6,
      name: t.demoSteps.step6,
      agent: 'Resource Constraint Optimizer',
      desc: language === 'hi'
        ? 'संसाधन संकट: भूस्खलन में 3 एम्बुलेंस भेजी गईं (8 → 5 शेष)। उच्च-क्लियरेंस शटल ट्रकों की दोहरी लहर सक्रिय।'
        : language === 'mr'
        ? 'साधन संकट: दरड कोसळल्याने ३ रुग्णवाहिका इतरत्र वळवल्या (८ वरून ५ उरल्या). लष्करी ट्रकची दुसरी फेरी सुरू.'
        : '3 ALS units diverted to sudden mountain landslide casualties. Scarcity optimizer triages non-critical ambulatory victims to high-clearance military trucks.',
    },
    {
      step: 7,
      name: t.demoSteps.step7,
      agent: 'Human Approval Gateway',
      desc: language === 'hi'
        ? 'मानव अनुमोदन द्वार: संवेदनशील निर्णय सीमा पार। ऑपरेटर द्वारा डिजिटल हस्ताक्षर से मार्ग परिवर्तन अधिकृत।'
        : language === 'mr'
        ? 'मानवी मंजुरी द्वार: संवेदनशील कृतीसाठी ऑपरेटरच्या डिजिटल स्वाक्षरीने मार्ग बदल अधिकृत केला.'
        : 'High-impact decision threshold reached: System halts high-risk commercial van commandeering until Duty Officer authorizes the diversion with digital sign-off.',
    },
    {
      step: 8,
      name: t.demoSteps.step8,
      agent: 'Execution & Verification Agents',
      desc: language === 'hi'
        ? 'पुनः निष्पादन: काफिला आश्रय 1, 2, और 3 पर सुरक्षित पहुंचा। बायोमेट्रिक उपस्थिति सत्यापन पूर्ण।'
        : language === 'mr'
        ? 'अंमलबजावणी सुरू: मदत पथके निवारा १, २ व ३ वर सुरक्षित पोहोचली. नागरिकांची उपस्थिती पडताळणी पूर्ण.'
        : 'Operator authorized route. Rerouted convoys arrive safely at Shelter 1, 2, and 3. Biometric shelter headcounts validated against master casualty lists.',
    },
    {
      step: 9,
      name: t.demoSteps.step9,
      agent: 'Verification Agent',
      desc: language === 'hi'
        ? 'मिशन सत्यापित एवं पूर्ण: 4,200 नागरिक सुरक्षित। शून्य हताहत। क्रिप्टोग्राफिक ऑडिट लेजर संकलित।'
        : language === 'mr'
        ? 'मोहीम पडताळणी व पूर्तता: ४,२०० नागरिक सुरक्षित. शून्य जीवितहानी. संपूर्ण डिजिटल ऑडिट नोंदवही तयार.'
        : 'Mission completed with 100% verified survivor accountability. Zero casualties. Full immutable audit trail compiled and synced.',
    },
  ];

  const currentInfo = demoStepsInfo[demoStep - 1] || demoStepsInfo[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  {t.hackathonDemoMode}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs font-mono text-slate-400">Live Agentic Execution Engine</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Flagship Demonstration: Multi-Disruption Flood Evacuation
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200/90 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[550px] gap-2">
            {demoStepsInfo.map((s) => {
              const isPast = s.step < demoStep;
              const isCurrent = s.step === demoStep;
              return (
                <div key={s.step} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-amber-400 scale-105 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle className="w-4 h-4" /> : s.step}
                  </div>
                  <span
                    className={`text-[10px] font-medium text-center truncate max-w-[65px] ${
                      isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {s.step === 4 ? 'R2 Detour' : s.step === 6 ? 'Fleet -3' : s.step === 7 ? 'Approval' : s.step === 9 ? 'Verified' : `Step ${s.step}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Step Showcase */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 bg-slate-50/80 dark:bg-slate-800/40 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                {currentInfo.agent}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Step {demoStep} of 9
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {currentInfo.name}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentInfo.desc}
            </p>
          </div>

          {/* Interactive Trigger Shortcuts for Judges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                  Disruption Injection: Route R2 Blocked
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3">
                  Simulate instantaneous sensor flood trigger without waiting for the stepper.
                </p>
              </div>
              <button
                onClick={() => {
                  triggerDisruption('route_r2_blocked');
                  setSelectedPlanVersion(2);
                }}
                className="w-full py-1.5 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg font-semibold text-center transition-colors cursor-pointer"
              >
                Trigger Route R2 Breach
              </button>
            </div>

            <div className="p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                  Resource Shock: Ambulances 8 → 5
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3">
                  Simulate external triage draw and trigger human approval threshold.
                </p>
              </div>
              <button
                onClick={() => {
                  triggerDisruption('ambulance_reduced');
                  setSelectedPlanVersion(3);
                }}
                className="w-full py-1.5 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg font-semibold text-center transition-colors cursor-pointer"
              >
                Trigger Fleet Scarcity
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/90 dark:border-slate-800 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={resetDemo}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                autoPlay
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoPlay ? 'Pause Auto' : 'Auto-Play (4.5s)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isDemoRunning ? (
              <button
                onClick={startHackathonDemo}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Start Flagship Demonstration</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={stepDemoForward}
                disabled={demoStep >= 9}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{demoStep >= 9 ? 'Demonstration Completed' : 'Proceed to Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
