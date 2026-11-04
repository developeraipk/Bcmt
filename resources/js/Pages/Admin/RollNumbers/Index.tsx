import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Search,
  Filter,
  UserCheck,
  Building2,
  Armchair,
  X,
  ExternalLink,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  Phone,
  CreditCard,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';

interface UnscheduledCandidate {
  id: number;
  application_number: string;
  roll_number?: string;
  student_name: string;
  father_name: string;
  photo_url?: string | null;
  gender: string;
  contact: string;
  cnic: string;
  program_id?: number;
  program_name: string;
  program_code: string;
  admission_date: string;
}

interface ScheduledCandidate {
  id: number;
  roll_number: string;
  application_number: string;
  student_name: string;
  father_name: string;
  photo_url?: string | null;
  gender: string;
  program_name: string;
  program_code: string;
  test_date: string;
  test_shift: string;
  test_time: string;
  room_number: string;
  seat_number: string;
  attendance_status: string;
}

interface Props {
  unscheduledCandidates: UnscheduledCandidate[];
  scheduledCandidates: ScheduledCandidate[];
  counts: {
    total_eligible: number;
    unscheduled: number;
    scheduled: number;
  };
  sessions: any[];
  programs: any[];
  examinations?: any[];
  selectedSessionId: number;
  selectedProgramId: number | null;
}

export default function RollNumbersIndex({
  unscheduledCandidates = [],
  scheduledCandidates = [],
  counts,
  sessions,
  programs,
  examinations = [],
  selectedSessionId,
  selectedProgramId,
}: Props) {
  const [activeTab, setActiveTab] = useState<'queue' | 'scheduled'>('queue');

  // Filter States
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Selection State (IDs of unscheduled candidates selected for assignment)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [customQty, setCustomQty] = useState<string>('');

  // Configuration Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [testDate, setTestDate] = useState<string>(todayStr);
  const [testShift, setTestShift] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [testTime, setTestTime] = useState<string>('09:00 AM');
  const [centerVenue, setCenterVenue] = useState<string>('BCMT Main Campus, Examination Hall A');

  // Real-Time Background Synchronization (Node.js style live updates without manual page refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't interrupt if user has actively selected candidate checkboxes
      if (selectedIds.length === 0) {
        router.reload({
          only: ['unscheduledCandidates', 'scheduledCandidates', 'counts'],
          preserveScroll: true,
        });
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedIds.length]);

  // Client-side filtering of Unscheduled Queue
  const filteredQueue = useMemo(() => {
    return unscheduledCandidates.filter((cand) => {
      // Course filter
      if (filterCourse && String(cand.program_id) !== filterCourse) {
        return false;
      }
      // Gender filter
      if (filterGender && cand.gender.toLowerCase() !== filterGender.toLowerCase()) {
        return false;
      }
      // Search filter (Name, Phone, CNIC)
      if (filterSearch) {
        const q = filterSearch.toLowerCase().trim();
        const matchesName = cand.student_name.toLowerCase().includes(q);
        const matchesFather = cand.father_name.toLowerCase().includes(q);
        const matchesCnic = cand.cnic.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const matchesPhone = cand.contact.toLowerCase().includes(q);
        const matchesAppNo = cand.application_number.toLowerCase().includes(q);
        if (!matchesName && !matchesFather && !matchesCnic && !matchesPhone && !matchesAppNo) {
          return false;
        }
      }
      return true;
    });
  }, [unscheduledCandidates, filterCourse, filterGender, filterSearch]);

  // Batch Selection Helpers
  const handleSelectBatch = (count: number) => {
    const idsToSelect = filteredQueue.slice(0, count).map((c) => c.id);
    setSelectedIds(idsToSelect);
  };

  const handleSelectCustomQty = () => {
    const qty = parseInt(customQty, 10);
    if (!isNaN(qty) && qty > 0) {
      handleSelectBatch(qty);
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredQueue.map((c) => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Submit Bulk Schedule Assignment
  const assignForm = useForm({
    application_ids: [] as number[],
    test_date: testDate,
    test_shift: testShift,
    test_time: testTime,
    center_name: centerVenue,
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert('Please select at least 1 candidate from the queue to assign an exam schedule.');
      return;
    }

    if (!testDate) {
      alert('Please specify the Test Date.');
      return;
    }

    assignForm.setData({
      application_ids: selectedIds,
      test_date: testDate,
      test_shift: testShift,
      test_time: testTime,
      center_name: centerVenue,
    });

    router.post(
      '/admin/roll-numbers/assign-schedule',
      {
        application_ids: selectedIds,
        test_date: testDate,
        test_shift: testShift,
        test_time: testTime,
        center_name: centerVenue,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedIds([]);
        },
      }
    );
  };

  // Unassign candidate (move back to queue)
  const handleUnassign = (cand: ScheduledCandidate) => {
    if (
      confirm(
        `Move candidate '${cand.student_name}' (${cand.roll_number}) back to the Unassigned Queue?`
      )
    ) {
      router.post(
        `/admin/roll-numbers/unassign-schedule/${cand.id}`,
        {},
        {
          preserveScroll: true,
        }
      );
    }
  };

  const quickTimes = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];

  return (
    <AdminLayout>
      <Head title="Examination Scheduling & Roll Numbers - BCMT Admin" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Entrance Examination Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            Exam Schedule Configuration &amp; Roll Number Assignment
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Assign dates, shifts, and venues to eligible candidates in batches. Candidates immediately move from the queue into the scheduled list.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#07294D] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FFB606]" />
            <span>Unassigned Queue ({counts?.unscheduled ?? unscheduledCandidates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-[#07294D] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scheduled List ({counts?.scheduled ?? scheduledCandidates.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: UNASSIGNED SCHEDULING QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Top 3 Stat Cards (Matches User Reference Image 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Unassigned Queue */}
            <div className="bg-[#007BFF] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100 block">
                  Total Unassigned Queue
                </span>
                <span className="text-2xl sm:text-3xl font-black font-sans">
                  {unscheduledCandidates.length} Students
                </span>
              </div>
            </div>

            {/* Card 2: Filtered in Queue */}
            <div className="bg-[#0284C7] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-sky-100 block">
                  Filtered in Queue
                </span>
                <span className="text-2xl sm:text-3xl font-black font-sans">
                  {filteredQueue.length} Students
                </span>
              </div>
            </div>

            {/* Card 3: Selected for Assignment */}
            <div className="bg-[#10B981] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100 block">
                  Selected for Assignment
                </span>
                <span className="text-2xl sm:text-3xl font-black font-sans">
                  {selectedIds.length} Students
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar (Course, Gender, Shift, Search, Clear) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-3">
            {/* Course Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#07294D]"
              >
                <option value="">All Courses</option>
                {programs.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="w-36">
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Gender</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#07294D]"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Shift Filter */}
            <div className="w-36">
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Shift</label>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#07294D]"
              >
                <option value="">All Shifts</option>
                <option value="morning">Morning Shift</option>
                <option value="afternoon">Afternoon Shift</option>
                <option value="evening">Evening Shift</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Name, Phone, CNIC..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#07294D]"
                />
              </div>
            </div>

            {/* Clear Button */}
            {(filterCourse || filterGender || filterShift || filterSearch) && (
              <button
                type="button"
                onClick={() => {
                  setFilterCourse('');
                  setFilterGender('');
                  setFilterShift('');
                  setFilterSearch('');
                }}
                className="self-end px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                title="Clear Filters"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {/* Exam Schedule Configuration Panel (Exact match of reference image) */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <div className="w-6 h-6 rounded-md bg-[#007BFF] text-white flex items-center justify-center font-bold text-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Exam Schedule Configuration</h3>
                <p className="text-[11px] text-stone-500">
                  Set the exam date, shift, and time for the selected students. Once assigned, they will be given sequential roll numbers and move to the Scheduled list.
                </p>
              </div>
            </div>

            {/* 4 Input Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Test Date */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  TEST DATE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
              </div>

              {/* Test Shift */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  TEST SHIFT <span className="text-rose-500">*</span>
                </label>
                <select
                  value={testShift}
                  onChange={(e) => setTestShift(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                >
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="evening">Evening Shift</option>
                </select>
              </div>

              {/* Test Time with Quick Pills */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  TEST TIME <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testTime}
                  onChange={(e) => setTestTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {quickTimes.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setTestTime(pill)}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
                        testTime === pill
                          ? 'bg-[#07294D] text-[#FFB606] border-[#07294D] font-bold'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Center / Lab */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  ASSIGNED CENTER / LAB
                </label>
                <input
                  type="text"
                  value={centerVenue}
                  onChange={(e) => setCenterVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-[#07294D] focus:outline-none"
                />
              </div>
            </div>

            {/* Batch Selection Buttons & Primary Action */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              {/* Batch Select Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <span className="text-[10px] font-black uppercase text-stone-500 mr-1">Batch Selection:</span>

                <button
                  type="button"
                  onClick={() => handleSelectBatch(40)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" /> Select 40 (Class)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectBatch(50)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" /> Select 50 (Class)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectBatch(100)}
                  className="px-3 py-1.5 bg-white border border-[#007BFF] text-[#007BFF] hover:bg-blue-50 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Select 100
                </button>

                {/* Custom Qty Input */}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="w-14 px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={handleSelectCustomQty}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Select
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Select All Queue ({filteredQueue.length})
                </button>

                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Deselect All
                </button>
              </div>

              {/* Primary Emerald Green Assignment Button */}
              <button
                type="button"
                onClick={handleAssignSubmit}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Assign Roll Numbers &amp; Schedule ({selectedIds.length})</span>
              </button>
            </div>
          </div>

          {/* Unassigned Candidates Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] border-b border-stone-200">
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredQueue.length > 0 &&
                          filteredQueue.every((c) => selectedIds.includes(c.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSelectAllFiltered();
                          } else {
                            handleDeselectAll();
                          }
                        }}
                        className="rounded border-stone-300 text-[#07294D] focus:ring-[#07294D] cursor-pointer"
                      />
                    </th>
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">Student Information</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Course &amp; Batch</th>
                    <th className="p-4">Contact / CNIC</th>
                    <th className="p-4">Admission Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredQueue.map((cand, idx) => {
                    const isSelected = selectedIds.includes(cand.id);

                    return (
                      <tr
                        key={cand.id}
                        className={`transition hover:bg-stone-50/70 ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(cand.id)}
                            className="rounded border-stone-300 text-[#07294D] focus:ring-[#07294D] cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center font-mono text-stone-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {cand.photo_url ? (
                              <img
                                src={cand.photo_url}
                                alt={cand.student_name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#07294D]/30 shrink-0 shadow-xs"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#07294D] text-[#FFB606] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {cand.student_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                                {cand.student_name}
                              </span>
                              <span className="text-[11px] text-stone-500 block">
                                S/O, D/O: {cand.father_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                              cand.gender.toLowerCase() === 'female'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {cand.gender}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#07294D] block">
                            {cand.program_name}
                          </span>
                          <span className="font-mono text-stone-400 text-[10px]">
                            {cand.program_code}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-stone-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{cand.contact}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CreditCard className="w-3 h-3 text-stone-400" />
                            <span>{cand.cnic}</span>
                          </div>
                        </td>
                        <td className="p-4 text-stone-500 font-medium">
                          {cand.admission_date}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleSelectOne(cand.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#10B981] text-white shadow-2xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredQueue.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-stone-400">
                        <UserCheck className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="font-bold text-stone-700 text-sm">
                          {unscheduledCandidates.length === 0
                            ? 'All eligible students have been assigned examination schedules!'
                            : 'No students match your filter criteria.'}
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          Switch to the Scheduled List tab to view and print official candidate admit cards.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED CANDIDATES & SLIPS */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Scheduled Candidates &amp; Verified Admit Cards ({scheduledCandidates.length})
                </h3>
                <p className="text-xs text-stone-500">
                  These candidates have an assigned roll number, examination date, shift, and hall.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Total Scheduled: {scheduledCandidates.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] border-b border-stone-200">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">Assigned Roll #</th>
                    <th className="p-4">Candidate &amp; Application</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Assigned Schedule</th>
                    <th className="p-4">Examination Center</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {scheduledCandidates.map((cand, idx) => (
                    <tr key={cand.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4 text-center font-mono text-stone-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-4 font-mono font-black text-sm text-[#07294D]">
                        {cand.roll_number}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {cand.photo_url ? (
                            <img
                              src={cand.photo_url}
                              alt={cand.student_name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-[#07294D]/30 shrink-0 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#07294D] text-[#FFB606] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {cand.student_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                              {cand.student_name}
                            </span>
                            <span className="text-[11px] text-stone-500 block font-mono">
                              #{cand.application_number} • S/O {cand.father_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-stone-800 block">
                          {cand.program_name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {cand.program_code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#07294D]" />
                          <span>{cand.test_date}</span>
                        </div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          <span className="font-semibold text-[#07294D]">{cand.test_shift}</span> • {cand.test_time}
                        </div>
                      </td>
                      <td className="p-4 text-stone-700">
                        <span className="font-medium block">{cand.room_number}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {/* View Admit Card Slip */}
                          <Link
                            href={`/admin/roll-numbers/${cand.id}/slip`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#07294D] hover:bg-[#041D3C] text-[#FFB606] rounded-xl text-xs font-bold transition shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#FFB606]" />
                            <span>View Slip</span>
                          </Link>

                          {/* Unassign / Move back to queue */}
                          <button
                            type="button"
                            onClick={() => handleUnassign(cand)}
                            title="Unassign schedule & move back to queue"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition border border-stone-200 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Unassign</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {scheduledCandidates.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-stone-400">
                        <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="font-bold text-stone-700 text-sm">
                          No candidates scheduled yet.
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          Select candidates from the Unassigned Queue tab to schedule them in batches.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
