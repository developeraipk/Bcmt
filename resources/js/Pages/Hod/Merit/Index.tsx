import React, { useState } from 'react';
import HodLayout from '@/Layouts/HodLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
  Sliders,
  Award,
  Plus,
  Play,
  CheckCircle2,
  Lock,
  Printer,
  Sparkles,
  HelpCircle,
  Eye,
  Percent,
  Edit2,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface Component {
  component_type: string;
  component_name: string;
  weight_percentage: number;
}

interface Formula {
  id: number;
  title: string;
  total_weight: number;
  is_active: boolean;
  components: Component[];
}

interface MeritList {
  id: number;
  title: string;
  list_number: number;
  status: string;
  sha256_hash: string;
  created_at: string;
  published_at: string | null;
  items_count?: number;
  session_program?: {
    program?: {
      name: string;
      code: string;
    };
  };
}

interface Props {
  sessionPrograms: any[];
  meritLists: MeritList[];
  sessions: any[];
  selectedSessionId: number;
}

export default function MeritIndex({ sessionPrograms, meritLists, sessions, selectedSessionId }: Props) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showCompileModal, setShowCompileModal] = useState(false);

  // Form for Dynamic Merit Formula Builder (Mandatory Correction 2 & 5)
  const formulaForm = useForm({
    session_program_id: sessionPrograms[0]?.id || '',
    title: 'Standard Academic Weightage (Matric + Inter + Test)',
    components: [
      { component_type: 'matric', component_name: 'Matriculation (SSC)', weight_percentage: 10 },
      { component_type: 'intermediate', component_name: 'Intermediate (FSc / HSSC)', weight_percentage: 40 },
      { component_type: 'admission_test', component_name: 'BCMT Campus Entrance Test', weight_percentage: 50 },
    ],
  });

  // Form for Compiling Merit List
  const compileForm = useForm({
    session_program_id: sessionPrograms[0]?.id || '',
    merit_formula_id: sessionPrograms[0]?.merit_formulas?.[0]?.id || '',
    title: 'Provisional Merit List - Round 1',
  });

  const totalFormulaWeight = formulaForm.data.components.reduce(
    (sum, c) => sum + Number(c.weight_percentage || 0),
    0
  );

  const handleAddComponent = () => {
    formulaForm.setData('components', [
      ...formulaForm.data.components,
      { component_type: 'custom', component_name: 'Interview / Practical', weight_percentage: 0 },
    ]);
  };

  const handleRemoveComponent = (idx: number) => {
    const updated = formulaForm.data.components.filter((_, i) => i !== idx);
    formulaForm.setData('components', updated);
  };

  const handleComponentChange = (idx: number, field: string, val: any) => {
    const updated = [...formulaForm.data.components];
    (updated[idx] as any)[field] = val;
    formulaForm.setData('components', updated);
  };

  const handleZeroAllWeights = () => {
    const updated = formulaForm.data.components.map((c) => ({
      ...c,
      weight_percentage: 0,
    }));
    formulaForm.setData('components', updated);
  };

  const handleEditFormula = (sp: any) => {
    const activeFormula = sp.merit_formulas?.find((f: Formula) => f.is_active);
    if (activeFormula && activeFormula.components && activeFormula.components.length > 0) {
      formulaForm.setData({
        session_program_id: sp.id,
        title: activeFormula.title || `Merit Weightage - ${sp.program?.name}`,
        components: activeFormula.components.map((c: any) => ({
          component_type: c.component_type,
          component_name: c.component_name,
          weight_percentage: Number(c.weight_percentage) || 0,
        })),
      });
    } else {
      formulaForm.setData({
        session_program_id: sp.id,
        title: `Academic Merit Formula - ${sp.program?.name}`,
        components: [
          { component_type: 'matric', component_name: 'Matriculation (SSC)', weight_percentage: 10 },
          { component_type: 'intermediate', component_name: 'Intermediate (FSc / HSSC)', weight_percentage: 40 },
          { component_type: 'admission_test', component_name: 'BCMT Campus Entrance Test', weight_percentage: 50 },
        ],
      });
    }
    setShowFormulaModal(true);
  };

  const handleResetFormula = (sp: any) => {
    if (confirm(`Reset and zero-out all merit formula weights to 0% for ${sp.program?.name}? This will deactivate the active formula.`)) {
      router.post('/hod/merit/formula/reset', {
        session_program_id: sp.id,
      });
    }
  };

  const handleOpenCompileModalForProgram = (sp: any) => {
    const activeFormula = sp.merit_formulas?.find((f: Formula) => f.is_active);
    compileForm.setData({
      session_program_id: sp.id,
      merit_formula_id: activeFormula?.id || sp?.merit_formulas?.[0]?.id || '',
      title: `Provisional Merit List - Round 1 (${sp.program?.name || sp.program?.code})`,
    });
    setShowCompileModal(true);
  };

  const handleDeleteList = (ml: MeritList) => {
    if (confirm(`Permanently delete merit list '${ml.title}'? All candidate rankings in this list will be removed.`)) {
      router.delete(`/hod/merit/${ml.id}`);
    }
  };

  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    formulaForm.post('/hod/merit/formula', {
      onSuccess: () => {
        setShowFormulaModal(false);
      },
    });
  };

  const handleCompileMerit = (e: React.FormEvent) => {
    e.preventDefault();
    compileForm.post('/hod/merit/compile', {
      onSuccess: () => {
        setShowCompileModal(false);
      },
    });
  };

  const handlePublishList = (meritListId: number) => {
    if (confirm('Approve and publish this merit list? It will be cryptographically locked with a SHA-256 seal and visible to students.')) {
      router.post(`/hod/merit/${meritListId}/publish`);
    }
  };

  return (
    <HodLayout>
      <Head title="Dynamic Merit Engine & Ranking - BCMT HOD" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-rose-300 bg-rose-950 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-800">
            Merit Engine & Ranking
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Dynamic Merit Calculation & Publication
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Build configurable formula weightages, compile unified gender rankings, and lock lists with cryptographic seals.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-300" /> New Formula
          </button>
          <button
            onClick={() => setShowCompileModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFB606]" /> Compile Merit List
          </button>
        </div>
      </div>

      {/* Active Formulas Overview */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs mb-8">
        <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#07294D]" /> Program-Wise Active Merit Formulas
          </span>
          <span className="text-xs text-stone-500 font-normal">Must equal exactly 100% total weight</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessionPrograms.map((sp) => {
            const activeFormula = sp.merit_formulas?.find((f: Formula) => f.is_active);
            const totalWeight = activeFormula?.components?.reduce((sum: number, c: any) => sum + Number(c.weight_percentage || 0), 0) ?? 0;
            return (
              <div
                key={sp.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between hover:border-[#07294D]/30 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#07294D] bg-[#07294D]/10 px-2 py-0.5 rounded uppercase">
                      {sp.program?.code}
                    </span>
                    <span className={`text-[11px] font-bold ${totalWeight === 100 ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {totalWeight}% Weighted
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm mb-2">{sp.program?.name}</h4>

                  {activeFormula ? (
                    <div className="space-y-1.5 text-xs text-stone-700">
                      <p className="font-semibold text-stone-800 text-[11px]">{activeFormula.title}</p>
                      {activeFormula.components?.map((comp: Component, i: number) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-stone-500">{comp.component_name}:</span>
                          <span className="font-bold font-mono text-stone-900">{comp.weight_percentage}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No active formula configured.</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-2.5 text-[11px]">
                  <div className="flex justify-between items-center text-stone-500 font-semibold">
                    <span>Total Cohort Seats: {sp.total_seats}</span>
                    <span>{sp.merit_formulas?.length || 0} Formulas</span>
                  </div>

                  {/* Card Action Buttons: Edit, Compile, and Reset */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleEditFormula(sp)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#FFB606]" /> Edit Formula
                    </button>
                    <button
                      onClick={() => handleOpenCompileModalForProgram(sp)}
                      title={`Compile Merit List for ${sp.program?.name}`}
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Compile
                    </button>
                    <button
                      onClick={() => handleResetFormula(sp)}
                      title="Clear & reset all formula components to 0%"
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset (0%)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compiled Merit Lists Board */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden mb-8">
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Compiled Merit Lists & Sealed Records</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Published merit lists are cryptographically hashed and trigger automated seat offers.
            </p>
          </div>
          <Award className="w-5 h-5 text-stone-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px] border-b border-stone-200">
                <th className="p-4">Merit List Title</th>
                <th className="p-4">Program</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Cryptographic Seal</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {meritLists.map((ml) => (
                <tr key={ml.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-4">
                    <span className="font-bold text-stone-900 text-sm block">{ml.title}</span>
                    <span className="text-[11px] text-stone-500">Compiled: {new Date(ml.created_at).toLocaleString()}</span>
                  </td>
                  <td className="p-4 font-semibold text-stone-800">
                    {ml.session_program?.program?.name}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ml.status === 'published_locked'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ml.status === 'published_locked' ? <Lock className="w-3 h-3" /> : null}
                      {ml.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-stone-500 truncate max-w-xs">
                    {ml.sha256_hash ? (
                      <span className="text-emerald-800 font-bold" title={ml.sha256_hash}>
                        SHA-256: {ml.sha256_hash.substring(0, 16)}...
                      </span>
                    ) : (
                      'Unpublished Draft'
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/hod/merit/${ml.id}/print`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> View List
                      </Link>

                      {ml.status === 'draft' && (
                        <button
                          onClick={() => handlePublishList(ml.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Approve & Publish
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteList(ml)}
                        title="Delete merit list record"
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {meritLists.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    No merit lists compiled yet. Click "Compile Merit List" above to run the ranking algorithm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="pb-4 mb-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#800000] uppercase tracking-wider">
                  Merit Weightage Engine
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
                  Design Dynamic Merit Formula
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFormula} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Target Degree / Diploma Program
                </label>
                <select
                  value={formulaForm.data.session_program_id}
                  onChange={(e) => formulaForm.setData('session_program_id', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#800000]"
                >
                  {sessionPrograms.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.program?.name} ({sp.program?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Formula Title
                </label>
                <input
                  type="text"
                  required
                  value={formulaForm.data.title}
                  onChange={(e) => formulaForm.setData('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-[#07294D]"
                />
              </div>

              {/* Dynamic Components List */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Formula Components
                  </label>
                  <span className={`text-xs font-mono font-bold ${
                    totalFormulaWeight === 100 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    Total: {totalFormulaWeight}% (Must be 100%)
                  </span>
                </div>

                <div className="space-y-2">
                  {formulaForm.data.components.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
                      <select
                        value={comp.component_type}
                        onChange={(e) => handleComponentChange(idx, 'component_type', e.target.value)}
                        className="w-36 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs"
                      >
                        <option value="matric">Matriculation</option>
                        <option value="intermediate">Intermediate (FSc)</option>
                        <option value="admission_test">Admission Test</option>
                        <option value="interview">Interview</option>
                        <option value="custom">Custom Component</option>
                      </select>

                      <input
                        type="text"
                        required
                        placeholder="Component Name..."
                        value={comp.component_name}
                        onChange={(e) => handleComponentChange(idx, 'component_name', e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs"
                      />

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          required
                          value={comp.weight_percentage}
                          onChange={(e) => handleComponentChange(idx, 'weight_percentage', Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-right"
                        />
                        <span className="font-bold text-stone-600">%</span>
                      </div>

                      {formulaForm.data.components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(idx)}
                          className="text-stone-400 hover:text-rose-600 px-1 font-bold text-sm cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="text-xs font-bold text-[#07294D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + Add Another Component
                  </button>

                  <button
                    type="button"
                    onClick={handleZeroAllWeights}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200"
                  >
                    <RotateCcw className="w-3 h-3" /> Zero All (0%)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formulaForm.processing || totalFormulaWeight !== 100}
                  className="px-6 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {formulaForm.processing ? 'Saving...' : 'Activate Formula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compile Merit Modal */}
      {showCompileModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Compile Cohort Merit Ranking
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Executes the dynamic weighted scoring algorithm across all completed applications and applies tie-breaker rules.
            </p>

            <form onSubmit={handleCompileMerit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Program Cohort
                </label>
                <select
                  value={compileForm.data.session_program_id}
                  onChange={(e) => {
                    const spId = e.target.value;
                    const sp = sessionPrograms.find((item) => String(item.id) === spId);
                    compileForm.setData({
                      ...compileForm.data,
                      session_program_id: spId,
                      merit_formula_id: sp?.merit_formulas?.[0]?.id || '',
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                >
                  {sessionPrograms.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.program?.name} ({sp.program?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Merit List Label
                </label>
                <input
                  type="text"
                  required
                  value={compileForm.data.title}
                  onChange={(e) => compileForm.setData('title', e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Provisional Merit List - Round 1', '2nd Merit List - Round 2', '3rd Merit List', 'Final Selection List'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => compileForm.setData('title', `${preset}`)}
                      className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompileModal(false)}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={compileForm.processing}
                  className="flex-1 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {compileForm.processing ? 'Computing Ranking...' : 'Compile Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HodLayout>
  );
}

