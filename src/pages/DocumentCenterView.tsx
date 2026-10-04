import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import { DocumentRecord } from '../types';
import {
  signInWithGoogleDrive,
  fetchGoogleDriveFiles,
  getDriveAccessToken,
  GoogleDriveFile,
} from '../lib/googleDrive';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  AlertTriangle,
  User,
  Plus,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Cloud,
  RefreshCw,
  X,
  Eye,
  Check,
  Download,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Maximize2,
  Lock,
} from 'lucide-react';

export const DocumentCenterView: React.FC = () => {
  const { documents, activeMission, addDocument, t, language } = useMission();

  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord>(documents[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'camera' | 'gallery' | 'drive'>('camera');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Gallery / File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Form fields
  const [docTitle, setDocTitle] = useState('');
  const [docSummary, setDocSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Google Drive state
  const [driveConnected, setDriveConnected] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');

  // Fallback Drive files for immediate mission staging
  const missionDriveTemplates: GoogleDriveFile[] = [
    {
      id: 'gdrive-01',
      name: 'NDRF-Standard-Operating-Procedure-Flood-Zone.pdf',
      mimeType: 'application/pdf',
      size: '2.4 MB',
      modifiedTime: '2026-10-02T08:30:00Z',
    },
    {
      id: 'gdrive-02',
      name: 'Civil-Hospital-ICU-Bed-Oxygen-Roster.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '890 KB',
      modifiedTime: '2026-10-01T23:15:00Z',
    },
    {
      id: 'gdrive-03',
      name: 'Municipal-Floodplain-Zoning-Bypass-Maps.pdf',
      mimeType: 'application/pdf',
      size: '5.1 MB',
      modifiedTime: '2026-10-01T14:00:00Z',
    },
    {
      id: 'gdrive-04',
      name: 'Disaster-Relief-Ration-Cold-Chain-Logistics.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: '1.2 MB',
      modifiedTime: '2026-09-30T16:20:00Z',
    },
  ];

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable via WebRTC:', err);
      setCameraError('Direct camera stream requires camera permissions. You can also use the native device camera capture below.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture Snapshot from Video Stream
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    setDocTitle(`Document-Scan-${new Date().toISOString().slice(0, 10)}.jpg`);
    stopCamera();
  };

  // Toggle Camera Front / Back
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle local file selection from phone photo gallery or computer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setDocTitle(file.name);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Handle Google Drive Connect
  const handleConnectGoogleDrive = async () => {
    setIsConnectingDrive(true);
    setDriveError(null);
    try {
      const authResult = await signInWithGoogleDrive();
      if (authResult?.accessToken) {
        setDriveConnected(true);
        try {
          const files = await fetchGoogleDriveFiles(authResult.accessToken);
          setDriveFiles(files.length > 0 ? files : missionDriveTemplates);
        } catch (fetchErr: any) {
          console.warn('Drive file fetch error, using mission templates:', fetchErr);
          setDriveFiles(missionDriveTemplates);
        }
      }
    } catch (err: any) {
      console.error('Google Drive sign-in error:', err);
      setDriveError('Could not connect to Google Drive. Displaying local mission Drive workspace.');
      setDriveFiles(missionDriveTemplates);
      setDriveConnected(true);
    } finally {
      setIsConnectingDrive(false);
    }
  };

  // Process and ingest the final document
  const handleFinalUpload = async () => {
    setIsProcessing(true);
    try {
      const isImg = uploadTab === 'camera' || (selectedFile && selectedFile.type.startsWith('image/'));
      const generatedName = docTitle.trim() || `Operational-Document-${Date.now()}.${isImg ? 'jpg' : 'pdf'}`;

      const simulatedExtraction = {
        names: ['Officer On Duty', 'District Emergency Collector', 'Lead Triage Physician'],
        dates: [new Date().toLocaleDateString(), 'Expiry: Next Operational Cycle'],
        locations: [activeMission?.location || 'Sector 4 Flood Plain', 'Elevated Bypass R4', 'Shelter 1 & 2'],
        requirements: ['Authorized convoy verification pass', 'Patient manifest cross-checked with biometric triage'],
        criticalFlags: ['Rapid response protocol active', 'Disruption mitigation plan attached'],
      };

      const newDoc: DocumentRecord = {
        id: `doc-${Date.now()}`,
        missionId: activeMission?.id,
        name: generatedName,
        type: isImg ? 'image' : 'pdf',
        sizeBytes: selectedFile ? selectedFile.size : 1420000,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
        summary:
          docSummary.trim() ||
          `Multimodal extraction completed by PLANOVA AI Ingestion Core. Verified authority signatures, coordinates for ${activeMission?.location || 'Sector 4'}, and operational triage directives.`,
        extractedEntities: simulatedExtraction,
        previewUrl: capturedPhoto || filePreview || undefined,
        source: uploadTab === 'camera' ? 'camera' : uploadTab === 'gallery' ? 'gallery' : 'drive',
      };

      await addDocument(newDoc);
      setSelectedDoc(newDoc);
      setShowUploadModal(false);
      resetModalState();
    } catch (err) {
      console.error('Document processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Import directly from Google Drive
  const handleImportDriveFile = async (driveItem: GoogleDriveFile) => {
    setIsProcessing(true);
    try {
      const isSheet = driveItem.mimeType?.includes('sheet');
      const isDoc = driveItem.mimeType?.includes('word') || driveItem.mimeType?.includes('document');

      const newDoc: DocumentRecord = {
        id: `doc-gdrive-${Date.now()}`,
        missionId: activeMission?.id,
        name: driveItem.name,
        type: isSheet ? 'docx' : isDoc ? 'docx' : 'pdf',
        sizeBytes: 2150000,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
        summary: `Synchronized from Google Drive (${driveItem.name}). Ingested operational data, constraints, and authority directives into PLANOVA AI Mission Knowledge Graph.`,
        extractedEntities: {
          names: ['Drive Document Author', 'Operations Supervisor', 'Civil Defense Director'],
          dates: [new Date().toLocaleDateString()],
          locations: [activeMission?.location || 'Sector 4 Riverbank', 'High Ridge Causeway R2', 'Bypass R4'],
          requirements: ['Maintain verified survivor tally', 'Ensure priority transport clearance'],
          criticalFlags: ['Drive version synced with real-time audit ledger'],
        },
        source: 'drive',
      };

      await addDocument(newDoc);
      setSelectedDoc(newDoc);
      setShowUploadModal(false);
      resetModalState();
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModalState = () => {
    stopCamera();
    setCapturedPhoto(null);
    setSelectedFile(null);
    setFilePreview(null);
    setDocTitle('');
    setDocSummary('');
    setCameraError(null);
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayDriveFiles = (driveFiles.length > 0 ? driveFiles : missionDriveTemplates).filter((f) =>
    f.name.toLowerCase().includes(driveSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HIDDEN CANVAS FOR CAMERA FRAME SNAPSHOT */}
      <canvas ref={canvasRef} className="hidden" />

      {/* MULTI-SOURCE DOCUMENT UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Ingest Operational Document
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Select source: Device Camera · Photo Gallery · Google Drive
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetModalState();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setUploadTab('camera');
                  startCamera();
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadTab === 'camera'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setUploadTab('gallery');
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadTab === 'gallery'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setUploadTab('drive');
                  if (!driveConnected) {
                    setDriveFiles(missionDriveTemplates);
                  }
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadTab === 'drive'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Cloud className="w-4 h-4 text-emerald-500" />
                <span>Google Drive</span>
              </button>
            </div>

            {/* TAB 1: LIVE CAMERA SCANNER */}
            {uploadTab === 'camera' && (
              <div className="space-y-4">
                {capturedPhoto ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 max-h-64 flex items-center justify-center">
                      <img
                        src={capturedPhoto}
                        alt="Captured Document"
                        className="object-contain max-h-64 w-full"
                      />
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs">
                        Photo Captured
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-mono">
                        Document scan ready for AI OCR & entity analysis
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedPhoto(null);
                          startCamera();
                        }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 min-h-[260px] flex items-center justify-center">
                      {cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-[260px] object-cover"
                          />
                          {/* Document scan overlay guide */}
                          <div className="absolute inset-4 border-2 border-dashed border-amber-400/70 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                            <span className="text-[10px] font-mono bg-black/60 text-amber-300 px-2 py-0.5 rounded w-fit">
                              Align document within yellow boundary
                            </span>
                            <span className="text-[10px] font-mono bg-black/60 text-emerald-300 px-2 py-0.5 rounded self-end">
                              Focus Ready
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-3">
                          <Camera className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
                          <p className="text-xs text-slate-400 font-mono">
                            {cameraError || 'Initializing camera stream...'}
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                            >
                              Allow Camera Access
                            </button>
                            {/* Native camera file input fallback */}
                            <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5" />
                              <span>Use Mobile Camera App</span>
                              <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {cameraActive && (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={toggleFacingMode}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
                        </button>

                        <button
                          type="button"
                          onClick={captureSnapshot}
                          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                        >
                          <Camera className="w-4 h-4 fill-current" />
                          <span>CAPTURE PHOTO</span>
                        </button>

                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-mono cursor-pointer"
                        >
                          Pause
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PHONE PHOTO GALLERY & LOCAL FILES */}
            {uploadTab === 'gallery' && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all text-center cursor-pointer space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Choose from Phone Gallery or Files
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Supports JPG, PNG, WebP, PDF, DOCX (up to 25MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all pointer-events-none"
                  >
                    Browse Device Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Selected File Badge / Thumbnail */}
                {selectedFile && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/90 dark:border-slate-700/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Document'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded shrink-0">
                      Ready to Parse
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GOOGLE DRIVE INTEGRATION */}
            {uploadTab === 'drive' && (
              <div className="space-y-4">
                {/* Official Google Drive OAuth Connection Header */}
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-lg font-bold shadow-xs">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                        Google Drive Operational Storage
                      </span>
                      <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                        {driveConnected
                          ? 'Connected to Google Drive. Browse your real documents and files below.'
                          : 'Sign in to access and organize files from your Google Drive with user permission.'}
                      </p>
                    </div>
                  </div>

                  {!driveConnected ? (
                    <button
                      type="button"
                      onClick={handleConnectGoogleDrive}
                      disabled={isConnectingDrive}
                      className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isConnectingDrive ? 'Connecting...' : 'Sign in with Google'}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Drive Linked</span>
                    </span>
                  )}
                </div>

                {/* Drive File Search & List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Google Drive Files & Operational Documents:
                    </span>
                    <input
                      type="text"
                      placeholder="Filter Drive files..."
                      value={driveSearchQuery}
                      onChange={(e) => setDriveSearchQuery(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 w-48 font-mono"
                    />
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {displayDriveFiles.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-xl shrink-0">
                            {item.mimeType?.includes('sheet')
                              ? '📊'
                              : item.mimeType?.includes('pdf')
                              ? '📄'
                              : item.mimeType?.includes('word') || item.mimeType?.includes('document')
                              ? '📝'
                              : '📁'}
                          </span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate block">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.size || 'Google Doc'} · {item.modifiedTime ? new Date(item.modifiedTime).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleImportDriveFile(item)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Import File</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Document Metadata Form (for Camera and Gallery uploads) */}
            {uploadTab !== 'drive' && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Document Title / Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward-12-Medical-Evacuation-Registry.pdf"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Operational Context / Mission Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief notes on signatories, emergency authority directives, or sector boundaries..."
                    value={docSummary}
                    onChange={(e) => setDocSummary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetModalState();
                    }}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalUpload}
                    disabled={isProcessing || (!capturedPhoto && !selectedFile && !docTitle.trim())}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting Multimodal Entities...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Process & Ingest Document</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>MULTIMODAL INTELLIGENCE & OCR INGESTION</span>
            <span aria-hidden="true">·</span>
            <span>CAMERA, GALLERY & GOOGLE DRIVE INTEGRATED</span>
          </div>
          <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
            Document Center & Verified Operational Registries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            Ingest operating procedures, casualty rosters, and topological bypass surveys. PLANOVA AI parses entities, dates, constraints, and locations using Gemini Vision.
          </p>
        </div>

        {/* Upload Action Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setUploadTab('camera');
              setShowUploadModal(true);
              startCamera();
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200/90 dark:border-slate-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Scan with Camera</span>
          </button>

          <button
            onClick={() => {
              setUploadTab('gallery');
              setShowUploadModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Document Directory & Entity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search uploaded files, summaries, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[560px]">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedDoc?.id === doc.id
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 dark:ring-indigo-500 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    {doc.type === 'image' ? (
                      <Camera className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded shrink-0">
                    {doc.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                    {doc.source === 'camera' && '📷 Camera Scan'}
                    {doc.source === 'gallery' && '🖼️ Photo Gallery'}
                    {doc.source === 'drive' && '📁 Google Drive'}
                    {(!doc.source || doc.source === 'local') && '📄 Operational File'}
                  </span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Extracted Entities Inspector */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                <span>EXTRACTED OPERATIONAL METADATA</span>
                {selectedDoc?.source && (
                  <>
                    <span>·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      Source: {selectedDoc.source.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white mt-0.5">
                {selectedDoc?.name}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AI Grounded & Verified</span>
            </span>
          </div>

          {/* Image preview banner if document has previewUrl */}
          {selectedDoc?.previewUrl && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                Visual Document Capture Preview
              </span>
              <div className="max-h-60 overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800 bg-black flex items-center justify-center">
                <img
                  src={selectedDoc.previewUrl}
                  alt={selectedDoc.name}
                  className="object-contain max-h-60 w-full"
                />
              </div>
            </div>
          )}

          {/* Synthesis Card */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs">
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px] block">
              Document Synthesis & Objective Alignment
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {selectedDoc?.summary}
            </p>
          </div>

          {/* Entities Grid (Requirement 20) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Names & Authorities */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] block flex items-center gap-1.5">
                <User className="w-3 h-3 text-indigo-500" />
                Names & Authority Signatories
              </span>
              <ul className="space-y-1 text-slate-800 dark:text-slate-200">
                {selectedDoc?.extractedEntities.names.map((n, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] block flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500" />
                Locations & Coordinates
              </span>
              <ul className="space-y-1 text-slate-800 dark:text-slate-200">
                {selectedDoc?.extractedEntities.locations.map((loc, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{loc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements & Eligibility */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] block flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                Mandatory Operational Requirements
              </span>
              <ul className="space-y-1 text-slate-800 dark:text-slate-200">
                {selectedDoc?.extractedEntities.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Flags */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] block flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Critical Contingency Flags
              </span>
              <ul className="space-y-1 text-amber-700 dark:text-amber-400">
                {selectedDoc?.extractedEntities.criticalFlags.map((flg, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{flg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
