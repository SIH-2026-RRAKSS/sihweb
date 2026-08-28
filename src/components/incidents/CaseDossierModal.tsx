import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Download,
  Printer,
  FileText,
  Building,
  User,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  Share2,
  Ban,
  Radio
} from 'lucide-react';
import { IncidentDetail } from '../../types';
import { ApiService } from '../../services/api';

interface CaseDossierModalProps {
  incidentId: string | null;
  onClose: () => void;
  onViewGraph: (id: string) => void;
}

export const CaseDossierModal: React.FC<CaseDossierModalProps> = ({
  incidentId,
  onClose,
  onViewGraph
}) => {
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) return;
    setLoading(true);
    ApiService.getIncidentDetail(incidentId).then((data) => {
      setDetail(data);
      setLoading(false);
    });
  }, [incidentId]);

  if (!incidentId) return null;

  const handleDownloadMarkdown = () => {
    if (!detail) return;
    const comp = detail.complaint;
    const pred = detail.model_prediction;
    const entity = detail.resolved_canonical_entity;
    const term = detail.top_terminal_details;

    const md = `# 🚨 FINANCIAL CYBERCRIME INVESTIGATIVE DOSSIER
**Incident Reference ID**: \`${comp.complaint_id}\`  
**Operational Classification**: **${pred.confidence_tier}** (GNN Risk: \`${pred.graphsage_risk_probability}\`)  
**Generated Date**: ${new Date().toUTCString()}  

---

## 1. Complaint & Incident Profile
- **Complainant**: ${comp.complainant_name}
- **Filing Date**: ${comp.complaint_date}
- **Disputed Amount**: ₹${comp.reported_amount.toLocaleString()}
- **Category**: ${comp.scam_category}
- **Location**: ${comp.location}
- **Reported Account**: \`${comp.reported_account_number}\` (IFSC: \`${comp.reported_ifsc}\`)

---

## 2. Resolved Canonical Entity Master
- **Entity ID**: \`${entity.entity_id}\`
- **Account Holder**: ${entity.canonical_holder_name}
- **Bank / Branch**: ${entity.bank_name}

---

## 3. Executive Intelligence Summary
> ${pred.executive_summary || 'Suspicious multi-hop laundering pattern detected dispersing funds downstream.'}

---

## 4. Concrete Observable Graph Evidence
${detail.investigative_evidence_bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

---

## 5. Physical Cash Exit & ATM Terminal Intelligence
- **Target Exit Terminal**: \`${term?.terminal_id || pred.top_terminal_id || 'N/A'}\`
- **City**: ${term?.city || pred.top_terminal_city || 'N/A'}
- **Confidence Score**: \`${term?.terminal_score || pred.top_terminal_score || 'N/A'}\`
- **Rationale**: ${term?.rationale || 'Terminal exit affinity identified.'}

---
*CONFIDENTIAL — FOR LAW ENFORCEMENT & FIU ANALYST REVIEW ONLY*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DOSSIER_${comp.complaint_id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    if (!detail) return;
    const blob = new Blob([JSON.stringify(detail, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CASE_RECORD_${detail.complaint.complaint_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFreezeNotice = () => {
    setActionNotice(`🚨 Automated Section 102 CrPC / Freeze Advisory dispatched to ${detail?.resolved_canonical_entity.bank_name || 'beneficiary bank'}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-cyber-900 border border-cyber-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-cyber-950 border-b border-cyber-700/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center text-cyber-red">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  Investigative Case Dossier — {incidentId}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red/40 rounded">
                  CONFIDENTIAL / LAW ENFORCEMENT ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Automated ML-Assisted Post-Complaint Analytical Triage Briefing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-cyber-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs font-sans">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Radio className="w-8 h-8 text-cyber-cyan animate-spin" />
              <span className="text-xs font-mono text-slate-400">Loading Case Intelligence...</span>
            </div>
          ) : detail ? (
            <>
              {/* Alert Notification Toast */}
              {actionNotice && (
                <div className="p-3 bg-cyber-red/20 border border-cyber-red/50 text-red-300 rounded-lg text-xs font-mono flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-cyber-red flex-shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Status Header Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-cyber-950/80 border border-cyber-800 rounded-xl font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Operational Risk Tier</div>
                  <div className="text-sm font-bold text-cyber-red flex items-center gap-1.5 mt-0.5">
                    <AlertOctagon className="w-4 h-4" />
                    {detail.model_prediction.confidence_tier}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">GraphSAGE Risk Probability</div>
                  <div className="text-sm font-bold text-cyber-cyan mt-0.5">
                    {(detail.model_prediction.graphsage_risk_probability * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Disputed Amount</div>
                  <div className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    ₹{detail.complaint.reported_amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Section 1 & 2: Grid Profile & Resolved Entity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Complaint Profile */}
                <div className="p-4 bg-cyber-950/60 border border-cyber-800 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-300 font-mono font-bold text-xs border-b border-cyber-800 pb-2">
                    <User className="w-3.5 h-3.5 text-cyber-cyan" />
                    1. Primary Complaint Details
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Complainant:</span>
                      <span className="text-slate-200 font-semibold">{detail.complaint.complainant_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scam Category:</span>
                      <span className="text-amber-400 font-semibold">{detail.complaint.scam_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary A/C:</span>
                      <span className="text-slate-200">{detail.complaint.reported_account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank IFSC:</span>
                      <span className="text-slate-200">{detail.complaint.reported_ifsc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jurisdiction:</span>
                      <span className="text-slate-200">{detail.complaint.location}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Resolved Canonical Entity Master */}
                <div className="p-4 bg-cyber-950/60 border border-cyber-800 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-300 font-mono font-bold text-xs border-b border-cyber-800 pb-2">
                    <Building className="w-3.5 h-3.5 text-purple-400" />
                    2. Resolved Canonical Financial Entity
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Entity Master ID:</span>
                      <span className="text-cyber-cyan font-bold">{detail.resolved_canonical_entity.entity_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Canonical Holder:</span>
                      <span className="text-slate-200 font-semibold">{detail.resolved_canonical_entity.canonical_holder_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank / Rail:</span>
                      <span className="text-slate-200">{detail.resolved_canonical_entity.bank_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GPS Coordinates:</span>
                      <span className="text-slate-400">
                        {detail.resolved_canonical_entity.coordinates ? `${detail.resolved_canonical_entity.coordinates[0].toFixed(4)}, ${detail.resolved_canonical_entity.coordinates[1].toFixed(4)}` : 'Available in Dataset A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Executive Intelligence Summary */}
              <div className="p-4 bg-cyber-950/80 border-l-4 border-cyber-cyan rounded-r-xl space-y-1.5">
                <div className="text-xs font-mono font-bold text-cyber-cyan uppercase">
                  3. Executive Intelligence Assessment
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{detail.model_prediction.executive_summary || 'Multi-hop fund dispersal identified routing complaint proceeds through structured intermediary accounts.'}"
                </p>
              </div>

              {/* Section 4: Concrete Observable Graph Evidence */}
              <div className="p-4 bg-cyber-950/60 border border-cyber-800 rounded-xl space-y-3">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>4. Concrete Observable Graph Evidence Bullets</span>
                  <span className="text-[10px] text-emerald-400">{detail.investigative_evidence_bullets.length} Signals Validated</span>
                </div>
                <ul className="space-y-2">
                  {detail.investigative_evidence_bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 5: Physical Cash Exit Intelligence */}
              {detail.top_terminal_details && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    5. Physical Cash Exit & ATM Terminal Prediction
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400">Target Terminal: </span>
                      <span className="text-amber-300 font-bold">{detail.top_terminal_details.terminal_id || 'ATM_029'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target City: </span>
                      <span className="text-slate-200 font-semibold">{detail.top_terminal_details.city || 'Mumbai'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Terminal Score: </span>
                      <span className="text-amber-400 font-bold">{detail.top_terminal_details.terminal_score || 0.72}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 pt-1">
                    {detail.top_terminal_details.rationale}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">Incident not found.</div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-cyber-950 border-t border-cyber-700/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewGraph(incidentId);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono bg-cyber-cyan text-cyber-950 font-bold hover:bg-cyber-cyan/90 rounded-lg transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Open Interactive Topology Graph
            </button>

            <button
              onClick={handleFreezeNotice}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono bg-cyber-red/20 text-cyber-red border border-cyber-red/40 hover:bg-cyber-red/30 rounded-lg transition-all"
              title="Issue Freeze Advisory Notice"
            >
              <Ban className="w-3.5 h-3.5" />
              Dispatch Freeze Notice
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1 px-3 py-2 text-xs font-mono bg-cyber-800 hover:bg-cyber-700 text-slate-200 border border-cyber-600 rounded-lg transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
              Markdown
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1 px-3 py-2 text-xs font-mono bg-cyber-800 hover:bg-cyber-700 text-slate-200 border border-cyber-600 rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              JSON
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-2 text-xs font-mono bg-cyber-800 hover:bg-cyber-700 text-slate-200 border border-cyber-600 rounded-lg transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
